// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { DesignSystemProvider } from '@microsoft/fast-jss-manager-react';
import { createColorPalette, DesignSystem, DesignSystemDefaults } from '@microsoft/fast-components-styles-msft';
import { parseColor } from '@microsoft/fast-colors';
import { i18n } from 'network-console-shared';

import ViewSelect from './ui/ViewSelect';
import store, { IView, IThemeInfo } from 'store';
import { Provider, useSelector } from 'react-redux';
import ModalManager from './ui/ModalManager';
import ErrorBoundary from 'ui/ErrorBoundary';
import { DARK_THEME_PALETTE, HIGH_CONTRAST_THEME_PALETTE, LIGHT_THEME_PALETTE } from './themes/vscode-theme';
import { LocalizationProvider } from 'utility/loc-context';

import ENGLISH_DICTIONARY from './_locales/en/messages.json';
i18n.loadLocalization(ENGLISH_DICTIONARY as any, 'en');

const App: React.FC = () => {
    return (
        <div className="App">
            <Provider store={store}>
                <LocalizedApp />
            </Provider>
        </div>
    );
}

function LocalizedApp() {
    const locale = useSelector<IView, string>(v => v.locale);
    return (
        <LocalizationProvider value={locale}>
            <StyledApp />
        </LocalizationProvider>
    );
}

function StyledApp() {
    const themeType = useSelector<IView, IThemeInfo>(s => s.theme);
    const palette =
        themeType.theme === 'light' ? LIGHT_THEME_PALETTE : (
            themeType.theme === 'high-contrast' ? HIGH_CONTRAST_THEME_PALETTE : DARK_THEME_PALETTE
        );
    const accent = parseColor(palette.themePrimary);
    const designSystem: DesignSystem = Object.assign({}, DesignSystemDefaults, {
        density: -1,
        accentBaseColor: palette.themePrimary,
        accentPalette: createColorPalette(accent!),
        backgroundColor: palette.white,
    });
    return (
        <DesignSystemProvider designSystem={designSystem}>
            <ErrorBoundary>
                <ViewSelect />
                <ModalManager />
            </ErrorBoundary>
        </DesignSystemProvider>
    );
}

export default App;
