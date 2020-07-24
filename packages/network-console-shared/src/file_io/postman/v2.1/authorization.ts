// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    INetConsoleAuthorization,
    INetConsoleBasicAuthorization,
    INetConsoleBearerTokenAuthorization,
} from '../../../net/net-console-http';
import { Auth, AuthType } from '../../../collections/postman/v2.1/schema-generated';

export function createAuthorizationProxy(realObject: Auth, onDirty: () => void): INetConsoleAuthorization {
    const ALLOWED_PROPERTIES = [
        'type',
        'token',
        'basic',
    ];

    return new Proxy<INetConsoleAuthorization>(realObject as any, {
        // @ts-ignore Transforming basic Auth to INetConsoleAuthorization
        get(obj: Auth, prop: string | number | symbol) {
            if (ALLOWED_PROPERTIES.indexOf(prop as string) === -1) {
                return undefined;
            }

            switch (prop) {
                case 'type': {
                    const postmanType = obj.type;
                    switch (postmanType) {
                        case 'noauth':
                            return 'none';
                        case 'bearer':
                            return 'token';
                        case 'basic':
                            return 'basic';
                        default:
                            return 'inherit';
                    }
                }

                case 'basic': {
                    const basicItems = obj.basic || [];
                    const result: INetConsoleBasicAuthorization = {
                        username: '',
                        password: '',
                        showPassword: false,
                    };
                    basicItems.forEach(item => {
                        switch (item.key) {
                            case 'username':
                                result.username = item.value;
                                break;
                            case 'password':
                                result.password = item.value;
                                break;
                            case 'showPassword':
                                result.showPassword = item.value;
                                break;
                        }
                    });
                    return result;
                }

                case 'bearer': {
                    const bearerItems = obj.bearer || [];
                    const result: INetConsoleBearerTokenAuthorization = {
                        token: '',
                    };
                    bearerItems.forEach(item => {
                        switch (item.key) {
                            case 'token':
                                result.token = item.value;
                                break;
                        }
                    });
                    return result;
                }
            }
        },
        // @ts-ignore Transforming basic Auth to INetConsoleAuthorization
        set(obj: Auth, prop: string | number | symbol, value: any) {
            if (ALLOWED_PROPERTIES.indexOf(prop as string) > -1) {
                onDirty();
                switch (prop) {
                    case 'type': {
                        switch (value) {
                            case 'none':
                                obj.type = AuthType.Noauth;
                                break;
                            case 'token':
                                obj.type = AuthType.Bearer;
                                break;
                            case 'basic':
                                obj.type = AuthType.Basic;
                                break;
                            default:
                                obj.type = AuthType.Noauth;
                                break;
                        }

                        return true;
                    }

                    case 'basic': {
                        const val: INetConsoleBasicAuthorization | null = value;
                        if (val) {
                            obj.basic = [
                                {
                                    key: 'username',
                                    value: val.username,
                                    type: 'string',
                                },
                                {
                                    key: 'password',
                                    value: val.password,
                                    type: 'string',
                                },
                                {
                                    key: 'showPassword',
                                    value: val.showPassword,
                                    type: 'boolean',
                                }
                            ];
                        }
                        else {
                            obj.basic = [];
                        }

                        return true;
                    } // case setting basic authorization

                    case 'token': {
                        const val: INetConsoleBearerTokenAuthorization | null = value;
                        if (val) {
                            obj.bearer = [
                                {
                                    key: 'token',
                                    value: val.token,
                                    type: 'string',
                                },
                            ];
                        }
                        else {
                            obj.bearer = [];
                        }

                        return true;
                    }
                }
            }

            return false;
        },
    });
}

export function mapNCAuthorizationToPostman(item: INetConsoleAuthorization): Auth {
    const result: Auth = {
        type: AuthType.Noauth,
    };

    const proxy = createAuthorizationProxy(result, () => {});
    Object.assign(proxy, result);

    return result;
}
