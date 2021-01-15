// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    IFormDataParameter,
    INetConsoleAuthorization,
    INetConsoleBodyComponents,
    INetConsoleParameter,
    INetConsoleRequest,
} from '../net/net-console-http';
import { IEnvironmentAdapter } from './interfaces';

/**
 * Serializes an INetConsoleParameter from a source. Because the source interface might
 * be implemented via getters and setters, this function may be called to produce a
 * plain JavaScript object which will always serialize to JSON.
 *
 * @param param The parameter to serialize
 */
export function serializeParameter(param: INetConsoleParameter): INetConsoleParameter {
    const { description, isActive, key, value } = param;
    return {
        description,
        isActive,
        key,
        value,
    };
}

/**
 * Serializes an INetConsoleRequest from a source. Because the source interface might
 * be implemented via getters and setters, this function may be called to produce a
 * plain JavaScript object, which will always be marshalable across boundaries and
 * will always be serializable to JSON.
 *
 * @param request The request to serialize
 */
export function serializeRequest(request: INetConsoleRequest): INetConsoleRequest {
    const { url, name, description, verb } = request;
    const headers = request.headers.map(serializeParameter);
    const queryParameters = request.queryParameters.map(serializeParameter);
    const routeParameters = request.routeParameters.map(serializeParameter);
    const authorization = serializeAuthorization(request.authorization);
    const bodyComponents = serializeBodyComponents(request.bodyComponents);

    const { content } = request.body;
    const body = {
        content,
    };

    return {
        verb,
        url,
        name,
        description,
        authorization,
        headers,
        queryParameters,
        routeParameters,
        bodyComponents,
        body,
    };
}

export function serializeAuthorization(auth: INetConsoleAuthorization): INetConsoleAuthorization {
    const { type } = auth;
    const result: INetConsoleAuthorization = {
        type,
    };

    if (auth.token) {
        const { token } = auth.token;
        result.token = {
            token,
        };
    }

    if (auth.basic) {
        const { username, password, showPassword } = auth.basic;
        result.basic = {
            username,
            password,
            showPassword,
        };
    }

    return result;
}

export function serializeBodyComponents(src: INetConsoleBodyComponents): INetConsoleBodyComponents {
    const { bodySelection } = src;
    const result: INetConsoleBodyComponents = {
        bodySelection,
    };

    if (src.rawTextBody && src.rawTextBody.text !== '') {
        const { contentType, text } = src.rawTextBody;
        result.rawTextBody = {
            contentType,
            text,
        };
    }

    if (src.xWwwFormUrlencoded && src.xWwwFormUrlencoded.length) {
        result.xWwwFormUrlencoded = src.xWwwFormUrlencoded.map(serializeParameter);
    }

    if (src.formData && src.formData.length) {
        result.formData = src.formData.map(serializeFormParameter);
    }

    return result;
}

function serializeFormParameter(param: IFormDataParameter): IFormDataParameter {
    const { description, isActive, key, type, value, fileContents } = param;
    const result: IFormDataParameter = {
        description,
        isActive,
        key,
        type,
        value,
    };

    if (fileContents) {
        result.fileContents = fileContents;
    }

    return result;
}

export function serializeEnvironment(env: IEnvironmentAdapter): IEnvironmentAdapter {
    const { id, name, variables } = env;
    return {
        id,
        name,
        variables: variables.map(serializeParameter),
    };
}
