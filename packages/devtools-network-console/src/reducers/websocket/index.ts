// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { OrderedSet, Map } from 'immutable';
import { IWebsocketMessageLoggedAction, WSMsgDirection, IWebsocketDisconnectedAction } from 'actions/websocket';
import { ms } from 'network-console-shared';
import { IEndRequestAction } from 'actions/response/basics';

export interface IWebsocketMessage {
    direction: WSMsgDirection;
    time: ms;
    content: string;
}

export interface IWebSocketConnection {
    connected: boolean;
    messages: OrderedSet<IWebsocketMessage>;
}

const DEFAULT_WS_CONNECTION: IWebSocketConnection = {
    connected: false,
    messages: OrderedSet()
};

export type WebSocketAction = IWebsocketMessageLoggedAction | IEndRequestAction | IWebsocketDisconnectedAction;

export type WS_State = Map<string, IWebSocketConnection>;
const DEFAULT_WS_STATE: WS_State = Map();

export default function reduceWebsocket(collection: WS_State = DEFAULT_WS_STATE, action: WebSocketAction) {
    if (!action.requestId) {
        return collection;
    }
    // TODO: make switch statement
    if (action.type === 'RESPONSE_END_REQUEST') {
        let isConnectedWebsocket = false;
        if (action.response?.statusCode === 101 && action.response?.headers) {
            for (const header of action.response?.headers) {
                if (header.key === "Upgrade" && header.value === "WebSocket"){
                    isConnectedWebsocket = true;
                    break;
                }
            }
        }
        if (!isConnectedWebsocket) {
            return collection;
        }
        const reqId = action.requestId;
        let state = collection.get(reqId);
        if (!state) {
            state = DEFAULT_WS_CONNECTION;
        }
        state = {
            ...state,
            connected: true
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
        let reqId = action.requestId;
        let state = collection.get(reqId);
        if (!state) {
            state = DEFAULT_WS_CONNECTION;
        }
        state = {
            ...state,
            connected: false
        };
        return collection.set(reqId, state);
    }

    return collection;
}
