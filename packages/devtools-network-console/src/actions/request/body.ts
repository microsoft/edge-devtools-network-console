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

// TODO: Remove
// export function doEditBodyForDataFileParamsAction(
//     requestId: string,
//     id: string,
//     fileName: string,
//     fileContents: Base64String,
//     inputType: 'text' | 'file'
// ): ThunkAction<void, IView, void, AnyAction> {
//     const bodySerializer: AsyncBodySerializer = calculateFormDataBody;
//     const parametersGetter: ParametersGetter = getFormDataParams;
//     return async (dispatch, getState) => {
//         let unfulfilled = true;

//         let triesRemaining = 5;
//         const replacement: Partial<IFormDataParameter> = {
//             value: fileName,
//             type: inputType,
//             fileContents,
//         };

//         do {
//             const state = getState();
//             const environment = !!state.environment.environment.id ? state.environment.environment.variables : [];
//             const before = parametersGetter(requestId, state);
//             const composed = before.slice();
//             const indexToReplace = composed.findIndex(i => i.id === id);
//             if (indexToReplace === -1 && triesRemaining === 0) {
//                 return;
//             }
//             else if (indexToReplace === -1) {
//                 triesRemaining--;
//                 continue;
//             }
//             const itemToReplace = composed[indexToReplace];
//             const finalReplacement = {
//                 ...itemToReplace,
//                 ...replacement,
//             };
//             composed.splice(indexToReplace, 1, finalReplacement);

//             const body = await bodySerializer(composed, environment);
//             const after = parametersGetter(requestId, getState());
//             if (before === after) {
//                 dispatch(makeEditBodyFormDataFileParams(requestId, id, fileName, fileContents, inputType, body));
//                 unfulfilled = false;
//             }

//         } while (unfulfilled);
//     };
// }

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

// export function addBodyItemAction(requestId: string,
//                                   itemType: BodyItemType,
//                                   id: string,
//                                   name: string,
//                                   value: string,
//                                   description: string,
//                                   isActive: boolean): ThunkAction<void, IView, void, AnyAction> {
//     const bodySerializer: AsyncBodySerializer = itemType === 'form-data' ? calculateFormDataBody : calculateUrlEncodedDataBody;
//     const parametersGetter: ParametersGetter = itemType === 'form-data' ? getFormDataParams : getUrlEncodedParams;
//     return async (dispatch, getState) => {
//         let unfulfilled = true;

//         do {
//             const state = getState();
//             const environment = !!state.environment.environment.id ? state.environment.environment.variables : [];
//             const before = parametersGetter(requestId, state);
//             const composed = before.slice();
//             composed.push({
//                 id,
//                 description,
//                 isActive,
//                 key: name,
//                 value,
//             });
//             const body = await bodySerializer(composed, environment);
//             const after = parametersGetter(requestId, getState());
//             if (before === after) {
//                 dispatch(addBodyDataItemAction(requestId, itemType, id, name, value, description, isActive, body));
//                 unfulfilled = false;
//             }

//         } while (unfulfilled);
//     };
// }

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

// export function editBodyItemAction(requestId: string,
//                                    itemType: BodyItemType,
//                                        id: string,
//                                        name: string,
//                                        value: string,
//                                        description: string,
//                                        isActive: boolean): ThunkAction<void, IView, void, AnyAction> {
//     const bodySerializer: AsyncBodySerializer = itemType === 'form-data' ? calculateFormDataBody : calculateUrlEncodedDataBody;
//     const parametersGetter: ParametersGetter = itemType === 'form-data' ? getFormDataParams : getUrlEncodedParams;

//     return async (dispatch, getState) => {
//         let unfulfilled = true;

//         let triesRemaining = 5;
//         const replacement = {
//             id,
//             description,
//             isActive,
//             key: name,
//             value,
//         };

//         do {
//             const state = getState();
//             const environment = !!state.environment.environment.id ? state.environment.environment.variables : [];
//             const before = parametersGetter(requestId, state);
//             const composed = before.slice();
//             const indexToReplace = composed.findIndex(i => i.id === id);
//             if (indexToReplace === -1 && triesRemaining === 0) {
//                 return;
//             }
//             else if (indexToReplace === -1) {
//                 triesRemaining--;
//                 continue;
//             }
//             composed.splice(indexToReplace, 1, replacement);

//             const body = await bodySerializer(composed, environment);
//             const after = parametersGetter(requestId, getState());
//             if (before === after) {
//                 dispatch(editBodyDataItemAction(requestId, itemType, id, name, value, description, isActive, body));
//                 unfulfilled = false;
//             }

//         } while (unfulfilled);
//     };
// }

// Dispatched by removeBodyItemAction

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

// export function removeBodyItemAction(requestId: string,
//                                      itemType: BodyItemType,
//                                      id: string): ThunkAction<void, IView, void, AnyAction> {
//     const parametersGetter: ParametersGetter = itemType === 'form-data' ? getFormDataParams : getUrlEncodedParams;

//     return async (dispatch, getState) => {
//         let unfulfilled = true;

//         let triesRemaining = 5;
//         do {
//             const state = getState();
//             const environment = !!state.environment.environment.id ? state.environment.environment.variables : [];
//             const before = parametersGetter(requestId, getState());
//             const composed = before.slice();
//             const indexToDelete = composed.findIndex(i => i.id === id);
//             if (indexToDelete === -1 && triesRemaining === 0) {
//                 return;
//             }
//             else if (indexToDelete === -1) {
//                 triesRemaining--;
//                 continue;
//             }
//             composed.splice(indexToDelete, 1);

//             const after = parametersGetter(requestId, getState());
//             if (before === after) {
//                 dispatch(removeBodyDataItemAction(requestId, itemType, id, body));
//                 unfulfilled = false;
//             }

//         } while (unfulfilled);
//     };
// }

export function setBodyTypeAction(requestId: string, bodyType: BodyType): ISetBodyTypeAction {
    return {
        type: 'REQUEST_SET_BODY_TYPE',
        requestId,
        bodyType,
    };
}
