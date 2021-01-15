// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { INetConsoleRequest, INetConsoleAuthorization, INetConsoleResponse, INetConsoleParameter } from '../net/net-console-http';

interface IMessage<T extends string> {
    type: T;
}

export interface IResponseMessage<TResult> {
    /** ID of the request message */
    id: number;

    result?: TResult;
    error?: string;
}

export function isResponseMessage<TResult>(msg: object): msg is IResponseMessage<TResult> {
    return typeof msg === 'object' && 'id' in msg;
}

export interface IInitHostMessage extends IMessage<'INIT_HOST'> {
    cssVariables: string;
    isDark: boolean;
    isHighContrast: boolean;
    persistedState?: string;
    messagePort?: MessagePort;
}

export type IInitEmptyRequestMessage = IMessage<'INIT_NEW_EMPTY_REQUEST'>;

export interface ICssStylesUpdatedMessage extends IMessage<'CSS_STYLE_UPDATED'> {
    cssVariables: string;
    isDark: boolean;
    isHighContrast: boolean;
}

export interface ISetPreferencesMessage extends IMessage<'SET_PREFERENCES'> {
    shouldShowDescription: boolean;
}

interface ILoadRequestMessageBase extends IMessage<'LOAD_REQUEST'> {
    request: INetConsoleRequest;
    requestId: string;
    requiresSaveAs: boolean;

    _environmentAuth?: INetConsoleAuthorization;
    _environmentAuthPath?: string[];
}

export type ILoadRequestMessage = ILoadRequestMessageBase;

export type IRequestCompleteMessage = IMessage<'REQUEST_COMPLETE'> & IResponseMessage<INetConsoleResponse>;

export interface IEditCollectionAuthorizationMessage extends IMessage<'EDIT_COLLECTION_AUTHORIZATION_PARAMETERS'> {
    collectionId: string;
    path: string[];
    authorization: INetConsoleAuthorization;
}

export interface IHostCollection {
    id: string;
    name: string;
    children: IHostCollection[];
    /**
     * Introduced in v0.11.1-preview. If this is `undefined`, it is assumed to be an "inherit".
     */
    authorization: INetConsoleAuthorization | undefined;
}

export interface IUpdateCollectionsTreeMessage extends IMessage<'UPDATE_COLLECTIONS_TREE'> {
    collections: IHostCollection[];
}

export interface IEditEnvironmentMessage extends IMessage<'EDIT_ENVIRONMENT_VARIABLES'> {
    id: string;
    environment: {
        name: string;
        options: INetConsoleParameter[];
    };
    file: string;
    collectionName: string;
}

export interface IUpdateEnvironmentMessage extends IMessage<'UPDATE_ENVIRONMENT'> {
    environment: {
        id: string;
        name: string;
        options: INetConsoleParameter[];
    };
}

export interface ICloseViewMessage extends IMessage<'CLOSE_VIEW'> {
    requestId: string;
}

export interface IShowViewMessage extends IMessage<'SHOW_OPEN_REQUEST'> {
    requestId: string;
}

export type IClearEnvironmentMessage = IMessage<'CLEAR_ENVIRONMENT'>;

export type HostMessage =
    IInitHostMessage |
    IInitEmptyRequestMessage |
    ICssStylesUpdatedMessage |
    ISetPreferencesMessage |
    ILoadRequestMessage |
    IRequestCompleteMessage |
    IClearEnvironmentMessage |
    IEditCollectionAuthorizationMessage |
    IUpdateCollectionsTreeMessage |
    IEditEnvironmentMessage |
    IUpdateEnvironmentMessage |
    ICloseViewMessage |
    IShowViewMessage
    ;
