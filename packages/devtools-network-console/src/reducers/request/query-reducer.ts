// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { INetConsoleParameter } from 'network-console-shared';

import { QueryAction } from 'actions/request/query';
import assert from 'utility/assert';
import { resetIDs, ID_DIV_QUERY } from './id-manager';
import { RequestsState } from '.';

export default function reduceQuery(action: QueryAction, collection: RequestsState): RequestsState {
    const state = collection.get(action.requestId);
    if (!state) {
        throw new RangeError('Invalid request ID');
    }
    let result = state;

    switch (action.type) {
        case 'REQUEST_QUERY_ADD': {
            const { name, value, description, isActive } = action;
            const newParam: INetConsoleParameter = {
                key: name,
                value,
                description,
                isActive,
            };

            result = {
                ...state,
                isDirty: true,
                current: {
                    ...state.current,
                    queryParameters: state.current.queryParameters.set(action.id, newParam),
                },
            };
            break;
        }

        case 'REQUEST_QUERY_EDIT': {
            const itemToModify = state.current.queryParameters.get(action.id);
            assert(!!itemToModify, 'Could not find query parameter to modify. Instead of edit, use add action.');

            const { description, value, isActive } = action;
            const newQuery: INetConsoleParameter = {
                key: action.newName,
                value,
                description,
                isActive,
            };
            result = {
                ...state,
                isDirty: true,
                current: {
                    ...state.current,
                    queryParameters: state.current.queryParameters.set(action.id, newQuery),
                },
            };
            break;
        }

        case 'REQUEST_QUERY_REMOVE': {
            const itemToRemove = state.current.queryParameters.get(action.id);
            assert(!!itemToRemove, 'Could not find query to remove.');

            let newQueries = state.current.queryParameters.remove(action.id);
            newQueries = resetIDs(action.requestId, ID_DIV_QUERY, newQueries.values());

            result = {
                ...state,
                isDirty: true,
                current: {
                    ...state.current,
                    queryParameters: newQueries,
                },
            };
            break;
        }
    }

    if (result !== state) {
        return collection.set(action.requestId, result);
    }

    return collection;
}
