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
    INetConsoleRequest,
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
import { initializeLocaleDictionary } from 'actions/locale-action';
import { makeSetCollectionTreeAction } from 'actions/collections';
import { makeEditAuthorizationInModalAction, makeEditEnvironmentAction } from 'actions/modal';

export default class WebApplicationHost implements INetConsoleHost {
    constructor() {
        const showEnvironmentModalAtStartup = false;
        const showAuthorizationModalAtStartup = false;

        setTimeout(() => {
            globalDispatch(setHostCapabilitiesAction(
                /* hasNativeTabs: */ false,
                /* canSave: */ true,
                /* canEditCORS: */ true,
                /* transparentAuthorization: */ true,
            ));
            globalDispatch(setHostOptionsAction(true));
            globalDispatch(loadRequestAction('coll1/coll2/0', DEFAULT_NET_CONSOLE_REQUEST, /* requiresSaveAs: */ true));
            recalculateAndApplyTheme('', 'light');
            globalDispatch(makeSetCollectionTreeAction([
                {
                    id: 'coll1',
                    name: 'Collection 1',
                    children: [{
                        id: 'coll1/coll2',
                        name: 'Child 1',
                        children: [],
                        authorization: {
                            type: 'basic',
                            basic: {
                                username: 'test',
                                password: 'test',
                                showPassword: false,
                            }
                        },
                    }],
                    authorization: undefined,
                },
                {
                    id: 'coll2',
                    name: 'Collection 2',
                    children: [{
                        id: 'coll2/coll2',
                        name: 'Child 1',
                        children: [],
                        authorization: undefined,
                    }],
                    authorization: undefined,
                },
                {
                    id: 'coll3',
                    name: 'Collection 3',
                    children: [{
                        id: 'coll3/coll2',
                        name: 'Child 1',
                        children: [],
                        authorization: undefined,
                    }],
                    authorization: undefined,
                },
                {
                    id: 'coll4',
                    name: 'Collection 4',
                    children: [{
                        id: 'coll4/coll2',
                        name: 'Child 1',
                        children: [],
                        authorization: undefined,
                    }],
                    authorization: undefined,
                },
                {
                    id: 'coll5',
                    name: 'Collection 5',
                    children: [{
                        id: 'coll5/coll2',
                        name: 'Child 1',
                        children: [],
                        authorization: undefined,
                    }],
                    authorization: undefined,
                },
                {
                    id: 'coll6',
                    name: 'Collection 6',
                    children: [{
                        id: 'coll6/coll2',
                        name: 'Child 1',
                        children: [],
                        authorization: undefined,
                    }],
                    authorization: undefined,
                },
                {
                    id: 'coll7',
                    name: 'Collection 7',
                    children: [{
                        id: 'coll7/coll2',
                        name: 'Child 1',
                        children: [],
                        authorization: undefined,
                    }],
                    authorization: undefined,
                },
                {
                    id: 'coll8',
                    name: 'Collection 8',
                    children: [{
                        id: 'coll8/coll2',
                        name: 'Child 1',
                        children: [],
                        authorization: undefined,
                    }],
                    authorization: undefined,
                },
                {
                    id: 'coll9',
                    name: 'Collection 9',
                    children: [{
                        id: 'coll9/coll2',
                        name: 'Child 1',
                        children: [],
                        authorization: undefined,
                    }],
                    authorization: undefined,
                },
                {
                    id: 'coll10',
                    name: 'Collection 10',
                    children: [{
                        id: 'coll10/coll2',
                        name: 'Child 1',
                        children: [],
                        authorization: undefined,
                    }],
                    authorization: undefined,
                },
                {
                    id: 'coll11',
                    name: 'Collection 11',
                    children: [{
                        id: 'coll11/coll2',
                        name: 'Child 1',
                        children: [],
                        authorization: undefined,
                    }],
                    authorization: undefined,
                },
                {
                    id: 'coll12',
                    name: 'Collection 12',
                    children: [{
                        id: 'coll12/coll2',
                        name: 'Child 1',
                        children: [],
                        authorization: undefined,
                    }],
                    authorization: undefined,
                },
                {
                    id: 'coll13',
                    name: 'Collection 13',
                    children: [{
                        id: 'coll13/coll2',
                        name: 'Child 1',
                        children: [],
                        authorization: undefined,
                    }],
                    authorization: undefined,
                },
                {
                    id: 'coll14',
                    name: 'Collection 14',
                    children: [{
                        id: 'coll14/coll2',
                        name: 'Child 1',
                        children: [],
                        authorization: undefined,
                    }],
                    authorization: undefined,
                },
                {
                    id: 'coll15',
                    name: 'Collection 15',
                    children: [{
                        id: 'coll15/coll2',
                        name: 'Child 1',
                        children: [],
                        authorization: undefined,
                    }],
                    authorization: undefined,
                },
                {
                    id: 'coll16',
                    name: 'Collection 16',
                    children: [],
                    authorization: undefined,
                },
            ]));
            loadPseudoloc();
        }, 1000);

        setTimeout(() => {
            if (showEnvironmentModalAtStartup) {
                globalDispatch(makeEditEnvironmentAction('env1', 'env1.nc.json', 'Environment Container 1', 'Environment 1', [
                    { key: 'foo', value: 'bar', description: '', isActive: true },
                    { key: 'bar', value: 'baz', description: '', isActive: true },
                    { key: 'frob', value: 'florbo', description: '', isActive: true },
                    { key: 'widget', value: 'contoso', description: '', isActive: true },
                ]));
            }
            else if (showAuthorizationModalAtStartup) {
                globalDispatch(makeEditAuthorizationInModalAction('coll1', [], { type: 'none' }));
            }
        }, 5000);
        (window as any).__debug_WAH = this;
    }

    async makeRequest(request: INetConsoleRequestInternal, environmentalAuthorization: INetConsoleAuthorization | null, environmentVariables: INetConsoleParameter[]): Promise<INetConsoleResponse> {
        const start = Date.now();
        let mergedRequest = await synthesizeHttpRequest(request, environmentalAuthorization, environmentVariables);
        const toFetch = constructRequest(mergedRequest);
        // await new Promise(r => setTimeout(r, 10000));
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
            resultRequest: formatRequestForSave(request),
            resultRequestId: 'DEFAULT_REQUEST',
        };
    }

    public _debug_manualLoad(requestBody: string) {
        const deserialized = deserializeFromHost('DEFAULT_REQUEST', JSON.parse(requestBody));
        globalDispatch(loadRequestAction('DEFAULT_REQUEST', deserialized, /* requiresSaveAs: */ true));
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

    public restoreFocusToHost() { }
}

async function loadPseudoloc() {
    const messages = await fetch('./_locales/ps-PS/messages.json');
    globalDispatch(initializeLocaleDictionary(await messages.json(), 'ps'));
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

function formatRequestForSave(request: INetConsoleRequestInternal): INetConsoleRequest {
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
