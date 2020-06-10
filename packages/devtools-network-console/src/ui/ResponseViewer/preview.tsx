// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import ReactJsonView from 'react-json-view';
import { strFromB64 } from 'utility/b64';
import { THEME_TYPE } from 'themes/vscode-theme';

function JsonPreview({ body, theme }: { body: string; theme: THEME_TYPE }) {
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
    let rjsTheme = "shapeshifter:inverted";
    if (theme === 'dark') {
        rjsTheme = "twilight";
    }
    else if (theme === 'high-contrast') {
        rjsTheme = "bright";
    }
    const child = (
        <ReactJsonView
            src={jsonObjPreview}
            displayDataTypes={false}
            enableClipboard={false}
            iconStyle="triangle"
            theme={rjsTheme as any}
            />
    );
    return child;
}

function ImagePreview({ body, contentType }: { body: string, contentType: string }) {
    const dataUrl = React.useMemo(() => {
        return `data:${contentType};base64,${body}`;
    }, [body, contentType]);
    return (
        // eslint-disable-next-line jsx-a11y/img-redundant-alt
        <img src={dataUrl} alt="Preview of the image that was received" />
    );
}

function HtmlPreview({ body }: { body: string }) {
    const dataUrl = React.useMemo(() => {
        const blob = new Blob([atob(body)], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        return url;
    }, [body]);
    return (
        <iframe title="Sandboxed preview of the document which was received" sandbox="" src={dataUrl} style={{
            width: 'calc(100% - 2px)',
            height: 'calc(100% - 2px)',
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

export default function preview(body: string, contentType: string, theme: THEME_TYPE = 'light'): IPreview | undefined {
    if (contentType.startsWith('image/')) {
        return {
            title: 'Image Preview',
            child: <ImagePreview body={body} contentType={contentType} />,
            className: '',
            parentClassName: '',
        };
    }
    else if (contentType.startsWith('text/html')) {
        return {
            title: 'HTML Preview',
            child: <HtmlPreview body={body} />,
            className: 'editor-container',
            parentClassName: '',
        };
    }
    else if (contentType.indexOf('json') > -1) {
        return {
            title: 'JSON Preview',
            child: <JsonPreview body={body} theme={theme} />,
            className: 'editor-container json-preview-container',
            parentClassName: 'json-preview',
        };
    }

    return undefined;
}
