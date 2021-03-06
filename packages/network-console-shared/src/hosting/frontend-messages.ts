// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IHttpRequest } from '../net/http-base';
import { INetConsoleRequest, INetConsoleAuthorization, INetConsoleParameter } from '../net/net-console-http';

interface IMessage<T extends string> {
    type: T;
}

interface IMessageWithResponse<T extends string> extends IMessage<T> {
    id: number;
}

export type IConsoleReadyMessage = IMessage<'CONSOLE_READY'>;

export type IPromptForNewCollectionMessage = IMessage<'PROMPT_FOR_NEW_COLLECTION'>;

/**
 * Requests that the host makes an ARIA announcement on behalf of the frontend.
 */
export interface IAriaAlertMessage extends IMessage<'ARIA_ALERT'> {
    /**
     * The message to announce. This message should be localized.
     */
    message: string;
}

export interface IExecuteRequestMessage extends IMessageWithResponse<'EXECUTE_REQUEST'> {
    configuration: IHttpRequest;
    /**
     * For this message, `inherit` is not allowed. The final calculated authorization must be included.
     * No environment substitution occurs on the embedder's part.
     */
    authorization: INetConsoleAuthorization;
}

export interface ISaveRequestMessage extends IMessageWithResponse<'SAVE_REQUEST'> {
    request: INetConsoleRequest;
    requestId: string;
    toCollectionId: string;
}

export interface ISaveCollectionAuthorizationMessage extends IMessageWithResponse<'SAVE_COLLECTION_AUTHORIZATION_PARAMETERS'> {
    collectionId: string;
    authorization: INetConsoleAuthorization;
}

export interface ISaveEnvironmentVariablesMessage extends IMessageWithResponse<'SAVE_ENVIRONMENT_VARIABLES'> {
    variables: INetConsoleParameter[];
    environmentId: string;
}

export interface IOpenWebLinkMessage extends IMessage<'OPEN_WEB_LINK'> {
    url: string;
}

export interface IUpdateDirtyFlagMessage extends IMessage<'UPDATE_DIRTY_FLAG'> {
    requestId: string;
    isDirty: boolean;
}

export interface IOpenUnattachedRequestMessage extends IMessage<'OPEN_NEW_UNATTACHED_REQUEST'> {
    requestId: string;
}

export type ILogMessage = IMessage<'LOG'> & {
    [s: string]: any;
};

export type FrontendMessage =
    IConsoleReadyMessage |
    IExecuteRequestMessage |
    ISaveRequestMessage |
    ISaveCollectionAuthorizationMessage |
    ISaveEnvironmentVariablesMessage |
    IOpenWebLinkMessage |
    IOpenUnattachedRequestMessage |
    IUpdateDirtyFlagMessage |
    ILogMessage |
    IPromptForNewCollectionMessage |
    IAriaAlertMessage
    ;
