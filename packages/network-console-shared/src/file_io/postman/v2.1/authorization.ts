// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    INetConsoleAuthorization,
    INetConsoleBasicAuthorization,
    INetConsoleBearerTokenAuthorization,
    NetworkConsoleAuthorizationScheme,
} from '../../../net/net-console-http';
import { Auth, AuthType, RequestObject, PostmanAuth } from '../../../collections/postman/v2.1/schema-generated';

export class AuthorizationAdapter implements INetConsoleAuthorization {

    constructor(private request: RequestObject, private setDirty: () => void) {

    }

    get type() {
        const postmanType = this.request.auth?.type;
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

    set type(value: NetworkConsoleAuthorizationScheme) {
        let auth = this.request.auth;
        if (!auth) {
            auth = this.request.auth = { type: AuthType.Noauth, };
        }
        switch (value) {
            case 'none':
                auth.type = AuthType.Noauth;
                break;
            case 'token':
                auth.type = AuthType.Bearer;
                break;
            case 'basic':
                auth.type = AuthType.Basic;
                break;
            case 'inherit':
                delete this.request.auth;
                break;
            default:
                auth.type = AuthType.Noauth;
                break;
        }
    }

    get token() {
        if (!this.request.auth?.bearer) {
            return undefined;
        }

        return new BearerTokenAdapter(this.request, this.setDirty);
    }

    set token(value: INetConsoleBearerTokenAuthorization | undefined) {
        if (!value) {
            if (this.request.auth) {
                delete this.request.auth.bearer;
            }
            return;
        }

        if (!this.request.auth) {
            this.request.auth = { type: AuthType.Bearer, bearer: [] };
        }
        else if (!this.request.auth.bearer) {
            this.request.auth.bearer = [];
        }

        const adapter = this.token!;
        adapter.token = value?.token;
        this.setDirty();
    }

    get basic() {
        if (!this.request.auth?.basic) {
            return undefined;
        }

        return new BasicAdapter(this.request, this.setDirty);
    }

    set basic(value: INetConsoleBasicAuthorization | undefined) {
        if (!value) {
            if (this.request.auth?.basic) {
                delete this.request.auth.basic;
            }
            return;
        }

        if (!this.request.auth) {
            this.request.auth = { type: AuthType.Basic, basic: [] };
        }
        else if (!this.request.auth.basic) {
            this.request.auth.basic = [];
        }

        const adapter = this.basic!;
        adapter.username = value.username;
        adapter.password = value.password;
        adapter.showPassword = value.showPassword;
        this.setDirty();
    }
}

function getItemFrom(array: PostmanAuth[] | undefined, key: string): PostmanAuth | undefined {
    if (!array) {
        return undefined;
    }

    const found = array.find(i => i.key === key);
    return found;
}

class BearerTokenAdapter implements INetConsoleBearerTokenAuthorization {
    constructor(private request: RequestObject, private setDirty: () => void) {

    }

    get token() {
        const item = getItemFrom(this.request.auth?.bearer, 'token');
        return item?.value || '';
    }

    set token(value: string) {
        if (!this.request.auth) {
            this.request.auth = { type: AuthType.Bearer, };
        }
        if (!this.request.auth.bearer) {
            this.request.auth.bearer = [];
        }
        const entry = getItemFrom(this.request.auth.bearer, 'token');
        if (entry) {
            entry.value = value;
        }
        else {
            this.request.auth.bearer.push({
                key: 'token',
                type: 'string',
                value,
            });
        }

        this.setDirty();
    }
}

class BasicAdapter implements INetConsoleBasicAuthorization {
    constructor(private request: RequestObject, private setDirty: () => void) {

    }

    get username() {
        const item = getItemFrom(this.request.auth?.basic, 'username');
        return item?.value || '';
    }

    set username(value: string) {
        if (!this.request.auth) {
            this.request.auth = { type: AuthType.Basic, };
        }
        if (!this.request.auth.basic) {
            this.request.auth.basic = [];
        }
        const entry = getItemFrom(this.request.auth.basic, 'username');
        if (entry) {
            entry.value = value;
        }
        else {
            this.request.auth.basic.push({
                key: 'username',
                type: 'string',
                value,
            });
        }

        this.setDirty();
    }

    get password() {
        const item = getItemFrom(this.request.auth?.basic, 'password');
        return item?.value || '';
    }

    set password(value: string) {
        if (!this.request.auth) {
            this.request.auth = { type: AuthType.Basic, };
        }
        if (!this.request.auth.basic) {
            this.request.auth.basic = [];
        }
        const entry = getItemFrom(this.request.auth.basic, 'password');
        if (entry) {
            entry.value = value;
        }
        else {
            this.request.auth.basic.push({
                key: 'password',
                type: 'string',
                value,
            });
        }

        this.setDirty();
    }

    get showPassword() {
        const item = getItemFrom(this.request.auth?.basic, 'showPassword');
        return item?.value ?? false;
    }

    set showPassword(value: boolean) {
        if (!this.request.auth) {
            this.request.auth = { type: AuthType.Basic, };
        }
        if (!this.request.auth.basic) {
            this.request.auth.basic = [];
        }
        const entry = getItemFrom(this.request.auth.basic, 'showPassword');
        if (entry) {
            entry.value = value;
        }
        else {
            this.request.auth.basic.push({
                key: 'showPassword',
                type: 'boolean',
                value,
            });
        }

        this.setDirty();
    }
}
