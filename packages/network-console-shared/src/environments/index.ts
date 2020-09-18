// Copyright (c) Microsoft Corporation
// Licensed under the MIT License.

import { INetConsoleParameter } from '../net/net-console-http';
import { NCNativeEnvironmentReader } from './native/native-env-format';
import deprecated from '../util/deprecate';

export type EnvironmentItemType = 'root' | 'environment';

export interface IEnvironmentRoot {
    readonly type: 'root';
    readonly name: string;
    readonly environments: IEnvironment[];
}

export interface IEnvironment {
    readonly type: 'environment';
    readonly name: string;
    readonly settings: INetConsoleParameter[];
}

export async function tryReadEnvironment(sourceUrl: string, collectionText: string): Promise<IEnvironmentRoot | null> {
    deprecated('Environments.tryReadEnvironmentAsync');
    try {
        const jsonObj = JSON.parse(collectionText);

        // Network Console native file format
        if ('meta' in jsonObj) {
            if ('networkConsoleEnvironmentVersion' in jsonObj.meta) {
                return new NCNativeEnvironmentReader(sourceUrl, jsonObj as any);
            }
        }

        // TODO: Postman v2.1 Environment file format
    }
    catch { }

    return null;
}
