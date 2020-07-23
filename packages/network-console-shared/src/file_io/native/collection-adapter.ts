// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    INetConsoleRequest,
    NetworkConsoleAuthorizationScheme,
} from '../../net/net-console-http';
import BidiMap from '../../util/bidi-map';

import {
    ICollectionFormat,
    ICollectionAdapter,
    ICollectionEntryAdapter,
    ICollectionItemAdapter,
    ICollectionContainerAdapter,
} from '../interfaces';
import { createAuthorizationProxy } from './authorization';
import { ContainerAdapter } from './container-adapter';
import { RequestAdapter } from './request-adapter';

import {
    INCNativeRoot,
    NCChild,
    INCNativeFolder,
    INCNativeRequest,
} from '../../collections/native/native-file-format';

type ValidityCheckResult = {
    valid: true;
    parsed: INCNativeRoot;
} | {
    valid: false;
    error: string;
};

export class CollectionAdapter implements ICollectionAdapter {
    private _dirty: boolean;
    private _current: INCNativeRoot;
    private _keyToIndex: BidiMap<string, number>;
    private _nextKey: number;

    constructor(
        public readonly format: ICollectionFormat,
        public readonly id: string,
        private fileContents: string,
    ) {
        const root = CollectionAdapter.isValidFile(fileContents);
        if (!root.valid) {
            throw new RangeError('Invalid file or error parsing: ' + root.error);
        }

        this._current = root.parsed;
        this._dirty = false;
        this._keyToIndex = new BidiMap();
        this._nextKey = 0;

        for (let index = 0; index < this._current.entries.length; index++) {
            const entryId = `${id}/${this._nextKey++}`;
            this._keyToIndex.set(entryId, index);
        }
    }

    static isValidFile(fileContents: string): ValidityCheckResult {
        try {
            const parsed = JSON.parse(fileContents) as Partial<INCNativeRoot>;
            if (!('meta' in parsed)) {
                return {
                    valid: false,
                    error: 'No metadata about the file.',
                };
            }
            if (!('networkConsoleCollectionVersion' in parsed.meta!)) {
                return {
                    valid: false,
                    error: 'No version key for this file.',
                };
            }
            if(!('name' in parsed)) {
                return {
                    valid: false,
                    error: 'No name for this file.',
                };
            }
            if (!('entries' in parsed) || !Array.isArray(parsed.entries)) {
                return {
                    valid: false,
                    error: 'Expected "entries" list was missing or not an array.',
                };
            }

            return {
                valid: true,
                parsed: parsed as INCNativeRoot,
            };
        }
        catch (e) {
            return {
                valid: false,
                error: 'Invalid JSON: ' + e.message,
            };
        }
    }

    get isDirty() {
        return this._dirty;
    }

    get name() {
        return this._current.name;
    }

    set name(value: string) {
        this._current.name = value;
        this._dirty = true;
    }

    get authorization() {
        if (!this._current.auth) {
            this._current.auth = {
                type: 'inherit',
            };
        }
        return createAuthorizationProxy(this._current.auth, () => { this._dirty = true; });
    }

    get childEntryIds() {
        return Array.from(this._keyToIndex.keys());
    }

    getEntryById(id: string): ICollectionEntryAdapter | null {
        const index = this._keyToIndex.getByKey(id);
        if (typeof index !== 'number') {
            return null;
        }

        const entry = this._current.entries[index] as NCChild;
        if ('request' in entry) {
            return new RequestAdapter(this.format, this, id, entry, () => { this._dirty = true; });
        }
        else if ('entries' in entry && Array.isArray(entry.entries)) {
            return new ContainerAdapter(this.format, this, id, entry, () => { this._dirty = true; });
        }

        throw new Error(`Parser error: Child with id "${id}" was not a valid request or collection folder.`);
    }

    async appendContainerEntry(name: string): Promise<ICollectionContainerAdapter> {
        const folder: INCNativeFolder = {
            name,
            entries: [],
        };
        const index = this._current.entries.length;
        this._current.entries.push(folder);
        const id = `${this.id}/${this._nextKey++}`;
        this._keyToIndex.set(id, index);
        this._dirty = true;

        return new ContainerAdapter(this.format, this, id, folder, () => { this._dirty = true; });
    }

    async appendItemEntry(request: INetConsoleRequest): Promise<ICollectionItemAdapter> {
        const item: INCNativeRequest = {
            request,
        };
        const index = this._current.entries.length;
        this._current.entries.push(item);
        const id = `${this.id}/${this._nextKey++}`;
        this._keyToIndex.set(id, index);
        this._dirty = true;

        return new RequestAdapter(this.format, this, id, item, () => { this._dirty = true; });
    }

    async deleteEntry(id: string) {
        const index = this._keyToIndex.getByKey(id);
        if (typeof index !== 'number') {
            throw new RangeError(`ID "${id}" not found in this container.`);
        }
        this._keyToIndex.deleteByKey(id);
        this._current.entries.splice(index, 1);
        this._dirty = true;

        // Move all values up by one
        const valuesList = Array.from(this._keyToIndex.values()).filter(v => v > index);
        valuesList.sort();
        // This will never error because it's traversed from least to greatest.
        for (const oldIndex of valuesList) {
            const key = this._keyToIndex.getByValue(oldIndex)!;
            this._keyToIndex.deleteByKey(key);
            this._keyToIndex.set(key, oldIndex - 1);
        }
    }

    async commit() {
        this.fileContents = JSON.stringify(this._current, null, 4);
        this._dirty = false;
    }

    async stringify() {
        return this.fileContents;
    }
}
