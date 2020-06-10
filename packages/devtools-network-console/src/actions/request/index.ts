// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BasicRequestAction, BASIC_REQUEST_ACTION_TYPES } from './basics';
import { HeaderAction, HEADER_REQUEST_ACTION_TYPES } from './headers';
import { QueryAction, QUERY_REQUEST_ACTION_TYPES } from './query';
import { RouteAction, ROUTE_REQUEST_ACTION_TYPES } from './route';
import { BodyAction, BODY_REQUEST_ACTION_TYPES } from './body';
import { ILoadRequestAction } from '../common';
import { AuthAction, AUTH_ACTIONS } from './auth';
import { ConfigureFetchAction, FETCH_ACTIONS } from './fetch';

export type RequestAction =
    BasicRequestAction |
    HeaderAction |
    QueryAction |
    RouteAction |
    BodyAction |
    AuthAction |
    ConfigureFetchAction |
    ILoadRequestAction
    ;

export function isBasicRequestAction(action: RequestAction): action is BasicRequestAction {
    return BASIC_REQUEST_ACTION_TYPES.has(action.type);
}

export function isHeaderRequestAction(action: RequestAction): action is HeaderAction {
    return HEADER_REQUEST_ACTION_TYPES.has(action.type);
}

export function isQueryRequestAction(action: RequestAction): action is QueryAction {
    return QUERY_REQUEST_ACTION_TYPES.has(action.type);
}

export function isRouteRequestAction(action: RequestAction): action is RouteAction {
    return ROUTE_REQUEST_ACTION_TYPES.has(action.type);
}

export function isBodyComponentsRequestAction(action: RequestAction): action is BodyAction {
    return BODY_REQUEST_ACTION_TYPES.has(action.type);
}

export function isAuthorizationRequestAction(action: RequestAction): action is AuthAction {
    return AUTH_ACTIONS.has(action.type);
}

export function isFetchRequestAction(action: RequestAction): action is ConfigureFetchAction {
    return FETCH_ACTIONS.has(action.type);
}
