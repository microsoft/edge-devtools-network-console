// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    INetConsoleAuthorization,
    INetConsoleRequest,
} from '../../net/net-console-http';
import IdIndexMap from '../../util/id-index-map';

import {
    ICollectionFormat,
    ICollectionAdapter,
    ICollectionEntryAdapter,
    ICollectionItemAdapter,
    ICollectionContainerAdapter,
} from '../interfaces';
import { migrateAuthorization } from '../convert';
import { ContainerAuthorizationAdapter } from './authorization';
import { ContainerAdapter } from './container-adapter';
import { RequestAdapter } from './request-adapter';

import {
    INCNativeRoot,
    NCChild,
    INCNativeFolder,
    INCNativeRequest,
} from './format';

type ParseResult = {
    valid: true;
    parsed: INCNativeRoot;
} | {
    valid: false;
    error: string;
};

export class CollectionAdapter implements ICollectionAdapter {
    private _dirty: boolean;
    private _current: INCNativeRoot;
    private _keyToIndex: IdIndexMap;
    private _nextKey: number;

    constructor(
        public readonly format: ICollectionFormat,
        public readonly id: string,
        private fileContents: string,
    ) {
        const root = CollectionAdapter.checkAndParse(fileContents);
        if (!root.valid) {
            throw new RangeError('Invalid file or error parsing: ' + root.error);
        }

        this._current = root.parsed;
        this._dirty = false;
        this._keyToIndex = new IdIndexMap();
        this._nextKey = 0;

        for (let index = 0; index < this._current.entries.length; index++) {
            const entryId = `${id}/${this._nextKey++}`;
            this._keyToIndex.set(entryId, index);
        }
    }

    static checkAndParse(fileContents: string): ParseResult {
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
        return new ContainerAuthorizationAdapter(this._current, () => { this._dirty = true; });
    }

    set authorization(value: INetConsoleAuthorization) {
        if (!this._current.auth) {
            this._current.auth = {
                type: 'inherit',
            };
        }
        migrateAuthorization(this._current.auth, value);
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
    }

    async commit() {
        this.fileContents = JSON.stringify(this._current, null, 4);
        this._dirty = false;
    }

    async stringify() {
        return this.fileContents;
    }
}
