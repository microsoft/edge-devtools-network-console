// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { INetConsoleParameter } from 'network-console-shared';

import { RouteAction } from 'actions/request/route';
import assert from 'utility/assert';
import { RequestsState } from '.';

export default function reduceRoute(action: RouteAction, collection: RequestsState): RequestsState {
    const state = collection.get(action.requestId);
    if (!state) {
        throw new RangeError('Invalid request ID.');
    }
    let result = state;

    switch (action.type) {
        case 'REQUEST_ROUTE_EDIT':
            const itemToModify = state.current.routeParameters.get(action.id);
            assert(!!itemToModify, 'Could not find route parameter to modify. Instead of edit, use add action.');

            const { description, value, isActive } = action;
            const newRoute: INetConsoleParameter = {
                key: itemToModify.key,
                value,
                description,
                isActive,
            };
            const newRoutes = state.current.routeParameters.set(action.id, newRoute);
            result = {
                ...state,
                isDirty: true,
                current: {
                    ...state.current,
                    routeParameters: newRoutes,
                },
            };
            break;
    }

    if (result !== state) {
        return collection.set(action.requestId, result);
    }

    return collection;
}
