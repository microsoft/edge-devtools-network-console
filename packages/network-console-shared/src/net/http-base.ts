// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { HttpVerb } from './verb';
import { Base64String } from '../util/base64';

export interface IHttpHeader {
    key: string;
    value: string;
}

export type CorsMode = 'cors' | 'no-cors' | 'same-origin';
export type CredentialsMode = 'same-origin' | 'include' | 'omit';
export type CacheMode = 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached';
export type RedirectMode = 'follow' | 'error' | 'manual';

/**
 * When using `fetch` to invoke a web request, the below parameters can be used
 * to modify the default behavior of the fetch request.
 */
export interface IFetchParams {
    /**
     * Indicates how the CORS protocol should be negotiated. Defaults to `cors`.
     */
    corsMode: CorsMode;
    /**
     * Indicates how browser-supported credentials should be used, irrespective of
     * the default authorization scheme. Defaults to `same-origin`.
     */
    credentialsMode: CredentialsMode;
    /**
     * Indicates the cache policy the request should use. Because of the use case,
     * this defaults to `no-store` within most hosts.
     */
    cacheMode: CacheMode;
    /**
     * Indicates the redirect policy that should be used. Almost all requests should
     * use `follow`, which is the default.
     */
    redirectMode: RedirectMode;
}

/**
 * For all cases in which an HTTP body entity is passed around, the body is encoded as
 * base64. This allows byte-accurate preservation to be shared across process and
 * data boundaries.
 */
export interface ISerializableHttpBody {
    /**
     * The content of the body, always encoded in base64.
     */
    content: Base64String;
}

/**
 * Specifies the types of authorization scheme leveraged by HTTP. Each host must know
 * specifics about implementing these schemes at the HTTP layer.
 */
export type HttpAuthorizationScheme =
    'none' |
    'basic'
    ;

/**
 * Documents the parameters required for Basic authorization.
 */
export interface IBasicAuthorization {
    username: string;
    password: string;
}

/**
 * The tuple type for authorization settings for an HTTP request.
 */
export interface IHttpAuthorization {
    type: string;
    /**
     * Required if `type` is `'basic'`.
     */
    basic?: IBasicAuthorization;
}

/**
 * The parameters that should be used
 */
export interface IHttpRequest {
    verb: HttpVerb;
    url: string;
    headers: IHttpHeader[];
    body: ISerializableHttpBody;

    /**
     * Optional; if not included, assumes `'none'` or depends on the value of
     * `fetchParams.credentialsMode`.
     */
    authorization?: IHttpAuthorization;
    /**
     * Optional; defaults are documented in `IFetchParams`.
     */
    fetchParams?: Partial<IFetchParams>;
}

export interface IHttpResponse {
    statusCode: number;
    statusText: string;
    headers: IHttpHeader[];
    body: ISerializableHttpBody;
    size: number;
}
