// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { OpenAPIV2 } from 'openapi-types';

import {
    IEnvironmentAdapter,
    IEnvironmentContainerAdapter,
    IEnvironmentFormat,
} from '../../interfaces';
import { INetConsoleParameter } from '../../../net/net-console-http';
import BidiMap from '../../../util/bidi-map';

export class EnvironmentContainerAdapter implements IEnvironmentContainerAdapter {
    public readonly canContainMultipleEnvironments = true;
    public readonly isDirty = false;
    private readonly children: IEnvironmentAdapter[] = [];
    private _keyToIndex: BidiMap<string, number> = new BidiMap();

    constructor(
        public readonly format: IEnvironmentFormat,
        public readonly id: string,
        private readonly document: OpenAPIV2.Document,
    ) {
        const host = document.host;
        if (!host) {
            throw new RangeError('This OpenAPI document may not be used as an environment because it does not include a "host" property.');
        }
        const basePath = document.basePath || '/';
        if (document.schemes) {
            for (const scheme of document.schemes) {
                const environmentId = `${id}/${scheme}`;
                const env = new EnvironmentAdapter(environmentId, scheme, scheme, host, basePath);
                const index = this.children.length;
                this._keyToIndex.set(environmentId, index);
                this.children.push(env);
            }
        }
        else {
            const scheme = 'https';
            const environmentId = `${id}/${scheme}`;
            const env = new EnvironmentAdapter(environmentId, scheme, scheme, host, basePath);
            const index = this.children.length;
            this._keyToIndex.set(environmentId, index);
            this.children.push(env);
        }
    }

    get name() {
        return `${this.document.info.title} (OpenAPI)`;
    }

    set name(_value: string) {
        failReadonly();
    }

    get childIds() {
        return Array.from(this._keyToIndex.keys());
    }

    getEnvironmentById(id: string): IEnvironmentAdapter | null {
        const env = this._keyToIndex.getByKey(id);
        if (typeof env !== 'number') {
            return null;
        }

        const entry = this.children[env];
        return entry;
    }

    async appendEnvironment(_name: string): Promise<IEnvironmentAdapter> {
        failReadonly();
    }

    async deleteEnvironment(_id: string): Promise<void> {
        failReadonly();
    }

    async stringify(): Promise<string> {
        return JSON.stringify(this.document, null, 4);
    }

    async commit() {
        failReadonly();
    }
}

class EnvironmentAdapter implements IEnvironmentAdapter {
    private _entry: INetConsoleParameter;
    constructor(
        public readonly id: string,
        private readonly environmentName: string,
        private readonly scheme: string,
        private readonly host: string,
        private readonly basePath: string,
    ) {
        this._entry = {
            description: 'Auto-generated from the OpenAPI document to access the root of the API service',
            isActive: true,
            key: 'baseUri',
            value: `${scheme || 'https'}://${host}${basePath}`,
        };
    }

    get name() {
        return this.scheme;
    }

    set name(_value: string) {
        failReadonly();
    }

    get variables() {
        return [this._entry];
    }

    set variables(_value: INetConsoleParameter[]) {
        failReadonly();
    }
}

function failReadonly(): never {
    throw new ReferenceError('Writing to this environment is not supported.');
}
