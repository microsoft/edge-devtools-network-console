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
    ICollectionContainerAdapter,
    ICollectionEntryAdapter,
    ICollectionItemAdapter,
} from '../interfaces';
import { migrateAuthorization } from '../convert';
import { RequestAdapter } from './request-adapter';
import { ContainerAuthorizationAdapter } from './authorization';

import {
    NCChild,
    INCNativeFolder,
    INCNativeRequest,
} from '../../collections/native/native-file-format';

export class ContainerAdapter implements ICollectionContainerAdapter {
    public readonly type = 'container';
    private _keyToIndex: IdIndexMap;
    private _nextKey: number;

    constructor(
        public readonly format: ICollectionFormat,
        public readonly collection: ICollectionAdapter,
        public readonly id: string,
        private readonly realObject: INCNativeFolder,
        private setDirty: () => void,
    ) {
        this._keyToIndex = new IdIndexMap();
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
        return new ContainerAuthorizationAdapter(this.realObject, this.setDirty);
    }

    set authorization(value: INetConsoleAuthorization) {
        if (!this.realObject.auth) {
            this.realObject.auth = {
                type: 'inherit',
            };
        }
        migrateAuthorization(this.realObject.auth, value);
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
    }
}
