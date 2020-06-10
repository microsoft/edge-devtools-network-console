// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { INetConsoleRequestInternal } from 'model/NetConsoleRequest';
import { IView } from 'store';
import { DEFAULT_NET_CONSOLE_REQUEST } from 'reducers/request';
import { AppHost } from 'store/host';
import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';

export interface IGlobalInitializeAction {
    type: 'GLOBAL_INITIALIZE_AND_RESET';
    persistedState: IView;
}

export interface ILoadRequestAction {
    type: 'LOAD_REQUEST';
    requestId: string;
    request: INetConsoleRequestInternal;
}

export const DEFAULT_EMPTY_REQUEST_ID = 'DEFAULT_REQUEST';

function makeLoadDefaultRequestAction(requestId = DEFAULT_EMPTY_REQUEST_ID): ILoadRequestAction {
    return {
        type: 'LOAD_REQUEST',
        requestId: requestId,
        request: {
            ...DEFAULT_NET_CONSOLE_REQUEST,
        },
    };
}

let nextRequestId = 1;
export function loadDefaultRequest(): ThunkAction<void, IView, void, AnyAction> {
    const id = `${DEFAULT_EMPTY_REQUEST_ID}_${nextRequestId++}`;
    return async dispatch => {
        AppHost.openUnattachedRequest(id);
        dispatch(makeLoadDefaultRequestAction(id));
    };
}

export function loadRequestAction(requestId: string, request: INetConsoleRequestInternal): ILoadRequestAction {
    AppHost.log({ when: 'loadRequestAction', request });
    return {
        type: 'LOAD_REQUEST',
        requestId: requestId,
        request,
    };
}

export function globalInitializeAction(persistedState: IView): IGlobalInitializeAction {
    return {
        type: 'GLOBAL_INITIALIZE_AND_RESET',
        persistedState,
    };
}
