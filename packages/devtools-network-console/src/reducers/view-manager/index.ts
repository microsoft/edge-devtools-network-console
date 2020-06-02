// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Set } from 'immutable';
import { ViewManagerAction, isViewManagerAction } from 'actions/view-manager';

export interface IViewManagerState {
    openViews: Set<string>;
    currentView: string | null;
}

export const DEFAULT_VIEW_MANAGER_STATE: IViewManagerState = {
    openViews: Set(),
    currentView: null,
};

export default function reduceViewManager(state = DEFAULT_VIEW_MANAGER_STATE, action: ViewManagerAction): IViewManagerState {
    if (!isViewManagerAction(action)) {
        return state;
    }

    switch (action.type) {
        case 'CHOOSE_VIEW':
            const hasView = state.openViews.has(action.requestId);
            if (hasView) {
                return {
                    ...state,
                    currentView: action.requestId,
                };
            }
            return state;

        case 'CLOSE_VIEW':
            const has = state.openViews.has(action.requestId);
            const isCurrent = state.currentView === action.requestId;
            if (has) {
                if (isCurrent) {
                    return {
                        ...state,
                        openViews: state.openViews.remove(action.requestId),
                        // If the host wants a view to be shown, it should subsequently
                        // send a message to display it.
                        currentView: null,
                    };
                }

                return {
                    ...state,
                    openViews: state.openViews.remove(action.requestId),
                };
            }

            return state;

        case 'LOAD_REQUEST':
            return {
                ...state,
                openViews: state.openViews.add(action.requestId),
                currentView: action.requestId,
            };

        case 'REQUEST_SAVE':
            if (action.requestId === action.resultRequestId) {
                return state;
            }

            window.parent.postMessage({
                type: 'LOG',
                message: 'reducers:view-manager:REQUEST_SAVE',
                action,
            }, '*');

            return {
                ...state,
                openViews: state.openViews.add(action.resultRequestId).remove(action.requestId),
                currentView: action.resultRequestId,
            };
    }

    return state;
}
