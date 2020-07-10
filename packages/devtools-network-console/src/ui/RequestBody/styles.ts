// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from 'glamor';
import CommonStyles from '../common-styles';

export const HEIGHT_100 = css({
    height: '100%',
});

export const FLEX_VERTICAL = css(HEIGHT_100, {
    display: 'flex',
    flexFlow: 'column nowrap',
});

export const NOSELECT = css({
    userSelect: 'none',
});

export const NO_BODY_TEXT = css(NOSELECT, {
    color: 'var(--nc-theme-disabled-text)',
    fontStyle: 'italic',
    margin: '10px 15%',
});

export const BODY_CONTAINER_STYLE = css({
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
});

export const FLEX_HORIZONTAL = CommonStyles.FLEX_HORIZONTAL;
export const BODY_SELECT_RBLIST = CommonStyles.RBL_HORIZONTAL;
export const BODY_SELECT_LABEL = CommonStyles.RBL_HORIZ_LABEL;

export const GRID_CONTANER = css({
    paddingTop: '10px',
})