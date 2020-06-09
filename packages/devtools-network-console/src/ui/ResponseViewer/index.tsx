// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { connect } from 'react-redux';
import { Pivot, PivotItem, DetailsList, IColumn, ProgressIndicator, SelectionMode, PivotLinkSize } from '@fluentui/react';

import CanonicalHeaderName from '../CanonicalHeaderName';
import { INetConsoleResponseInternal } from 'model/NetConsoleRequest';
import * as Styles from './styles';
import CommonStyles from 'ui/common-styles';
import CookiesTable from './CookiesTable';
import { IView } from 'store';
import preview from './preview';
import Stats from './Stats';
import { THEME_TYPE, THEME_OVERRIDE } from 'themes/vscode-theme';
import { AppHost } from 'store/host';
import ResponseBody from './ResponseBody';
import ContainerWithStatusBar from 'ui/generic/ContainerWithStatusBar';

interface IConnectedProps {
    response: INetConsoleResponseInternal;
    theme: THEME_TYPE;
}
export interface IOwnProps {
    requestId: string;
}
export type IResponseViewerProps = IConnectedProps & IOwnProps;

const HEADERS_COLUMNS: IColumn[] = [
    {
        key: "key",
        name: "Name",
        fieldName: "key",
        isSorted: false,
        minWidth: 50,
        maxWidth: 150,
        onRender: (item, _index, _column) => {
            return (
                <CanonicalHeaderName header={item.key} />
            );
        },
    },
    {
        key: "value",
        name: "Value",
        fieldName: "value",
        isSorted: false,
        minWidth: 50
    },
];

export function ResponseViewer(props: IResponseViewerProps) {
    let languageChoice = 'text';
    let contentType = '';
    if (props.response.status === 'COMPLETE' && props.response.response) {
        const contentTypeHeader = props.response.response.headers.find(h => h.key === 'content-type');
        if (contentTypeHeader) {
            contentType = contentTypeHeader.value;

            switch (contentTypeHeader.value) {
                case 'application/json':
                case 'application/json; charset=utf-8':
                case 'text/json':
                case 'text/x-json':
                    languageChoice = 'json';
                    break;
                case 'text/javascript':
                case 'application/javascript':
                case 'application/x-javascript':
                    languageChoice = 'javascript';
                    break;
                case 'text/typescript':
                case 'application/typescript':
                    languageChoice = 'typescript';
                    break;
                case 'text/plain':
                    break;
                default:
                    if (contentTypeHeader.value.indexOf('/json') > -1) {
                        languageChoice = 'json';
                    }
                    else if (contentTypeHeader.value.indexOf('html') > -1) {
                        languageChoice = 'html';
                    }
                    else if (contentTypeHeader.value.indexOf('/javascript') > -1) {
                        languageChoice = 'javascript';
                    }
                    else if (contentTypeHeader.value.indexOf('/typescript') > -1) {
                        languageChoice = 'typescript';
                    }
                    break;
            }
        }
    }

    if (props.response.status === 'PENDING') {
        return <Pending />;
    }
    else if (props.response.status === 'ERROR_BELOW_APPLICATION_LAYER') {
        return <ErrorBelowApplication />;
    }
    else if (props.response.status === 'NOT_SENT' || !props.response.response) {
        return <NotIssued />;
    }

    const renderedPreview = preview(props.response.response.body.content, contentType, props.theme);

    return (
        <ContainerWithStatusBar>
            <div className="response-tabs" {...Styles.HEIGHT_100}>
                <Pivot
                    {...Styles.RESPONSE_PIVOT_STYLE}
                    className={renderedPreview && renderedPreview.parentClassName}
                    styles={{
                        root: THEME_OVERRIDE.mainPivotRoot,
                        link: THEME_OVERRIDE.mainPivotButtons,
                        linkIsSelected: THEME_OVERRIDE.mainPivotButtons,
                    }}
                    linkSize={PivotLinkSize.large}
                    >
                    {renderedPreview && <PivotItem headerText={renderedPreview.title} className={renderedPreview.className}>
                        {renderedPreview.child}
                    </PivotItem>}
                    <PivotItem headerText="Body" className="editor-container">
                        <ResponseBody
                            languageChoice={languageChoice}
                            requestId={props.requestId}
                            theme={props.theme}
                            serializedBody={props.response.response.body}
                            size={props.response.response.size}
                            />
                    </PivotItem>
                    <PivotItem headerText="Headers" {...CommonStyles.SCROLL_CONTAINER_STYLE}>
                        <div {...CommonStyles.SCROLLABLE_STYLE}>
                            <DetailsList
                                items={props.response.response.headers}
                                columns={HEADERS_COLUMNS}
                                selectionMode={SelectionMode.none}
                                compact={true}
                                styles={{
                                    contentWrapper: {
                                        padding: '4px 0 4px 6px',
                                    }
                                }}
                                />
                        </div>
                    </PivotItem>
                    <PivotItem headerText="Cookies" {...CommonStyles.SCROLL_CONTAINER_STYLE}>
                        <div {...CommonStyles.SCROLLABLE_STYLE}>
                            <CookiesTable headers={props.response.response.headers} />
                        </div>
                    </PivotItem>
                </Pivot>
            </div>

            <Stats
                duration={props.response.duration}
                size={props.response.response.size}
                statusCode={props.response.response.statusCode}
                statusText={props.response.response.statusText}
                requestId={props.requestId}
                />
        </ContainerWithStatusBar>
    );
}

function NotIssued() {
    return (
        <div {...Styles.NO_REQ_STYLE}>
            Press 'Send' to issue the request.
        </div>
    );
}

function Pending() {
    return (
        <div {...Styles.NO_REQ_STYLE} style={{display: 'flex', flexFlow: 'column nowrap', alignItems: 'stretch', margin: '20px'}}>
            <div>
                Please wait for the request to complete...
            </div>
            <div>
                <ProgressIndicator />
            </div>
        </div>
    );
}

function ErrorBelowApplication() {
    return (
        <div {...Styles.NO_REQ_STYLE} style={{display: 'flex', flexFlow: 'column nowrap', alignItems: 'stretch', margin: '20px'}}>
            <h2>Error issuing this request.</h2>
            <p>An error occurred beneath HTTP, such as a DNS error, a physical network error, or something similar.</p>
        </div>
    );
}

function mapStateToProps(state: IView, ownProps: IOwnProps): IConnectedProps {
    const response = state.response.get(ownProps.requestId);
    if (!response) {
        AppHost.log({
            message: 'Invariant failure, no response for ID',
            where: 'ResponseViewer:mapStateToProps',
            state,
            ownProps,
            response,
        });
        throw new Error('Invariant failed: Response not found for given request ID');
    }

    return {
        response: response,
        theme: state.theme,
    };
}

export const ConnectedResponseViewer = connect(mapStateToProps)(ResponseViewer);
export default ConnectedResponseViewer;
