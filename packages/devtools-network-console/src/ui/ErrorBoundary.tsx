// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { MessageBar, MessageBarType, Text } from 'office-ui-fabric-react';

interface IProps {
    children: any;
}

interface IState {
    hasError: false;
    errorMessage: string;
    errorStack: string;
    isExpanded: boolean;
}

export default class ErrorBoundary extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            hasError: false,
            errorMessage: '',
            errorStack: '',
            isExpanded: false,
        };
    }

    static getDerivedStateFromError(error: Error) {
        return {
            hasError: true,
            errorMessage: error.message,
            errorStack: error.stack,
            isExpanded: false,
        };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        window.parent.postMessage({
            type: 'FRONTEND_ERROR',
            errorStack: error.stack,
            errorInfo,
        }, '*');
    }

    render() {
        if (this.state.hasError) {
            return (
                <div>
                    <MessageBar messageBarType={MessageBarType.error} isMultiline>
                        <Text variant="xLarge">Something went wrong.</Text>
                        <p>{this.state.errorMessage}</p>
                        <p>You can close and re-open this tool to recover.</p>
                    </MessageBar>
                    <div style={{padding: '10px', overflow: 'auto'}}>
                        {this.state.isExpanded && (<pre>
                            {this.state.errorStack}
                        </pre>)}
                        {!this.state.isExpanded && (
                            <a href="#show-more" onClick={this._expand} style={{fontSize: '10px'}} aria-label="Expand the call stack to see error details">Error details</a>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }

    private _expand: (e: React.MouseEvent<HTMLAnchorElement>) => void = e => {
        this.setState({
            isExpanded: true,
        });
        e.preventDefault();
    };
}
