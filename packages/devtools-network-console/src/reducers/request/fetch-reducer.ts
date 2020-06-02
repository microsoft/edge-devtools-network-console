// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ConfigureFetchAction } from 'actions/request/fetch';
import { RequestsState } from '.';
import { IFetchParams } from 'network-console-shared';

const DEFAULT_FETCH_PARAMS: IFetchParams = {
    corsMode: 'cors',
    cacheMode: 'no-store',
    credentialsMode: 'same-origin',
    redirectMode: 'follow',
}

export default function reduceFetch(action: ConfigureFetchAction, collection: RequestsState): RequestsState {
    const state = collection.get(action.requestId);
    if (!state) {
        throw new RangeError('Invalid request ID');
    }
    let result = state;

    switch (action.type) {
        case 'REQUEST_FETCH_SET_CORS_MODE':
            result = {
                ...state,
                current: {
                    ...state.current,
                    fetchParams: {
                        ...(state.current.fetchParams || DEFAULT_FETCH_PARAMS),
                        corsMode: action.corsMode,
                    },
                },
                isDirty: true,
            };
            break;

        case 'REQUEST_FETCH_SET_CACHE_MODE':
            result = {
                ...state,
                current: {
                    ...state.current,
                    fetchParams: {
                        ...(state.current.fetchParams || DEFAULT_FETCH_PARAMS),
                        cacheMode: action.cacheMode,
                    },
                },
                isDirty: true,
            };
            break;

        case 'REQUEST_FETCH_SET_CREDENTIALS_MODE':
            result = {
                ...state,
                current: {
                    ...state.current,
                    fetchParams: {
                        ...(state.current.fetchParams || DEFAULT_FETCH_PARAMS),
                        credentialsMode: action.credentialsMode,
                    },
                },
                isDirty: true,
            };
            break;

        case 'REQUEST_FETCH_SET_REDIRECT_MODE':
            result = {
                ...state,
                current: {
                    ...state.current,
                    fetchParams: {
                        ...(state.current.fetchParams || DEFAULT_FETCH_PARAMS),
                        redirectMode: action.redirectMode,
                    },
                },
                isDirty: true,
            };
            break;
    }

    if (result !== state) {
        return collection.set(action.requestId, result);
    }

    return collection;
}
