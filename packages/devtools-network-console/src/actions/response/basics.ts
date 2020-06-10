// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IHttpResponse, ResponseStatus } from 'network-console-shared';

import { ILoadRequestAction } from '../common';
import { ISaveRequestAction } from 'actions/request/basics';

export interface IBeginRequestAction {
    type: 'RESPONSE_BEGIN_REQUEST';
    requestId: string;
}

export interface IEndRequestAction {
    type: 'RESPONSE_END_REQUEST';
    requestId: string;
    succeeded: boolean;
    status: ResponseStatus;
    response: IHttpResponse | null;
}

export const RESPONSE_ACTION_TYPES = new Set<string>([
    'RESPONSE_BEGIN_REQUEST',
    'RESPONSE_END_REQUEST',
    'LOAD_REQUEST',
    'REQUEST_SAVE',
]);
export type ResponseAction =
    IBeginRequestAction |
    IEndRequestAction |
    ILoadRequestAction |
    ISaveRequestAction
    ;

export function beginResponseAction(requestId: string): IBeginRequestAction {
    return {
        type: 'RESPONSE_BEGIN_REQUEST',
        requestId,
    };
}

export function endResponseAction(requestId: string, succeeded: boolean, status: ResponseStatus, response: IHttpResponse | null): IEndRequestAction {
    return {
        type: 'RESPONSE_END_REQUEST',
        requestId,
        succeeded,
        status,
        response,
    };
}
