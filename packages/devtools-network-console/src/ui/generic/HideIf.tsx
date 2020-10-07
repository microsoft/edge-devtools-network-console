// Copyright (c) Microsoft Corporation
// Licensed under the MIT License

import React from 'react';
import { omit } from 'lodash-es';

interface IHideIfProps<T> extends React.HTMLProps<HTMLDivElement> {
    test: T;
    match: T;
}

export default function HideIf<T>(props: IHideIfProps<T>) {
    const { test, match } = props;
    const style = props.style || { };
    const divProps = React.useMemo(() => omit(props, 'test', 'match'), [props]);

    if (test === match) {
        style.display = 'none';
    }

    return (
        <div {...divProps} style={style}>
            {props.children}
        </div>
    );
}

export function HideUnless<T>(props: IHideIfProps<T>) {
    const { test, match } = props;
    const style = props.style || { };
    const divProps = React.useMemo(() => omit(props, 'test', 'match'), [props]);

    if (test !== match) {
        style.display = 'none';
    }

    return (
        <div {...divProps} style={style}>
            {props.children}
        </div>
    );
}
