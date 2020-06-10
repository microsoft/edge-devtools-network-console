// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as Postman21 from './schema-generated';
import { INetConsoleAuthorization } from '../../../net/net-console-http';

function postmanBasicToNCBasic(src: Postman21.Auth): INetConsoleAuthorization {
    const basicAuth = src.basic!.reduce((accum, current) => {
       return accum;
    }, {
        username: '',
        password: '',
        showPassword: false as boolean,
    });
    return {
        type: 'basic',
        basic: basicAuth,
    };
}

function postmanTokenToNCToken(src: Postman21.Auth): INetConsoleAuthorization {
    return {
        type: 'token',
        token: {
            token: src.bearer?.[0]?.value || '',
        },
    };
}

export function postman21AuthToNetConsole(src?: Postman21.Auth): INetConsoleAuthorization {
    if (!src) {
        return {
            type: 'inherit',
        };
    }

    switch (src.type) {
        case 'noauth':
            return {
                type: 'none',
            };

        case 'basic':
            return postmanBasicToNCBasic(src);

        case 'bearer':
            return postmanTokenToNCToken(src);

        default:
            // TODO: fire 'unsupported authorization type on import' telemetry event
            return {
                type: 'inherit',
            };
    }
}
