// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import VsCodeProtocolHost from './vscode-protocol-host';
import { getStore, globalDispatch } from 'store';
import { setHostCapabilitiesAction } from 'actions/host-capabilities';

export default class VsCodeApplicationHost extends VsCodeProtocolHost {
    protected onInitHost(message: any) {
        if (message.persistedState) {
            this.reloadGlobalState(message.persistedState);
        }
        else {
            globalDispatch(setHostCapabilitiesAction(
                /* hasNativeTabs: */ true,
                /* canSave: */ true,
                /* canEditCORS: */ false,
                /* transparentAuthorization: */ false,
            ));
        }

        this.initializeStoreMonitoring();

        super.onInitHost(message);
    }

    private reloadGlobalState(_stateValue: string) {
        // TODO: Implement persistence / rehydrate
        // https://github.com/microsoft/edge-devtools-network-console/issues/4
    }

    private initializeStoreMonitoring() {
        const store = getStore();
        let isDirty: boolean = false;
        store.subscribe(() => {
            const state = store.getState();
            const isNowDirty = !!((!!state.viewManager.currentView) &&
                                 (state.request.get(state.viewManager.currentView)?.isDirty));
            if (isDirty !== isNowDirty) {
                isDirty = isNowDirty;
                console.log(`Updating flag isDirty = ${isDirty}`);
                this.markDirtyState(state.viewManager.currentView || '', isNowDirty);
            }
        });
    }
}
