// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IHttpHeader } from 'network-console-shared';

export interface IDeconstructedUrl {
    input: string;
    summaryPath: string;
    detectedRouteParameters: IToken[];
    queryString: IHttpHeader[];
}

export interface IToken {
    start: number;
    length: number;
}

// Needs to be able to take in forms such as
// {scheme}://{url}/:some/:variable/to/the/:other?a=b&c=d&e=f
// or
// {schemeAndUrl}/:some/:variable/ignore

export default function deconstruct(input: string): IDeconstructedUrl {
    const queryStart = input.indexOf('?');
    const summaryPath = queryStart === -1 ?
                            input :
                            input.substring(0, queryStart);
    const queryPart = queryStart === -1 ?
                        '' :
                        input.substring(queryStart + 1);

    const queryString = parseQueryParameters(queryPart);
    const detectedRouteParameters = detectRouteParameters(summaryPath);

    return {
        input,
        summaryPath,
        detectedRouteParameters,
        queryString,
    };
}

function parseQueryParameters(queryString: string): IHttpHeader[] {
    const result: IHttpHeader[] = [];

    const parts = queryString.split('&');
    for (const part of parts) {
        if (part.length === 0) {
            continue;
        }

        const equalLocation = part.indexOf('=');
        if (equalLocation === -1) {
            result.push({
                key: part,
                value: '',
            });
        }
        else {
            const key = part.substring(0, equalLocation);
            const value = part.substring(equalLocation + 1);
            result.push({ key, value });
        }
    }

    return result;
}

function detectRouteParameters(path: string): IToken[] {
    const result: IToken[] = [];

    const matcher = /\/:(\w+)/gi;
    let match: RegExpExecArray | null = null;
    do {
        match = matcher.exec(path);
        if (match) {
            result.push({
                start: match.index + 2,
                length: match[1].length,
            });
        }
    } while (match);

    return result;
}
