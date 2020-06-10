// Copyright (c) Microsoft Corp.
// Licensed under the MIT License.

interface INCEnvironmentFolder {
    readonly name: string;
    readonly environments: INCEnvironment[];
    readonly meta: {
        networkConsoleEnvironmentVersion: string;
    };
}

interface INCEnvironment {
    name: string;
    settings: INCSetting[];
}

interface INCSetting {
    key: string;
    value: string;
    description: string;
    isActive: boolean;
}

import { IEnvironmentRoot, IEnvironment } from '../index';
import { INetConsoleParameter } from '../../net/net-console-http';

export class NCNativeEnvironmentReader implements IEnvironmentRoot {
    public readonly type = 'root';
    public readonly name: string;
    constructor(public readonly sourceUrl: string,
                private readonly sourceObject: INCEnvironmentFolder) {
        this.name = sourceObject.name;
    }

    get environments() {
        return this.sourceObject.environments.map(src => new NCEnvironmentReader(src));
    }
}

class NCEnvironmentReader implements IEnvironment {
    public readonly type = 'environment';
    public readonly name: string;

    constructor(private src: INCEnvironment) {
        this.name = src.name;
    }

    get settings() {
        return this.src.settings.slice();
    }
}

export function serializeNativeEnvironment(
    collectionName: string,
    environmentName: string,
    settings: INetConsoleParameter[],
    addTabs = false,
): string {
    const collection: INCEnvironmentFolder = {
        name: collectionName,
        meta: {
            networkConsoleEnvironmentVersion: '0.9',
        },
        environments: [
            {
                name: environmentName,
                settings,
            },
        ],
    };
    return JSON.stringify(collection, null, addTabs ? 2 : 0);
}
