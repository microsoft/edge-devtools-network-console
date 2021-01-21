// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Map as IMap } from 'immutable';
import { INetConsoleParameter } from 'network-console-shared';

import { IModalState, MODAL_AUTHORIZATION_REQUEST_ID } from '../../store';
import { ModalAction } from 'actions/modal';
import { alterAuthorization } from '../shared/auth';
import { resetIDs, ID_DIV_ENVIRONMENT } from 'reducers/request/id-manager';
import assert from 'utility/assert';

const DEFAULT_MODAL_STATE: IModalState = {
    authorization: null,
    authorizationCollectionId: null,
    authorizationPaths: [],

    collections: {
        open: false,
        selectedCollectionId: null,
    },
    environment: {
        name: '',
        id: '',
        fileName: '',
        collectionName: '',
        values: IMap(),
    },
};

export default function reduceModalState(state: IModalState = DEFAULT_MODAL_STATE, action: ModalAction): IModalState {
    switch (action.type) {
        case 'REQUEST_AUTH_BASIC_SET_VALUES':
        case 'REQUEST_AUTH_SET_KIND':
        case 'REQUEST_AUTH_TOKEN_SET_VALUES':
            if (!state.authorization) {
                return state;
            }

            if (action.requestId === MODAL_AUTHORIZATION_REQUEST_ID) {
                return {
                    ...state,
                    authorization: alterAuthorization(action, state.authorization),
                };
            }

            break;
        case 'MODAL_AUTH_EDIT':
            return {
                ...state,
                authorization: action.auth,
                authorizationCollectionId: action.collectionId,
                authorizationPaths: action.paths,
            };

        case 'MODAL_AUTH_DISMISS':
            return {
                ...state,
                authorizationCollectionId: null,
                authorization: null,
                authorizationPaths: [],
            };

        case 'MODAL_START_SELECT_COLLECTION':
            return {
                ...state,
                collections: {
                    ...state.collections,
                    selectedCollectionId: (action.isSelectionActive && action.defaultCollectionId) ? action.defaultCollectionId : null,
                    open: action.isSelectionActive,
                },
            };

        case 'MODAL_CHOOSE_COLLECTION_FOR_SAVE':
            return {
                ...state,
                collections: {
                    ...state.collections,
                    selectedCollectionId: action.collectionId,
                },
            };

        case 'MODAL_EDIT_ENVIRONMENT_START':
            return {
                ...state,
                environment: {
                    id: action.id,
                    name: action.name,
                    values: resetIDs('', ID_DIV_ENVIRONMENT, action.values),
                    fileName: action.fileName,
                    collectionName: action.collectionName,
                },
            };

        case 'MODAL_ENVIRONMENT_VALUE_ADD': {
            assert(!state.environment.values.findEntry(h => h.key === action.name),
                'Must not add a variable to the collection where one with a matching name already exists. Instead, use the Edit Value action.');
            assert(!state.environment.values.get(action.id),
                'Must not add an environment variable to the collection where one with a matching ID already exists.');

            const { name, value, description, isActive } = action;
            const newEntry: INetConsoleParameter = {
                key: name,
                value,
                description,
                isActive,
            };

            return {
                ...state,
                environment: {
                    ...state.environment,
                    values: state.environment.values.set(action.id, newEntry),
                },
            };
        }

        case 'MODAL_ENVIRONMENT_VALUE_EDIT': {
            const itemToModify = state.environment.values.get(action.id);
            assert(!!itemToModify, 'Could not find variable to modify. Instead of edit, use Add Variable action.');

            const newItem: INetConsoleParameter = {
                description: action.description,
                isActive: action.isActive,
                key: action.newName,
                value: action.value,
            };

            return {
                ...state,
                environment: {
                    ...state.environment,
                    values: state.environment.values.set(action.id, newItem),
                },
            };
        }

        case 'MODAL_ENVIRONMENT_VALUE_REMOVE': {
            const itemToRemove = state.environment.values.get(action.id);
            assert(!!itemToRemove, 'Could not find variable to remove.');

            const newEnvList = state.environment.values.toArray().filter(pair => pair[0] !== action.id)
                .map(pair => pair[1]);
            const newEnv = resetIDs('', ID_DIV_ENVIRONMENT, newEnvList);

            return {
                ...state,
                environment: {
                    ...state.environment,
                    values: newEnv,
                },
            };
        }

        case 'MODAL_EDIT_ENVIRONMENT_DISMISS':
            return {
                ...state,
                environment: {
                    ...DEFAULT_MODAL_STATE.environment,
                },
            };
    }

    return state;
}
