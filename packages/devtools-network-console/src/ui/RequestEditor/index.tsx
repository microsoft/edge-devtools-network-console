// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { INetConsoleParameter } from 'network-console-shared';
import { Pivot } from '@microsoft/fast-components-react-msft';
import { TextField } from '@fluentui/react';
import { Map } from 'immutable';
import { connect, useDispatch } from 'react-redux';
import { StyleAttribute, css } from 'glamor';

import CommonStyles from 'ui/common-styles';
import AddressBar from '../AddressBar';
import Authorization from '../Authorization';
import CalculatedAddress from '../CalculatedAddress';
import EditorGrid from '../EditorGrid';
import { INetConsoleRequestInternal } from 'model/NetConsoleRequest';
import { IView, IEnvironmentAuthorizationState, IActiveEnvironmentState } from 'store';
import { setNameAction } from 'actions/request/basics';
import { editRouteAction } from 'actions/request/route';
import { removeQueryAction, editQueryAction, addQueryAction } from 'actions/request/query';
import { removeHeaderAction, addHeaderAction, editHeaderAction } from 'actions/request/headers';
import RequestBody from '../RequestBody';
import CorsConfiguration from './CorsConfiguration';
import { ID_DIV_QUERY, ID_DIV_HEADER, ID_DIV_ROUTE } from 'reducers/request/id-manager';
import ContainerWithStatusBar from 'ui/generic/ContainerWithStatusBar';
import { HideUnless } from 'ui/generic/HideIf';
import { DesignSystemProvider } from '@microsoft/fast-jss-manager-react';

interface IOwnProps {
    requestId: string;
}

interface IConnectedProps {
    canSave: boolean;
    canEditCORS: boolean;
    isRequestDirty: boolean;

    request: INetConsoleRequestInternal;

    routeParameters: Map<string, INetConsoleParameter>;
    headers: Map<string, INetConsoleParameter>;
    queryParameters: Map<string, INetConsoleParameter>;
    environmentAuth?: IEnvironmentAuthorizationState;

    options: {
        showDescriptionFields: boolean;
    };

    environment: IActiveEnvironmentState;
}

export type IRequestEditorProps = IOwnProps & IConnectedProps;

type ActivityState = 'query' | 'cookies' | 'auth' | 'body' | 'route' | 'fetch';
const PIVOT_DEFAULT_ITEMS = [{
    tab: (cn: string) => <div className={cn}>Query</div>,
    content: () => <></>,
    id: 'query',
}, {
    tab: (cn: string) => <div className={cn}>Headers</div>,
    content: () => <></>,
    id: 'headers',
}, {
    tab: (cn: string) => <div className={cn}>Auth</div>,
    content: () => <></>,
    id: 'auth',
}, {
    tab: (cn: string) => <div className={cn}>Body</div>,
    content: () => <></>,
    id: 'body',
}];
const PIVOT_ROUTE_ITEM = {
    tab: (cn: string) => <div className={cn}>Route</div>,
    content: () => <></>,
    id: 'route',
};
const PIVOT_CORS_ITEM = {
    tab: (cn: string) => <div className={cn}>Fetch</div>,
    content: () => <></>,
    id: 'fetch',
};

export default function RequestEditor(props: IRequestEditorProps) {
    const dispatch = useDispatch();
    const [currentTab, setCurrentTab] = React.useState<ActivityState>(props.request.routeParameters.count() > 0 ? 'route' : 'query');

    let bodyPivotStyle: StyleAttribute;
    let bodyStyle: StyleAttribute;
    if (props.request.bodyComponents.bodySelection === 'none') {
        bodyPivotStyle = bodyStyle = css({});
    }
    else if (props.request.bodyComponents.bodySelection === 'raw') {
        bodyPivotStyle = CommonStyles.SCROLL_CONTAINER_STYLE;
        bodyStyle = CommonStyles.FULL_SIZE_NOT_SCROLLABLE;
    }
    else {
        bodyPivotStyle = CommonStyles.SCROLL_CONTAINER_STYLE;
        bodyStyle = CommonStyles.SCROLLABLE_STYLE;
    }

    const pivotTabs = PIVOT_DEFAULT_ITEMS.slice();
    if (props.routeParameters.count() > 0) {
        pivotTabs.unshift(PIVOT_ROUTE_ITEM);
    }
    if (props.canEditCORS) {
        pivotTabs.push(PIVOT_CORS_ITEM);
    }
    return (
        <ContainerWithStatusBar>
            <div className="ht100 flxcol">
                <div>
                    <TextField
                        onChange={e => dispatch(setNameAction(props.requestId, (e.target as HTMLInputElement).value))}
                        styles={{
                            fieldGroup: {
                                borderColor: 'transparent',
                            },
                            field: {
                                fontSize: '16px',
                            },
                        }}
                        className="request-title-editor"
                        value={props.request.name}
                        placeholder={`${props.request.verb} ${props.request.url}`}
                        autoFocus={true}
                        ariaLabel="Specify a name for this request"
                        />
                </div>
                <div>
                    <AddressBar
                        isRequestDirty={props.isRequestDirty}
                        canSave={props.canSave}
                        url={props.request.url}
                        verb={props.request.verb}
                        requestId={props.requestId}
                        />
                </div>
                <div className="ht100 flxcol">
                    <DesignSystemProvider designSystem={{ density: 2}}>
                        <Pivot
                            activeId={currentTab}
                            label="Choose views of the request"
                            onUpdate={activeTab => setCurrentTab(activeTab as ActivityState)}
                            items={pivotTabs} />
                    </DesignSystemProvider>
                    <div style={{flexGrow: 1}}>
                        {(props.routeParameters.count() > 0 &&
                        (<HideUnless test={currentTab} match="route">
                            <EditorGrid
                                canHaveFiles={false}
                                isDeleteAllowed={false}
                                deleteRow={undefined}
                                idStart={props.requestId + ID_DIV_ROUTE}
                                rows={props.routeParameters}
                                isNameFieldReadonly={true}
                                hideDescriptionField={!props.options.showDescriptionFields}
                                hideAddRow={true}
                                updateRow={(_isNewRow, id, _key, value, description, enabled) => {
                                    dispatch(editRouteAction(props.requestId, id, value, description, enabled));
                                }}
                                previewEnvironmentMerge={true}
                                environmentVariables={props.environment.variables}
                                />
                        </HideUnless>)
                        )}
                        <HideUnless test={currentTab} match="query" {...CommonStyles.SCROLL_CONTAINER_STYLE}>
                            <div {...CommonStyles.SCROLLABLE_STYLE}>
                                <EditorGrid
                                    canHaveFiles={false}
                                    isDeleteAllowed={true}
                                    deleteRow={id => {
                                        dispatch(removeQueryAction(props.requestId, id));
                                    }}
                                    idStart={props.requestId + ID_DIV_QUERY}
                                    isNameFieldReadonly={false}
                                    hideDescriptionField={!props.options.showDescriptionFields}
                                    rows={props.queryParameters}
                                    updateRow={(isNewRow, id, key, value, description, enabled) => {
                                        if (isNewRow) {
                                            dispatch(addQueryAction(props.requestId, id, key, value, description, enabled));
                                        }
                                        else {
                                            dispatch(editQueryAction(props.requestId, id, key, value, description, enabled));
                                        }
                                    }}
                                    previewEnvironmentMerge={true}
                                    environmentVariables={props.environment.variables}
                                    />
                            </div>
                        </HideUnless>
                        <HideUnless test={currentTab} match="headers" {...CommonStyles.SCROLL_CONTAINER_STYLE}>
                            <div {...CommonStyles.SCROLLABLE_STYLE}>
                                <EditorGrid
                                    canHaveFiles={false}
                                    isDeleteAllowed={true}
                                    deleteRow={id => {
                                        dispatch(removeHeaderAction(props.requestId, id));
                                    }}
                                    idStart={props.requestId + ID_DIV_HEADER}
                                    isNameFieldReadonly={false}
                                    hideDescriptionField={!props.options.showDescriptionFields}
                                    rows={props.headers}
                                    updateRow={(isNewRow, id, key, value, description, enabled) => {
                                        if (isNewRow) {
                                            dispatch(addHeaderAction(props.requestId, id, key, value, description, enabled));
                                        }
                                        else {
                                            dispatch(editHeaderAction(props.requestId, id, key, value, description, enabled));
                                        }
                                    }}
                                    previewEnvironmentMerge={true}
                                    environmentVariables={props.environment.variables}
                                    />
                            </div>
                        </HideUnless>
                        <HideUnless test={currentTab} match="auth" {...CommonStyles.SCROLL_CONTAINER_STYLE}>
                            <div {...CommonStyles.SCROLLABLE_STYLE}>
                                <Authorization authorization={props.request.authorization} requestId={props.requestId} environmentAuth={props.environmentAuth} />
                            </div>
                        </HideUnless>
                        <HideUnless test={currentTab} match="body" {...bodyPivotStyle}>
                            <div {...bodyStyle}>
                                <RequestBody requestId={props.requestId} />
                            </div>
                        </HideUnless>
                        {props.canEditCORS && (
                        <HideUnless test={currentTab} match="fetch" {...CommonStyles.SCROLL_CONTAINER_STYLE}>
                            <CorsConfiguration
                                requestId={props.requestId}
                                selectedCorsMode={props.request.fetchParams?.corsMode || 'cors'}
                                selectedCacheMode={props.request.fetchParams?.cacheMode || 'no-store'}
                                selectedCredentialsMode={props.request.fetchParams?.credentialsMode || 'same-origin'}
                                selectedRedirectMode={props.request.fetchParams?.redirectMode || 'follow'}
                                />
                        </HideUnless>)}
                    </div>
                </div>
            </div>

            <CalculatedAddress request={props.request} environmentVariables={props.environment.variables} />
        </ContainerWithStatusBar>
    );
}

function mapStateToProps(state: IView, ownProps: IOwnProps): IConnectedProps {
    const request = state.request.get(ownProps.requestId);
    if (!request) {
        throw new RangeError('Invalid requestId');
    }

    return {
        canSave: state.hostCapabilities.canSave,
        canEditCORS: state.hostCapabilities.canEditCORS,
        isRequestDirty: request.isDirty,

        headers: request.current.headers,
        queryParameters: request.current.queryParameters,
        routeParameters: request.current.routeParameters,
        request: request.current,
        environmentAuth: state.environment.authorization.get(ownProps.requestId),

        options: {
            showDescriptionFields: state.hostCapabilities.shouldShowDescription,
        },

        environment: state.environment.environment,
    };
}

export const ConnectedRequestEditor = connect(mapStateToProps)(RequestEditor);
