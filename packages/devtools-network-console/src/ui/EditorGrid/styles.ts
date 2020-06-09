// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from 'glamor';

export const INTERIOR_BORDER_STYLE = css({
    width: '1px',
    backgroundColor: 'var(--nc-theme-dividers)',
});

export const GRID_TABLE_STYLE = css({
    width: '100%',
    padding: 0,
});

export const ENABLED_COLUMN_STYLE = css({
    width: '30px',
    textAlign: 'center',
});


export const GRID_HEADER_STYLE = css({
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '25px 1px var(--grid-key-column-width, 35fr) 1px var(--grid-value-column-width, 35fr) 1px var(--grid-description-column-width, 30fr) 30px',
    userSelect: 'none',
    fontWeight: '600',
    fontSize: '13px',
});

export const GRID_HEADER_CELL_STYLE = css({
    padding: '3px',
});

export const GRID_HEADER_DIVIDER_STYLE = css({
    backgroundColor: 'transparent',
    cursor: 'col-resize',
});

export const GRID_ROW_STYLE = css({
    display: 'grid',
    width: '100%',
    gridTemplateColumns: '25px 1px var(--grid-key-column-width, 35fr) 1px var(--grid-value-column-width, 35fr) 1px var(--grid-description-column-width, 30fr) 30px',
    fontSize: '12px',
});

export const GRID_TEXT_INPUT_STYLE = css({
    display: 'inline-flex',
    width: 'calc(100% - 4px)',
    height: '100%',
    borderColor: 'transparent',
});

const GRID_CELL_BASE_STYLE = css({
    border: '0px #ccc solid',
    padding: '2px',
});

const INTERIOR_GRID_CELL_STYLE = css(GRID_CELL_BASE_STYLE, {
    // borderRightWidth: '1px',
    borderTopWidth: '1px',
});

export const ENABLED_CELL_STYLE = css(INTERIOR_GRID_CELL_STYLE, {
    gridColumnStart: 1,
    gridColumnEnd: 3,
});

export const ENABLED_CHECK_STYLE = css({
    marginTop: '8px',
});

export const KEY_CELL_STYLE = css(INTERIOR_GRID_CELL_STYLE, {
    gridColumnStart: 3,
    gridColumnEnd: 5,
});

export const VALUE_CELL_STYLE = css(INTERIOR_GRID_CELL_STYLE, {
    gridColumnStart: 5,
    gridColumnEnd: 7,
});

const GRID_CELL_LAST_STYLE = css(GRID_CELL_BASE_STYLE, {
    borderTopWidth: '1px',
});

export const DESCRIPTION_CELL_STYLE = css(GRID_CELL_LAST_STYLE, {
    gridColumnStart: 7,
    gridColumnEnd: 8,
});

export const DELETE_CELL_STYLE = css(GRID_CELL_LAST_STYLE, {
    gridColumnStart: 8,
    gridColumnEnd: 9,
    paddingLeft: 0,
});

export const DELETE_BUTTON_STYLE = css({
    border: 'none',
    background: 'transparent',
    paddingLeft: 0,
    paddingRight: 0,
    marginLeft: '-1px',
});

export const PREVIEW_TEXT_STYLE = css({
    padding: '0 8px 3px',
    fontSize: '10px',
    wordBreak: 'break-all'
});
