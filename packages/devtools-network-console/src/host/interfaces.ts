// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    INetConsoleAuthorization,
    INetConsoleParameter,
    INetConsoleResponse,
} from 'network-console-shared';

import { INetConsoleRequestInternal } from 'model/NetConsoleRequest';

export interface ISaveResult {
    result: INetConsoleRequestInternal;
    resultRequestId: string;
}

/**
 * When implemented, provides the host capabilities. This allows the frontend to be decoupled and to behave
 * in different ways depending on the capabilities.
 */
export interface INetConsoleHost {
    /**
     * Issues an HTTP request
     * @param request The request to issue
     * @param environmentalAuthorization Authorization that is coming from the environment, if any
     * @param environmentVariables Environment variables to substitute, if any
     */
    makeRequest(request: INetConsoleRequestInternal, environmentalAuthorization: INetConsoleAuthorization | null, environmentVariables: INetConsoleParameter[]): Promise<INetConsoleResponse>;
    /**
     * Saves a request
     * @param request The request to save
     * @param requestId The ID of the request. An unsaved request should pass `DEFAULT_REQUEST`.
     * @param toCollectionId The collection ID to save into
     */
    saveRequest(request: INetConsoleRequestInternal, requestId: string, toCollectionId: string): Promise<ISaveResult>;

    /**
     * Persists collection authorization settings back to a collection.
     *
     * @param collectionId Collection ID to modify
     * @param authorization The authorization settings to save
     */
    saveCollectionAuthorization(collectionId: string, authorization: INetConsoleAuthorization): Promise<void>;
    /**
     * Saves a set of environment variables back to the host.
     *
     * @param environmentVariables The environment variables to save
     * @param environmentId The ID of the environment to modify
     */
    saveEnvironment(environmentVariables: INetConsoleParameter[], environmentId: string): Promise<void>;

    /**
     * Indicates whether a web link needs to be opened via the INetConsoleHost#openLink function. This is to allow embedders to trigger a system
     * provided browser. If this returns true, the frontend API should call the `openLink` function and then call `preventDefault` on the
     * link's onclick handler.
     */
    mustAskToOpenLink(): boolean;
    /**
     * Prompts the host to open a web link in a new tab or window.
     */
    openLink?: (url: string) => void;

    /**
     * In a host that controls the TDI, flags the current embedder as "dirty" (meaning that the document has a mismatched Committed vs Current state).
     */
    markDirtyState: (requestId: string, isDirty: boolean) => void;

    /**
     * Notifies the host that a new "tab" has opened.
     */
    openUnattachedRequest: (requestId: string) => void;

    log: (message: object) => void;

    /**
     * If a connection has been upgraded to a WebSocket, allows it to be disconnected.
     */
    disconnectWebsocket: (requestId: string) => void;
    /**
     * If a connection has been upgraded to a WebSocket, sends a message. The default value of
     * the `encoding` parameter is 'text'.
     */
    sendWebSocketMessage: (requestId: string, message: string, encoding?: 'text' | 'base64') => void;
}
