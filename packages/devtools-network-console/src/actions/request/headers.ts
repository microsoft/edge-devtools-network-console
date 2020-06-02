// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ISetBodyRawTextTypeAction } from './body';

export interface IAddHeaderAction {
    type: 'REQUEST_HEADER_ADD';
    requestId: string;

    id: string;
    name: string;
    value: string;
    description: string;
    isActive: boolean;
}

export interface IEditHeaderAction {
    type: 'REQUEST_HEADER_EDIT';
    requestId: string;

    id: string;
    newName: string;
    value: string;
    description: string;
    isActive: boolean;
}

export interface IRemoveHeaderAction {
    type: 'REQUEST_HEADER_REMOVE';
    requestId: string;

    id: string;
}

export const HEADER_REQUEST_ACTION_TYPES = new Set<string>([
    'REQUEST_HEADER_ADD',
    'REQUEST_HEADER_EDIT',
    'REQUEST_HEADER_REMOVE',
    // from: Body
    'REQUEST_SET_BODY_TEXT_TYPE',
]);
export type HeaderAction =
    IAddHeaderAction |
    IEditHeaderAction |
    IRemoveHeaderAction |
    ISetBodyRawTextTypeAction
    ;

export function addHeaderAction(requestId: string, id: string, name: string, value: string, description: string, isActive: boolean): IAddHeaderAction {
    return {
        type: 'REQUEST_HEADER_ADD',
        requestId,
        id,
        name,
        value,
        description,
        isActive,
    };
}

export function editHeaderAction(requestId: string, id: string, newName: string, value: string, description: string, isActive: boolean): IEditHeaderAction {
    return {
        type: 'REQUEST_HEADER_EDIT',
        requestId,

        id,
        newName,
        value,
        description,
        isActive,
    };
}

export function removeHeaderAction(requestId: string, id: string): IRemoveHeaderAction {
    return {
        type: 'REQUEST_HEADER_REMOVE',
        requestId,

        id,
    };
}
