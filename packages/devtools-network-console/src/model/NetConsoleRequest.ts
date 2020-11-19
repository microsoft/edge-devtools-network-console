// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Map as IMap } from 'immutable';
import {
    IFormDataParameter,
    HttpVerb,
    INetConsoleAuthorization,
    INetConsoleParameter,
    IFetchParams,
    ms,
    ResponseStatus,
    IHttpResponse,
}
from 'network-console-shared';

export interface INetConsoleRequestInternal {
    verb: HttpVerb;
    url: string;
    name: string;
    description: string;

    headers: IMap<string, INetConsoleParameter>;
    queryParameters: IMap<string, INetConsoleParameter>;
    routeParameters: IMap<string, INetConsoleParameter>;

    bodyComponents: {
        rawTextBody: {
            text: string;
            contentType: string;
        };
        formData: IMap<string, IFormDataParameter>;
        xWwwFormUrlencoded: IMap<string, INetConsoleParameter>;
        bodySelection: 'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw';
    };

    authorization: INetConsoleAuthorization;
    fetchParams?: IFetchParams;
}

export interface ISaveable<T extends object> {
    committed: T;
    current: T;
    isDirty: boolean;
}

export interface INetConsoleResponseInternal {
    duration: ms;
    started: ms;
    status: ResponseStatus;
    response: IHttpResponse | null;
    cookie: number;
}
