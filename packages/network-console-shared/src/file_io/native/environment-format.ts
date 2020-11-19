// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    IEnvironmentFormat,
    IEnvironmentContainerAdapter,
} from '../interfaces';
import { EnvironmentContainerAdapter } from './environment-container-adapter';
import { INCNativeEnvironmentFile } from './format';

export class EnvironmentFormat implements IEnvironmentFormat {
    public readonly formatId = 'nc-native-env';
    public readonly canWrite = true;

    private static _nextNewEnvironmentId = 0;

    constructor() {}

    async createEnvironmentContainer(name: string): Promise<IEnvironmentContainerAdapter> {
        const DEFAULT_ENVIRONMENT: INCNativeEnvironmentFile = {
            meta: {
                networkConsoleEnvironmentVersion: '0.11.0-preview',
            },
            name,
            environments: [],
        };

        const id = `nc-native-format-new-environment-${EnvironmentFormat._nextNewEnvironmentId++}`;
        return new EnvironmentContainerAdapter(this, id, JSON.stringify(DEFAULT_ENVIRONMENT, null, 4));
    }

    async parse(id: string, contents: string): Promise<IEnvironmentContainerAdapter> {
        return new EnvironmentContainerAdapter(this, id, contents);
    }

    async tryParse(id: string, contents: string): Promise<IEnvironmentContainerAdapter | null> {
        try {
            return await this.parse(id, contents);
        }
        catch (_err) {
            return null;
        }
    }
}
