// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { INetConsoleAuthorization, INetConsoleParameter } from 'network-console-shared';

import { AuthAction } from '../request/auth';
import { ThunkAction } from 'redux-thunk';
import { IView } from 'store';
import { AnyAction } from 'redux';
import { AppHost } from 'store/host';

export interface ISelectCollectionForSaveAction {
    type: 'MODAL_START_SELECT_COLLECTION';
    defaultCollectionId: string | null;
    isSelectionActive: boolean;
}

export interface IEditAuthorizationInModalAction {
    type: 'MODAL_AUTH_EDIT';

    collectionId: string;
    paths: string[];
    auth: INetConsoleAuthorization;
}

export interface IChooseCollectionForSaveAction {
    type: 'MODAL_CHOOSE_COLLECTION_FOR_SAVE';

    collectionId: string;
}

export interface IDismissAuthorizationModalAction {
    type: 'MODAL_AUTH_DISMISS';
}

export interface IEditEnvironmentAction {
    type: 'MODAL_EDIT_ENVIRONMENT_START';
    id: string;
    fileName: string;
    collectionName: string;
    name: string;
    values: INetConsoleParameter[];
}

export interface IDismissEditEnvironmentAction {
    type: 'MODAL_EDIT_ENVIRONMENT_DISMISS';
}

export interface IAddEnvVarAction {
    type: 'MODAL_ENVIRONMENT_VALUE_ADD';

    id: string;
    name: string;
    value: string;
    description: string;
    isActive: boolean;
}

export interface IEditEnvVarAction {
    type: 'MODAL_ENVIRONMENT_VALUE_EDIT';

    id: string;
    newName: string;
    value: string;
    description: string;
    isActive: boolean;
}

export interface IRemoveEnvVarAction {
    type: 'MODAL_ENVIRONMENT_VALUE_REMOVE';

    id: string;
}

export type ModalAction =
    AuthAction |
    IEditAuthorizationInModalAction |
    IDismissAuthorizationModalAction |
    ISelectCollectionForSaveAction |
    IChooseCollectionForSaveAction |
    IEditEnvironmentAction |
    IAddEnvVarAction |
    IEditEnvVarAction |
    IRemoveEnvVarAction |
    IDismissEditEnvironmentAction
    ;

export function makeEditAuthorizationInModalAction(
        collectionId: string,
        paths: string[],
        auth: INetConsoleAuthorization
    ): IEditAuthorizationInModalAction {
    return {
        type: 'MODAL_AUTH_EDIT',

        collectionId,
        paths,
        auth,
    };
}

export function makeDismissAuthorizationModalAction(): IDismissAuthorizationModalAction {
    return {
        type: 'MODAL_AUTH_DISMISS',
    };
}

export function makeSelectCollectionForSaveAction(defaultCollectionId: string | null, isSelectionActive: boolean): ISelectCollectionForSaveAction {
    return {
        type: 'MODAL_START_SELECT_COLLECTION',
        defaultCollectionId,
        isSelectionActive,
    };
}

export function makeChooseCollectionForSaveAction(collectionId: string): IChooseCollectionForSaveAction {
    return {
        type: 'MODAL_CHOOSE_COLLECTION_FOR_SAVE',
        collectionId,
    };
}

export function doSaveCollectionAuthorizationToHost(collectionId: string, authorization: INetConsoleAuthorization): ThunkAction<void, IView, void, AnyAction> {
    return async dispatch => {
        try {
            await AppHost.saveCollectionAuthorization(collectionId, authorization);
            dispatch(makeDismissAuthorizationModalAction());
        }
        catch {
            // TODO: Reconsider for webview
            // Error is swallowed for now; VS Code presents the error
        }
    }
}

export function makeEditEnvironmentAction(id: string, fileName: string, collectionName: string, name: string, values: INetConsoleParameter[]): IEditEnvironmentAction {
    return {
        type: 'MODAL_EDIT_ENVIRONMENT_START',
        id,
        fileName,
        collectionName,
        name,
        values,
    };
}

export function makeAddEnvVarAction(id: string, name: string, value: string, description: string, isActive: boolean): IAddEnvVarAction {
    return {
        type: 'MODAL_ENVIRONMENT_VALUE_ADD',
        id,
        name,
        value,
        description,
        isActive,
    };
}

export function makeEditEnvVarAction(id: string, newName: string, value: string, description: string, isActive: boolean): IEditEnvVarAction {
    return {
        type: 'MODAL_ENVIRONMENT_VALUE_EDIT',
        id,
        newName,
        value,
        description,
        isActive,
    };
}

export function makeRemoveEnvVarAction(id: string): IRemoveEnvVarAction {
    return {
        type: 'MODAL_ENVIRONMENT_VALUE_REMOVE',
        id,
    };
}

export function makeDismissEditEnvironmentAction() : IDismissEditEnvironmentAction {
    return {
        type: 'MODAL_EDIT_ENVIRONMENT_DISMISS',
    };
}
