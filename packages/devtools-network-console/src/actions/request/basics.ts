// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    HttpVerb,
    INetConsoleResponse,
} from 'network-console-shared';

import { INetConsoleRequestInternal } from 'model/NetConsoleRequest';

export interface ISetVerbAction {
    type: 'REQUEST_VERB_SET';
    requestId: string;
    verb: HttpVerb;
}

export interface ISetUrlAction {
    type: 'REQUEST_URL_SET';
    requestId: string;
    url: string;
}

export interface ISetNameAction {
    type: 'REQUEST_NAME_SET';
    requestId: string;
    name: string;
}

export interface ISetDescriptionAction {
    type: 'REQUEST_DESCRIPTION_SET';
    requestId: string;
    description: string;
}

export interface ISetVerbAndUrlAction {
    type: 'REQUEST_VERB_URL_SET';
    requestId: string;
    verb: HttpVerb;
    url: string;
}

export interface ISaveRequestAction {
    type: 'REQUEST_SAVE';
    requestId: string;
    resultRequestId: string;
    resultRequest: INetConsoleRequestInternal;
}

export interface ISaveFailedAction {
    type: 'REQUEST_SAVE_FAILED';
    requestId: string;
    errorMessage: string;
}

export interface IStartRequestAction {
    type: 'REQUEST_START';
    requestId: string;
}

export interface IStopRequestAction {
    type: 'REQUEST_STOP';
    requestId: string;
    response: INetConsoleResponse | null;
}

export const BASIC_REQUEST_ACTION_TYPES = new Set<string>([
    'REQUEST_VERB_SET',
    'REQUEST_URL_SET',
    'REQUEST_VERB_URL_SET',
    'REQUEST_NAME_SET',
    'REQUEST_DESCRIPTION_SET',
    'REQUEST_SAVE',
    'REQUEST_START',
    'REQUEST_STOP',
    'REQUEST_SAVE_FAILED',
]);
export type BasicRequestAction =
    ISetVerbAction |
    ISetUrlAction |
    ISetVerbAndUrlAction |
    ISetNameAction |
    ISetDescriptionAction |
    ISaveRequestAction |
    IStartRequestAction |
    IStopRequestAction |
    ISaveFailedAction
    ;

export function setVerbAction(requestId: string, verb: HttpVerb): ISetVerbAction {
    return {
        type: 'REQUEST_VERB_SET',
        requestId,
        verb,
    };
}

export function setUrlAction(requestId: string, url: string): ISetUrlAction {
    return {
        type: 'REQUEST_URL_SET',
        requestId,
        url,
    };
}

export function setVerbAndUrlAction(requestId: string, verb: HttpVerb, url: string): ISetVerbAndUrlAction {
    return {
        type: 'REQUEST_VERB_URL_SET',
        requestId,
        verb,
        url,
    };
}

export function setNameAction(requestId: string, name: string): ISetNameAction {
    return {
        type: 'REQUEST_NAME_SET',
        requestId,
        name,
    };
}

export function setDescriptionAction(requestId: string, description: string): ISetDescriptionAction {
    return {
        type: 'REQUEST_DESCRIPTION_SET',
        requestId,
        description,
    };
}

export function saveRequestAction(requestId: string, resultRequest: INetConsoleRequestInternal, resultRequestId: string): ISaveRequestAction {
    return {
        type: 'REQUEST_SAVE',
        requestId,
        resultRequestId,
        resultRequest: resultRequest,
    };
}

export function saveRequestFailedAction(requestId: string, errorMessage: string): ISaveFailedAction {
    return {
        type: 'REQUEST_SAVE_FAILED',
        requestId,
        errorMessage,
    };
}

export function startRequestAction(requestId: string): IStartRequestAction {
    return {
        type: 'REQUEST_START',
        requestId,
    };
}

export function stopRequestAction(requestId: string, response: INetConsoleResponse | null): IStopRequestAction {
    return {
        type: 'REQUEST_STOP',
        requestId,
        response,
    };
}
