// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { connect, useDispatch } from 'react-redux';
import { Set } from 'immutable';

import RequestView from 'ui/RequestView';
import { IView } from 'store';
import { RequestsState } from 'reducers/request';
import { Stack, MessageBar, MessageBarType, Link } from 'office-ui-fabric-react';
import { loadDefaultRequest } from 'actions/common';

export interface IConnectedProps {
    requests: RequestsState;
    openViews: Set<string>;
    currentView: string | null;
}

export type IViewSelectProps = IConnectedProps;

export function ViewSelect(props: IViewSelectProps) {
    const dispatch = useDispatch();
    if (props.openViews.size === 0 || !props.currentView) {
        return (
            <Stack>
                <MessageBar
                    messageBarType={MessageBarType.info}
                >
                    Open or
                    <Link href="#create-request" aria-label="Create a request" onClick={e => {
                        e.preventDefault();
                        dispatch(loadDefaultRequest());
                    }}>Create a request</Link> to use Network Console. See the "Network Console Collections"
                    window in the bottom left corner of your Visual Studio Code's Explorer menu.
                </MessageBar>
            </Stack>
        );
    }

    const request = props.requests.get(props.currentView);
    if (!request) {
        throw new Error('Invariant failed: request not known from open view.');
    }

    return (
        <RequestView requestId={props.currentView} />
    );
}

function mapStateToProps(state: IView): IConnectedProps {
    return {
        requests: state.request,
        currentView: state.viewManager.currentView,
        openViews: state.viewManager.openViews,
    };
}
const ConnectedViewSelect = connect(mapStateToProps)(ViewSelect);
export default ConnectedViewSelect;
