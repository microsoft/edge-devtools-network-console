// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IEditRouteAction {
    type: 'REQUEST_ROUTE_EDIT';
    requestId: string;

    id: string;
    value: string;
    description: string;
    isActive: boolean;
}

// Route parameters can't be manually added or removed because they're
// composed via the URL parameter. Also, the key can't be edited here -
// it is read-only as determined by the URL.
export const ROUTE_REQUEST_ACTION_TYPES = new Set<string>([
    'REQUEST_ROUTE_EDIT',
]);
export type RouteAction =
    IEditRouteAction
    ;

export function editRouteAction(requestId: string, id: string, value: string, description: string, isActive: boolean): IEditRouteAction {
    return {
        type: 'REQUEST_ROUTE_EDIT',
        requestId,

        id,
        value,
        description,
        isActive,
    };
}
