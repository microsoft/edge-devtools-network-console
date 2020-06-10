// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

export default function Size({ size }: { size: number }) {
    const KB = 1024;
    const MB = 1048576;
    const GB = MB * 1024;

    const fmt = new Intl.NumberFormat();


    if (size > GB) {
        return (
            <span title={fmt.format(size) + ' bytes'}>{Math.round(size * 1000 / GB) / 1000.0} GiB</span>
        );
    }
    else if (size > MB) {
        return (
            <span title={fmt.format(size) + ' bytes'}>{Math.round(size * 100 / MB) / 100.0} MiB</span>
        );
    }
    else if (size > KB) {
        return (
            <span title={fmt.format(size) + ' bytes'}>{Math.round(size * 100 / KB) / 100.0} KiB</span>
        );
    }

    return <span title={`${size} bytes`}>{size} bytes</span>;
}
