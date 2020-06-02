// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from 'glamor';

export const NO_REQ_STYLE = css({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'var(--nc-theme-disabled-text)',
    userSelect: 'none',
});

export const HEIGHT_100 = css({
    height: '100%',
});

export const RESPONSE_PIVOT_STYLE = css(HEIGHT_100, {
    display: 'flex',
    flexFlow: 'column nowrap',
});
