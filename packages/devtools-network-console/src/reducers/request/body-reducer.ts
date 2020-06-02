// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { INetConsoleParameter, IFormDataParameter } from 'network-console-shared';

import { BodyAction } from 'actions/request/body';
import { resetIDs, ID_DIV_FORM_DATA, ID_DIV_FORM_URLENCODED } from './id-manager';
import assert from 'utility/assert';
import { RequestsState } from '.';

export default function reduceBody(action: BodyAction, collection: RequestsState): RequestsState {
    const state = collection.get(action.requestId);
    if (!state) {
        throw new RangeError(`Request "${action.requestId}" could not be located.`);
    }

    switch (action.type) {
        // Toggle of none / raw / form-data / x-www-form-urlencoded
        case 'REQUEST_SET_BODY_TYPE': {
            const result = {
                ...state,
                isDirty: true,
                current: {
                    ...state.current,
                    bodyComponents: {
                        ...state.current.bodyComponents,
                        bodySelection: action.bodyType,
                    },
                },
            };
            return collection.set(action.requestId, result);
        }

        // content-type of bodySelection === 'raw'
        case 'REQUEST_SET_BODY_TEXT_TYPE': {
            const result = {
                ...state,
                isDirty: true,
                current: {
                    ...state.current,
                    bodyComponents: {
                        ...state.current.bodyComponents,
                        rawTextBody: {
                            ...state.current.bodyComponents.rawTextBody,
                            contentType: action.contentType,
                        },
                    },
                },
            };
            return collection.set(action.requestId, result);
        }

        // edit body text of bodySelection === 'raw'
        case 'REQUEST_EDIT_BODY_TEXT': {
            const result = {
                ...state,
                isDirty: true,
                current: {
                    ...state.current,
                    bodyComponents: {
                        ...state.current.bodyComponents,
                        rawTextBody: {
                            ...state.current.bodyComponents.rawTextBody,
                            text: action.text,
                        }
                    },
                    body: {
                        content: action.text,
                    },
                },
            };
            return collection.set(action.requestId, result);
        }

        // add form-data or x-www-form-urlencoded item
        case 'REQUEST_ADD_BODY_ITEM': {
            if (action.bodyArea === 'form-data') {
                if (state.current.bodyComponents.formData.has(action.id)) {
                    throw new RangeError(`Body section 'formData' already has an item with ID '${action.id}'. Use the edit action instead.`);
                }

                const newParam: IFormDataParameter = {
                    description: action.description,
                    isActive: action.isActive,
                    key: action.name,
                    type: 'text',
                    value: action.value,
                    fileContents: '',
                };
                const result = {
                    ...state,
                    isDirty: true,
                    current: {
                        ...state.current,
                        bodyComponents: {
                            ...state.current.bodyComponents,
                            formData: state.current.bodyComponents.formData.set(action.id, newParam),
                        },
                    },
                };
                return collection.set(action.requestId, result);
            }
            else { // x-www-form-urlencoded
                if (state.current.bodyComponents.xWwwFormUrlencoded.has(action.id)) {
                    throw new RangeError(`Body section 'xWwwFormUrlencoded' already has an item with ID '${action.id}'. Use the edit action instead.`);
                }

                const newParam: INetConsoleParameter = {
                    description: action.description,
                    isActive: action.isActive,
                    key: action.name,
                    value: action.value,
                };
                const result = {
                    ...state,
                    isDirty: true,
                    current: {
                        ...state.current,
                        bodyComponents: {
                            ...state.current.bodyComponents,
                            xWwwFormUrlencoded: state.current.bodyComponents.xWwwFormUrlencoded.set(action.id, newParam),
                        },
                    },
                };
                return collection.set(action.requestId, result);
            }
        }

        case 'REQUEST_EDIT_BODY_ITEM': {
            if (action.bodyArea === 'form-data') {
                const itemToModify = state.current.bodyComponents.formData.get(action.id);
                assert(!!itemToModify, 'Could not find item to modify. Instead of edit, use add.');

                const { name, description, value, isActive } = action;
                const newItem: IFormDataParameter = {
                    description,
                    isActive,
                    key: name,
                    type: itemToModify!.type,
                    value,
                    fileContents: itemToModify!.type,
                };
                const result = {
                    ...state,
                    isDirty: true,
                    current: {
                        ...state.current,
                        bodyComponents: {
                            ...state.current.bodyComponents,
                            formData: state.current.bodyComponents.formData.set(action.id, newItem),
                        },
                    },
                };
                return collection.set(action.requestId, result);
            }
            else { // x-www-form-urlencoded
                const itemToModify = state.current.bodyComponents.xWwwFormUrlencoded.get(action.id);
                assert(!!itemToModify, 'Could not find item to modify. Instead of edit, use add.');

                const { name, description, value, isActive } = action;
                const newItem: INetConsoleParameter = {
                    description,
                    isActive,
                    key: name,
                    value,
                };
                const result = {
                    ...state,
                    isDirty: true,
                    current: {
                        ...state.current,
                        bodyComponents: {
                            ...state.current.bodyComponents,
                            xWwwFormUrlencoded: state.current.bodyComponents.xWwwFormUrlencoded.set(action.id, newItem),
                        },
                    },
                };
                return collection.set(action.requestId, result);
            }
        }

        case 'REQUEST_REMOVE_BODY_ITEM': {
            const components: 'formData' | 'xWwwFormUrlencoded' = action.bodyArea === 'form-data' ? 'formData' : 'xWwwFormUrlencoded';
            const bodyIdSeparator = action.bodyArea === 'form-data' ? ID_DIV_FORM_DATA : ID_DIV_FORM_URLENCODED;

            const itemToRemove = state.current.bodyComponents[components].get(action.id);
            assert(!!itemToRemove, 'Could not find item to remove.');

            let newMap = state.current.bodyComponents[components].remove(action.id);
            newMap = resetIDs(action.requestId, bodyIdSeparator, newMap.values());

            const result = {
                ...state,
                isDirty: true,
                current: {
                    ...state.current,
                    bodyComponents: {
                        ...state.current.bodyComponents,
                        [components]: newMap,
                    },
                },
            };
            return collection.set(action.requestId, result);
        }

        case 'REQUEST_EDIT_BODY_FORM_DATA_FILE': {
            const itemToModify = state.current.bodyComponents.formData.get(action.id);
            assert(!!itemToModify, 'Could not find item to modify. Instead of edit, use add.');

            const { fileName, inputType, fileContents } = action;
            const newItem: IFormDataParameter = {
                ...itemToModify!,
                fileContents,
                type: inputType,
                value: fileName,
            };
            const result = {
                ...state,
                isDirty: true,
                current: {
                    ...state.current,
                    bodyComponents: {
                        ...state.current.bodyComponents,
                        formData: state.current.bodyComponents.formData.set(action.id, newItem),
                    },
                },
            };
            return collection.set(action.requestId, result);
        }
    }

    return collection;
}
