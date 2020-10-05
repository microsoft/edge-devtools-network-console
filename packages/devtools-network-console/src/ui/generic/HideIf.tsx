// Copyright (c) Microsoft Corporation
// Licensed under the MIT License

import React from 'react';

interface IHideIfProps<T> extends React.HTMLProps<HTMLDivElement> {
    test: T;
    match: T;
}

export default function HideIf<T>(props: IHideIfProps<T>) {
    const { test, match } = props;
    const style = props.style || { };

    if (test === match) {
        style.display = 'none';
    }

    return (
        <div {...props} style={style}>
            {props.children}
        </div>
    );
}

export function HideUnless<T>(props: IHideIfProps<T>) {
    const { test, match } = props;
    const style = props.style || { };

    if (test !== match) {
        style.display = 'none';
    }

    return (
        <div {...props} style={style}>
            {props.children}
        </div>
    );
}
