// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IHttpResponse, ResponseStatus } from 'network-console-shared';

import { ILoadRequestAction } from '../common';
import { ISaveRequestAction } from 'actions/request/basics';

export interface IBeginRequestAction {
    type: 'RESPONSE_BEGIN_REQUEST';
    requestId: string;
    cookie: number;
}

export interface IEndRequestAction {
    type: 'RESPONSE_END_REQUEST';
    requestId: string;
    succeeded: boolean;
    status: ResponseStatus;
    response: IHttpResponse | null;
    cookie: number;
}

export interface ICancelRequestAction {
    type: 'RESPONSE_CANCEL_REQUEST';
    requestId: string;
    cookie: number;
}

export const RESPONSE_ACTION_TYPES = new Set<string>([
    'RESPONSE_BEGIN_REQUEST',
    'RESPONSE_END_REQUEST',
    'LOAD_REQUEST',
    'REQUEST_SAVE',
    'RESPONSE_CANCEL_REQUEST',
]);
export type ResponseAction =
    IBeginRequestAction |
    IEndRequestAction |
    ILoadRequestAction |
    ISaveRequestAction |
    ICancelRequestAction
    ;

export function beginResponseAction(requestId: string, cookie: number): IBeginRequestAction {
    return {
        type: 'RESPONSE_BEGIN_REQUEST',
        requestId,
        cookie,
    };
}

export function endResponseAction(requestId: string, succeeded: boolean, status: ResponseStatus, response: IHttpResponse | null, cookie: number): IEndRequestAction {
    return {
        type: 'RESPONSE_END_REQUEST',
        requestId,
        succeeded,
        status,
        response,
        cookie,
    };
}

export function cancelRequestAction(requestId: string, cookie: number): ICancelRequestAction {
    return {
        type: 'RESPONSE_CANCEL_REQUEST',
        requestId,
        cookie,
    };
}
