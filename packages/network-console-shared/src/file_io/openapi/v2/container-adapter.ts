// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { OpenAPIV2 } from 'openapi-types';

import {
    INetConsoleAuthorization,
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

export class ContainerAdapter implements ICollectionContainerAdapter {
    public readonly type = 'container';
    private readonly pathName: string;
    private readonly _keyToIndex: BidiMap<string, number>;

    constructor(
        public readonly format: ICollectionFormat,
        public readonly collection: ICollectionAdapter,
        public readonly id: string,
        private document: OpenAPIV2.Document,
        private fullPath: string,
        private immediateChildren: ICollectionEntryAdapter[],
    ) {
        const pathParts = fullPath.split('/');
        this.pathName = pathParts[pathParts.length - 1];
        this._keyToIndex = new BidiMap();
        this.immediateChildren.forEach((child, index) => {
            this._keyToIndex.set(child.id, index);
        });
    }

    get name() {
        return this.pathName;
    }

    set name(_value: string) {
        throw new ReferenceError('Writing to this collection is not supported.');
    }

    get authorization(): INetConsoleAuthorization {
        return {
            type: 'inherit',
        };
    }

    get childEntryIds() {
        return Array.from(this._keyToIndex.keys());
    }

    getEntryById(id: string): ICollectionEntryAdapter | null {
        const index = this._keyToIndex.getByKey(id);
        if (typeof index !== 'number') {
            return null;
        }
        return this.immediateChildren[index];
    }

    async appendContainerEntry(_name: string): Promise<ICollectionContainerAdapter> {
        throw new ReferenceError('Writing to this collection is not supported.');
    }

    async appendItemEntry(_request: INetConsoleRequest): Promise<ICollectionItemAdapter> {
        throw new ReferenceError('Writing to this collection is not supported.');
    }

    async deleteEntry(_id: string) {
        throw new ReferenceError('Writing to this collection is not supported.');
    }
}
