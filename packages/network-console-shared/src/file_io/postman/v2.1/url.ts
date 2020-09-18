// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    URLObject,
    VariableType,
} from '../../../collections/postman/v2.1/schema-generated';
import { INetConsoleParameter } from '../../../net/net-console-http';

/**
 * Constructs a Postman v2.1-schema-compatible "URLObject", given the Network Console parameters.
 *
 * In the Network Console data format, the URL is stored separately from the query parameters;
 * i.e., https://contoso.com/?search=bar would store as https://contoso.com/ with an array
 * containing a single Query parameter. Route parameters are inferred but stored as part of
 * the *request* object itself, whereas in Postman these are stored as part of the URLObject.
 *
 * In addition, the Query parameters are stored as part of the "raw" URL in Postman, which isn't
 * a thing in the Network Console data interchange format.
 *
 * Finally, in order to accommodate the way that Postman composes its URLObject, we first try to
 * use the `URL` API. However, this API doesn't always work because of particular features we
 * and they support (notably things like leading variables, such as in the example url of
 * `{{uriroot}}foo/bar/baz`), which would fail standard URL parsing via the API.
 *
 * @param url The URL from the `INetConsoleRequest`
 * @param routeParams The route parameters
 * @param queryParameters The query parameters
 */
export function constructURLObject(url: string, routeParams: INetConsoleParameter[], queryParameters: INetConsoleParameter[]) {
    const result: URLObject = {
        raw: url,
    };

    if (!tryParseInto(result, url, routeParams, queryParameters)) {
        let protocol: string | undefined;
        let host: string | undefined;
        let port: string | undefined;
        let paths: string | undefined;

        const indexOfSchemeSeparator = url.indexOf('://');
        let indexOfHost = 0;
        if (indexOfSchemeSeparator > -1) {
            protocol = url.substr(0, indexOfSchemeSeparator);
            indexOfHost = indexOfSchemeSeparator + '://'.length;
        }

        const firstPathIndex = url.indexOf('/', indexOfHost);
        if (firstPathIndex === -1) {
            host = url.substring(indexOfHost);
        }
        else {
            host = url.substring(indexOfHost, firstPathIndex);
        }

        const indexOfHostPortSeparator = host.indexOf(':');
        if (indexOfHostPortSeparator > -1) {
            host = host.substring(0, indexOfHostPortSeparator);
            port = host.substring(indexOfHostPortSeparator + 1);
        }

        if (firstPathIndex > -1) {
            paths = url.substring(firstPathIndex + 1);
        }

        if (protocol) {
            result.protocol = protocol;
        }
        if (host) {
            result.host = host.split('.');
        }
        if (port) {
            result.port = port;
        }
        if (paths) {
            result.path = paths.split('/');
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
    }

    return result;
}

/**
 * Attempts to parse the incoming URL into a URLObject, using the built-in `URL` class. Returns success or failure.
 *
 * @param result
 * @param url
 * @param routeParams
 * @param queryParameters
 * @return {boolean} Success or failure of the parsing.
 */
function tryParseInto(result: URLObject, url: string, routeParams: INetConsoleParameter[], queryParameters: INetConsoleParameter[]): boolean {
    try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol) {
            result.protocol = parsedUrl.protocol;
            if (result.protocol.endsWith(':')) {
                result.protocol = result.protocol.substr(0, result.protocol.length - 1);
            }
        }

        if (parsedUrl.hostname) {
            result.host = parsedUrl.hostname.split('.');
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
        return true;
    }
    catch (_err) {
        return false;
    }
}

/**
 * Produces a string containing the URL represented by a Postman 2.1-schema-compatible
 * URLObject. Favors the URLObject's `raw` property if available, but if not, constructs
 * the URL from its components. It does not perform any variable substitutions.
 *
 * @param url The Postman URLObject
 */
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
