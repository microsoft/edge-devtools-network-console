// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

type BoolFactory = () => boolean;
export interface IConditionalProps {
    showIf: boolean | BoolFactory;
    children?: any;
}

export default function Conditional(props: IConditionalProps) {
    let shouldShow = false;
    if (typeof props.showIf === 'function') {
        shouldShow = props.showIf();
    }
    else {
        shouldShow = props.showIf;
    }

    if (shouldShow) {
        return props.children;
    }
}
