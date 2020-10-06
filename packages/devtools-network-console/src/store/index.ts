// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Map as IMap, Set as ISet } from 'immutable';
import { applyMiddleware, compose, createStore, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import {
    INetConsoleAuthorization,
    INetConsoleParameter,
} from 'network-console-shared';

import {
    INetConsoleRequestInternal,
    ISaveable,
} from '../model/NetConsoleRequest';
import reduceRequest, { RequestsState } from '../reducers/request';
import reduceResponse, { ResponsesState } from '../reducers/response';
import reduceTheme from '../reducers/theme';
import reduceHostCaps from '../reducers/host-capabilities';
import reduceViewManager, { IViewManagerState } from 'reducers/view-manager';
import reduceModals from 'reducers/modals';
import reduceEnvironment from 'reducers/environment';
import reduceCollections from 'reducers/collections';
import reduceSaveAsRequests from 'reducers/saveAsRequests';
import reduceLocale from 'reducers/locale';
import { ICollection } from 'model/collections';
import { THEME_TYPE } from 'themes/vscode-theme';

declare var __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: typeof compose;
const composeEnhancers = typeof(__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) !== 'undefined' ? __REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;

export type RequestState = ISaveable<INetConsoleRequestInternal>;

export interface IHostCapabilities {
    /**
     * Indicates whether the host supports TDI. If not, the frontend must implement TDI.
     */
    nativeTabs: boolean;
    /**
     * Indicates whether the host can save requests. If so, the Save button will be present.
     */
    canSave: boolean;
    /**
     * Indicates whether the Description field should be present in grid key-value pair editors.
     */
    shouldShowDescription: boolean;
    /**
     * Indicates whether the CORS editing capability should be present for browser hosts
     */
    canEditCORS: boolean;
    /**
     * Indicates whether the transparent authorization state of a debugged page (cookies or other auth) should be
     * included as part of the request. When this is true, all requests will choose this as the default authorization
     * scheme.
     */
    includeTransparentAuthorization: boolean;
}

export interface ICollectionsModalState {
    selectedCollectionId: string | null;
    open: boolean;
}

export interface IEnvironmentModalState {
    id: string;
    name: string;
    fileName: string;
    collectionName: string;
    values: IMap<string, INetConsoleParameter>;
}

export interface IModalState {
    authorization: INetConsoleAuthorization | null;
    authorizationCollectionId: string | null;
    authorizationPaths: string[];

    collections: ICollectionsModalState;
    environment: IEnvironmentModalState;
}
export const MODAL_AUTHORIZATION_REQUEST_ID = '#$#$_GLOBAL_MODAL_AUTHORIZATION$#$#';

export interface IEnvironmentAuthorizationState {
    values: INetConsoleAuthorization | null;
    from: string[];
}

export interface IActiveEnvironmentState {
    variables: INetConsoleParameter[];
    name: string;
    id: string;
}

export interface IEnvironmentState {
    // requestId -> environment authorization state
    authorization: IMap<string, IEnvironmentAuthorizationState>;
    environment: IActiveEnvironmentState;
}

export interface IThemeInfo {
    theme: THEME_TYPE;
    fontPalette: 'normal' | 'small';
}

export interface IView {
    collections: ICollection[];
    request: RequestsState;
    response: ResponsesState;
    viewManager: IViewManagerState;
    modals: IModalState;
    environment: IEnvironmentState;

    theme: IThemeInfo;
    hostCapabilities: IHostCapabilities;
    saveAsRequests: ISet<string>;
    locale: string;
}

export interface ICollectionArea {
    name: string;
    description: string;
    item: (ICollectionArea | RequestState)[];
}

const reducers = combineReducers({
    collections: reduceCollections,
    request: reduceRequest,
    response: reduceResponse,
    viewManager: reduceViewManager,
    modals: reduceModals,
    environment: reduceEnvironment,

    theme: reduceTheme,
    hostCapabilities: reduceHostCaps,
    saveAsRequests: reduceSaveAsRequests,
    locale: reduceLocale,
});

const store = createStore(reducers, composeEnhancers(applyMiddleware(thunk)));
export default store;

export function getStore() {
    return store;
}

export function globalDispatch(message: any) {
    store.dispatch(message);
}
