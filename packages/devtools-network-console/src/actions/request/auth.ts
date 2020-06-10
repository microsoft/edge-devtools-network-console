// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { NetworkConsoleAuthorizationScheme } from 'network-console-shared';

export interface ISetAuthorizationSchemeAction {
    type: 'REQUEST_AUTH_SET_KIND';
    requestId: string;
    kind: NetworkConsoleAuthorizationScheme
}

export interface ISetBasicAuthAction {
    type: 'REQUEST_AUTH_BASIC_SET_VALUES';
    requestId: string;
    username: string;
    password: string;
    showPassword: boolean;
}

export interface ISetBearerTokenAction {
    type: 'REQUEST_AUTH_TOKEN_SET_VALUES';
    requestId: string;
    token: string;
}

export const AUTH_ACTIONS = new Set([
    'REQUEST_AUTH_SET_KIND',
    'REQUEST_AUTH_BASIC_SET_VALUES',
    'REQUEST_AUTH_TOKEN_SET_VALUES',
]);

export type AuthAction =
    ISetAuthorizationSchemeAction |
    ISetBasicAuthAction |
    ISetBearerTokenAction
    ;

export function makeSetAuthorizationSchemeAction(requestId: string, kind: NetworkConsoleAuthorizationScheme): ISetAuthorizationSchemeAction {
    return {
        type: 'REQUEST_AUTH_SET_KIND',
        requestId,
        kind,
    };
}

export function makeSetBasicAuthAction(requestId: string, username: string, password: string, showPassword: boolean): ISetBasicAuthAction {
    return {
        type: 'REQUEST_AUTH_BASIC_SET_VALUES',
        requestId,
        username,
        password,
        showPassword,
    };
}

export function makeSetBearerTokenAction(requestId: string, token: string): ISetBearerTokenAction {
    return {
        type: 'REQUEST_AUTH_TOKEN_SET_VALUES',
        requestId,
        token,
    };
}
