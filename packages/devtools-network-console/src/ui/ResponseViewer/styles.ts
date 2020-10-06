// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from 'glamor';

export const NO_REQ_STYLE = css({
    display: 'flex',
    width: '100%',
    height: '100%',
    flexFlow: 'column nowrap',
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

export const LINK_NO_LEADING_STYLE = css({ paddingLeft: 0 });

export const VERTICALLY_CENTERED = css({
    display: 'flex',
    alignItems: 'center',
});
