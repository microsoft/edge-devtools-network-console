// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { createContext } from 'react';
export const LocalizationContext = createContext('en-US');
export const LocalizationProvider = LocalizationContext.Provider;
export const LocalizationConsumer = LocalizationContext.Consumer;

export interface ILocalized {
    locale: string;
}
