// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Set as ISet } from 'immutable';
import { ILoadRequestAction } from 'actions/common';
import { ICloseViewAction } from 'actions/view-manager';

const DEFAULT_STATE = ISet();

type SaveAsRequestAction = 
    ILoadRequestAction |
    ICloseViewAction 
    ;

export default function reduceSaveAsRequests(state = DEFAULT_STATE, action: SaveAsRequestAction): ISet<string> {
    switch (action.type) {
        case 'LOAD_REQUEST':
            if (action.requiresSaveAs) {
                return state.add(action.requestId);
            }
            break;
        case 'CLOSE_VIEW':
            return state.remove(action.requestId);
            
        default:
            break;
    }

    return state;
}
