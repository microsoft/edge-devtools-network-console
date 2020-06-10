// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum NetworkConsoleAuthorizationScheme {
    Inherit = 'inherit',
    None = 'none',
    Basic = 'basic',
    Token = 'token',
}

export interface INetConsoleAuthorization {
    type: NetworkConsoleAuthorizationScheme;
    /**
     * If the host supports transparent authorization (such as cookies or NTLM),
     * include it. This setting will have no effect if the host does not support
     * transparent authorization, and if a non-transparent authorization scheme
     * is selected (such as JWT), the host will include both (if that makes sense).
     */
    includeTransparent: boolean;

    basic?: INetConsoleBasicAuthorization;
    token?: INetConsoleBearerTokenAuthorization;
}

export interface INetConsoleBasicAuthorization {
    username: string;
    password: string;
    showPassword: boolean;
}

export interface INetConsoleBearerTokenAuthorization {
    token: string;
}
