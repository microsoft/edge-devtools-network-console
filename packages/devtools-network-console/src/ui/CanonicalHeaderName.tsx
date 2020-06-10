// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

const KNOWN_HEADERS = new Map([
    ['content-type', {
        name: 'Content-Type',
        description: 'Indicates the media type of the resource',
        example: 'text/html; charset=UTF-8',
        specifications: [
            { title: 'RFC 7231, section 3.1.1.5', url: 'https://tools.ietf.org/html/rfc7231#section-3.1.1.5' },
            { title: 'RFC 7233, section 4.1', url: 'https://tools.ietf.org/html/rfc7233#section-4.1' },
        ]
    }],
    ['content-length', {
        name: 'Content-Length',
        description: 'Indicates the size of the entity-body, in bytes, sent to the recipient.',
        example: '1574',
        specifications: [
            { title: 'RFC 7230, section 3.3.2', url: 'https://tools.ietf.org/html/rfc7230#section-3.3.2' },
        ],
    }],
]);

function canonicalizeHeader(name: string): string {
    return name[0].toUpperCase() + name.substr(1).replace(/-[a-z]/g, s => `-${s[1].toUpperCase()}`);
}

export default function CanonicalHeaderName(props: { header: string }) {
    const known = KNOWN_HEADERS.get(props.header);
    if (!known) {
        return (
            <span>{canonicalizeHeader(props.header)}</span>
        );
    }
    else {
        return (
            <span title={known.description}>{known.name}</span>
        );
    }
}
