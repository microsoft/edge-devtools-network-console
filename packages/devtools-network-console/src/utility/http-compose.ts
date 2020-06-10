// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Map as IMap } from 'immutable';
import {
    IHttpRequest,
    INetConsoleAuthorization,
    INetConsoleParameter,
    ISerializableHttpBody,
    toB64,
    IHttpHeader,
} from 'network-console-shared';

import { INetConsoleRequestInternal } from 'model/NetConsoleRequest';
import { mergeString, mergeEnvironments, mergeStringWithDurableMap } from './environment-merge';
import { calculateFormDataBody, calculateUrlEncodedDataBody } from './body-serialization';
import { toESMap } from 'utility';

export async function synthesizeHttpRequest(
    source: INetConsoleRequestInternal,
    environmentAuthorization: INetConsoleAuthorization | null,
    environmentVariables: INetConsoleParameter[],
): Promise<IHttpRequest> {
    const { verb } = source;
    let url = mergeString(source.url, environmentVariables).value;
    url = substituteRouteParameters(url, source.routeParameters, environmentVariables);
    if (source.queryParameters.size > 0) {
        url += '?' + concatenateQuery(source.queryParameters.valueSeq().toArray(), environmentVariables);
    }
    const headers = mergeEnvironments(source.headers.valueSeq().toArray(), environmentVariables);
    const body: ISerializableHttpBody = {
        content: '',
    };
    switch (source.bodyComponents.bodySelection) {
        case 'raw':
            body.content = toB64(source.bodyComponents.rawTextBody.text);
            addDefaultContentTypeIfMissing(headers, source.bodyComponents.rawTextBody.contentType);
            break;
        case 'form-data': {
            const components = source.bodyComponents.formData.valueSeq().toArray().filter(a => a.isActive);
            const mergedComponents = mergeEnvironments(components, environmentVariables);
            const serialized = await calculateFormDataBody(mergedComponents, environmentVariables);

            body.content = toB64(serialized.body);
            setContentType(headers, `multipart/form-data; boundary=${serialized.boundary}`);
            break;
        }
        case 'x-www-form-urlencoded': {
            const components = source.bodyComponents.xWwwFormUrlencoded.valueSeq().toArray().filter(a => a.isActive);
            const mergedComponents = mergeEnvironments(components, environmentVariables);
            const serialized = await calculateUrlEncodedDataBody(mergedComponents, environmentVariables);

            body.content = toB64(serialized);
            addDefaultContentTypeIfMissing(headers, 'application/x-www-form-urlencoded');
            break;
        }
        case 'none':
        default:
            break;
    }
    const authorization = substituteAuthorization(source.authorization, environmentAuthorization, environmentVariables);
    if (authorization.type === 'token') {
        const authHeaderIndex = headers.findIndex(h => h.key.toLowerCase() === 'authorization');
        const bearerHeader = { key: 'Authorization', value: `Bearer ${authorization.token!.token}`, description: '', isActive: true };
        if (authHeaderIndex === -1) {
            headers.push(bearerHeader);
        }
        else {
            headers.splice(authHeaderIndex, 1, bearerHeader);
        }
    }

    return {
        verb,
        url,
        headers,
        body,
        authorization,
        fetchParams: source.fetchParams,
    };
}

function addDefaultContentTypeIfMissing(headers: IHttpHeader[], defaultContentType: string) {
    if (!headers.some(h => h.key.toLowerCase() === 'content-type')) {
        headers.push({ key: 'Content-Type', value: defaultContentType });
    }
}

function setContentType(headers: IHttpHeader[], contentType: string) {
    const headerToReplace = headers.find(h => h.key.toLowerCase() === 'content-type');
    if (headerToReplace) {
        headerToReplace.value = contentType;
    }
    else {
        headers.push({ key: 'Content-Type', value: contentType });
    }
}

function substituteAuthorization(
    sourceAuth: INetConsoleAuthorization,
    environmentAuth: INetConsoleAuthorization | null,
    environmentVariables: INetConsoleParameter[]
): INetConsoleAuthorization {
    if (sourceAuth && sourceAuth.type !== 'inherit') {
        return substituteAuthorizationWithVariables(sourceAuth, environmentVariables);
    }

    if (environmentAuth) {
        return substituteAuthorizationWithVariables(environmentAuth, environmentVariables);
    }

    return {
        type: 'none',
    };
}

function substituteAuthorizationWithVariables(auth: INetConsoleAuthorization, environmentVariables: INetConsoleParameter[]): INetConsoleAuthorization {
    const map = toESMap(environmentVariables, v => v.key);
    switch (auth.type) {
        case 'none':
            return auth;
        case 'inherit':
            return auth;

        case 'basic': {
            if (!auth.basic) {
                throw new Error('Assertion failed: type = basic but no basic authorization data found.');
            }

            let { username, password, showPassword } = auth.basic;
            username = mergeStringWithDurableMap(username, map).value;
            password = mergeStringWithDurableMap(password, map).value;
            return {
                type: 'basic',
                basic: {
                    username,
                    password,
                    showPassword,
                },
            };
        }

        case 'token': {
            if (!auth.token) {
                throw new Error('Assertion failed: type = bearer token but no bearer token data was found.');
            }

            let { token } = auth.token;
            token = mergeStringWithDurableMap(token, map).value;

            return {
                type: 'token',
                token: {
                    token,
                },
            };
        }
    }

    return {
        type: 'none',
    };
}

export function substituteRouteParameters(baseUrl: string, routes: IMap<string, INetConsoleParameter>, environmentVariables: INetConsoleParameter[]): string {
    const routesArray = routes.valueSeq().toArray();
    const merged = mergeEnvironments(routesArray, environmentVariables);

    let result = baseUrl;
    merged.forEach(r => {
        if (!r.isActive) {
            return;
        }

        result = result.replace(':' + r.key, r.value);
    });
    return result;
}

export function concatenateQuery(query: INetConsoleParameter[], environmentVariables: INetConsoleParameter[]): string {
    const merged = mergeEnvironments(query, environmentVariables);
    const enc = encodeURIComponent;
    return merged.map(q => `${enc(q.key)}=${enc(q.value)}`).join('&');
}
