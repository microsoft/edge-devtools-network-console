// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Map } from 'immutable';

import { ResponseAction } from 'actions/response';
import { INetConsoleResponseInternal } from 'model/NetConsoleRequest';

const DEFAULT_RESPONSE_STATE: INetConsoleResponseInternal = {
    duration: 0,
    started: 0,
    status: 'NOT_SENT',
    response: null,
    cookie: -1,
};

/**
 * Maps requestId to INetConsoleResponseInternal
 */
export type ResponsesState = Map<string, INetConsoleResponseInternal>;
export const DEFAULT_RESPONSES_MAP: ResponsesState = Map();

export default function reduceResponse(collection: ResponsesState = DEFAULT_RESPONSES_MAP, action: ResponseAction): ResponsesState {
    if (!action.requestId) {
        return collection;
    }
    let reqId = action.requestId;

    const state = collection.get(reqId);
    if (!state) {
        return collection.set(reqId, {
            ...DEFAULT_RESPONSE_STATE
        });
    }

    let result = state;

    switch (action.type) {
        case 'RESPONSE_BEGIN_REQUEST':
            result = {
                duration: 0,
                response: null,
                started: Date.now(),
                status: 'PENDING',
                cookie: action.cookie,
            };
            break;

        case 'RESPONSE_END_REQUEST':
            if (state.status !== 'PENDING' || action.cookie !== state.cookie) {
                // Only allow pending requests to be fulfilled.
                // Ignore "end" notifications is we've moved on (i.e., previously this was canceled)
                break;
            }
            result = {
                duration: Date.now() - state.started,
                started: 0,
                response: action.response,
                status: action.status,
                cookie: -1,
            };
            break;

        case 'REQUEST_SAVE':
            if (reqId === action.resultRequestId){
                break;
            }
            reqId = action.resultRequestId;
            result = {
                ...DEFAULT_RESPONSE_STATE,
            };
            break;
        case 'RESPONSE_CANCEL_REQUEST':
            if (state.status !== 'PENDING' || action.cookie !== state.cookie) {
                // Only allow cancellation of pending requests.
                // Ignore "cancel" notifications is we've moved on (i.e., previously this was completed)
                break;
            }
            result = {
                duration: 0,
                response: null,
                started: Date.now(),
                status: 'NOT_SENT',
                cookie: -1,
            };
            break;
    }

    if (result !== state) {
        return collection.set(reqId, result);
    }

    return collection;
}
