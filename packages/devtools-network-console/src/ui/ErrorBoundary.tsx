// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { MessageBar, MessageBarType, Text, Link } from '@fluentui/react';
import { AppHost } from 'store/host';
import LocText from './LocText';
import { i18n } from 'network-console-shared';

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
        AppHost.log({
            kind: 'FRONTEND_ERROR',
            errorStack: error.stack,
            errorInfo,
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div>
                    <MessageBar messageBarType={MessageBarType.error} isMultiline>
                        <Text variant="xLarge"><LocText textKey="ErrorBoundary.title" /></Text>
                        <p>{this.state.errorMessage}</p>
                        <p><LocText textKey="ErrorBoundary.reopen" /></p>
                    </MessageBar>
                    <div style={{padding: '10px', overflow: 'auto'}}>
                        {this.state.isExpanded && (<pre>
                            {this.state.errorStack}
                        </pre>)}
                        {!this.state.isExpanded && (
                            <Link href="#show-more" onClick={this._expand} style={{fontSize: '10px'}} aria-label={i18n.getMessage('ErrorBoundary.showMoreAriaLabel', '')}>
                                <LocText textKey="ErrorBoundary.showMoreLabel" />
                            </Link>
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
