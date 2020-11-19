// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    IEnvironmentFormat,
    IEnvironmentContainerAdapter,
    IEnvironmentAdapter,
} from '../interfaces';
import { INCNativeEnvironment } from './format';
import { INetConsoleParameter } from '../../net/net-console-http';

export class EnvironmentAdapter implements IEnvironmentAdapter {
    constructor(
        public readonly format: IEnvironmentFormat,
        public readonly container: IEnvironmentContainerAdapter,
        public readonly id: string,
        private readonly realObject: INCNativeEnvironment,
        private setDirty: () => void,
    ) {

    }

    get name() {
        return this.realObject.name;
    }

    set name(value: string) {
        this.realObject.name = value;
        this.setDirty();
    }

    get variables() {
        return this.realObject.variables.map(p => {
            const { description, isActive, key, value } = p;
            return { description, isActive, key, value };
        });
    }

    set variables(value: INetConsoleParameter[]) {
        this.realObject.variables = value.map(p => {
            const { description, isActive, key, value } = p;
            return { description, isActive, key, value };
        });
        this.setDirty();
    }
}
