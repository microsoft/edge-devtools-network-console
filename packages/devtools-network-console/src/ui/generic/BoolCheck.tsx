// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

export interface IBoolCheckProps {
    isChecked: boolean;
}

export default function BoolCheck(props: IBoolCheckProps) {
    if (props.isChecked) {
        return <span>✓</span>;
    }

    return <span />;
}
