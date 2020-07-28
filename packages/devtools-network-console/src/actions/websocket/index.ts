// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ms } from 'network-console-shared';
import { ThunkAction } from 'redux-thunk';
import { IView } from 'store';
import { AnyAction } from 'redux';
import { WebSocketMock } from 'host/web-application-host';
import { AppHost } from 'store/host';

export interface ISendWebsocketMessageAction {
    type: 'REQUEST_WEBSOCKET_SEND_MESSAGE';

    requestId: string;
    messageBody: string;
}

export type WSMsgDirection = 'send' | 'recv' | 'status';

export interface IWebsocketMessageLoggedAction {
    type: 'REQUEST_WEBSOCKET_MESSAGE_LOGGED';

    requestId: string;
    direction: WSMsgDirection;
    time: ms;
    content: string;
}
// TODO: add support for client vs server disconnect
export interface IWebsocketDisconnectedAction {
    type: 'REQUEST_WEBSOCKET_DISCONNECTED';

    requestId: string;
}

export function makeSendWebsocketMessageAction(requestId: string, messageBody: string): ISendWebsocketMessageAction {
    return {
        type: 'REQUEST_WEBSOCKET_SEND_MESSAGE',
        requestId,
        messageBody,
    };
}

export function makeWebsocketMessageLoggedAction(requestId: string, direction: WSMsgDirection, time: ms, content: string): IWebsocketMessageLoggedAction {
    return {
        type: 'REQUEST_WEBSOCKET_MESSAGE_LOGGED',
        requestId,
        direction,
        time,
        content,
    };
}

export function makeWebSocketDisconnectedAction(requestId: string): IWebsocketDisconnectedAction {
    return {
        type: 'REQUEST_WEBSOCKET_DISCONNECTED',
        requestId
    }
}

export function sendWsMessage(requestId: string, messageBody: string): ThunkAction<void, IView, void, AnyAction> {
    return async dispatch => {
        dispatch(makeSendWebsocketMessageAction(requestId, messageBody));
        WebSocketMock.instance(requestId).send(messageBody);

        // TODO: Support base64?
        // AppHost.sendWebSocketMessage(requestId, messageBody, 'text');
    };
}

export function sendWsDisconnect(requestId: string): ThunkAction<void, IView, void, AnyAction> {
    return async dispatch => {
        dispatch(makeWebSocketDisconnectedAction(requestId));
        // AppHost.disconnectWebsocket(requestId);
    };
}
