// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import JSONView from 'ui/JSONView';
import { strFromB64 } from 'utility/b64';
import { getText, ILocalized } from 'utility/loc-context';

function JsonPreview({ body }: { body: string; } & ILocalized) {
    const jsonObjPreview = React.useMemo(() => {
        let val = null;
        try {
            const fromB64 = strFromB64(body);
            val = JSON.parse(fromB64);
        }
        catch (err) {
            val = `Error decoding JSON: ${err.message}`;
        }
        return val;
    }, [body]);
    const child = (
        <JSONView value={jsonObjPreview} />
    );
    return child;
}

function ImagePreview({ body, contentType, locale }: { body: string, contentType: string } & ILocalized) {
    const dataUrl = React.useMemo(() => {
        return `data:${contentType};base64,${body}`;
    }, [body, contentType]);
    return (
        // eslint-disable-next-line jsx-a11y/img-redundant-alt
        <img src={dataUrl} alt={getText('ResponsePreview.imageAlt', { locale })} />
    );
}

function HtmlPreview({ body, locale }: { body: string } & ILocalized) {
    const dataUrl = React.useMemo(() => {
        const blob = new Blob([atob(body)], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        return url;
    }, [body]);
    return (
        <iframe title={getText('ResponsePreview.htmlPreview', { locale })} sandbox="" src={dataUrl} style={{
            width: 'calc(100% - 2px)',
            height: 'calc(100% - 38px)',
            border: '1px solid #333',
            backgroundColor: 'white',
        }}></iframe>
    );
}

interface IPreview {
    title: string;
    child: JSX.Element;
    className: string;
    parentClassName: string;
}

export default function preview(body: string, contentType: string, locale: string): IPreview | undefined {
    if (contentType.startsWith('image/')) {
        return {
            title: getText('ResponsePreview.imagePreviewTitle', { locale }),
            child: <ImagePreview body={body} contentType={contentType} locale={locale} />,
            className: '',
            parentClassName: '',
        };
    }
    else if (contentType.startsWith('text/html')) {
        return {
            title: getText('ResponsePreview.htmlPreviewTitle', { locale }),
            child: <HtmlPreview body={body} locale={locale} />,
            className: 'editor-container',
            parentClassName: '',
        };
    }
    else if (contentType.indexOf('json') > -1) {
        return {
            title: getText('ResponsePreview.jsonPreviewTitle', { locale }),
            child: <JsonPreview body={body} locale={locale} />,
            className: 'editor-container json-preview-container',
            parentClassName: 'json-preview',
        };
    }

    return undefined;
}
