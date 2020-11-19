// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LocaleAction } from 'actions/locale-action';

export default function reduceLocale(state = 'en', action: LocaleAction): string {
    if (action.type === 'SET_LOCALE') {
        return action.locale;
    }

    return state;
}
