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

        // const almostView = JSON.parse(stateValue);
        // almostView.request = IMap(almostView.request);
        // almostView.response = IMap(almostView.response);
        // almostView.viewManager.openViews = ISet(almostView.viewManager.openViews);

        // globalDispatch(globalInitializeAction(almostView));
    }

    private initializeStoreMonitoring() {
        const store = getStore();
        // const onStoreChanged = debounce(() => {
        //     const state = store.getState();
        //     window.parent.postMessage({
        //         type: 'VSCODE_HOST_SAVE_STATE',
        //         state: JSON.stringify(state),
        //     }, '*');
        // }, 500);
        // store.subscribe(onStoreChanged);
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
