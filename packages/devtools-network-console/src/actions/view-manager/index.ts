// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ILoadRequestAction } from '../common';
import { AnyAction } from 'redux';
import { ISaveRequestAction } from 'actions/request/basics';

export interface IChooseViewAction {
    type: 'CHOOSE_VIEW';
    requestId: string;
}

export interface ICloseViewAction {
    type: 'CLOSE_VIEW';
    requestId: string;
}

const VIEW_MANAGER_ACTIONS = new Set<string>([
    'CHOOSE_VIEW',
    'LOAD_REQUEST',
    'REQUEST_SAVE',
    'CLOSE_VIEW',
]);
export type ViewManagerAction =
    IChooseViewAction |
    ILoadRequestAction |
    ISaveRequestAction |
    ICloseViewAction
    ;

export function isViewManagerAction(action: AnyAction): action is ViewManagerAction {
    return VIEW_MANAGER_ACTIONS.has(action.type);
}

export function chooseViewAction(requestId: string): IChooseViewAction {
    return {
        type: 'CHOOSE_VIEW',
        requestId,
    };
}

export function closeViewAction(requestId: string): ICloseViewAction {
    return {
        type: 'CLOSE_VIEW',
        requestId,
    };
}
