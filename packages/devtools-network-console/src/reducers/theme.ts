// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { THEME_TYPE } from 'themes/vscode-theme';

const DEFAULT_THEME_TYPE: THEME_TYPE = 'light';

export default function reduceTheme(state = DEFAULT_THEME_TYPE, action: { type: 'SET_THEME_TYPE', themeType: THEME_TYPE }): THEME_TYPE {
    switch (action.type) {
        case 'SET_THEME_TYPE':
            return action.themeType;
    }

    return state;
}
