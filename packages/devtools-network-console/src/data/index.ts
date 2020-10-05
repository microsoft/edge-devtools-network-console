// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { HttpVerb } from 'network-console-shared';

export interface IHttpVerbDef {
    name: string;
    descriptionKey: string;
    link: string;
    canIncludeBody: boolean;
    category?: string;
}

/**
 * This is not presently used and may be removed in the future. We would like to support
 * rich tooltips for our controls, but that's TBD.
 */
export const KNOWN_HTTP_VERBS: IHttpVerbDef[] = [
    {
        name: 'GET',
        descriptionKey: 'KNOWN_HTTP_VERBS.GET',
        link: 'https://tools.ietf.org/html/rfc7231#section-4.3.1',
        canIncludeBody: false,
    },
    {
        name: 'HEAD',
        descriptionKey: 'KNOWN_HTTP_VERBS.HEAD',
        link: 'https://tools.ietf.org/html/rfc7231#section-4.3.2',
        canIncludeBody: false,
    },
    {
        name: 'POST',
        descriptionKey: 'KNOWN_HTTP_VERBS.POST',
        link: 'https://tools.ietf.org/html/rfc7231#section-4.3.3',
        canIncludeBody: true,
    },
    {
        name: 'PUT',
        descriptionKey: 'KNOWN_HTTP_VERBS.PUT',
        link: 'https://tools.ietf.org/html/rfc7231#section-4.3.4',
        canIncludeBody: true,
    },
    {
        name: 'PATCH',
        descriptionKey: 'KNOWN_HTTP_VERBS.PATCH',
        link: 'https://tools.ietf.org/html/rfc5789',
        canIncludeBody: true,
    },
    {
        name: 'DELETE',
        descriptionKey: 'KNOWN_HTTP_VERBS.DELETE',
        link: 'https://tools.ietf.org/html/rfc7231#section-4.3.5',
        canIncludeBody: false,
    },
    {
        name: 'OPTIONS',
        descriptionKey: 'KNOWN_HTTP_VERBS.OPTIONS',
        link: 'https://tools.ietf.org/html/rfc7231#section-4.3.7',
        canIncludeBody: true,
    },
];

export function getKnownVerbDef(verb: HttpVerb): IHttpVerbDef | null {
    return KNOWN_HTTP_VERBS.find(d => d.name === verb) || null;
}
