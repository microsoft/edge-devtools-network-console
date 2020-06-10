// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from 'glamor';

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
    }),

    FULL_SIZE_NOT_SCROLLABLE: css({
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
    }),
};

export default CommonStyles;
