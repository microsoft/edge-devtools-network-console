// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { HostCapabilitiesAction } from '../../actions/host-capabilities';
import { IHostCapabilities } from '../../store/index';

const DEFAULT_VALUE = {
    nativeTabs: true,
    canSave: false,
    shouldShowDescription: false,
    canEditCORS: false,
    includeTransparentAuthorization: false,
};

export default function reduceHostCapabilities(state: IHostCapabilities = DEFAULT_VALUE, action: HostCapabilitiesAction): IHostCapabilities {
    switch (action.type) {
        case 'HOST_SET_CAPABILITIES': {
            return {
                ...state,
                canSave: action.canSave,
                nativeTabs: action.hasNativeTabs,
                canEditCORS: action.canEditCORS,
                includeTransparentAuthorization: action.transparentAuthorization,
            };
        }

        case 'HOST_SET_OPTIONS': {
            return {
                ...state,
                shouldShowDescription: action.shouldShowDescription,
            };
        }
    }

    return state;
}
