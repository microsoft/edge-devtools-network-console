// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import VsCodeProtocolHost from './vscode-protocol-host';
import { globalDispatch, getStore } from 'store';
import { setHostCapabilitiesAction } from 'actions/host-capabilities';
import { enableDevtoolsThemeOverrides } from 'themes/vscode-theme';

export default class EdgeApplicationHost extends VsCodeProtocolHost {
    protected onInitHost(message: any) {
        globalDispatch(setHostCapabilitiesAction(
            /* hasNativeTabs: */ false,
            /* canSave: */ false,
            /* canEditCORS: */ true,
            /* transparentAuthorization: */ true,
        ));
        super.onInitHost(message);

        enableDevtoolsThemeOverrides();
        this.initializeStoreMonitoring();
    }

    private initializeStoreMonitoring() {
        const store = getStore();
        let isDirty = false;
        store.subscribe(() => {
            const state = store.getState();
            const hasCurrentView = !!state.viewManager.currentView;
            let isNowDirty = false;
            if (hasCurrentView) {
                const currentRequest = state.request.get(state.viewManager.currentView!);
                if (currentRequest && currentRequest.isDirty) {
                    isNowDirty = true;
                }
            }
            if (isDirty !== isNowDirty && state.viewManager.currentView) {
                isDirty = isNowDirty;
                this.markDirtyState(state.viewManager.currentView, isNowDirty);
            }
        });
    }
}
