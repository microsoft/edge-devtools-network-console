// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { INetConsoleAuthorization } from 'network-console-shared';
import { AuthAction } from 'actions/request/auth';

export function alterAuthorization(action: AuthAction, source: INetConsoleAuthorization): INetConsoleAuthorization {
    switch (action.type) {
        case 'REQUEST_AUTH_SET_KIND': {
            return {
                ...source,
                type: action.kind,
            };
        }

        case 'REQUEST_AUTH_BASIC_SET_VALUES': {
            return {
                ...source,
                basic: {
                    username: action.username,
                    password: action.password,
                    showPassword: action.showPassword,
                },
            };
        }

        case 'REQUEST_AUTH_TOKEN_SET_VALUES': {
            return {
                ...source,
                token: {
                    token: action.token,
                },
            };
        }
    }
}