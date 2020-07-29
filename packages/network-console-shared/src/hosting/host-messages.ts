// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    INetConsoleRequest,
    INetConsoleAuthorization,
    INetConsoleResponse,
    INetConsoleParameter,
    ms,
} from '../net/net-console-http';
import { Base64String } from '../util/base64';

interface IMessage<T extends string> {
    type: T;
}

interface IResponseMessage<TResult> {
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

    environmentAuth?: INetConsoleAuthorization;
    environmentAuthPath?: string[];
}

interface ILoadRequestMessageEnvironment {
    environmentAuth: INetConsoleAuthorization;
    environmentAuthPath: string;
}

export type ILoadRequestMessage = ILoadRequestMessageBase | (ILoadRequestMessageBase & ILoadRequestMessageEnvironment);

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

export interface IWebSocketConnectedMessage extends IMessage<'WEBSOCKET_CONNECTED'> {
    requestId: string;
}

export interface IWebSocketDisconnectedMessage extends IMessage<'WEBSOCKET_DISCONNECTED'> {
    requestId: string;
}

export interface IWebSocketPacketMessage extends IMessage<'WEBSOCKET_PACKET'> {
    requestId: string;
    data: string | Base64String;
    direction: 'send' | 'recv';
    encoding: 'text' | 'base64';
    timeFromConnection: ms;
}

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
    IShowViewMessage |
    IWebSocketDisconnectedMessage |
    IWebSocketPacketMessage
    ;
