// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    INetConsoleRequest,
} from '../../../net/net-console-http';
import { ICollectionFormat, ICollectionAdapter, ICollectionItemAdapter } from '../../interfaces';
import {
    Items,
} from '../../../collections/postman/v2.1/schema-generated';

import { RequestWrapper } from './request';

export class RequestAdapter implements ICollectionItemAdapter {
    public readonly type = 'item';

    constructor(
        public readonly format: ICollectionFormat,
        public readonly collection: ICollectionAdapter,
        public readonly id: string,
        private readonly realObject: Items,
        private setDirty: () => void,
    ) {

    }

    get request(): INetConsoleRequest {
        return new RequestWrapper(this.realObject, this.setDirty);
    }

    get name() {
        return this.realObject.name || '';
    }
}
