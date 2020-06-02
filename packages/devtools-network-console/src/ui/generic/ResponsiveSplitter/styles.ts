// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from 'glamor';

export const REACTIVE_SPLITTER_WIDTH_MEDIA_QUERY = '(min-width: 1000px)';

export const SPLITTER_CONTAINER_STYLE = css({
    display: 'grid',
    gridTemplate: 'calc(50% - 8px) 15px calc(50% - 7px) / 1fr',
    placeItems: 'stretch stretch',
    ['@media' + REACTIVE_SPLITTER_WIDTH_MEDIA_QUERY]: {
        gridTemplate: '1fr / calc(50% - 8px) 15px calc(50% - 8px)',
    },
    position: 'relative',
});

export function calculateSplitterContainerStyle(leftPercentage: number) {
    if (isNaN(leftPercentage)) {
        throw new Error('Invalid left side percentage.');
    }
    return css(SPLITTER_CONTAINER_STYLE, {
        gridTemplate: `calc(${leftPercentage}% - 7px) 14px calc(100% - ${leftPercentage}% - 14px) / 1fr`,
        ['@media' + REACTIVE_SPLITTER_WIDTH_MEDIA_QUERY]: {
            gridTemplate: `1fr / calc(${leftPercentage}% - 7px) 14px calc(100% - ${leftPercentage}% - 14px)`,
        },
    });
}

export function calculateResizingContainerStyle(leftPercentage: number) {
    return css(calculateSplitterContainerStyle(leftPercentage), {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        position: 'absolute',
    });
}

export const SIDE_STYLE = css({
    overflow: 'hidden',
});

export const LEFT_SIDE_STYLE = css(SIDE_STYLE, {
    gridArea: '1 / 1 / 2 / 2',
    ['@media' + REACTIVE_SPLITTER_WIDTH_MEDIA_QUERY]: {
        paddingLeft: '5px',
    },
});

export const RIGHT_SIDE_STYLE = css(SIDE_STYLE, {
    gridArea: '3 / 1 / 4 / 2',
    ['@media' + REACTIVE_SPLITTER_WIDTH_MEDIA_QUERY]: {
        gridArea: '1 / 3 / 2 / 4',
        paddingRight: '5px',
    },
});

export const MIDDLE_STYLE = css({
    height: '5px',
    margin: '10px 0',    
    gridArea: '2 / 1 / 3 / 2',
    userSelect: 'none',
    display: 'flex',
    flexDirection: 'column',
    ['@media' + REACTIVE_SPLITTER_WIDTH_MEDIA_QUERY]: {
        height: 'auto',
        width: '5px',
        margin: '0 5px',
        gridArea: '1 / 2 / 2 / 3',
        flexDirection: 'row',
    },
});

export const MIDDLE_DIVIDER_STYLE = css({
    height: '1px',
    margin: '2px 0',
    backgroundColor: 'var(--nc-theme-dividers)',
    ['@media' + REACTIVE_SPLITTER_WIDTH_MEDIA_QUERY]: {
        height: 'unset',
        margin: '0 2px',
        width: '1px',
    },
})

export const MIDDLE_RESIZABLE_STYLE = css(MIDDLE_STYLE, {
    cursor: 'ns-resize',
    ['@media' + REACTIVE_SPLITTER_WIDTH_MEDIA_QUERY]: {
        cursor: 'ew-resize',
    },
});
