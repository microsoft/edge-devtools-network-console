// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Base64String } from '../util/base64';
import {
    HttpAuthorizationScheme,
    IHttpHeader,
    IHttpAuthorization,
    IHttpRequest,
    IHttpResponse,
    IBasicAuthorization,
} from './http-base';

export interface INetConsoleParameter extends IHttpHeader {
    description: string;
    isActive: boolean;
}

export interface IFormDataParameter extends INetConsoleParameter {
    type: 'text' | 'file';
    /**
     * When `type` === `'file'`, the `value` property contains the name
     * of the file.
     */
    value: string;
    fileContents?: Base64String;
}

export function isFormDataParameter(param: INetConsoleParameter): param is IFormDataParameter {
    return 'type' in param;
}

export type NetworkConsoleAuthorizationScheme =
    HttpAuthorizationScheme |
    'inherit' |
    'token'
    ;

export interface INetConsoleBearerTokenAuthorization {
    token: string;
}

export interface INetConsoleBasicAuthorization extends IBasicAuthorization {
    showPassword: boolean;
}

export interface INetConsoleAuthorization extends IHttpAuthorization {
    type: NetworkConsoleAuthorizationScheme;

    token?: INetConsoleBearerTokenAuthorization;
    basic?: INetConsoleBasicAuthorization;
}

export type BodyFormat = 'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw';

export interface INetConsoleRawBody {
    text: string;
    /**
     * Contains the UI-selected content type of the text (for the default mode of
     * syntax highlighting).
     */
    contentType: string;
}

export interface INetConsoleBodyComponents {
    /**
     * "Raw text" is typically for some content that the user has entered manually into
     * the text editor (for example, for JSON, plain text, or CSV). This content is *not*
     * encoded into Base64 since the content is typically considered to have been entered
     * as plain text.
     */
    rawTextBody?: INetConsoleRawBody;
    /**
     * Contains key-value pairs of form data. Because form data parameters do contain the
     * contents of files, the host can decide whether to persist the file contents into the
     * save file.
     */
    formData?: IFormDataParameter[];
    /**
     * Contains key-value pairs of x-www-form-urlencoded data.
     */
    xWwwFormUrlencoded?: INetConsoleParameter[];
    /**
     * The discriminator for which mode the request uses to compose the body.
     */
    bodySelection: BodyFormat;
}

/**
 * This is the main item that is presented to users and is put into native files.
 */
export interface INetConsoleRequest extends IHttpRequest {
    /**
     * For `IBaseNetConsoleRequest`: the URL should not contain a hash, query
     * string, or substituted route parameters. That is to say it would look
     * like this:
     *
     *     {{scheme}}://{{domain}}/foo/bar/:id
     *
     * Here, there are multiple things going on:
     *
     *  - `{{scheme}}` and `{{domain}}` are environment variables which are substituted
     *  - `:id` is a route parameter which should appear in the `routeParameters` field
     *
     * When the frontend issues a request, it will compose the environment variables,
     * route parameters, and query parameters into a single URL which is then put into
     * the `IHttpRequest#url` property.
     */
    url: string;

    /**
     * The friendly name of the request as set by the user.
     */
    name: string;
    /**
     * An additional description of the request as set by the user.
     */
    description: string;

    authorization: INetConsoleAuthorization;

    /**
     * The headers of the request.
     */
    headers: INetConsoleParameter[];
    /**
     * Query parameters to be included at the end of the URL.
     */
    queryParameters: INetConsoleParameter[];
    /**
     * Route parameters to be substituted.
     */
    routeParameters: INetConsoleParameter[];

    /**
     * Persisted body components and configuration. While not required, the format may persist
     * all of the values (so that the user doesn't lose data in "raw text" mode when switching
     * to "form-data" mode); but only the value indicated by the `bodySelection` discriminator
     * will be used to compose the final request.
     */
    bodyComponents: INetConsoleBodyComponents;
}

/**
 * Milliseconds
 */
export type ms = number;

/**
 * Represents the latest "response" status of a particular request.
 */
export type ResponseStatus =
    'NOT_SENT' |
    'PENDING' |
    'ERROR_BELOW_APPLICATION_LAYER' |
    'COMPLETE'
    ;

/**
 * Wraps an HTTP response with some additional metadata, including detection of below-HTTP errors
 * and the duration of the request.
 */
export interface INetConsoleResponse {
    response: IHttpResponse;
    duration: ms;
    status: ResponseStatus;
}
