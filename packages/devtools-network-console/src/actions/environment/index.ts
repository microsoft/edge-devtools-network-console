// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { INetConsoleAuthorization, INetConsoleParameter } from 'network-console-shared';

import assert from 'utility/assert';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { IView } from 'store';
import { AppHost } from 'store/host';
import { makeDismissEditEnvironmentAction } from 'actions/modal';
export interface ISetEnvironmentAuthorizationAction {
    type: 'ENV_SET_AMBIENT_AUTHORIZATION';
    requestId: string;
    authorization: INetConsoleAuthorization | null;
    authorizationPath: string[];
}

export interface ISetEnvironmentVariablesAction {
    type: 'ENV_SET_VARIABLES';
    id: string;
    name: string;
    variables: INetConsoleParameter[];
}

export interface IClearEnvironmentVariablesAction {
    type: 'ENV_CLEAR_VARIABLES';
}

export const ENVIRONMENT_ACTION_TYPES = new Set<string>([
    'ENV_SET_AMBIENT_AUTHORIZATION',
    'ENV_SET_VARIABLES',
    'ENV_CLEAR_VARIABLES',
]);
export type EnvironmentAction =
    ISetEnvironmentAuthorizationAction |
    ISetEnvironmentVariablesAction |
    IClearEnvironmentVariablesAction
    ;

export function isEnvironmentAction(action: AnyAction): action is EnvironmentAction {
    return ENVIRONMENT_ACTION_TYPES.has(action.type);
}

export function makeSetEnvironmentAuthorizationAction(requestId: string, authorization: INetConsoleAuthorization | null, authorizationPath: string[]): ISetEnvironmentAuthorizationAction {
    assert(!!(authorization || authorizationPath.length === 0),
        'Should not set an authorization path when clearing the ambient authorization context.');

    return {
        type: 'ENV_SET_AMBIENT_AUTHORIZATION',
        requestId,
        authorization,
        authorizationPath,
    };
}

export function makeSetEnvironmentVariablesAction(id: string, name: string, variables: INetConsoleParameter[]): ISetEnvironmentVariablesAction {
    return {
        id,
        name,
        type: 'ENV_SET_VARIABLES',
        variables,
    };
}

export function makeClearEnvironmentVariablesAction(): IClearEnvironmentVariablesAction {
    return {
        type: 'ENV_CLEAR_VARIABLES',
    };
}

export function saveEnvironmentToHost(variables: INetConsoleParameter[], environmentId: string): ThunkAction<void, IView, void, AnyAction> {
    return async dispatch => {
        await AppHost.saveEnvironment(variables, environmentId);
        dispatch(makeDismissEditEnvironmentAction());
    };
}
