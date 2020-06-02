// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    CorsMode,
    CredentialsMode,
    CacheMode,
    RedirectMode,
} from 'network-console-shared';

export interface IFetchSetCorsModeAction {
    type: 'REQUEST_FETCH_SET_CORS_MODE';
    requestId: string;
    corsMode: CorsMode;
}

export interface IFetchSetCredentialsModeAction {
    type: 'REQUEST_FETCH_SET_CREDENTIALS_MODE';
    requestId: string;
    credentialsMode: CredentialsMode;
}

export interface IFetchSetCacheModeAction {
    type: 'REQUEST_FETCH_SET_CACHE_MODE';
    requestId: string;
    cacheMode: CacheMode;
}

export interface IFetchSetRedirectModeAction {
    type: 'REQUEST_FETCH_SET_REDIRECT_MODE';
    requestId: string;
    redirectMode: RedirectMode;
}

export type ConfigureFetchAction =
    IFetchSetCorsModeAction |
    IFetchSetCacheModeAction |
    IFetchSetCredentialsModeAction |
    IFetchSetRedirectModeAction
    ;
export const FETCH_ACTIONS = new Set<string>([
    'REQUEST_FETCH_SET_CORS_MODE',
    'REQUEST_FETCH_SET_CREDENTIALS_MODE',
    'REQUEST_FETCH_SET_CACHE_MODE',
    'REQUEST_FETCH_SET_REDIRECT_MODE',
]);

export function fetchSetCorsModeAction(requestId: string, corsMode: CorsMode): IFetchSetCorsModeAction {
    return {
        type: 'REQUEST_FETCH_SET_CORS_MODE',
        requestId,
        corsMode,
    };
}

export function fetchSetCredentialsModeAction(requestId: string, credentialsMode: CredentialsMode): IFetchSetCredentialsModeAction {
    return {
        type: 'REQUEST_FETCH_SET_CREDENTIALS_MODE',
        requestId,
        credentialsMode,
    };
}

export function fetchSetCacheModeAction(requestId: string, cacheMode: CacheMode): IFetchSetCacheModeAction {
    return {
        type: 'REQUEST_FETCH_SET_CACHE_MODE',
        requestId,
        cacheMode,
    };
}

export function fetchSetRedirectModeAction(requestId: string, redirectMode: RedirectMode): IFetchSetRedirectModeAction {
    return {
        type: 'REQUEST_FETCH_SET_REDIRECT_MODE',
        requestId,
        redirectMode,
    };
}
