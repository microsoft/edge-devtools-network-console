// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { OrderedSet, Map } from 'immutable';
import { IWebsocketMessageLoggedAction, WSMsgDirection, IWebsocketDisconnectedAction, IWebsocketConnectedAction, IWebsocketClearMessagesAction } from 'actions/websocket';
import { ms } from 'network-console-shared';

export interface IWebsocketMessage {
    direction: WSMsgDirection;
    content: string;
    entryNumber: number;
    time?: ms;
    reason?: string;
    error?: string;
}

export interface IWebSocketConnection {
    connected: boolean;
    messages: OrderedSet<IWebsocketMessage>;
}

const DEFAULT_WS_CONNECTION: IWebSocketConnection = {
    connected: false,
    messages: OrderedSet()
};

export type WebSocketAction = IWebsocketMessageLoggedAction | IWebsocketConnectedAction | IWebsocketDisconnectedAction | IWebsocketClearMessagesAction;

export type WS_State = Map<string, IWebSocketConnection>;
const DEFAULT_WS_STATE: WS_State = Map();

export default function reduceWebsocket(collection: WS_State = DEFAULT_WS_STATE, action: WebSocketAction) {
    if (!action.requestId) {
        return collection;
    }
    const reqId = action.requestId;
    let state = collection.get(reqId);
    switch (action.type) {
        case 'REQUEST_WEBSOCKET_CONNECTED':
            if (!state) {
                state = DEFAULT_WS_CONNECTION;
            }
            state = {
                ...state,
                connected: true,
                messages: state.messages.add({
                    direction: 'status',
                    content: 'Connected',
                    entryNumber: state.messages.count(),
                })
            };
            return collection.set(reqId, state);
        case 'REQUEST_WEBSOCKET_MESSAGE_LOGGED':
            if (!state) {
                state = DEFAULT_WS_CONNECTION;
            }
            const { direction, time, content } = action;
            state = {
                ...state,
                messages: state.messages.add({
                    direction,
                    time,
                    content,
                    entryNumber: state.messages.count(),
                })
            };
            return collection.set(reqId, state);
        case 'REQUEST_WEBSOCKET_DISCONNECTED':
            if (!state) {
                state = DEFAULT_WS_CONNECTION;
            }
            const disconnectMessage = action.reason ? `Disconnected: ${action.reason}` : 'Disconnected';
            state = {
                ...state,
                connected: false,
                messages: state.messages.add({
                    direction: 'status',
                    content: disconnectMessage,
                    entryNumber: state.messages.count(),
                })
            };
            return collection.set(reqId, state);
        case 'REQUEST_WEBSOCKET_CLEAR_MESSAGES':
            if (!state) {
                return collection
            }
            state = {
                ...state,
                messages: OrderedSet(),
            };
            return collection.set(reqId, state);
        default:
            return collection;
    }
}
