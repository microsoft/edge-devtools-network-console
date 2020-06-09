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
            recalculateAndApplyTheme('', 'dark');
        }, 1000);
        (window as any).__debug_WAH = this;
    }

    async makeRequest(request: INetConsoleRequestInternal, environmentalAuthorization: INetConsoleAuthorization | null, environmentVariables: INetConsoleParameter[]): Promise<INetConsoleResponse> {
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
