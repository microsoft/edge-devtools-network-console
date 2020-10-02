// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    INetConsoleAuthorization,
    INetConsoleBasicAuthorization,
    INetConsoleBearerTokenAuthorization,
    INetConsoleRequest,
    NetworkConsoleAuthorizationScheme,
} from '../../net/net-console-http';
import { INCNativeRequest, INCNativeFolder } from './format';

export class RequestAuthorizationAdapter implements INetConsoleAuthorization {

    constructor(private realObj: INetConsoleRequest, private setDirty: () => void) {

    }

    get type() {
        return this.realObj.authorization.type || 'inherit';
    }

    set type(value: NetworkConsoleAuthorizationScheme) {
        if (!this.realObj.authorization) {
            this.realObj.authorization = { type: value, };
        }
        else {
            this.realObj.authorization.type = value;
        }
        this.setDirty();
    }

    get token() {
        if (!this.realObj.authorization.token) {
            return undefined;
        }

        return new BearerTokenAdapter(this.realObj.authorization.token, this.setDirty);
    }

    set token(value: INetConsoleBearerTokenAuthorization | undefined) {
        if (!value) {
            if (this.realObj.authorization) {
                delete this.realObj.authorization.token;
                this.setDirty();
            }
            return;
        }

        if (!this.realObj.authorization) {
            this.realObj.authorization = { type: 'token', token: { ...value } };
        }
        else if (!this.realObj.authorization.token) {
            this.realObj.authorization.token = { ...value };
        }
        this.setDirty();
    }

    get basic() {
        if (!this.realObj.authorization.basic) {
            return undefined;
        }

        return new BasicAdapter(this.realObj.authorization.basic, this.setDirty);
    }

    set basic(value: INetConsoleBasicAuthorization | undefined) {
        if (!value) {
            if (this.realObj.authorization.basic) {
                delete this.realObj.authorization.basic;
                this.setDirty();
            }
            return;
        }

        if (!this.realObj.authorization) {
            this.realObj.authorization = { type: 'basic', basic: { ...value } };
        }
        else if (!this.realObj.authorization.basic) {
            this.realObj.authorization.basic = { ...value };
        }

        this.setDirty();
    }
}

export class ContainerAuthorizationAdapter implements INetConsoleAuthorization {

    constructor(private realObj: INCNativeFolder, private setDirty: () => void) {

    }

    get type() {
        return this.realObj.auth?.type || 'inherit';
    }

    set type(value: NetworkConsoleAuthorizationScheme) {
        if (!this.realObj.auth) {
            this.realObj.auth = { type: value, };
        }
        else {
            this.realObj.auth.type = value;
        }
        this.setDirty();
    }

    get token() {
        if (!this.realObj.auth?.token) {
            return undefined;
        }

        return new BearerTokenAdapter(this.realObj.auth.token, this.setDirty);
    }

    set token(value: INetConsoleBearerTokenAuthorization | undefined) {
        if (!value) {
            if (this.realObj.auth) {
                delete this.realObj.auth.token;
                this.setDirty();
            }
            return;
        }

        if (!this.realObj.auth) {
            this.realObj.auth = { type: 'token', token: { ...value } };
        }
        else if (!this.realObj.auth.token) {
            this.realObj.auth.token = { ...value };
        }
        this.setDirty();
    }

    get basic() {
        if (!this.realObj.auth?.basic) {
            return undefined;
        }

        return new BasicAdapter(this.realObj.auth.basic, this.setDirty);
    }

    set basic(value: INetConsoleBasicAuthorization | undefined) {
        if (!value) {
            if (this.realObj.auth?.basic) {
                delete this.realObj.auth.basic;
                this.setDirty();
            }
            return;
        }

        if (!this.realObj.auth) {
            this.realObj.auth = { type: 'basic', basic: { ...value } };
        }
        else if (!this.realObj.auth.basic) {
            this.realObj.auth.basic = { ...value };
        }

        this.setDirty();
    }
}

class BearerTokenAdapter implements INetConsoleBearerTokenAuthorization {
    constructor(private realObj: INetConsoleBearerTokenAuthorization, private setDirty: () => void) {

    }

    get token() {
        return this.realObj.token;
    }

    set token(value: string) {
        this.realObj.token = value;
        this.setDirty();
    }
}

class BasicAdapter implements INetConsoleBasicAuthorization {
    constructor(private realObj: INetConsoleBasicAuthorization, private setDirty: () => void) {

    }

    get username() {
        return this.realObj.username;
    }

    set username(value: string) {
        this.realObj.username = value;
        this.setDirty();
    }

    get password() {
        return this.realObj.password;
    }

    set password(value: string) {
        this.realObj.password = value;
        this.setDirty();
    }

    get showPassword() {
        return this.realObj.showPassword;
    }

    set showPassword(value: boolean) {
        this.realObj.showPassword = value;
        this.setDirty();
    }
}
