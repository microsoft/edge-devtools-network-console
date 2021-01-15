// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { ConnectedRequestEditor } from '../RequestEditor';
import { ResizableSplitter } from '../generic/ResponsiveSplitter';
import ResponseViewer from '../ResponseViewer';

export interface IOwnProps {
    requestId: string;
}

export type IRequestViewProps = IOwnProps;

export default function RequestView(props: IRequestViewProps) {
    return (
        <ResizableSplitter
            secondPaneProps={{
                'aria-live': 'polite',
            }}
            >
            <ConnectedRequestEditor requestId={props.requestId} />
            <ResponseViewer requestId={props.requestId} />
        </ResizableSplitter>
    );
}
