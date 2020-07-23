// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { INetConsoleAuthorization } from '../../net/net-console-http';

export function createAuthorizationProxy(realObject: INetConsoleAuthorization, onDirty: () => void): INetConsoleAuthorization {
    const ALLOWED_PROPERTIES = [
        'type',
        'token',
        'basic',
    ];

    return new Proxy(realObject, {
        set(obj: INetConsoleAuthorization, prop: string | number | symbol, value: any) {
            if (ALLOWED_PROPERTIES.indexOf(prop as string) > -1) {
                onDirty();
                return Reflect.set(obj, prop, value);
            }

            return false;
        },
    });
}
