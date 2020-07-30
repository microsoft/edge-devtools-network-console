// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    URLObject,
    VariableType,
} from '../../../collections/postman/v2.1/schema-generated';
import { INetConsoleParameter } from '../../../net/net-console-http';

export function constructURLObject(url: string, routeParams: INetConsoleParameter[], queryParameters: INetConsoleParameter[]) {
    const result: URLObject = {
        raw: url,
    };

    const parsedUrl = new URL(url);
    if (parsedUrl.protocol) {
        result.protocol = parsedUrl.protocol;
        if (result.protocol.endsWith(':')) {
            result.protocol = result.protocol.substr(0, result.protocol.length - 1);
        }
    }

    if (parsedUrl.hostname) {
        result.host = [parsedUrl.hostname];
    }

    if (parsedUrl.port) {
        result.port = parsedUrl.port;
    }

    if (parsedUrl.pathname) {
        let path = parsedUrl.pathname;
        if (path.charAt(0) === '/') {
            path = path.substr(1);
        }

        result.path = path.split('/');
    }

    if (parsedUrl.hash) {
        result.hash = parsedUrl.hash;
    }

    if (queryParameters.length) {
        const qs = queryParameters.filter(q => q.isActive).map(q => {
            return `${encodeURIComponent(q.key)}=${encodeURIComponent(q.value)}`;
        }).join('&');
        if (qs) {
            result.raw += '?' + qs;
        }
        result.query = queryParameters.map(q => {
            return {
                description: q.description,
                disabled: !q.isActive,
                key: q.key,
                value: q.value,
            };
        });
    }

    if (routeParams.length) {
        result.variable = routeParams.map(r => {
            return {
                description: r.description,
                key: r.key,
                disabled: !r.isActive,
                value: r.value,
                type: VariableType.String,
            };
        });
    }

    return result;
}

export function formatURLObjectWithoutVariables(url: URLObject) {
    const { hash, host, path, port, protocol, query, raw } = url;
    if (raw) {
        return raw;
    }

    let builder = '';
    if (protocol) {
        builder = protocol + '://';
    }

    if (host) {
        if (Array.isArray(host)) {
            builder += host.join('.');
        }
        else {
            builder += host;
        }
    }

    if (port) {
        builder += ':' + port;
    }

    if (path) {
        let pathComponent;
        if (Array.isArray(path)) {
            pathComponent = path.join('/');
        }
        else {
            pathComponent = path;
        }

        if (pathComponent.charAt(0) !== '/') {
            builder += '/';
        }
        builder += pathComponent;
    }

    if (query && query.length) {
        builder += '?';
        builder += query.map(q => `${encodeURIComponent(q.key || '')}=${encodeURIComponent(q.value || '')}`).join('&');
    }

    if (hash) {
        builder += '#';
        builder += hash;
    }

    return builder;
}
