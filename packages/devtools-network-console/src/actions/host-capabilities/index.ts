// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface ISetHostCapabilitiesAction {
    type: 'HOST_SET_CAPABILITIES';

    hasNativeTabs: boolean;
    canSave: boolean;
    canEditCORS: boolean;
    transparentAuthorization: boolean;
}

export interface ISetHostOptionsAction {
    type: 'HOST_SET_OPTIONS';

    shouldShowDescription: boolean;
}

export type HostCapabilitiesAction =
    ISetHostCapabilitiesAction |
    ISetHostOptionsAction
    ;

export function setHostCapabilitiesAction(
        hasNativeTabs: boolean,
        canSave: boolean,
        canEditCORS: boolean,
        transparentAuthorization: boolean,
        ): ISetHostCapabilitiesAction {
    return {
        type: 'HOST_SET_CAPABILITIES',
        hasNativeTabs,
        canSave,
        canEditCORS,
        transparentAuthorization,
    };
}

export function setHostOptionsAction(shouldShowDescription: boolean): ISetHostOptionsAction {
    return {
        type: 'HOST_SET_OPTIONS',
        shouldShowDescription,
    };
}
