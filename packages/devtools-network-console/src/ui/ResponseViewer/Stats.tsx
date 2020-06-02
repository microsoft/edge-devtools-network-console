// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { ms } from 'network-console-shared';

import Size from 'ui/generic/Size';

export interface IStatsProps {
    statusCode: number;
    statusText: string;
    duration: ms;
    size: number;
}

export default function Stats(props: IStatsProps) {
    return (
        <div>
            <dl className="response-stats">
                <dt>Status:</dt>
                <dd>{props.statusCode} {props.statusText}</dd>

                <dt>Time:</dt>
                <dd>{props.duration}ms</dd>

                <dt>Size:</dt>
                <dd><Size size={props.size} /></dd>
            </dl>
        </div>
    );
}
