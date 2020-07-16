// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { THEME_TYPE } from 'themes/vscode-theme';
import { IThemeInfo } from 'store';

const DEFAULT_THEME: IThemeInfo = {
    fontPalette: 'normal',
    theme: 'light',
};


export default function reduceTheme(state: IThemeInfo = DEFAULT_THEME, action: { type: 'SET_THEME_TYPE', themeType: THEME_TYPE }): IThemeInfo {
    switch (action.type) {
        case 'SET_THEME_TYPE':
            return {
                ...state,
                theme: action.themeType,
            };
    }

    return state;
}
