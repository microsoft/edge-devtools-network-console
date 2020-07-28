// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// This file is intended as a rapid development debugging aid and is not a
// supported application host for any scenario.

import {
    IHttpHeader,
    IHttpRequest,
    INetConsoleAuthorization,
    INetConsoleParameter,
    INetConsoleResponse,
    binFromB64,
} from 'network-console-shared';

import { INetConsoleHost, ISaveResult } from './interfaces';
import { globalDispatch } from 'store';
import { setHostCapabilitiesAction, setHostOptionsAction } from 'actions/host-capabilities';
import { binToB64 } from 'utility/b64';

import { deserializeFromHost } from './vscode-protocol-host';
import { loadRequestAction } from 'actions/common';
import { DEFAULT_NET_CONSOLE_REQUEST } from 'reducers/request';
import { synthesizeHttpRequest } from 'utility/http-compose';
import { recalculateAndApplyTheme } from 'themes/vscode-theme';
import { INetConsoleRequestInternal } from 'model/NetConsoleRequest';
import { makeWebsocketMessageLoggedAction } from 'actions/websocket';

export default class WebApplicationHost implements INetConsoleHost {
    constructor() {
        setTimeout(() => {
            globalDispatch(setHostCapabilitiesAction(
                /* hasNativeTabs: */ false,
                /* canSave: */ false,
                /* canEditCORS: */ true,
                /* transparentAuthorization: */ true,
            ));
            globalDispatch(setHostOptionsAction(true));
            globalDispatch(loadRequestAction('DEFAULT_REQUEST', DEFAULT_NET_CONSOLE_REQUEST));
            recalculateAndApplyTheme('', 'light');
        }, 1000);
        (window as any).__debug_WAH = this;
    }

    async makeRequest(request: INetConsoleRequestInternal, environmentalAuthorization: INetConsoleAuthorization | null, environmentVariables: INetConsoleParameter[]): Promise<INetConsoleResponse> {
        if (request.url === 'wss://www.norad.mil/cheyenne/WOPR') {
            WebSocketMock.instance('wss');
            const time = Math.random() * 1000;
            setTimeout(() => {
                globalDispatch(makeWebsocketMessageLoggedAction('DEFAULT_REQUEST', 'recv', Math.floor(time), 'GREETINGS PROFESSOR FALKEN.', 'text'));
            }, time);
            return {
                duration: 4,
                status: 'COMPLETE',
                response: {
                    headers: [
                        { key: 'Connection', value: 'Upgrade' },
                        { key: 'Upgrade', value: 'WebSocket' },
                    ],
                    statusCode: 101,
                    statusText: 'Upgrade',
                    size: 0,
                    body: {
                        content: '',
                    },
                },
            };
        }

        const start = Date.now();
        let mergedRequest = await synthesizeHttpRequest(request, environmentalAuthorization, environmentVariables);

        const toFetch = constructRequest(mergedRequest);
        const response = await fetch(toFetch);
        const stop = Date.now();

        const body = await bodyFromResponse(response);
        return {
            duration: stop - start,
            status: 'COMPLETE',
            response: {
                headers: parseHeaders(response.headers),
                statusCode: response.status,
                statusText: response.statusText,
                size: body.byteLength,
                body: {
                    content: binToB64(body),
                },
            }
        };
    }

    async saveRequest(request: INetConsoleRequestInternal): Promise<ISaveResult> {
        // TODO: Investigate supporting save in web application host
        return {
            result: request,
            resultRequestId: 'DEFAULT_REQUEST',
        };
    }

    public _debug_manualLoad(requestBody: string) {
        const deserialized = deserializeFromHost('DEFAULT_REQUEST', JSON.parse(requestBody));
        globalDispatch(loadRequestAction('DEFAULT_REQUEST', deserialized));
    }

    async saveCollectionAuthorization(_collectionId: string, _authorization: INetConsoleAuthorization): Promise<void> {
        // TODO: Investigate supporting save in web application host
    }

    async saveEnvironment(_envVariables: INetConsoleParameter[], _envId: string): Promise<void> {
        // TODO: Investigate supporting save in WAH
        await timeout(2000);
    }

    public mustAskToOpenLink = () => false;

    public markDirtyState(requestId: string, isDirty: boolean) {
        // Not supported in WAH
    }

    public openUnattachedRequest(_requestId: string) {
        // Not supported in WAH
    }

    public log(message: object) {
        console.log({
            type: 'LOG',
            ...message,
        });
    }

    /**
     * If a connection has been upgraded to a WebSocket, allows it to be disconnected.
     */
    disconnectWebsocket(_requestId: string) {
        // TODO: Do something here?
    }

    /**
     * If a connection has been upgraded to a WebSocket, sends a message. The default value of
     * the `encoding` parameter is 'text'.
     */
    sendWebSocketMessage(requestId: string, message: string, encoding: 'text' | 'base64' = 'text') {
        WebSocketMock.instance(requestId).send(message, encoding);
    }
}

function constructHeaders(request: IHttpRequest): Headers {
    const result = new Headers();
    request.headers.forEach(header => {
        result.append(header.key, header.value);
    });
    return result;
}

function constructRequest(request: IHttpRequest): Request {
    const result = new Request(request.url, {
        headers: constructHeaders(request),
        method: request.verb,
        mode: request.fetchParams?.corsMode || 'cors',
        cache: request.fetchParams?.cacheMode || 'no-cache',
        redirect: request.fetchParams?.redirectMode || 'follow',
        referrer: '',
        credentials: request.fetchParams?.credentialsMode || 'same-origin',
        body: request.body.content ? binFromB64(request.body.content) : undefined,
    });
    return result;
}

function parseHeaders(headers: Headers): IHttpHeader[] {
    const result: IHttpHeader[] = [];
    headers.forEach((value, key) => {
        result.push({
            key,
            value,
        });
    });
    // Because this is a sample and Web Application host can't read cookies,
    // make some fake ones up here
    result.push({ key: 'set-cookie', value: '_EDGE_V=1; path=/; httponly; expires=Tue, 09-Feb-2021 02:38:24 GMT; domain=bing.com' });
    result.push({ key: 'set-cookie', value: `SampleCookie=this thing; path=/; domain=localhost; HttpOnly; expires=${new Date().toUTCString()}` });
    return result;
}

async function bodyFromResponse(response: Response): Promise<ArrayBuffer> {
    const result = await response.arrayBuffer();
    return result;
}

function timeout(ms: number): Promise<void> {
    return new Promise<void>(r => setTimeout(r, ms));
}

const DEMO_RESPONSES = {
    'Hello.': 'HOW ARE YOU FEELING TODAY?',
    [`I'm fine. How are you?`]: `EXCELLENT. IT'S BEEN A LONG TIME. CAN YOU EXPLAIN THE REMOVAL OF YOUR USER ACCOUNT NUMBER ON 6/23/73?`,
    'People sometimes make mistak': 'YES THEY DO. SHALL WE PLAY A GAME?',
    'People sometimes make mistakes.': 'YES THEY DO. SHALL WE PLAY A GAME?',
    'Love to. How about Global Thermonuclear War?': `WOULDN'T YOU PREFER A GOOD GAME OF CHESS?`,
    [`Later. Let's play Global Thermonuclear War.`]: 'FINE.',
};
const DEMO_JSON_RESPONSES = {
    [JSON.stringify({ type: 'INIT_CONNECTION', client: 'ws1-info' })]: JSON.stringify({ type: 'PROTOCOL_NEGOTIATION', capabilities: ['authentication', 'synchronization', 'push'] }),
    [JSON.stringify({ type: 'AUTHENTICATE', id: 1, user: 'rob@contoso.com', token: 'adDSAFADSFssda=-1=9331hnhnsdjhjaf.1akjdlfjd' })]: JSON.stringify({ type: 'AUTHENTICATION_ERROR', id: 1, message: 'TOKEN_EXPIRED' }),
}

export class WebSocketMock {
    private static _instance: WebSocketMock | null;
    public static instance(requestId: string) {
        if (!WebSocketMock._instance || requestId !== WebSocketMock._instance.requestId) {
            WebSocketMock._instance = new WebSocketMock(requestId);
        }
        return WebSocketMock._instance;
    }

    private connected: number;
    private modeJson: boolean;
    private constructor(private requestId: string) {
        this.connected = Date.now();
        this.modeJson = false;
    }

    send(message: string, encoding: 'text' | 'base64') {
        globalDispatch(makeWebsocketMessageLoggedAction(this.requestId, 'send', Math.floor(Date.now() - this.connected), message, encoding));
        const resps: any = this.modeJson ? DEMO_JSON_RESPONSES : DEMO_RESPONSES;
        const response = resps[message];
        if (response) {
            setTimeout(() => {
                globalDispatch(makeWebsocketMessageLoggedAction(this.requestId, 'recv', Math.floor(Date.now() - this.connected), response, 'text'));
            }, Math.random() * 750);
        }
        else if (message === 'go-json') {
            this.modeJson = true;
            setTimeout(() => {
                globalDispatch(makeWebsocketMessageLoggedAction(this.requestId, 'recv', Math.floor(Date.now() - this.connected), JSON.stringify({ type: 'ACK', protocol: 'JSON', status: 'OK'}), 'text'));
            }, 250 + Math.random() * 750);
        }
    }
}