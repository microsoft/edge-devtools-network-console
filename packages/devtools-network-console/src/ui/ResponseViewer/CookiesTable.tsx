// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { DetailsList, IColumn, SelectionMode } from 'office-ui-fabric-react';
import { IHttpHeader } from 'network-console-shared';

import BoolCheck from 'ui/generic/BoolCheck';

export interface ICookiesTableProps {
    headers: IHttpHeader[];
}

interface IParsedCookie {
    name: string;
    value: string;
    domain: string;
    path: string;
    expires: string;
    httpOnly: boolean;
    secure: boolean;
}

const columns: IColumn[] = [
    {
        key: 'name',
        name: 'Name',
        fieldName: 'name',
        isSorted: false,
        minWidth: 50,
        maxWidth: 150,
        isResizable: true,
    },
    {
        key: 'value',
        name: 'Value',
        fieldName: 'value',
        isSorted: false,
        minWidth: 50,
        isResizable: true,
    },
    {
        key: 'domain',
        name: 'Domain',
        fieldName: 'domain',
        isSorted: false,
        minWidth: 50,
        isResizable: true,
    },
    {
        key: 'path',
        name: 'Path',
        fieldName: 'path',
        isSorted: false,
        minWidth: 50,
        isResizable: true,
    },
    {
        key: 'expires',
        name: 'Expires',
        fieldName: 'expires',
        isSorted: false,
        minWidth: 100,
        maxWidth: 125,
        isResizable: true,
    },
    {
        key: 'httpOnly',
        name: 'HttpOnly',
        fieldName: 'httpOnly',
        isSorted: false,
        minWidth: 25,
        isResizable: true,
        onRender: (item, _index, _column) => {
            return (
                <BoolCheck isChecked={item.httpOnly} />
            );
        },
    },
    {
        key: 'secure',
        name: 'Secure',
        fieldName: 'secure',
        isSorted: false,
        minWidth: 25,
        isResizable: true,
        onRender: (item, _index, _column) => {
            return (
                <BoolCheck isChecked={item.secure} />
            );
        },
    },
];

function parseCookieHeader(cookie: string): IParsedCookie {
    // _EDGE_V=1; path=/; httponly; expires=Tue, 09-Feb-2021 02:38:24 GMT; domain=bing.com
    const parts = cookie.split(/;\s+/g);
    const nameValuePart = parts.shift();
    if (!nameValuePart) {
        throw new Error();
    }
    const nameValueComponents = nameValuePart.split('=') as string[];
    const name = nameValueComponents[0];
    const value = nameValueComponents[1];
    const parameters = parts.map(part => (part.split('=') as string[]));
    // TODO: invert the order of detection here
    const httpOnly = parameters.some(p => p[0].toLowerCase() === 'httponly');
    const secure = parameters.some(p => p[0].toLowerCase() === 'secure');
    const pathPair = parameters.find(p => p[0].toLowerCase() === 'path');
    const path = pathPair ? pathPair[1] : '';
    const domainPair = parameters.find(p => p[0].toLowerCase() === 'domain');
    const domain = domainPair ? domainPair[1] : '';
    const expiresPair = parameters.find(p => p[0].toLowerCase() === 'expires');
    const expires = expiresPair ? expiresPair[1] : '';
    return { name, value, path, domain, expires, httpOnly, secure };
}

export default function CookiesTable(props: { headers: IHttpHeader[] }) {
    const cookieHeaders = props.headers.filter(h => h.key.toLowerCase() === 'set-cookie');
    const cookies = cookieHeaders.map(h => h.value).map(parseCookieHeader);
    return (
        <DetailsList
            compact={true}
            items={cookies}
            columns={columns}
            selectionMode={SelectionMode.none}
            />
    );
}
