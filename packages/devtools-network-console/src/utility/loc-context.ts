// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { createContext } from 'react';
import { i18n } from 'network-console-shared';

export const LocalizationContext = createContext('en-US');
export const LocalizationProvider = LocalizationContext.Provider;
export const LocalizationConsumer = LocalizationContext.Consumer;

export interface ILocalized {
    locale: string;
}

export function getText(key: string, props: ILocalized) {
    let message = i18n.getMessage(key, '', { language: props.locale });
    if (!message) {
        message = `[LOC FAILED] (${props.locale}) ${key}`;
    }
    return message;
}
