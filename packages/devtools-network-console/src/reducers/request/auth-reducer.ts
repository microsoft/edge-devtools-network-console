// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    AuthAction
} from 'actions/request/auth';
import { RequestsState } from '.';
import { RequestState } from 'store';
import { alterAuthorization } from 'reducers/shared/auth';

export default function reduceRequestAuth(action: AuthAction, collection: RequestsState): RequestsState {
    const state = collection.get(action.requestId);
    if (!state) {
        return collection;
    }

    const altered = alterAuthorization(action, state.current.authorization);
    if (altered !== state.current.authorization) {
        const result: RequestState = {
            ...state,
            isDirty: true,
            current: {
                ...state.current,
                authorization: altered,
            },
        };
        return collection.set(action.requestId, result);
    }

    return collection;
}
