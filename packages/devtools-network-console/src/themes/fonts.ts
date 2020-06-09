// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IRawStyle, IFontWeight, DefaultFontStyles, IFontStyles, FontWeights } from '@fluentui/react';

function _createFont(size: string, weight: IFontWeight, fontFamily: string): IRawStyle {
    return {
        fontFamily: fontFamily,
        MozOsxFontSmoothing: 'grayscale',
        WebkitFontSmoothing: 'antialiased',
        fontSize: size,
        fontWeight: weight,
    };
}

interface IFontSizeDef {
    mini: string;
    xSmall: string;
    small: string;
    smallPlus: string;
    medium: string;
    mediumPlus: string;
    icon: string;
    large: string;
    xLarge: string;
    xLargePlus: string;
    xxLarge: string;
    xxLargePlus: string;
    superLarge: string;
    mega: string;
}

/**
 * Based on FontSizes from @uifabric/styling/lib/styles/fonts.js
 */
export const DEFAULT_FONT_SIZES: IFontSizeDef = {
    mini: '10px',
    xSmall: '10px',
    small: '12px',
    smallPlus: '12px',
    medium: '14px',
    mediumPlus: '16px',
    icon: '16px',
    large: '18px',
    xLarge: '20px',
    xLargePlus: '24px',
    xxLarge: '28px',
    xxLargePlus: '32px',
    superLarge: '42px',
    mega: '68px',
};

export const REDUCED_FONT_SIZES: IFontSizeDef = {
    mini: '9px',
    xSmall: '10px',
    small: '10px',
    smallPlus: '11px',
    medium: '11px',
    mediumPlus: '12px',
    icon: '12px',
    large: '14px',
    xLarge: '16px',
    xLargePlus: '20px',
    xxLarge: '24px',
    xxLargePlus: '28px',
    superLarge: '36px',
    mega: '48px',
};

export function createFontStyle(fontSizes: IFontSizeDef): IFontStyles {
    const fontFamilyWithFallback = DefaultFontStyles.medium.fontFamily as string;
    return {
        tiny: _createFont(fontSizes.mini, FontWeights.regular, fontFamilyWithFallback),
        xSmall: _createFont(fontSizes.xSmall, FontWeights.regular, fontFamilyWithFallback),
        small: _createFont(fontSizes.small, FontWeights.regular, fontFamilyWithFallback),
        smallPlus: _createFont(fontSizes.smallPlus, FontWeights.regular, fontFamilyWithFallback),
        medium: _createFont(fontSizes.medium, FontWeights.regular, fontFamilyWithFallback),
        mediumPlus: _createFont(fontSizes.mediumPlus, FontWeights.regular, fontFamilyWithFallback),
        large: _createFont(fontSizes.large, FontWeights.regular, fontFamilyWithFallback),
        xLarge: _createFont(fontSizes.xLarge, FontWeights.semibold, fontFamilyWithFallback),
        xLargePlus: _createFont(fontSizes.xLargePlus, FontWeights.semibold, fontFamilyWithFallback),
        xxLarge: _createFont(fontSizes.xxLarge, FontWeights.semibold, fontFamilyWithFallback),
        xxLargePlus: _createFont(fontSizes.xxLargePlus, FontWeights.semibold, fontFamilyWithFallback),
        superLarge: _createFont(fontSizes.superLarge, FontWeights.semibold, fontFamilyWithFallback),
        mega: _createFont(fontSizes.mega, FontWeights.semibold, fontFamilyWithFallback),
    };
}
