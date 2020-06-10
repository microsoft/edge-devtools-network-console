// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Base64String } from 'network-console-shared';

export interface ISetBodyRawTextAction {
    type: 'REQUEST_EDIT_BODY_TEXT';
    requestId: string;
    text: string | Base64String;
}

export interface ISetBodyRawTextTypeAction {
    type: 'REQUEST_SET_BODY_TEXT_TYPE';
    requestId: string;
    contentType: string;
}

export type BodyItemType = 'form-data' | 'x-www-form-urlencoded';
export type BodyType = 'none' | BodyItemType | 'raw';

export interface IAddBodyItemAction {
    type: 'REQUEST_ADD_BODY_ITEM';
    requestId: string;
    bodyArea: BodyItemType;
    id: string;
    name: string;
    value: string;
    description: string;
    isActive: boolean;
}

export interface IEditFormDataFileParametersAction {
    type: 'REQUEST_EDIT_BODY_FORM_DATA_FILE';
    requestId: string;
    id: string;
    fileName: string;
    fileContents: Base64String;
    inputType: 'text' | 'file';
}

export interface IEditBodyItemAction {
    type: 'REQUEST_EDIT_BODY_ITEM';
    requestId: string;
    bodyArea: BodyItemType;
    id: string;
    name: string;
    value: string;
    description: string;
    isActive: boolean;
}

export interface IRemoveBodyItemAction {
    type: 'REQUEST_REMOVE_BODY_ITEM';
    requestId: string;
    bodyArea: BodyItemType;
    id: string;
}

export interface ISetBodyTypeAction {
    type: 'REQUEST_SET_BODY_TYPE';
    requestId: string;
    bodyType: BodyType;
}

export type BodyAction =
    ISetBodyRawTextAction |
    ISetBodyRawTextTypeAction |
    IAddBodyItemAction |
    IEditBodyItemAction |
    IRemoveBodyItemAction |
    ISetBodyTypeAction |
    IEditFormDataFileParametersAction
    ;
export const BODY_REQUEST_ACTION_TYPES = new Set<string>([
    'REQUEST_EDIT_BODY_TEXT',
    'REQUEST_SET_BODY_TEXT_TYPE',
    'REQUEST_ADD_BODY_ITEM',
    'REQUEST_EDIT_BODY_ITEM',
    'REQUEST_REMOVE_BODY_ITEM',
    'REQUEST_SET_BODY_TYPE',
    'REQUEST_EDIT_BODY_FORM_DATA_FILE',
]);

export function editBodyTextAction(requestId: string, text: string): ISetBodyRawTextAction {
    return {
        type: 'REQUEST_EDIT_BODY_TEXT',
        requestId,
        text,
    };
}

export function setBodyTextTypeAction(requestId: string, contentType: string): ISetBodyRawTextTypeAction {
    return {
        type: 'REQUEST_SET_BODY_TEXT_TYPE',
        requestId,
        contentType,
    };
}

export function editBodyFormDataFileParams(requestId: string, id: string, fileName: string, fileContents: Base64String, inputType: 'text' | 'file'): IEditFormDataFileParametersAction {
    return {
        type: 'REQUEST_EDIT_BODY_FORM_DATA_FILE',
        requestId,
        id,
        fileName,
        fileContents,
        inputType,
    };
}

export function addBodyDataItemAction(requestId: string,
                                      bodyArea: BodyItemType,
                                      id: string,
                                      name: string,
                                      value: string,
                                      description: string,
                                      isActive: boolean): IAddBodyItemAction {

    return {
        type: 'REQUEST_ADD_BODY_ITEM',
        requestId,
        bodyArea,
        id,
        name,
        value,
        description,
        isActive,
    };
}

export function editBodyDataItemAction(requestId: string,
                                       bodyArea: BodyItemType,
                                       id: string,
                                       name: string,
                                       value: string,
                                       description: string,
                                       isActive: boolean): IEditBodyItemAction {
    return {
        type: 'REQUEST_EDIT_BODY_ITEM',
        requestId,
        bodyArea,
        id,
        name,
        value,
        description,
        isActive,
    };
}

export function removeBodyDataItemAction(requestId: string,
                                         bodyArea: BodyItemType,
                                         id: string): IRemoveBodyItemAction {
    return {
        type: 'REQUEST_REMOVE_BODY_ITEM',
        requestId,
        bodyArea,
        id,
    };
}

export function setBodyTypeAction(requestId: string, bodyType: BodyType): ISetBodyTypeAction {
    return {
        type: 'REQUEST_SET_BODY_TYPE',
        requestId,
        bodyType,
    };
}
