// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from 'glamor';

const FLEX_HORIZONTAL = css({
    display: 'flex',
    flexFlow: 'row nowrap',
});

const CommonStyles = {
    SCROLL_CONTAINER_STYLE: css({
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
    }),

    SCROLLABLE_STYLE: css({
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
    }),

    FULL_SIZE_NOT_SCROLLABLE: css({
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
    }),

    FLEX_HORIZONTAL,

    /**
     * RadioButtonList horizontal container
     */
    RBL_HORIZONTAL: css(FLEX_HORIZONTAL, {
        justifyContent: 'center',
        marginTop: '10px',
    }),

    /**
     * RadioButtonList horizontal label
     */
    RBL_HORIZ_LABEL: css({
        paddingRight: '15px',
        userSelect: 'none',
    }),
};

export default CommonStyles;
