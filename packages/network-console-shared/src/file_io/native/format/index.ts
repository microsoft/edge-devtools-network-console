// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    INetConsoleAuthorization,
    INetConsoleParameter,
    INetConsoleRequest,
} from '../../../net/net-console-http';

// ----- Collection file type definitions

export type NCChild = INCNativeFolder | INCNativeRequest;
export interface INCNativeFolder {
    name: string;
    auth?: INetConsoleAuthorization;
    entries: NCChild[];
}

export interface INCNativeRequest {
    auth?: INetConsoleAuthorization;
    request: INetConsoleRequest;
}

/**
 * Describes the root definition of a native Network Console (.nc.json) file.
 */
export interface INCNativeRoot extends INCNativeFolder {
    meta: {
        networkConsoleCollectionVersion: string;
    };
}

// ----- Environment file type definitions

export interface INCNativeEnvironmentFile {
    meta: {
        networkConsoleEnvironmentVersion: string;
    };
    name: string;
    environments: INCNativeEnvironment[];
}

/**
 * Describes the root definition of a native Network Console environment (.ncenv.json) file.
 */
export interface INCNativeEnvironment {
    name: string;
    variables: INetConsoleParameter[];
}
