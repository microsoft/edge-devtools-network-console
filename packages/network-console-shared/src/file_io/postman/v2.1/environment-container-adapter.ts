// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    IEnvironmentAdapter,
    IEnvironmentContainerAdapter,
    IEnvironmentFormat,
} from '../../interfaces';
import {
    IPostmanEnvironmentFile
} from './environment-format';
import { INetConsoleParameter } from '../../../net/net-console-http';

type ParseResult = {
    valid: true;
    parsed: IPostmanEnvironmentFile;
} | {
    valid: false;
    error: string;
};

export class EnvironmentContainerAdapter implements IEnvironmentContainerAdapter, IEnvironmentAdapter {
    public readonly canContainMultipleEnvironments = false;
    private _dirty: boolean;
    private _current: IPostmanEnvironmentFile;
    private _childKey: string;

    constructor(
        public readonly format: IEnvironmentFormat,
        public readonly id: string,
        private fileContents: string,
    ) {
        const root = EnvironmentContainerAdapter.checkAndParse(fileContents);
        if (!root.valid) {
            throw new RangeError('Invalid file or error parsing: ' + root.error);
        }

        this._current = root.parsed;
        this._dirty = false;
        this._childKey = `${id}/0`;
    }

    static checkAndParse(fileContents: string): ParseResult {
        try {
            const parsed = JSON.parse(fileContents) as Partial<IPostmanEnvironmentFile>;
            if (!('id' in parsed)) {
                return {
                    valid: false,
                    error: 'No ID in the file.',
                };
            }
            if(!('name' in parsed)) {
                return {
                    valid: false,
                    error: 'No name for this file.',
                };
            }
            if (!('values' in parsed) || !Array.isArray(parsed.values)) {
                return {
                    valid: false,
                    error: 'Expected "values" list was missing or not an array.',
                };
            }

            return {
                valid: true,
                parsed: parsed as IPostmanEnvironmentFile,
            };
        }
        catch (e) {
            return {
                valid: false,
                error: 'Invalid JSON: ' + e.message,
            };
        }
    }

    get isDirty() {
        return this._dirty;
    }

    get childIds() {
        return [this._childKey];
    }

    getEnvironmentById(id: string): IEnvironmentAdapter | null {
        if (id !== this._childKey) {
            return null;
        }

        return this;
    }

    async appendEnvironment(name: string): Promise<IEnvironmentAdapter> {
        throw new ReferenceError('Multiple environments are not supported for this container.');
    }

    async deleteEnvironment(id: string): Promise<void> {
        throw new ReferenceError('Multiple environments are not supported for this container.');
    }

    async stringify(): Promise<string> {
        return this.fileContents;
    }

    async commit(): Promise<void> {
        this.fileContents = JSON.stringify(this._current, null, 4);
        this._dirty = false;
    }

    get name() {
        return this._current.name;
    }

    set name(value: string) {
        this._current.name = value;
        this._dirty = true;
    }

    get variables() {
        return this._current.values.map(p => {
            const { enabled, key, value } = p;
            return {
                description: '',
                isActive: enabled,
                key,
                value,
            };
        });
    }

    set variables(value: INetConsoleParameter[]) {
        this._current.values = value.map(p => {
            const { isActive, key, value } = p;
            return {
                enabled: isActive,
                key,
                value,
            };
        });
        this._dirty = true;
    }
}
