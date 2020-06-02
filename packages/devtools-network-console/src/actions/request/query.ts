// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IAddQueryAction {
    type: 'REQUEST_QUERY_ADD';
    requestId: string;

    id: string;
    name: string;
    value: string;
    description: string;
    isActive: boolean;
}

export interface IEditQueryAction {
    type: 'REQUEST_QUERY_EDIT';
    requestId: string;

    id: string;
    newName: string;
    value: string;
    description: string;
    isActive: boolean;
}

export interface IRemoveQueryAction {
    type: 'REQUEST_QUERY_REMOVE';
    requestId: string;

    id: string;
}

export const QUERY_REQUEST_ACTION_TYPES = new Set<string>([
    'REQUEST_QUERY_ADD',
    'REQUEST_QUERY_EDIT',
    'REQUEST_QUERY_REMOVE',
]);
export type QueryAction =
    IAddQueryAction |
    IEditQueryAction |
    IRemoveQueryAction
    ;

export function addQueryAction(requestId: string, id: string, name: string, value: string, description: string, isActive: boolean): IAddQueryAction {
    return {
        type: 'REQUEST_QUERY_ADD',
        requestId,

        id,
        name,
        value,
        description,
        isActive,
    };
}

export function editQueryAction(requestId: string, id: string, newName: string, value: string, description: string, isActive: boolean): IEditQueryAction {
    return {
        type: 'REQUEST_QUERY_EDIT',
        requestId,

        id,
        newName,
        value,
        description,
        isActive,
    };
}

export function removeQueryAction(requestId: string, id: string): IRemoveQueryAction {
    return {
        type: 'REQUEST_QUERY_REMOVE',
        requestId,

        id,
    };
}
