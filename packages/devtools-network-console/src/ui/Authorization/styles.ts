// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from 'glamor';

export const AUTHORIZATION_LABEL_CONTAINER_STYLE = css({
    flexGrow: 0,
    flexShrink: 0,
    width: '75px',
    padding: '15px 0 0 10px', 
    fontWeight: 'bold',
});

export const AUTHORIZATION_TEXT_FIELD_STYLE = css({
    width: '96%',
    margin: '1% 0% 1% 3.5%',
});

export const LABELED_AREA = css({
    flexGrow: 1,
});

export const BASIC_AUTH_SHOW_PASSWORD_CHECKBOX_AREA = css(LABELED_AREA, {
    margin: '10px',
});

export const BEARER_TOKEN_TEXT_AREA = css(AUTHORIZATION_TEXT_FIELD_STYLE, {
    minHeight: '85px',
    fontFamily: 'Consolas, monospace',
});

export const INHERITED_TERM = css({
    display: 'inline',
    fontWeight: 'bold',
    '::after': {
        content: '": "',
    },
});

export const INHERITED_DEFINITION = css({
    display: 'inline',
    marginInlineStart: 0,
    '::after': {
        content: '"\\A"',
        whiteSpace: 'pre',
    },
});

export const INHERITED_INFORMATION = css({
    fontSize: '12px',
    marginInlineStart: '40px',
    marginBlockStart: '0.5em',
    marginBlockEnd: '0.5em',
});
