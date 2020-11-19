// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { HttpVerb } from '../../../net/verb';
import {
    INetConsoleRequest,
    INetConsoleAuthorization,
    INetConsoleParameter,
    INetConsoleBodyComponents,
} from '../../../net/net-console-http';
import { migrateAuthorization } from '../../convert';
import {
    RequestObject,
    Items,
    URLObject,
} from './format/schema-generated';
import { constructURLObject, formatURLObjectWithoutVariables } from './url';

import { BodyAdapter } from './body';
import { AuthorizationAdapter } from './authorization';

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
        if (!value) {
            this._request.url = { };
        }
        else {
            this._request.url = constructURLObject(value, this.routeParameters, this.queryParameters);
        }
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
        return !!this._request.description ? String(this._request.description) : '';
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
        this._request.description = value;
        this.setDirty();
    }

    get authorization(): INetConsoleAuthorization {
        return new AuthorizationAdapter(this._request, this.setDirty);
    }

    set authorization(value: INetConsoleAuthorization) {
        if (value.type === 'inherit') {
            delete this._request.auth;
        }
        else {
            migrateAuthorization(this.authorization, value);
        }

        this.setDirty();
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
        const adapter = this.bodyComponents;
        adapter.bodySelection = value.bodySelection;
        adapter.formData = value.formData?.slice();
        adapter.rawTextBody = value.rawTextBody ? {
            ...value.rawTextBody,
        } : undefined;
        adapter.xWwwFormUrlencoded = value.xWwwFormUrlencoded?.slice();
        this.setDirty();
    }
}

export function mapNCToPostman(item: INetConsoleRequest): Items {
    const result: Items = { request: { } };

    const wrapper = new RequestWrapper(result, () => {});
    wrapper.authorization = item.authorization;
    wrapper.bodyComponents = item.bodyComponents;
    wrapper.description = item.description;
    wrapper.headers = item.headers.slice();
    wrapper.name = item.name;
    wrapper.queryParameters = item.queryParameters.slice();
    wrapper.routeParameters = item.routeParameters.slice();
    wrapper.url = item.url;
    wrapper.verb = item.verb;

    return result;
}
