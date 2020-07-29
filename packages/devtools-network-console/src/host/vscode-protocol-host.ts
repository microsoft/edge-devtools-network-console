// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    FrontendMessage,
    INetConsoleAuthorization,
    INetConsoleParameter,
    INetConsoleRequest,
    INetConsoleResponse,
    HostMessage,
    isResponseMessage,
} from 'network-console-shared';

import {
    IInitHostMessage,
    ICssStylesUpdatedMessage,
    ILoadRequestMessage,
    ISetPreferencesMessage,
    IEditCollectionAuthorizationMessage,
    IClearEnvironmentMessage,
    IEditEnvironmentMessage,
    IUpdateCollectionsTreeMessage,
    IUpdateEnvironmentMessage,
    ICloseViewMessage,
    IShowViewMessage,
    IWebSocketConnectedMessage,
    IWebSocketDisconnectedMessage,
    IWebSocketPacketMessage,
} from 'network-console-shared/hosting/host-messages';

import { INetConsoleHost, ISaveResult } from './interfaces';
import { recalculateAndApplyTheme, THEME_TYPE } from 'themes/vscode-theme';
import { globalDispatch } from 'store';
import { setHostOptionsAction } from 'actions/host-capabilities';
import { loadRequestAction, loadDefaultRequest } from 'actions/common';
import { makeEditAuthorizationInModalAction, makeEditEnvironmentAction } from 'actions/modal';
import { makeSetEnvironmentAuthorizationAction, makeClearEnvironmentVariablesAction, makeSetEnvironmentVariablesAction } from 'actions/environment';
import { makeSetCollectionTreeAction } from 'actions/collections';
import { synthesizeHttpRequest } from 'utility/http-compose';
import { INetConsoleRequestInternal } from 'model/NetConsoleRequest';
import {
    resetIDs,
    ID_DIV_FORM_URLENCODED,
    ID_DIV_FORM_DATA,
    ID_DIV_HEADER,
    ID_DIV_QUERY,
    ID_DIV_ROUTE,
} from 'reducers/request/id-manager';
import { chooseViewAction, closeViewAction } from 'actions/view-manager';
import { makeWebsocketMessageLoggedAction, makeWebSocketDisconnectedAction, makeWebSocketConnectedAction } from 'actions/websocket';

type PostMessage = (msg: any) => void;
type HandleMessage = (ev: MessageEvent) => void;

export default class VsCodeProtocolHost implements INetConsoleHost {
    private currentMessageId = 0;
    private pending = new Map<number, { resolve: (v: any) => void, reject: (e: Error) => void }>();
    private pendingResolves = new Map<number, (response: INetConsoleResponse) => void>();
    private postMessage: PostMessage;
    private handleMessage: HandleMessage;

    constructor() {
        this.postMessage = msg => {
            window.parent.postMessage(msg, '*');
        };

        this.handleMessage = ev => {
            this.onMessage(ev.data);
        };
        window.addEventListener('message', this.handleMessage);
        this.sendMessage({ type: 'CONSOLE_READY' });
    }

    makeRequest(request: INetConsoleRequestInternal, environmentalAuthorization: INetConsoleAuthorization | null, environmentVariables: INetConsoleParameter[]): Promise<INetConsoleResponse> {
        return new Promise<INetConsoleResponse>(async (resolve, reject) => {
            const id = ++this.currentMessageId;
            this.pendingResolves.set(id, resolve);
            this.pending.set(id, { resolve, reject });

            let mergedRequest = await synthesizeHttpRequest(request, environmentalAuthorization, environmentVariables);
            this.sendMessage({
                type: 'EXECUTE_REQUEST',
                id,
                configuration: mergedRequest,
                authorization: environmentalAuthorization || { type: 'none' },
            });
        });
    }

    saveRequest(request: INetConsoleRequestInternal, requestId: string, toCollectionId: string) {
        return new Promise<ISaveResult>((resolve, reject) => {
            const id = ++this.currentMessageId;
            this.pending.set(id, { resolve, reject });

            const toSave = this.formatRequestForSave(request);
            this.sendMessage({
                type: 'SAVE_REQUEST',
                id,
                requestId,
                request: toSave,
                toCollectionId,
            });
        });
    }

    protected formatRequestForSave(request: INetConsoleRequestInternal): INetConsoleRequest {
        return {
            authorization: request.authorization,
            body: {
                content: '',
            },
            bodyComponents: {
                bodySelection: request.bodyComponents.bodySelection,
                formData: request.bodyComponents.formData.valueSeq().toArray(),
                rawTextBody: {
                    contentType: request.bodyComponents.rawTextBody.contentType || '',
                    text: request.bodyComponents.rawTextBody.text,
                },
                xWwwFormUrlencoded: request.bodyComponents.xWwwFormUrlencoded.valueSeq().toArray(),
            },
            description: request.description,
            headers: request.headers.valueSeq().toArray(),
            name: request.name,
            queryParameters: request.queryParameters.valueSeq().toArray(),
            routeParameters: request.routeParameters.valueSeq().toArray(),
            url: request.url,
            verb: request.verb,
            fetchParams: request.fetchParams,
        };
    }

    async saveCollectionAuthorization(collectionId: string, authorization: INetConsoleAuthorization): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const id = ++this.currentMessageId;
            this.pending.set(id, { resolve, reject });
            this.sendMessage({
                type: 'SAVE_COLLECTION_AUTHORIZATION_PARAMETERS',
                id,
                collectionId,
                authorization,
            });
        });
    }

    async saveEnvironment(envVariables: INetConsoleParameter[], envId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const id = ++this.currentMessageId;
            this.pending.set(id, { resolve, reject });
            this.sendMessage({
                type: 'SAVE_ENVIRONMENT_VARIABLES',
                environmentId: envId,
                id,
                variables: envVariables.slice(),
            });
        });
    }

    /**
     * Sends a supported message to the embedder.
     *
     * @param message The message to send
     */
    protected sendMessage(message: FrontendMessage) {
        this.postMessage(message);
    }

    private async onMessage(message: HostMessage) {
        if (isResponseMessage(message)) {
            const pending = this.pending.get(message.id);
            if (pending) {
                if (message.error) {
                    pending.reject(new Error(message.error));
                }
                else {
                    pending.resolve(message.result!);
                }

                this.pendingResolves.delete(message.id);
                return;
            }
        }

        switch (message.type) {
            case 'INIT_HOST':
                this.onInitHost(message);
                break;

            case 'INIT_NEW_EMPTY_REQUEST':
                this.onInitEmptyRequest();
                break;

            case 'CSS_STYLE_UPDATED':
                this.onCssStyleUpdated(message);
                break;

            case 'LOAD_REQUEST':
                this.onLoadRequest(message);
                break;

            case 'SET_PREFERENCES':
                this.onSetPreferences(message);
                break;

            case 'EDIT_COLLECTION_AUTHORIZATION_PARAMETERS':
                this.onEditCollectionAuthorizationParameters(message);
                break;

            case 'UPDATE_COLLECTIONS_TREE':
                this.onUpdateCollectionsTree(message);
                break;

            case 'EDIT_ENVIRONMENT_VARIABLES':
                this.onEditEnvironmentVariables(message);
                break;

            case 'UPDATE_ENVIRONMENT':
                this.onUpdateEnvironment(message);
                break;

            case 'CLEAR_ENVIRONMENT':
                this.onClearEnvironment(message);
                break;

            case 'CLOSE_VIEW':
                this.onCloseView(message);
                break;

            case 'SHOW_OPEN_REQUEST':
                this.onShowView(message);
                break;

            case 'WEBSOCKET_CONNECTED':
                    this.onWebSocketConnected(message);
                    break;

            case 'WEBSOCKET_DISCONNECTED':
                this.onWebSocketDisconnected(message);
                break;

            case 'WEBSOCKET_PACKET':
                this.onWebSocketPacket(message);
                break;
        }
    }

    protected onInitHost(message: IInitHostMessage) {
        if (message.messagePort) {
            window.removeEventListener('message', this.handleMessage);
            message.messagePort.addEventListener('message', this.handleMessage);

            const port = message.messagePort;
            this.postMessage = msg => {
                port.postMessage(msg);
            };
            port.start();
        }

        let theme: THEME_TYPE = 'light';
        if (message.isHighContrast) {
            theme = 'high-contrast';
        }
        else if (message.isDark) {
            theme = 'dark';
        }

        recalculateAndApplyTheme(message.cssVariables, theme);
    }

    protected onInitEmptyRequest() {
        globalDispatch(loadDefaultRequest());
    }

    protected onCssStyleUpdated(message: ICssStylesUpdatedMessage) {
        let theme: THEME_TYPE = 'light';
        if (message.isHighContrast) {
            theme = 'high-contrast';
        }
        else if (message.isDark) {
            theme = 'dark';
        }

        recalculateAndApplyTheme(message.cssVariables, theme);
    }

    protected async onLoadRequest(message: ILoadRequestMessage) {
        const deserialized = deserializeFromHost(message.requestId, message.request);
        globalDispatch(loadRequestAction(message.requestId, deserialized));

        const environmentAuth: INetConsoleAuthorization | null = message.environmentAuth || null;
        if (environmentAuth) {
            const environmentAuthPath: string[] = message.environmentAuthPath || [];
            globalDispatch(makeSetEnvironmentAuthorizationAction(message.requestId, environmentAuth, environmentAuthPath));
        }
    }

    protected onSetPreferences(message: ISetPreferencesMessage) {
        globalDispatch(setHostOptionsAction(message.shouldShowDescription));
    }

    protected onEditCollectionAuthorizationParameters(message: IEditCollectionAuthorizationMessage) {
        const { collectionId, path, authorization } = message;
        globalDispatch(makeEditAuthorizationInModalAction(collectionId, path, authorization));
    }

    protected onUpdateCollectionsTree(message: IUpdateCollectionsTreeMessage) {
        const { collections } = message;
        globalDispatch(makeSetCollectionTreeAction(collections));
    }

    protected onEditEnvironmentVariables(message: IEditEnvironmentMessage) {
        const { id, environment, file, collectionName } = message;
        const { name, options } = environment;
        globalDispatch(makeEditEnvironmentAction(id, file, collectionName, name, options));
    }

    protected onUpdateEnvironment(message: IUpdateEnvironmentMessage) {
        const { environment } = message;
        const { id, name, options } = environment;
        globalDispatch(makeSetEnvironmentVariablesAction(id, name, options));
    }

    protected onClearEnvironment(_message: IClearEnvironmentMessage) {
        globalDispatch(makeClearEnvironmentVariablesAction());
    }

    protected onShowView(message: IShowViewMessage) {
        globalDispatch(chooseViewAction(message.requestId));
    }

    protected onCloseView(message: ICloseViewMessage) {
        globalDispatch(closeViewAction(message.requestId));
    }

    protected onWebSocketConnected(message: IWebSocketConnectedMessage) {
        // TODO: Connect the host message to the global dispatcher
        globalDispatch(makeWebSocketConnectedAction(message.requestId));
    }

    protected onWebSocketDisconnected(message: IWebSocketDisconnectedMessage) {
        // TODO: Connect the host message to the global dispatcher
        globalDispatch(makeWebSocketDisconnectedAction(message.requestId));
    }

    protected onWebSocketPacket(message: IWebSocketPacketMessage) {
        // TODO: Establish timing
        globalDispatch(makeWebsocketMessageLoggedAction(message.requestId, message.direction, message.timeFromConnection, message.data));
    }

    public mustAskToOpenLink = () => true;
    public openLink(url: string) {
        this.sendMessage({
            type: 'OPEN_WEB_LINK',
            url,
        });
    }

    public markDirtyState(requestId: string, isDirty: boolean) {
        this.sendMessage({
            type: 'UPDATE_DIRTY_FLAG',
            requestId,
            isDirty,
        });
    }

    public openUnattachedRequest(requestId: string) {
        this.sendMessage({
            type: 'OPEN_NEW_UNATTACHED_REQUEST',
            requestId,
        });
    }

    public log(message: object) {
        this.sendMessage({
            type: 'LOG',
            ...message,
        });
    }

    /**
     * If a connection has been upgraded to a WebSocket, allows it to be disconnected.
     */
    disconnectWebsocket(requestId: string) {
        this.sendMessage({
            type: 'DISCONNECT_WEBSOCKET',
            requestId,
        });
    }

    /**
     * If a connection has been upgraded to a WebSocket, sends a message. The default value of
     * the `encoding` parameter is 'text'.
     */
    sendWebSocketMessage(requestId: string, message: string, encoding: 'text' | 'base64' = 'text') {
        this.sendMessage({
            type: 'WEBSOCKET_SEND_MESSAGE',
            encoding,
            message,
            requestId,
        });
    }
}

export function deserializeFromHost(requestId: string, src: INetConsoleRequest): INetConsoleRequestInternal {
    const result: INetConsoleRequestInternal = {
        authorization: src.authorization,
        bodyComponents: {
            rawTextBody: {
                contentType: src.bodyComponents.rawTextBody?.contentType || '',
                text: src.bodyComponents.rawTextBody?.text || '',
            },
            bodySelection: src.bodyComponents.bodySelection,
            formData: resetIDs(requestId, ID_DIV_FORM_DATA, src.bodyComponents.formData || []),
            xWwwFormUrlencoded: resetIDs(requestId, ID_DIV_FORM_URLENCODED, src.bodyComponents.xWwwFormUrlencoded || []),
        },
        description: src.description,
        headers: resetIDs(requestId, ID_DIV_HEADER, src.headers),
        name: src.name,
        queryParameters: resetIDs(requestId, ID_DIV_QUERY, src.queryParameters),
        routeParameters: resetIDs(requestId, ID_DIV_ROUTE, src.routeParameters),
        url: src.url,
        verb: src.verb,
        fetchParams: {
            cacheMode: src.fetchParams?.cacheMode || 'no-store',
            corsMode: src.fetchParams?.corsMode || 'cors',
            credentialsMode: src.fetchParams?.credentialsMode || 'same-origin',
            redirectMode: src.fetchParams?.redirectMode || 'follow'
        },
    };

    return result;
}
