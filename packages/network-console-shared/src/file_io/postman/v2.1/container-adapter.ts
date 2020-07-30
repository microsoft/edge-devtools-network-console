// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    INetConsoleRequest,
} from '../../../net/net-console-http';
import BidiMap from '../../../util/bidi-map';
import {
    ICollectionFormat,
    ICollectionAdapter,
    ICollectionContainerAdapter,
    ICollectionEntryAdapter,
    ICollectionItemAdapter,
} from '../../interfaces';
import { RequestAdapter } from './request-adapter';
import { AuthorizationAdapter } from './authorization';
import { mapNCToPostman } from './request';

import {
    Items as Postman21Entry,
    AuthType,
} from '../../../collections/postman/v2.1/schema-generated';

export class ContainerAdapter implements ICollectionContainerAdapter {
    public readonly type = 'container';
    private _keyToIndex: BidiMap<string, number>;
    private _nextKey: number;

    constructor(
        public readonly format: ICollectionFormat,
        public readonly collection: ICollectionAdapter,
        public readonly id: string,
        private readonly realObject: Postman21Entry,
        private setDirty: () => void,
    ) {
        if (!Array.isArray(this.realObject.item)) {
            throw new RangeError('Attempted to instantiate a Postman v2.1 ContainerAdapter against an "Items" that lacked an "item" property (or it was not an array).');
        }
        this._keyToIndex = new BidiMap();
        this._nextKey = 0;

        for (let index = 0; index < this.realObject.item!.length; index++) {
            const entryId = `${id}/${this._nextKey++}`;
            this._keyToIndex.set(entryId, index);
        }
    }

    get name() {
        return this.realObject.name || '<unnamed folder>';
    }

    set name(value: string) {
        this.realObject.name = value;
        this.setDirty();
    }

    get authorization() {
        return new AuthorizationAdapter(this.realObject, this.setDirty);
    }

    get childEntryIds() {
        return Array.from(this._keyToIndex.keys());
    }

    getEntryById(id: string): ICollectionEntryAdapter | null {
        const index = this._keyToIndex.getByKey(id);
        if (typeof index !== 'number') {
            return null;
        }

        const entry = this.realObject.item![index] as Postman21Entry;
        if ('request' in entry) {
            return new RequestAdapter(this.format, this.collection, id, entry, this.setDirty);
        }
        else if ('item' in entry && Array.isArray(entry.item)) {
            return new ContainerAdapter(this.format, this.collection, id, entry, this.setDirty);
        }

        throw new Error(`Parser error: Child with id "${id}" was not a valid request or collection folder.`);
    }

    async appendContainerEntry(name: string) {
        const folder: Postman21Entry = {
            name,
            item: [],
        };
        const index = this.realObject.item!.length;
        this.realObject.item!.push(folder);
        const id = `${this.id}/${this._nextKey++}`;
        this._keyToIndex.set(id, index);
        this.setDirty();

        return new ContainerAdapter(this.format, this.collection, id, folder, this.setDirty);
    }

    async appendItemEntry(request: INetConsoleRequest): Promise<ICollectionItemAdapter> {
        const item: Postman21Entry = {
            request: mapNCToPostman(request),
            name: request.name,
        };
        const index = this.realObject.item!.length;
        this.realObject.item!.push(item);
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
        this.realObject.item!.splice(index, 1);
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
