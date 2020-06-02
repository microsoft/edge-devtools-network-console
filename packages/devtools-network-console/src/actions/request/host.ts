// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { IView } from 'store';
import { AppHost } from 'store/host';
import { saveRequestAction, saveRequestFailedAction } from './basics';
import { makeSelectCollectionForSaveAction } from 'actions/modal';

export function saveRequestToHostAction(requestId: string, toCollectionId: string | null = null): ThunkAction<void, IView, void, AnyAction> {
    return async (dispatch, getState) => {
        const state = getState();
        // TODO: get request by ID
        const request = state.request.get(requestId);
        if (!request) {
            throw new RangeError(`Invalid request ID "${requestId}".`);
        }
        if (request.isDirty || toCollectionId) {
            try {
                let result;
                if (toCollectionId) {
                    result = await AppHost.saveRequest(request.current, requestId, toCollectionId);
                }
                else {
                    result = await AppHost.saveRequest(request.current, requestId, '');
                }
                dispatch(saveRequestAction(requestId, result.result, result.resultRequestId));
                if (toCollectionId) {
                    dispatch(makeSelectCollectionForSaveAction(null, false));
                }
            }
            catch (err) {
                dispatch(saveRequestFailedAction(requestId, err.message));
            }
        }
    }
}
