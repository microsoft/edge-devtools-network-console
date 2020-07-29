// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { OrderedSet, Map } from 'immutable';
import { IWebsocketMessageLoggedAction, WSMsgDirection, IWebsocketDisconnectedAction, IWebsocketConnectedAction, IWebsocketClearMessagesAction } from 'actions/websocket';
import { ms } from 'network-console-shared';
import { IEndRequestAction } from 'actions/response/basics';

export interface IWebsocketMessage {
    direction: WSMsgDirection;
    content: string;
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
    // TODO: make switch statement
    if (action.type === 'REQUEST_WEBSOCKET_CONNECTED') {
        const reqId = action.requestId;
        let state = collection.get(reqId);
        if (!state) {
            state = DEFAULT_WS_CONNECTION;
        }
        state = {
            ...state,
            connected: true,
            messages: state.messages.add({
                direction: 'status',
                content: 'Connected',
            })
        };
        return collection.set(reqId, state);
    }
    if (action.type === 'REQUEST_WEBSOCKET_MESSAGE_LOGGED') {
        const reqId = action.requestId;
        let state = collection.get(reqId);
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
            })
        };
        return collection.set(reqId, state);
    }
    if (action.type === 'REQUEST_WEBSOCKET_DISCONNECTED') {
        const reqId = action.requestId;
        let state = collection.get(reqId);
        if (!state) {
            state = DEFAULT_WS_CONNECTION;
        }
        const content = action.reason ? `Disconnected: ${action.reason}` : 'Disconnected';
        // TODO: add disconnected reason/error to content
        state = {
            ...state,
            connected: false,
            messages: state.messages.add({
                direction: 'status',
                content: content,
            })
        };
        return collection.set(reqId, state);
    }
    if (action.type === 'REQUEST_WEBSOCKET_CLEAR_MESSAGES') {
        const reqId = action.requestId;
        let state = collection.get(reqId);
        if (!state) {
            return collection
        }
        state = {
            ...state,
            connected: false,
            messages: OrderedSet(),
        };
        return collection.set(reqId, state);
    }

    return collection;
}
