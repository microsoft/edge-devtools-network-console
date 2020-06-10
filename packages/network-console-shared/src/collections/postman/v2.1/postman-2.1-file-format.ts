// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    ICollectionRootReader,
    ICollectionItemBase,
    ICollectionFolderReader,
    ICollectionEntryReader,
} from '../../shared/reader';
import { INetConsoleAuthorization, INetConsoleRequest, INetConsoleParameter, BodyFormat, IFormDataParameter } from '../../../net/net-console-http';
import lazy, { Lazy } from '../../../util/lazy';
import * as Postman21 from './schema-generated';
import { postman21AuthToNetConsole } from './auth';
import { HttpVerb } from '../../../net/verb';

export class Postman21NativeReader implements ICollectionRootReader {
    public readonly type = 'root';
    private root: Postman21.Postman21Schema;
    private _children: Lazy<ICollectionItemBase[]>;
    public readonly canWrite = false;

    constructor(public readonly url: string, json: string) {
        this.root = JSON.parse(json);
        this._children = lazy(() => {
            return this.root.item.map(entry => itemFromNative(entry));
        });
    }

    public get name() {
        return this.root.info.name;
    }

    public get children() {
        return this._children().slice();
    }

    public get authorization(): INetConsoleAuthorization {
        return this.root.auth ? postman21AuthToNetConsole(this.root.auth) : {
            type: 'inherit',
        };
    }
}

function itemFromNative(native: Postman21.Items): ICollectionItemBase {
    if ('item' in native && !!native.item) {
        // it's a folder
        return new Postman21NativeFolderReader(native);
    }
    else {
        // it's a request
        return new Postman21NativeEntryReader(native);
    }
}

class Postman21NativeFolderReader implements ICollectionFolderReader {
    public readonly type = 'folder';
    private _children: Lazy<ICollectionItemBase[]>;
    private _auth: Lazy<INetConsoleAuthorization>;
    public readonly canWrite = false;
    constructor(private readonly root: Postman21.Items) {
        if (!root.item) {
            throw new RangeError('Invalid type: expected "item" property on entry.');
        }

        this._children = lazy(() => {
            return root.item!.map(entry => itemFromNative(entry));
        });
        this._auth = lazy(() => {
            return this.root.auth ? postman21AuthToNetConsole(this.root.auth) : { type: 'inherit' };
        });
    }

    public get name() {
        return this.root.name || '<unnamed>';
    }

    public get children() {
        return this._children().slice();
    }

    public get authorization(): INetConsoleAuthorization {
        return this._auth();
    }
}

class Postman21NativeEntryReader implements ICollectionEntryReader {
    public readonly type = 'entry';
    public readonly canWrite = false;
    private _request: Lazy<INetConsoleRequest>;

    constructor(private readonly originalEntry: Postman21.Items) {
        this._request = lazy(() => {
            return convertPostmanToNetConsole(originalEntry);
        });
    }

    public get name() {
        let name = this.originalEntry.name;
        if (!name) {
            const req = this.originalEntry.request as Postman21.RequestObject;
            name = `${req.method} ${(req.url as Postman21.URLObject).raw}`;
        }
        return name;
    }

    public get request() {
        return this._request();
    }
}

function convertPostmanToNetConsole(entry: Postman21.Items): INetConsoleRequest {
    const req = entry.request as Postman21.RequestObject;
    let headers = req.header as Postman21.Header[];
    if (typeof headers === 'string') {
        // TODO: Telemetry log unsupported deserialization of headers via variables
        headers = [];
    }
    const contentTypeHeader = headers.find(h => h.key.toLowerCase() === 'content-type');
    const contentType = contentTypeHeader && contentTypeHeader.value;

    let postmanAuth = req.auth as Postman21.Auth | undefined;
    if (typeof postmanAuth === 'string') {
        // TODO: Telemetry log unsupported deserialization of auth via variables
        postmanAuth = undefined;
    }

    return {
        // body.content is set to empty and calculated by the frontend
        body: { content: '' },
        authorization: !!postmanAuth ? postman21AuthToNetConsole(postmanAuth) : { type: 'inherit' },
        bodyComponents: postmanBodyComponentsToNetConsole(req.body, contentType),
        description: extractSimpleDescription(req.description),
        headers: (headers).map<INetConsoleParameter>(h => {
            return {
                description: extractSimpleDescription(h.description),
                // todo: look up what corresponds to disabling a parameter
                isActive: true,
                key: h.key,
                value: h.value || '',
            };
        }),
        name: entry.name || '',
        queryParameters: extractQuery(req.url),
        routeParameters: extractRoutes(req.url),
        url: stripQueryFromRaw(req.url),
        verb: (req.method as HttpVerb) || 'GET',
    };
}

function extractSimpleDescription(description: string | Postman21.Description | undefined | null): string {
    if (typeof description === 'string') {
        return description as string;
    }
    if (!description) {
        return '';
    }

    return (description as Postman21.Description).content || '';
}

function extractQuery(url: Postman21.URLObject | string | undefined): INetConsoleParameter[] {
    if (typeof url === 'string') {
        // TODO: Telemetry log unsupported deserialization of URL via variables
        return [];
    }
    if (!url) {
        return [];
    }

    const query = url.query;
    if (!query) {
        return [];
    }

    return query.map<INetConsoleParameter>(q => {
        return {
            description: extractSimpleDescription(q.description),
            isActive: !q.disabled,
            key: q.key || '',
            value: q.value || '',
        };
    });
}

function extractRoutes(url: Postman21.URLObject | string | undefined): INetConsoleParameter[] {
    if (typeof url === 'string') {
        // TODO: Telemetry log unsupported deserialization of URL via variables
        return [];
    }
    if (!url) {
        return [];
    }

    const routes = url.variable;
    if (!routes) {
        return [];
    }

    return routes.map<INetConsoleParameter>(r => {
        return {
            description: extractSimpleDescription(r.description),
            isActive: !r.disabled,
            key: r.key || '',
            value: r.value,
        };
    });
}

function stripQueryFromRaw(url: string | Postman21.URLObject | undefined): string {
    if (!url) {
        return '';
    }

    const raw = ((typeof url === 'string') ? url : url.raw) || '';
    const indexOfQn = raw.indexOf('?');
    if (indexOfQn > -1) {
        return raw.substr(0, indexOfQn);
    }

    return raw;
}

function postmanBodyComponentsToNetConsole(body: Postman21.Body | null | undefined, contentType?: string) {
    const rawTextBody = {
        text: '',
        contentType: '',
    };
    const formData: IFormDataParameter[] = [];
    const xWwwFormUrlencoded: INetConsoleParameter[] = [];
    let bodySelection: BodyFormat = 'none';
    if (!!body) {
        switch (body.mode) {
            case 'raw': {
                if (!body.raw) {
                    break;
                }
                bodySelection = 'raw';
                rawTextBody.text = body.raw;
                rawTextBody.contentType = contentType || 'text/plain';
                break;
            }
            case 'formdata':
                bodySelection = 'form-data';
                formData.push(...(body.formdata || []).map<IFormDataParameter>(f => {
                    return {
                        description: extractSimpleDescription(f.description),
                        isActive: !f.disabled,
                        key: f.key,
                        value: f.value || '',
                        type: 'text',
                    };
                }));
                break;
            case 'urlencoded':
                bodySelection = 'x-www-form-urlencoded';
                xWwwFormUrlencoded.push(...(body.urlencoded || []).map<INetConsoleParameter>(e => {
                    return {
                        description: extractSimpleDescription(e.description),
                        isActive: true,
                        key: e.key,
                        value: e.value || '',
                    };
                }));
                break;

            default:
                // todo: telemetry
                break;
        }
    }

    return {
        bodySelection,
        formData,
        rawTextBody,
        xWwwFormUrlencoded,
    };
}
