// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { OpenAPIV2 } from 'openapi-types';

import {
    INetConsoleRequest,
    INetConsoleAuthorization,
} from '../../../net/net-console-http';
import BidiMap from '../../../util/bidi-map';

import {
    ICollectionFormat,
    ICollectionAdapter,
    ICollectionEntryAdapter,
    ICollectionItemAdapter,
    ICollectionContainerAdapter,
} from '../../interfaces';

import { ContainerAdapter } from './container-adapter';
import { RequestAdapter } from './request-adapter';
import { convertSecurityToNC } from './authorization-adapter';

export class CollectionAdapter implements ICollectionAdapter {
    private _keyToIndex: BidiMap<string, number>;
    public readonly isDirty = false;
    private readonly immediateChildren: ICollectionEntryAdapter[];

    constructor(
        public readonly format: ICollectionFormat,
        public readonly id: string,
        private readonly document: OpenAPIV2.Document,
    ) {
        this.immediateChildren = [];
        this._keyToIndex = new BidiMap();

        const paths = Object.keys(document.paths);
        paths.sort();
        paths.forEach(path => {
            const requests: RequestAdapter[] = [];
            const pathMaybe = document.paths[path];
            if (pathMaybe) {
                const containerId = id + '/' + path;
                const pathItem = pathMaybe as OpenAPIV2.PathItemObject;
                if (pathItem.del) {
                    requests.push(new RequestAdapter(format, this, path + '::DELETE', document, path, 'del'));
                }
                else if (pathItem.delete) {
                    requests.push(new RequestAdapter(format, this, path + '::DELETE', document, path, 'delete'));
                }

                if (pathItem.get) {
                    requests.push(new RequestAdapter(format, this, path + '::GET', document, path, 'get'));
                }

                if (pathItem.head) {
                    requests.push(new RequestAdapter(format, this, path + '::HEAD', document, path, 'head'));
                }

                if (pathItem.options) {
                    requests.push(new RequestAdapter(format, this, path + '::OPTIONS', document, path, 'options'));
                }

                if (pathItem.patch) {
                    requests.push(new RequestAdapter(format, this, path + '::PATCH', document, path, 'patch'));
                }

                if (pathItem.post) {
                    requests.push(new RequestAdapter(format, this, path + '::POST', document, path, 'post'));
                }

                if (pathItem.put) {
                    requests.push(new RequestAdapter(format, this, path + '::PUT', document, path, 'put'));
                }

                if (requests.length === 0) {
                    return;
                }

                const container = new ContainerAdapter(format, this, containerId, document, path, requests);
                this._keyToIndex.set(containerId, this.immediateChildren.length);
                this.immediateChildren.push(container);
            }
        });
    }

    get name() {
        return this.document.info.title;
    }

    set name(_value: string) {
        throw new ReferenceError('Writing this collection is not supported.');
    }

    get authorization(): INetConsoleAuthorization {
        return convertSecurityToNC(this.document, this.document.security, 'none');
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

    async commit() {
        throw new ReferenceError('Writing to this collection is not supported.');
    }

    async stringify() {
        return JSON.stringify(this.document);
    }
}
