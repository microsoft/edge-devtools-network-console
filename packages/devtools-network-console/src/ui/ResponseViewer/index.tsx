// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { connect } from 'react-redux';
import { ProgressIndicator } from '@fluentui/react';
import { DataGrid, DataGridColumn, DataGridCellRenderConfig, Pivot } from '@microsoft/fast-components-react-msft';

import CanonicalHeaderName from '../CanonicalHeaderName';
import { INetConsoleResponseInternal } from 'model/NetConsoleRequest';
import * as Styles from './styles';
import CommonStyles from 'ui/common-styles';
import CookiesTable from './CookiesTable';
import { IView } from 'store';
import preview from './preview';
import Stats from './Stats';
import { THEME_TYPE } from 'themes/vscode-theme';
import { AppHost } from 'store/host';
import ResponseBody from './ResponseBody';
import ContainerWithStatusBar from 'ui/generic/ContainerWithStatusBar';
import { HideUnless } from 'ui/generic/HideIf';
import { DesignSystemProvider } from '@microsoft/fast-jss-manager-react';
import WebSocketView from './WebSocket';

interface IConnectedProps {
    response: INetConsoleResponseInternal;
    showWSView: boolean;
    theme: THEME_TYPE;
}
export interface IOwnProps {
    requestId: string;
}
export type IResponseViewerProps = IConnectedProps & IOwnProps;

const headersColumns: DataGridColumn[] = [
    {
        columnDataKey: 'key',
        title: 'Name',
        columnWidth: '20%',
        cell: (config: DataGridCellRenderConfig) => {
            return (
                <div className={config.classNames}>
                    <CanonicalHeaderName header={(config.rowData as any)[config.columnDataKey]} />
                </div>
            );
        },
    },
    {
        columnDataKey: 'value',
        title: 'Value',
        columnWidth: '75%',
    },
];

type ActivityState = 'preview' | 'body' | 'headers' | 'cookies' | 'websocket';
const PIVOT_DEFAULT_ITEMS = [{
    tab: (cn: string) => <div className={cn}>Body</div>,
    content: () => <></>,
    id: 'body',
}, {
    tab: (cn: string) => <div className={cn}>Headers</div>,
    content: () => <></>,
    id: 'headers',
}, {
    tab: (cn: string) => <div className={cn}>Cookies</div>,
    content: () => <></>,
    id: 'cookies',
}];
const PIVOT_PREVIEW_ITEM = {
    tab: (cn: string) => <div className={cn}>Preview</div>,
    content: () => <></>,
    id: 'preview',
};
const WEBSOCKET_ITEM = {
    tab: (cn: string) => <div className={cn}>WebSocket</div>,
    content: () => <></>,
    id: 'websocket',
};

export function ResponseViewer(props: IResponseViewerProps) {
    // TODO: Promote to per-request state in the Store
    const [currentTab, setCurrentTab] = React.useState<ActivityState>('body');
    const headerData = React.useMemo(() => {
        if (props.response.status === 'COMPLETE' && props.response.response) {
            return props.response.response.headers.map((h, index) => {
                const rowKey = `r${props.requestId}h${index}`;
                return {
                    ...h,
                    rowKey,
                };
            });
        }
        return [];
    }, [props.requestId, props.response.status, props.response.response]);
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
                    else if (contentTypeHeader.value.indexOf('/javascript') > -1 || contentTypeHeader.value.indexOf('/x-javascript') > -1) {
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
    const tabsToDisplay = PIVOT_DEFAULT_ITEMS.slice();
    if (!!renderedPreview) {
        tabsToDisplay.unshift(PIVOT_PREVIEW_ITEM);
    } else if(currentTab === 'preview') {
        // TODO: determine if necessary
        // (this fixes bad webhost state if you send a different request that does not have a preview)
        setCurrentTab('body');
    }

    if (props.showWSView) {
        // TODO: determine if we can default to the WS tab the first time we connect to a WS
        tabsToDisplay.push(WEBSOCKET_ITEM);
    } else if (currentTab === 'websocket') {
        // TODO: determine if necessary
        // (this fixes bad webhost state if you send a different request that does not have a websocket)
        setCurrentTab('body');
    }

    return (
        <ContainerWithStatusBar>
            <div className="response-tabs" {...Styles.HEIGHT_100}>
                <DesignSystemProvider designSystem={{ density: 2 }}>
                <Pivot
                    activeId={currentTab}
                    items={tabsToDisplay}
                    label="Choose views of the response data"
                    onUpdate={activeTab => setCurrentTab(activeTab as ActivityState)}
                    />
                </DesignSystemProvider>
                {!!renderedPreview && (
                <HideUnless test={currentTab} match="preview" className={renderedPreview.className}>
                    {renderedPreview.child}
                </HideUnless>
                )}
                <HideUnless test={currentTab} match="body" className="editor-container">
                    <ResponseBody
                        languageChoice={languageChoice}
                        requestId={props.requestId}
                        theme={props.theme}
                        serializedBody={props.response.response.body}
                        size={props.response.response.size}
                        />
                </HideUnless>
                <HideUnless test={currentTab} match="headers" {...CommonStyles.SCROLL_CONTAINER_STYLE}>
                    <div {...CommonStyles.SCROLLABLE_STYLE}>
                        <DataGrid
                            rows={headerData}
                            columns={headersColumns}
                            dataRowKey="rowKey"
                            virtualize={false}
                            />
                    </div>
                </HideUnless>
                <HideUnless test={currentTab} match="cookies" {...CommonStyles.SCROLL_CONTAINER_STYLE}>
                    <div {...CommonStyles.SCROLLABLE_STYLE}>
                        <CookiesTable headers={props.response.response.headers} />
                    </div>
                </HideUnless>
                <HideUnless test={currentTab} match="websocket" {...CommonStyles.SCROLL_CONTAINER_STYLE}>
                    <WebSocketView requestId={props.requestId} theme={props.theme}/>
                </HideUnless>
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
    const wsState = state.websocket.get(ownProps.requestId);
    // Show the Websocket view if there are message associated with this request, even if disconnected.
    // This allows users to see previous messages and the disconnect status.
    const showWSView = wsState ? wsState.messages.size > 0 : false
    return {
        response: response,
        theme: state.theme.theme,
        showWSView,
    };
}

export const ConnectedResponseViewer = connect(mapStateToProps)(ResponseViewer);
export default ConnectedResponseViewer;
