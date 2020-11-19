// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { Hypertext, Typography, TypographySize } from '@microsoft/fast-components-react-msft';

import { AppHost } from 'store/host';
import LocText from './LocText';
import { getText, ILocalized, LocalizationConsumer } from 'utility/loc-context';
import LocalAlert from './generic/LocalAlert';

interface IProps {
    children: any;
}

interface IState {
    hasError: false;
    errorMessage: string;
    errorStack: string;
    isExpanded: boolean;
}

class ErrorBoundary extends React.Component<IProps & ILocalized, IState> {
    constructor(props: IProps & ILocalized) {
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
                    <LocalAlert
                        type="error">
                        <Typography size={TypographySize._2}>
                            <LocText textKey="ErrorBoundary.title" />
                        </Typography>
                        <p>{this.state.errorMessage}</p>
                        <p><LocText textKey="ErrorBoundary.reopen" /></p>
                    </LocalAlert>
                    <div style={{padding: '10px', overflow: 'auto'}}>
                        {this.state.isExpanded && (<pre>
                            {this.state.errorStack}
                        </pre>)}
                        {!this.state.isExpanded && (
                            <Hypertext href="#show-more" onClick={this._expand} style={{fontSize: '10px'}} aria-label={getText('ErrorBoundary.showMoreAriaLabel', this.props)}>
                                <LocText textKey="ErrorBoundary.showMoreLabel" />
                            </Hypertext>
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

export default function LocalizedErrorBoundary(props: IProps) {
    return (
        <LocalizationConsumer>
            {locale => <ErrorBoundary locale={locale} {...props} />}
        </LocalizationConsumer>
    );
}
