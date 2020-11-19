// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { i18n } from 'network-console-shared';
import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { IView } from 'store';

export interface ISetLocaleAction {
    type: 'SET_LOCALE';
    locale: string;
}

export function makeSetLocaleAction(locale: string): ISetLocaleAction {
    return {
        type: 'SET_LOCALE',
        locale,
    };
}

export function initializeLocaleDictionary(dictionary: any, locale: string): ThunkAction<void, IView, void, AnyAction> {
    return async dispatch => {
        i18n.loadLocalization(dictionary, locale);
        dispatch(makeSetLocaleAction(locale));
    };
}

export type LocaleAction = 
    ISetLocaleAction
    ;
