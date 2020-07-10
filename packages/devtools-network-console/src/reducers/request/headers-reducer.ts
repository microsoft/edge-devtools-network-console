// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    HeaderAction
} from 'actions/request/headers';
import assert from 'utility/assert';
import { resetIDs, ID_DIV_HEADER } from './id-manager';
import { RequestsState } from '.';
import { INetConsoleParameter } from 'network-console-shared';

export default function reduceRequestHeaders(action: HeaderAction, collection: RequestsState): RequestsState {
    const state = collection.get(action.requestId);
    if (!state) {
        throw new RangeError('Invalid request ID');
    }

    let result = state;

    switch (action.type) {
        case 'REQUEST_HEADER_ADD': {
            assert(!state.current.headers.get(action.id),
                'Must not add a header to the collection where one with a matching ID already exists.');

            const { name, value, description, isActive } = action;
            const newHeader: INetConsoleParameter = {
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
                    headers: state.current.headers.set(action.id, newHeader),
                },
            };
            break;
        }

        case 'REQUEST_HEADER_EDIT': {
            const oldHeader = state.current.headers.get(action.id);
            assert(!!oldHeader, 'Could not find header to modify. Instead of edit, use Add Header action.');

            const newHeader: INetConsoleParameter = {
                description: action.description,
                isActive: action.isActive,
                key: action.newName,
                value: action.value,
            };

            result = {
                ...state,
                isDirty: true,
                current: {
                    ...state.current,
                    headers: state.current.headers.set(action.id, newHeader),
                },
            };
            break;
        }

        case 'REQUEST_HEADER_REMOVE': {
            const headerToRemove = state.current.headers.get(action.id);
            assert(!!headerToRemove, 'Could not find header to remove.');

            let newHeaders = state.current.headers.remove(action.id);
            newHeaders = resetIDs(action.requestId, ID_DIV_HEADER, newHeaders.values());

            result = {
                ...state,
                isDirty: true,
                current: {
                    ...state.current,
                    headers: newHeaders,
                },
            };
            break;
        }

        case 'REQUEST_SET_BODY_TEXT_TYPE': {
            const headerEntry = state.current.headers.findEntry(v => v.key.toLowerCase() === 'content-type');
            let headers = state.current.headers;
            if (!headerEntry) {
                headers = headers.set(`${action.requestId}H${headers.size}`, {
                    description: '(Set by body content type selection)',
                    isActive: true,
                    key: 'Content-Type',
                    value: action.contentType,
                });
            }
            else {
                const oldHeader = headerEntry[1];
                const newHeader = {
                    ...oldHeader,
                    value: action.contentType,
                };
                headers = headers.set(headerEntry[0], newHeader);
            }

            result = {
                ...state,
                isDirty: true,
                current: {
                    ...state.current,
                    headers,
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
