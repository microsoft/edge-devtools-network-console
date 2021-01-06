// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { connect, useDispatch } from 'react-redux';
import { Set } from 'immutable';
import { StealthButton } from '@microsoft/fast-components-react-msft';

import RequestView from 'ui/RequestView';
import { IView } from 'store';
import { RequestsState } from 'reducers/request';
import Stack from 'ui/generic/Stack';
import { loadDefaultRequest } from 'actions/common';
import LocText from 'ui/LocText';
import { AppHost } from 'store/host';

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
            <Stack center style={{ paddingTop: '40px' }}>
                <StealthButton
                    onClick={e => {
                        dispatch(loadDefaultRequest());
                    }}
                >
                    <LocText textKey='ViewSelect.create' />
                </StealthButton>
                <StealthButton
                    onClick={_e => {
                        // TODO: Send message to host to prompt for importing a collection
                        console.log('TODO: Implement');
                    }}
                    >
                    <LocText textKey="ViewSelect.import" />
                </StealthButton>
                <StealthButton
                    onClick={() => {
                        AppHost.openLink && AppHost.openLink('https://www.github.com/microsoft/edge-devtools-network-console');
                    }}
                    >
                    <LocText textKey="ViewSelect.learnMore" />
                </StealthButton>
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
