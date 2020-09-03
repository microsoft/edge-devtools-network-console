// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    IEnvironmentAdapter,
    IEnvironmentContainerAdapter,
    IEnvironmentFormat,
} from '../interfaces';
import {
    INCNativeEnvironment,
    INCNativeEnvironmentFile,
} from './environment-format';
import { EnvironmentAdapter } from './environment-adapter';
import BidiMap from '../../util/bidi-map';

type ValidityCheckResult = {
    valid: true;
    parsed: INCNativeEnvironmentFile;
} | {
    valid: false;
    error: string;
};

export class EnvironmentContainerAdapter implements IEnvironmentContainerAdapter {
    public canContainMultipleEnvironments = true;
    private _dirty: boolean;
    private _current: INCNativeEnvironmentFile;
    private _keyToIndex: BidiMap<string, number>;
    private _nextKey: number;

    constructor(
        public readonly format: IEnvironmentFormat,
        public readonly id: string,
        private fileContents: string,
    ) {
        const root = EnvironmentContainerAdapter.isValidFile(fileContents);
        if (!root.valid) {
            throw new RangeError('Invalid file or error parsing: ' + root.error);
        }

        this._current = root.parsed;
        this._dirty = false;
        this._keyToIndex = new BidiMap();
        this._nextKey = 0;

        for (let index = 0; index < this._current.environments.length; index++) {
            const entryId = `${id}/${this._nextKey++}`;
            this._keyToIndex.set(entryId, index);
        }
    }

    static isValidFile(fileContents: string): ValidityCheckResult {
        try {
            const parsed = JSON.parse(fileContents) as Partial<INCNativeEnvironmentFile>;
            if (!('meta' in parsed)) {
                return {
                    valid: false,
                    error: 'No metadata about the file.',
                };
            }
            if (!('networkConsoleEnvironmentVersion' in parsed.meta!)) {
                return {
                    valid: false,
                    error: 'No version key for this file.',
                };
            }
            if(!('name' in parsed)) {
                return {
                    valid: false,
                    error: 'No name for this file.',
                };
            }
            if (!('environments' in parsed) || !Array.isArray(parsed.environments)) {
                return {
                    valid: false,
                    error: 'Expected "environments" list was missing or not an array.',
                };
            }

            return {
                valid: true,
                parsed: parsed as INCNativeEnvironmentFile,
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

    get name() {
        return this._current.name;
    }

    set name(value: string) {
        this._current.name = value;
        this._dirty = true;
    }

    get childIds() {
        return Array.from(this._keyToIndex.keys());
    }

    getEnvironmentById(id: string): IEnvironmentAdapter | null {
        const index = this._keyToIndex.getByKey(id);
        if (typeof index !== 'number') {
            return null;
        }

        const environment = this._current.environments[index] as INCNativeEnvironment;
        if (!environment) {
            throw new Error(`Parser error: Child with id "${id}" was not found.`);
        }

        return new EnvironmentAdapter(this.format, this, id, environment, () => { this._dirty = true; });
    }

    async appendEnvironment(name: string): Promise<IEnvironmentAdapter> {
        const child: INCNativeEnvironment = {
            name,
            variables: [],
        };
        const index = this._current.environments.length;
        this._current.environments.push(child);
        const id = `${this.id}/${this._nextKey++}`;
        this._keyToIndex.set(id, index);
        this._dirty = true;

        return new EnvironmentAdapter(this.format, this, id, child, () => { this._dirty = true; });
    }

    async deleteEnvironment(id: string): Promise<void> {
        const index = this._keyToIndex.getByKey(id);
        if (typeof index !== 'number') {
            throw new RangeError(`ID "${id}" not found in this container.`);
        }

        this._keyToIndex.deleteByKey(id);
        this._current.environments.splice(index, 1);
        this._dirty = true;

        // Move all values up by one
        const valuesList = Array.from(this._keyToIndex.values()).filter(v => v > index);
        valuesList.sort();
        // This will never error because it's traversed from least to greatest.
        for (const oldIndex of valuesList) {
            const key = this._keyToIndex.getByValue(oldIndex)!;
            this._keyToIndex.deleteByKey(key);
            this._keyToIndex.set(key, oldIndex - 1);
        }
    }

    async stringify(): Promise<string> {
        return this.fileContents;
    }

    async commit(): Promise<void> {
        this.fileContents = JSON.stringify(this._current, null, 4);
        this._dirty = false;
    }
}
