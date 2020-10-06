// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const LOADED_DICTIONARIES: Map<string, LocalizationDictionary> = new Map();

export function format(text: string, substitutions?: string | string[]): string {
    // TODO
    return '[LOC] ' + text;
}

export type GetMessageOptions = {
    language?: string;
    substitutions?: string | string[];
}

export function getMessage(key: string, path: string, options?: GetMessageOptions): string | undefined {
    let dict = LOADED_DICTIONARIES.get(options?.language || 'en');
    return dict?.[key]?.message;
}

export type LocalizationDictionary = {
    [key: string]: {
        message: string;
        description?: string;
    };
};

export function loadLocalization(dictionary: LocalizationDictionary, locale: string) {
    LOADED_DICTIONARIES.set(locale, dictionary);
}
