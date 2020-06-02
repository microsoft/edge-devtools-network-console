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
        let isDirty: boolean = false;
        store.subscribe(() => {
            const state = store.getState();
            const isNowDirty = !!((!!state.viewManager.currentView) &&
                                 (state.request.get(state.viewManager.currentView)?.isDirty));
            if (isDirty !== isNowDirty && state.viewManager.currentView) {
                isDirty = isNowDirty;
                console.log(`Updating flag isDirty = ${isDirty}`);
                this.markDirtyState(state.viewManager.currentView || '', isNowDirty);
            }
        });
    }
}
