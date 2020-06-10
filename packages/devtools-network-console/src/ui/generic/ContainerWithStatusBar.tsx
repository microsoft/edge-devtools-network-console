// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { css } from 'glamor';

interface IContainerWithStatusBarProps {
    children: React.ReactNode[];
}

const PARENT_STYLE = css({
    display: 'flex',
    flexFlow: 'column nowrap',
    height: '100%',
    width: '100%',
    alignItems: 'stretch',
});

const MAIN_CONTENT_STYLE = css({
    order: 1,
    flexGrow: 1,
    flexShrink: 1,
    overflow: 'hidden',
});
const STATUS_BAR_STYLE = css({
    order: 2,
    flexGrow: 0,
    flexShrink: 0,
    margin: '4px 8px 8px',
});

export default function ContainerWithStatusBar(props: IContainerWithStatusBarProps) {
    return (
        <div {...PARENT_STYLE}>
            <div {...MAIN_CONTENT_STYLE}>
                {props.children[0]}
            </div>
            <div {...STATUS_BAR_STYLE}>
                {props.children[1]}
            </div>
        </div>
    );
}
