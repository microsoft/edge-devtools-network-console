// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    RequestAction,
    isBasicRequestAction,
    isHeaderRequestAction,
    isQueryRequestAction,
    isRouteRequestAction,
    isBodyComponentsRequestAction,
    isAuthorizationRequestAction,
    isFetchRequestAction,
} from 'actions/request';
import { RequestState } from 'store';
import { Map as IMap } from 'immutable';

import reduceRequestBasics from './basics-reducer';
import reduceBodyComponents from './body-reducer';
import reduceRequestHeaders from './headers-reducer';
import reduceQuery from './query-reducer';
import reduceRoute from './route-reducer';
import reduceAuth from './auth-reducer';
import { INetConsoleRequestInternal } from 'model/NetConsoleRequest';
import { NetworkConsoleAuthorizationScheme } from 'model/authorization';
import reduceFetch from './fetch-reducer';

export const DEFAULT_NET_CONSOLE_REQUEST: INetConsoleRequestInternal = {
    authorization: {
        type: NetworkConsoleAuthorizationScheme.Inherit,
    },
    description: '',
    headers: IMap(),
    name: '',
    queryParameters: IMap(),
    routeParameters: IMap(),
    url: '',
    verb: 'GET',
    bodyComponents: {
        bodySelection: 'none',
        formData: IMap(),
        rawTextBody: {
            contentType: 'application/json',
            text: '',
        },
        xWwwFormUrlencoded: IMap(),
    },
    fetchParams: {
        cacheMode: 'no-store',
        corsMode: 'cors',
        credentialsMode: 'same-origin',
        redirectMode: 'follow',
    },
};

export type RequestsState = IMap<string, RequestState>;

const DEFAULT_REQUEST_MAP: RequestsState = IMap<string, RequestState>();

export default function reduceRequest(state: RequestsState = DEFAULT_REQUEST_MAP, action: RequestAction): RequestsState {
    let result = state;
    if (isBasicRequestAction(action)) {
        result = reduceRequestBasics(action, result);
    }

    if (isHeaderRequestAction(action)) {
        result = reduceRequestHeaders(action, result);
    }

    if (isQueryRequestAction(action)) {
        result = reduceQuery(action, result);
    }

    if (isRouteRequestAction(action)) {
        result = reduceRoute(action, result);
    }

    if (isBodyComponentsRequestAction(action)) {
        result = reduceBodyComponents(action, result);
    }

    if (isAuthorizationRequestAction(action)) {
        result = reduceAuth(action, result);
    }

    if (isFetchRequestAction(action)) {
        result = reduceFetch(action, result);
    }

    if (action.type === 'LOAD_REQUEST') {
        result = result.set(action.requestId, {
            // We use the spread operator here to ensure that the 'committed'
            // and 'current' states are not referentially equal
            committed: {
                ...action.request,
            },
            current: {
                ...action.request,
            },
            isDirty: false,
        });
        window.parent.postMessage({ type: 'LOG', when: 'LOAD_REQUEST', result }, '*');
    }
    else if (action.type === 'REQUEST_SAVE') {
        result = result.set(action.resultRequestId, {
            committed: {
                ...action.resultRequest,
            },
            current: {
                ...action.resultRequest,
            },
            isDirty: false,
        });

        window.parent.postMessage({
            type: 'LOG',
            message: 'reducers:request:REQUEST_SAVE',
            action,
            result,
        }, '*');
    }

    return result;
}
