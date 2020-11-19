// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { uuid } from 'uuidv4';
import {
    IEnvironmentFormat,
    IEnvironmentContainerAdapter,
} from '../../interfaces';
import { EnvironmentContainerAdapter } from './environment-container-adapter';

export interface IPostmanEnvironmentFile {
    id: string;
    name: string;
    values: Array<{
        key: string;
        value: string;
        enabled: boolean;
    }>;
    _postman_variable_scope: 'environment';
    _postman_exported_at: string;
    _postman_exported_using: string;
}

export class EnvironmentFormat implements IEnvironmentFormat {
    public readonly formatId = 'postman-v2.1-env';
    public readonly canWrite = true;

    private static _nextNewEnvironmentId = 0;

    constructor() {}

    async createEnvironmentContainer(name: string): Promise<IEnvironmentContainerAdapter> {
        const DEFAULT_ENVIRONMENT: IPostmanEnvironmentFile = {
            id: uuid(),
            name,
            values: [],
            _postman_variable_scope: 'environment',
            _postman_exported_at: new Date().toISOString(),
            _postman_exported_using: 'edge-devtools-network-console/0.11.0-preview',
        };

        const id = `postman-v2.1-format-new-environment-${EnvironmentFormat._nextNewEnvironmentId++}`;
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
