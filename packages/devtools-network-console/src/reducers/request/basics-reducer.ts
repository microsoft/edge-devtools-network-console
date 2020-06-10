// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Map as IMap } from 'immutable';
import { INetConsoleParameter, IHttpHeader } from 'network-console-shared';

import {
    BasicRequestAction, ISetUrlAction, ISetVerbAndUrlAction,
} from 'actions/request/basics';
import { default as deconstructUrl, IToken } from 'model/url-parser';
import { RequestState } from 'store';
import { RequestsState } from '.';
import { resetIDs, ID_DIV_ROUTE, ID_DIV_QUERY } from './id-manager';

export default function reduceRequestBasics(action: BasicRequestAction, collection: RequestsState): RequestsState {
    const state = collection.get(action.requestId);
    if (!state) {
        throw new RangeError(`Request "${action.requestId}" could not be located.`);
    }

    switch (action.type) {
        case 'REQUEST_URL_SET': {
            const result = setUrlIntoComponentParameters(action, state);
            return collection.set(action.requestId, result);
        }

        case 'REQUEST_VERB_SET': {
            const result = {
                ...state,
                isDirty: true,
                current: {
                    ...state.current,
                    verb: action.verb,
                },
            };
            return collection.set(action.requestId, result);
        }

        case 'REQUEST_NAME_SET': {
            const result = {
                ...state,
                isDirty: true,
                current: {
                    ...state.current,
                    name: action.name,
                },
            };
            return collection.set(action.requestId, result);
        }

        case 'REQUEST_VERB_URL_SET': {
            const temp = setUrlIntoComponentParameters(action, state);
            const result = {
                ...temp,
                current: {
                    ...temp.current,
                    verb: action.verb,
                },
            };
            return collection.set(action.requestId, result);
        }

        case 'REQUEST_DESCRIPTION_SET': {
            const result = {
                ...state,
                isDirty: true,
                current: {
                    ...state.current,
                    description: action.description,
                },
            };
            return collection.set(action.requestId, result);
        }

        case 'REQUEST_SAVE': {
            const result = {
                ...state,
                committed: state.current,
                current: {
                    ...state.current,
                    headers: state.current.headers.slice(),
                    queryParameters: state.current.queryParameters.slice(),
                    routeParameters: state.current.routeParameters.slice(),
                },
                isDirty: false,
            };
            return collection.set(action.requestId, result);
        }
    }

    return collection;
}

function setUrlIntoComponentParameters(action: ISetUrlAction | ISetVerbAndUrlAction, state: RequestState): RequestState {
    const parts = deconstructUrl(action.url);
    const parsedRoutes = mergeRouteParameters(action.requestId, parts.detectedRouteParameters, parts.summaryPath, state);
    const routeParameters = parsedRoutes;
    const parsedQuery = mergeQueryStringComponents(action.requestId, parts.queryString, state);
    const queryParameters = parsedQuery;

    return {
        ...state,
        isDirty: true,
        current: {
            ...state.current,
            url: parts.summaryPath,
            queryParameters,
            routeParameters,
        },
    }
}

/**
 * When entering a new URL, route parameters being input "win", but the route parameters
 * which already exist should have their state migrated to the new parameters (such as, if
 * there are already values or descriptions. Route parameters can't be disabled.)
 *
 * @param components The deconstructed route parameter components
 * @param originalState The previous state
 */
function mergeRouteParameters(requestId: string, components: IToken[], path: string, originalState: RequestState): IMap<string, INetConsoleParameter> {
    const originalParameters = originalState.current.routeParameters;
    const result = components.map(token => {
        const key = path.substr(token.start, token.length);
        const originalItem = originalParameters.get(key);
        if (originalItem) {
            return originalItem;
        }
        else {
            const param: INetConsoleParameter = {
                key,
                value: '',
                description: '',
                isActive: true,
            };
            return param;
        }
    });

    return resetIDs(requestId, ID_DIV_ROUTE, result);
}

/**
 * When entering a new URL, the query string components only "win" if there are new query strings
 * (which contrasts with the behavior of route parameters). This is because the UI-based URL does
 * not include a query string, but the query string is composed when sending the request.
 *
 * @param components The deconstructed query string tokens
 * @param originalState The previous state
 */
function mergeQueryStringComponents(requestId: string, components: IHttpHeader[], originalState: RequestState): IMap<string, INetConsoleParameter> {
    if (components.length === 0) {
        // TODO: originalState.current -> originalState.requests.get(requestId)
        return originalState.current.queryParameters;
    }

    // TODO: Fix: repeated query parameters won't be parsed correctly here
    const originalParameters = originalState.current.queryParameters;
    let nextId = originalParameters.size;
    const result = components.map(qp => {
        const originalItem = originalParameters.get(qp.key);
        if (originalItem) {
            return {
                ...originalItem,
                value: qp.value,
                isActive: true,
            };
        }
        else {
            return {
                key: qp.key,
                value: qp.value,
                isActive: true,
                description: '',
                id: `${requestId}${ID_DIV_QUERY}${nextId++}`,
            };
        }
    });

    return resetIDs(requestId, ID_DIV_QUERY, result);
}
