// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { HttpVerb } from 'network-console-shared';

export interface IHttpVerbDef {
    name: string;
    description: string;
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
        description: 'Requests transfer of a currently selected representation ' +
                     'for the target resource. GET is the primary mechanism of ' +
                     'information retrieval and the focus of almost all ' +
                     'performance optimizations.',
        link: 'https://tools.ietf.org/html/rfc7231#section-4.3.1',
        canIncludeBody: false,
    },
    {
        name: 'HEAD',
        description: 'The HEAD method is identical to GET except that the server ' +
                     'MUST NOT send a message body in the response, i.e., the ' +
                     'response terminates at the end of the header section.',
        link: 'https://tools.ietf.org/html/rfc7231#section-4.3.2',
        canIncludeBody: false,
    },
    {
        name: 'POST',
        description: 'The POST method requests that the target resource process ' +
                     'the representation enclosed in the request according to the ' +
                     'resource\'s own specific semantics.',
        link: 'https://tools.ietf.org/html/rfc7231#section-4.3.3',
        canIncludeBody: true,
    },
    {
        name: 'PUT',
        description: 'The PUT method requests that the state of the target ' +
                     'resource be created or replaced with the state defined ' +
                     'by the representation enclosed in the message payload.',
        link: 'https://tools.ietf.org/html/rfc7231#section-4.3.4',
        canIncludeBody: true,
    },
    {
        name: 'PATCH',
        description: 'The PATCH method requests that a set of changes described ' +
                     'in the request entity be applied to the resource identified ' +
                     'by the Request-URI.',
        link: 'https://tools.ietf.org/html/rfc5789',
        canIncludeBody: true,
    },
    {
        name: 'DELETE',
        description: 'The DELETE method requests that the origin server remove the ' +
                     'association between the target resource and its current ' +
                     'functionality.',
        link: 'https://tools.ietf.org/html/rfc7231#section-4.3.5',
        canIncludeBody: false,
    },
    {
        name: 'OPTIONS',
        description: 'The OPTIONS method requests information about the communication ' +
                     'options available for the target resource, at either the origin ' +
                     'server or an intervening intermediary.',
        link: 'https://tools.ietf.org/html/rfc7231#section-4.3.7',
        canIncludeBody: true,
    },
];

export function getKnownVerbDef(verb: HttpVerb): IHttpVerbDef | null {
    return KNOWN_HTTP_VERBS.find(d => d.name === verb) || null;
}
