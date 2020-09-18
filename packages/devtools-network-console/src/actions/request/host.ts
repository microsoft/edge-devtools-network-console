// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { IView } from 'store';
import { AppHost } from 'store/host';
import { saveRequestAction, saveRequestFailedAction } from './basics';
import { makeSelectCollectionForSaveAction } from 'actions/modal';
import { deserializeFromHost } from 'host/vscode-protocol-host';

export function saveRequestToHostAction(requestId: string, toCollectionId: string | null = null): ThunkAction<void, IView, void, AnyAction> {
    return async (dispatch, getState) => {
        const state = getState();
        const request = state.request.get(requestId);
        if (!request) {
            throw new RangeError(`Invalid request ID "${requestId}".`);
        }
        if (request.isDirty || toCollectionId) {
            try {
                const result = await AppHost.saveRequest(request.current, requestId, toCollectionId || '');
                const deserialized = deserializeFromHost(result.resultRequestId, result.resultRequest);
                dispatch(saveRequestAction(requestId, deserialized, result.resultRequestId));
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
