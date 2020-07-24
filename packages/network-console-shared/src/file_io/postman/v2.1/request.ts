// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { HttpVerb } from '../../../net/verb';
import {
    INetConsoleRequest,
    INetConsoleAuthorization,
    INetConsoleParameter,
    INetConsoleBodyComponents,
} from '../../../net/net-console-http';
import {
    RequestObject,
    Items,
    URLObject,
} from '../../../collections/postman/v2.1/schema-generated';
import { constructURLObject, formatURLObjectWithoutVariables } from './url';

import { BodyAdapter } from './body';
import { createAuthorizationProxy } from './authorization';

export class RequestWrapper implements INetConsoleRequest {
    private _request: RequestObject;
    constructor(private realObject: Items, private setDirty: () => void) {
        if (!realObject.request || typeof realObject.request !== 'object') {
            throw new RangeError('Unsupported request type: either a variable redirection or non-included request.');
        }
        this._request = realObject.request as RequestObject;
    }

    get url(): string {
        if (!this._request.url || typeof this._request.url === 'string') {
            // We don't support variable lookup for URLs
            return '';
        }

        return formatURLObjectWithoutVariables(this._request.url);
    }

    set url(value: string) {
        this._request.url = constructURLObject(value, this.routeParameters, this.queryParameters);
        this.setDirty();
    }

    get verb(): HttpVerb {
        return (this._request.method as HttpVerb) || 'GET';
    }

    set verb(value: HttpVerb) {
        this._request.method = value;
        this.setDirty();
    }

    get name(): string {
        return this.realObject.name || '';
    }

    set name(value: string) {
        this.realObject.name = value;
        this.setDirty();
    }

    get description(): string {
        return !!this.realObject.description ? String(this.realObject.description) : '';
    }

    get body() {
        return {
            content: '',
        };
    }

    set body(_value: any) {
        // Not preserved for file data
    }

    set description(value: string) {
        this.realObject.description = value;
        this.setDirty();
    }

    get authorization(): INetConsoleAuthorization {
        if (!this._request.auth) {
            this._request.auth = {
                type: 'inherit',
            } as any;
        }
        return createAuthorizationProxy(this._request.auth!, this.setDirty);
    }

    set authorization(value: INetConsoleAuthorization) {
        if (value.type === 'inherit') {
            delete this._request.auth;
        }

        Object.assign(this.authorization, value);
    }

    get headers(): INetConsoleParameter[] {
       if (!this._request.header) {
           return [];
       }
       if (typeof this._request.header === 'string') {
           // Flag: Unsupported variable reference here
           return [];
       }

       return this._request.header.map(h => {
           return {
               description: h.description ? String(h.description) : '',
               isActive: !h.disabled,
               key: h.key,
               value: h.value,
           };
       });
    }

    set headers(value: INetConsoleParameter[]) {
        this._request.header = value.map(h => {
            return {
                key: h.key,
                value: h.value,
                description: h.description,
                disabled: !h.isActive,
            };
        });
        this.setDirty();
    }

    get queryParameters(): INetConsoleParameter[] {
        if (!this._request.url || typeof this._request.url === 'string' || !this._request.url.query) {
            return [];
        }

        return this._request.url.query.map(q => {
            return {
                description: q.description ? String(q.description) : '',
                isActive: !q.disabled,
                key: q.key || '',
                value: q.value || '',
            };
        });
    }

    set queryParameters(value: INetConsoleParameter[]) {
        if (!this._request.url || typeof this._request.url === 'string') {
            // the this.url setter will populate this._request.url with a valid object.
            this.url = '';
        }
        (this._request.url as URLObject).query = value.map(h => {
            return {
                key: h.key,
                value: h.value,
                description: h.description,
                disabled: !h.isActive,
            };
        });
        this.setDirty();
    }

    get routeParameters(): INetConsoleParameter[] {
        if (!this._request.url || typeof this._request.url === 'string' || !this._request.url.variable) {
            return [];
        }

        return this._request.url.variable.map(v => {
            return {
                description: v.description ? String(v.description) : '',
                isActive: !v.disabled,
                key: v.key || '',
                value: v.value || '',
            };
        });
    }

    set routeParameters(value: INetConsoleParameter[]) {
        if (!this._request.url || typeof this._request.url === 'string') {
            // the this.url setter will populate this._request.url with a valid object.
            this.url = '';
        }
        (this._request.url as URLObject).variable = value.map(rp => {
            return {
                key: rp.key,
                value: rp.value,
                description: rp.description,
                disabled: !rp.isActive,
            };
        });
        this.setDirty();
    }

    get bodyComponents() {
        if (!this._request.body) {
            this._request.body = {};
        }
        return new BodyAdapter(this._request.body, this._request, this.setDirty);
    }

    set bodyComponents(value: INetConsoleBodyComponents) {
        var adapter = this.bodyComponents;
        Object.assign(adapter, value);
        this.setDirty();
    }
}

export function mapNCToPostman(item: INetConsoleRequest): Items {
    const result: Items = { };

    const wrapper = new RequestWrapper(result, () => {});
    Object.assign(wrapper, item);

    return result;
}
