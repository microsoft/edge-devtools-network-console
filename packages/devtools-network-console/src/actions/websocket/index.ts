// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ms, Base64String } from 'network-console-shared';
import { ThunkAction } from 'redux-thunk';
import { IView } from 'store';
import { AnyAction } from 'redux';
import { WebSocketMock } from 'host/web-application-host';
import { AppHost } from 'store/host';

export interface ISendWebsocketMessageAction {
    type: 'REQUEST_WEBSOCKET_SEND_MESSAGE';

    requestId: string;
    messageBody: string | Base64String;
    encoding: 'text' | 'base64';
}

export type WSMsgDirection = 'send' | 'recv';

export interface IWebsocketMessageLoggedAction {
    type: 'REQUEST_WEBSOCKET_MESSAGE_LOGGED';

    requestId: string;
    direction: WSMsgDirection;
    time: ms;
    content: string | Base64String;
    encoding: 'text' | 'base64';
}
// TODO: add support for client vs server disconnect
export interface IWebsocketDisconnectedAction {
    type: 'REQUEST_WEBSOCKET_DISCONNECTED';

    requestId: string;
}

export function makeSendWebsocketMessageAction(requestId: string, messageBody: string, encoding: 'text' | 'base64'): ISendWebsocketMessageAction {
    return {
        type: 'REQUEST_WEBSOCKET_SEND_MESSAGE',
        requestId,
        messageBody,
        encoding,
    };
}

export function makeWebsocketMessageLoggedAction(requestId: string, direction: WSMsgDirection, time: ms, content: string, encoding: 'text' | 'base64'): IWebsocketMessageLoggedAction {
    return {
        type: 'REQUEST_WEBSOCKET_MESSAGE_LOGGED',
        requestId,
        direction,
        time,
        content,
        encoding,
    };
}

export function makeWebSocketDisconnectedAction(requestId: string): IWebsocketDisconnectedAction {
    return {
        type: 'REQUEST_WEBSOCKET_DISCONNECTED',
        requestId
    }
}

export function sendWsMessage(requestId: string, messageBody: string, encoding: 'text' | 'base64'): ThunkAction<void, IView, void, AnyAction> {
    return async dispatch => {
        dispatch(makeSendWebsocketMessageAction(requestId, messageBody, encoding));
        AppHost.sendWebSocketMessage(requestId, messageBody, encoding);
    };
}

export function sendWsDisconnect(requestId: string): ThunkAction<void, IView, void, AnyAction> {
    return async dispatch => {
        dispatch(makeWebSocketDisconnectedAction(requestId));
        AppHost.disconnectWebsocket(requestId);
    };
}
