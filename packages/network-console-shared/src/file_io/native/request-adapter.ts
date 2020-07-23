// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    INetConsoleRequest,
} from '../../net/net-console-http';
import { ICollectionFormat, ICollectionAdapter, ICollectionItemAdapter } from '../interfaces';
import { createAuthorizationProxy } from './authorization';
import {
    INCNativeRequest,
} from '../../collections/native/native-file-format';

export class RequestAdapter implements ICollectionItemAdapter {
    public readonly type = 'item';

    constructor(
        public readonly format: ICollectionFormat,
        public readonly collection: ICollectionAdapter,
        public readonly id: string,
        private readonly realObject: INCNativeRequest,
        private setDirty: () => void,
    ) {

    }

    get request(): INetConsoleRequest {
        return createRequestProxy(this.realObject.request, this.setDirty);
    }

    get name() {
        return this.realObject.request.name;
    }
}

function createRequestProxy(realObject: INetConsoleRequest, onDirty: () => void): INetConsoleRequest {
    const ALLOWED_PROPERTIES = [
        // IHttpRequest props
        'verb',
        'url',
        'headers',
        'body',
        'authorization',
        'fetchParams',
        // INetConsoleRequest props
        'name',
        'description',
        'queryParameters',
        'routeParameters',
        'bodyComponents',
    ];
    return new Proxy(realObject, {
        get(obj: INetConsoleRequest, prop: string | number | symbol) {
            if (prop === 'authorization') {
                const authorizationProp = Reflect.get(obj, prop);
                return createAuthorizationProxy(authorizationProp, onDirty);
            }
            return Reflect.get(obj, prop);
        },
        set(obj: INetConsoleRequest, prop: string | number | symbol, value: any) {
            if (ALLOWED_PROPERTIES.indexOf(prop as string) > -1) {
                onDirty();
                return Reflect.set(obj, prop, value);
            }

            return false;
        },
    });
}
