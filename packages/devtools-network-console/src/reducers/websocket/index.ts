// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { OrderedSet } from 'immutable';
import { IWebsocketMessageLoggedAction, WSMsgDirection } from 'actions/websocket';
import { ms } from 'network-console-shared';

export interface IWebsocketMessage {
    direction: WSMsgDirection;
    time: ms;
    content: string;
}

export type WS_State = OrderedSet<IWebsocketMessage>;
const DEFAULT_WS_STATE: WS_State = OrderedSet();

export default function reduceWebsocket(state = DEFAULT_WS_STATE, action: IWebsocketMessageLoggedAction) {
    if (action.type === 'REQUEST_WEBSOCKET_MESSAGE_LOGGED') {
        const { direction, time, content } = action;
        return state.add({
            direction,
            time,
            content,
        });
    }

    return state;
}
