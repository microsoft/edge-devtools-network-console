// Copyright (c) Microsoft Corporation
// Licensed under the MIT License

import * as React from 'react';
import { css } from 'glamor';

export interface IStackProps {
    center?: boolean;
    horizontal?: boolean;
    children?: React.ReactNode;
    style?: React.CSSProperties;
}

const BASE_STYLE = css({ 
    display: 'flex',
    flexFlow: 'column nowrap',
    
});

const CENTERED_STYLE = css(BASE_STYLE, {
    alignItems: 'center',
});

const HORIZONTAL_STYLE = css({
    flexDirection: 'row',
    width: '100%',
});

export default function Stack(props: IStackProps) {
    const baseStyle = props.center ? CENTERED_STYLE : BASE_STYLE;

    return (
        <div {...baseStyle} {...(props.horizontal ? HORIZONTAL_STYLE : {})} style={props.style || {}}>
            {props.children}
        </div>
    );
}
