// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { globalDispatch } from 'store';

export const DARK_THEME_PALETTE = {
    black: "#ffffff",
    neutralDark: "#dddddd",
    neutralLight: "rgba(58, 131, 208, 0.7)",
    neutralLighter: "#333333",
    neutralPrimary: "#d4d4d4",
    neutralSecondary: "rgba(204, 204, 204, 0.7)",
    themeDark: "rgb(126 197 255)",
    themeDarkAlt: "#1177bb",
    themeDarker: "#8db9e2",
    themeLight: "#75beff",
    themeLighter: "#1e1e1e",
    themeLighterAlt: "#e1e4e8",
    themePrimary: "rgb(80, 173, 235)",
    themeSecondary: "#094771",
    themeTertiary: "#75beff",
    white: "#1e1e1e",
    splitterColor: '#4a4a4a',
};

export const LIGHT_THEME_PALETTE = {
    black: "#000000",
    neutralDark: "#8e979c",
    neutralLight: "#e3e4e4",
    neutralLighter: "#f2f4f5",
    neutralPrimary: "#24292e",
    neutralSecondary: "#717171",
    themeDark: "#8e979c",
    themeDarkAlt: "#0062a3",
    themeDarker: "#1258a7",
    themeLight: "#75beff",
    themeLighter: "#e1e4e8",
    themeLighterAlt: "#e1e4e8",
    themePrimary: "#007acc",
    themeSecondary: "#0074e8",
    themeTertiary: "#75beff",
    white: "#ffffff",
    splitterColor: '#e1e4e8',
};

export const HIGH_CONTRAST_THEME_PALETTE = {
    themePrimary: '#6bbfff',
    themeLighterAlt: '#04080a',
    themeLighter: '#111f29',
    themeLight: '#20394d',
    themeTertiary: '#407399',
    themeSecondary: '#5ea8e0',
    themeDarkAlt: '#7ac5ff',
    themeDark: '#8fceff',
    themeDarker: '#acdbff',
    neutralLighterAlt: '#0b0b0b',
    neutralLighter: '#151515',
    neutralLight: '#252525',
    neutralQuaternaryAlt: '#2f2f2f',
    neutralQuaternary: '#373737',
    neutralTertiaryAlt: '#595959',
    neutralTertiary: '#c8c8c8',
    neutralSecondary: '#d0d0d0',
    neutralPrimaryAlt: '#dadada',
    neutralPrimary: '#ffffff',
    neutralDark: '#f4f4f4',
    black: '#f8f8f8',
    white: '#000000',
    splitterColor: '#333333',
};

const VSCODE_VARIABLES_PALETTE = {
    themePrimary: 'var(--vscode-button-background)',
    themeLighterAlt: 'var(--vscode-editorGroupHeader-tabsBorder)',
    themeLighter: 'var(--vscode-breadcrumb-background)',
    themeLight: 'var(--vscode-problemsInfoIcon-foreground)',
    themeTertiary: 'var(--vscode-editorInfo-foreground)',
    themeSecondary: 'var(--vscode-list-activeSelectionBackground)',
    themeDarkAlt: 'var(--vscode-button-hoverBackground)',
    themeDark: 'var(--vscode-activityBar-activeBorder)',
    themeDarker: 'var(--vscode-gitDecoration-submoduleResourceForeground)',
    neutralLighter: 'var(--vscode-activityBar-background)',
    neutralLight: 'var(--vscode-activityBar-activeBackground)',
    neutralSecondary: 'var(--vscode-descriptionForeground)',
    neutralPrimary: 'var(--vscode-editor-foreground)',
    neutralDark: 'var(--vscode-activityBar-foreground)',
    black: 'var(--vscode-tab-activeForeground)',
    white: 'var(--vscode-tab-activeBackground)',
};

export type THEME_TYPE = 'dark' | 'light' | 'high-contrast';

export function recalculateAndApplyTheme(sourceCss: string, themeType: THEME_TYPE) {
    document.documentElement.setAttribute('style', sourceCss);

    let palette: any = VSCODE_VARIABLES_PALETTE;
    if (!sourceCss) {
        if (themeType === 'high-contrast') {
            palette = HIGH_CONTRAST_THEME_PALETTE;
        }
        else if (themeType === 'dark') {
            palette = DARK_THEME_PALETTE;
        }
        else {
            palette = LIGHT_THEME_PALETTE;
        }
    }

    document.body.setAttribute('style',`
        --nc-theme-fore: ${palette.black};
        --nc-theme-back: ${palette.white};
        --nc-theme-disabled-text: ${palette.themeDarker};
        --nc-theme-dividers: ${palette.splitterColor};
        background-color: ${themeType === 'light' ? 'white' : 'rgb(30,30,30)'};`
    );
    globalDispatch({ type: 'SET_THEME_TYPE', themeType, });
}
