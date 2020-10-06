// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { DataGridHeaderRenderConfig } from '@microsoft/fast-components-react-base';
import { DataGrid, DataGridColumn, DataGridCellRenderConfig } from '@microsoft/fast-components-react-msft';
import { IHttpHeader } from 'network-console-shared';

import BoolCheck from 'ui/generic/BoolCheck';
import LocText from 'ui/LocText';

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

const dataCols: DataGridColumn[] = [
    {
        columnDataKey: 'name',
        title: 'Name',
        columnWidth: '20%',
        header: (config: DataGridHeaderRenderConfig) => {
            return (
                <div className={config.classNames} role="columnheader" key={config.key} style={{gridColumn: '1 / auto', textAlign: 'center'}}>
                    <LocText textKey={`CookiesTable.Header.${config.title}`} />
                </div>
            );
        },
    },
    {
        columnDataKey: 'value',
        title: 'Value',
        columnWidth: '20%',
        header: (config: DataGridHeaderRenderConfig) => {
            return (
                <div className={config.classNames} role="columnheader" key={config.key} style={{gridColumn: '2 / auto', textAlign: 'center'}}>
                    <LocText textKey={`CookiesTable.Header.${config.title}`} />
                </div>
            );
        },
    },
    {
        columnDataKey: 'domain',
        title: 'Domain',
        columnWidth: '14%',
        header: (config: DataGridHeaderRenderConfig) => {
            return (
                <div className={config.classNames} role="columnheader" key={config.key} style={{gridColumn: '3 / auto', textAlign: 'center'}}>
                    <LocText textKey={`CookiesTable.Header.${config.title}`} />
                </div>
            );
        },
    },
    {
        columnDataKey: 'path',
        title: 'Path',
        columnWidth: '10%',
        header: (config: DataGridHeaderRenderConfig) => {
            return (
                <div className={config.classNames} role="columnheader" key={config.key} style={{gridColumn: '4 / auto', textAlign: 'center'}}>
                    <LocText textKey={`CookiesTable.Header.${config.title}`} />
                </div>
            );
        },
    },
    {
        columnDataKey: 'expires',
        title: 'Expires',
        columnWidth: '20%',
        header: (config: DataGridHeaderRenderConfig) => {
            return (
                <div className={config.classNames} role="columnheader" key={config.key} style={{gridColumn: '5 / auto', textAlign: 'center'}}>
                    <LocText textKey={`CookiesTable.Header.${config.title}`} />
                </div>
            );
        },
    },
    {
        columnDataKey: 'httpOnly',
        title: 'HttpOnly',
        cell: (config: DataGridCellRenderConfig) => {
            return (
                <div className={config.classNames} {...config.unhandledProps} data-cellid={config.columnDataKey} style={{textAlign: 'center'}}>
                    <BoolCheck isChecked={(config.rowData as IParsedCookie).httpOnly} />
                </div>
            );
        },
        header: (config: DataGridHeaderRenderConfig) => {
            return (
                <div className={config.classNames} role="columnheader" key={config.key} style={{gridColumn: '6 / auto', textAlign: 'center'}}>
                    {/* Intentionally not localized */}
                    {config.title}
                </div>
            );
        },
        columnWidth: '8%',
    },
    {
        columnDataKey: 'secure',
        title: 'Secure',
        cell: (config: DataGridCellRenderConfig) => {
            return (
                <div className={config.classNames} {...config.unhandledProps} data-cellid={config.columnDataKey} style={{textAlign: 'center'}}>
                    <BoolCheck isChecked={(config.rowData as IParsedCookie).secure} />
                </div>
            );
        },
        header: (config: DataGridHeaderRenderConfig) => {
            return (
                <div className={config.classNames} role="columnheader" key={config.key} style={{gridColumn: '7 / auto', textAlign: 'center'}}>
                    <LocText textKey={`CookiesTable.Header.${config.title}`} />
                </div>
            )
        },
        columnWidth: '8%',
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
        <DataGrid
            rows={cookies}
            columns={dataCols}
            dataRowKey="name"
            virtualize={false}
            />
    );
}
