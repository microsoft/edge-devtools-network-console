// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function format(text: string, substitutions?: string | string[]): string {
    // TODO
    return '[LOC] ' + text;
}

export type GetMessageOptions = {
    language?: string;
    substitutions?: string | string[];
}

export function getMessage(key: string, path: string, options?: GetMessageOptions): string | undefined {
    // TODO
    return undefined;
}
