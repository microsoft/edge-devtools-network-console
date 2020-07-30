// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    ICollectionFormat,
    ICollectionAdapter,
    ICollectionEntryAdapter,
    ICollectionItemAdapter,
    ICollectionContainerAdapter,
} from '../../interfaces';
import {
    Postman21Schema,
    AuthType,
    Items as Postman21Entry,
} from '../../../collections/postman/v2.1/schema-generated';
import BidiMap from '../../../util/bidi-map';
import { INetConsoleRequest } from '../../../net/net-console-http';
import { AuthorizationAdapter } from './authorization';

import { RequestWrapper, mapNCToPostman } from './request';
import { RequestAdapter } from './request-adapter';
import { ContainerAdapter } from './container-adapter';

type ValidityCheckResult = {
    valid: true;
    parsed: Postman21Schema;
} | {
    valid: false;
    error: string;
};

export class CollectionAdapter implements ICollectionAdapter {
    private _dirty: boolean;
    private _current: Postman21Schema;
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

        for (let index = 0; index < this._current.item.length; index++) {
            const entryId = `${id}/${this._nextKey++}`;
            this._keyToIndex.set(entryId, index);
        }
    }

    static isValidFile(fileContents: string): ValidityCheckResult {
        try {
            const parsed = JSON.parse(fileContents) as Partial<Postman21Schema>;
            if (!('info' in parsed)) {
                return {
                    valid: false,
                    error: 'No metadata about the file.',
                };
            }
            if (!('schema' in parsed.info!) || parsed.info!.schema !== 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json') {
                return {
                    valid: false,
                    error: 'Schema version not supported.',
                };
            }
            if(!('item' in parsed) || !Array.isArray(parsed.item)) {
                return {
                    valid: false,
                    error: 'Expected "item" list was missing or not an array.',
                };
            }

            return {
                valid: true,
                parsed: parsed as Postman21Schema,
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
        return this._current.info.name;
    }

    set name(value: string) {
        this._current.info.name = value;
        this._dirty = true;
    }

    get authorization() {
        return new AuthorizationAdapter(this._current, () => { this._dirty = true; });
    }

    get childEntryIds() {
        return Array.from(this._keyToIndex.keys());
    }

    getEntryById(id: string): ICollectionEntryAdapter | null {
        const index = this._keyToIndex.getByKey(id);
        if (typeof index !== 'number') {
            return null;
        }

        const entry = this._current.item[index] as Postman21Entry;
        if ('request' in entry) {
            return new RequestAdapter(this.format, this, id, entry, () => { this._dirty = true; });
        }
        else if ('item' in entry && Array.isArray(entry.item)) {
            return new ContainerAdapter(this.format, this, id, entry, () => { this._dirty = true; });
        }

        throw new Error(`Parser error: Child with id "${id}" was not a valid request or collection folder.`);
    }

    async appendContainerEntry(name: string): Promise<ICollectionContainerAdapter> {
        const folder: Postman21Entry = {
            name,
            item: [],
        };
        const index = this._current.item.length;
        this._current.item.push(folder);
        const id = `${this.id}/${this._nextKey++}`;
        this._keyToIndex.set(id, index);
        this._dirty = true;

        return new ContainerAdapter(this.format, this, id, folder, () => { this._dirty = true; });
    }

    async appendItemEntry(request: INetConsoleRequest): Promise<ICollectionItemAdapter> {
        const item: Postman21Entry = mapNCToPostman(request);
        const index = this._current.item.length;
        this._current.item.push(item);
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
        this._current.item.splice(index, 1);
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
