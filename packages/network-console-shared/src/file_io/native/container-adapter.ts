// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    INetConsoleRequest,
} from '../../net/net-console-http';
import BidiMap from '../../util/bidi-map';
import {
    ICollectionFormat,
    ICollectionAdapter,
    ICollectionContainerAdapter,
    ICollectionEntryAdapter,
    ICollectionItemAdapter,
} from '../interfaces';
import { RequestAdapter } from './request-adapter';
import { createAuthorizationProxy } from './authorization';

import {
    NCChild,
    INCNativeFolder,
    INCNativeRequest,
} from '../../collections/native/native-file-format';

export class ContainerAdapter implements ICollectionContainerAdapter {
    public readonly type = 'container';
    private _keyToIndex: BidiMap<string, number>;
    private _nextKey: number;

    constructor(
        public readonly format: ICollectionFormat,
        public readonly collection: ICollectionAdapter,
        public readonly id: string,
        private readonly realObject: INCNativeFolder,
        private setDirty: () => void,
    ) {
        this._keyToIndex = new BidiMap();
        this._nextKey = 0;

        for (let index = 0; index < this.realObject.entries.length; index++) {
            const entryId = `${id}/${this._nextKey++}`;
            this._keyToIndex.set(entryId, index);
        }
    }

    get name() {
        return this.realObject.name;
    }

    set name(value: string) {
        this.realObject.name = value;
        this.setDirty();
    }

    get authorization() {
        if (!this.realObject.auth) {
            this.realObject.auth = {
                type: 'inherit',
            };
        }
        return createAuthorizationProxy(this.realObject.auth, this.setDirty);
    }

    get childEntryIds() {
        return Array.from(this._keyToIndex.keys());
    }

    getEntryById(id: string): ICollectionEntryAdapter | null {
        const index = this._keyToIndex.getByKey(id);
        if (typeof index !== 'number') {
            return null;
        }

        const entry = this.realObject.entries[index] as NCChild;
        if ('request' in entry) {
            return new RequestAdapter(this.format, this.collection, id, entry, this.setDirty);
        }
        else if ('entries' in entry && Array.isArray(entry.entries)) {
            return new ContainerAdapter(this.format, this.collection, id, entry, this.setDirty);
        }

        throw new Error(`Parser error: Child with id "${id}" was not a valid request or collection folder.`);
    }

    async appendContainerEntry(name: string) {
        const folder: INCNativeFolder = {
            name,
            entries: [],
        };
        const index = this.realObject.entries.length;
        this.realObject.entries.push(folder);
        const id = `${this.id}/${this._nextKey++}`;
        this._keyToIndex.set(id, index);
        this.setDirty();

        return new ContainerAdapter(this.format, this.collection, id, folder, this.setDirty);
    }

    async appendItemEntry(request: INetConsoleRequest): Promise<ICollectionItemAdapter> {
        const item: INCNativeRequest = {
            request,
        };
        const index = this.realObject.entries.length;
        this.realObject.entries.push(item);
        const id = `${this.id}/${this._nextKey++}`;
        this._keyToIndex.set(id, index);
        this.setDirty();

        return new RequestAdapter(this.format, this.collection, id, item, this.setDirty);
    }

    async deleteEntry(id: string) {
        const index = this._keyToIndex.getByKey(id);
        if (typeof index !== 'number') {
            throw new RangeError(`ID "${id}" not found in this container.`);
        }
        this._keyToIndex.deleteByKey(id);
        this.realObject.entries.splice(index, 1);
        this.setDirty();

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
}
