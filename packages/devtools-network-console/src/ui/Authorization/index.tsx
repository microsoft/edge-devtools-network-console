// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Pivot, PivotItem, Stack, MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { INetConsoleAuthorization, NetworkConsoleAuthorizationScheme } from 'network-console-shared';

import BasicAuthorization from './BasicAuthorization';
import BearerToken from './BearerToken';
import { makeSetAuthorizationSchemeAction } from 'actions/request/auth';
import { IEnvironmentAuthorizationState } from 'store';
import { THEME_OVERRIDE } from 'themes/vscode-theme';

export interface IAuthorizationProps {
    requestId: string;
    authorization: INetConsoleAuthorization;
    environmentAuth?: IEnvironmentAuthorizationState;
}

const TYPE_TO_INDEX = new Map<NetworkConsoleAuthorizationScheme, number>([
    ['inherit', 0],
    ['none', 1],
    ['token', 2],
    ['basic', 3],
]);
export default function Authorization(props: IAuthorizationProps) {
    const token = props.authorization.token;
    const basic = props.authorization.basic;
    let index = TYPE_TO_INDEX.get(props.authorization.type) || 0;
    const env = props.environmentAuth;
    const dispatch = useDispatch();

    return (
        <Pivot 
            initialSelectedIndex={index} 
            onLinkClick={(pivotItem) => {
                if (pivotItem) {
                    // TODO: Improve this hack
                    const key = ((pivotItem as any).key as string).substr(2) as NetworkConsoleAuthorizationScheme;
                    dispatch(makeSetAuthorizationSchemeAction(props.requestId, key));
                }
            }}
            styles={{
                root: THEME_OVERRIDE.smallPivotRoot,
                link: THEME_OVERRIDE.smallPivotButtons,
                linkIsSelected: THEME_OVERRIDE.smallPivotButtons,
            }}>
            <PivotItem headerText="Inherited" key="inherit">
                <Stack tokens={{ childrenGap: 'm', padding: 'm' }}>
                    <MessageBar
                        messageBarType={MessageBarType.info}
                        styles={{ root: { userSelect: 'none' }}}
                        >
                        <Stack>
                            <div>This request should use the authorization defined for its parent or its collection.</div>
                            {env && env.values && (
                                <div>The nearest authorization being inherited from its parent specifies that it
                                    should be using <strong>{schemeToName(env.values.type)} </strong>
                                    to authorize. It is coming from the collection path
                                    <strong> {env.from.join('/')}</strong>.</div>
                            )}
                        </Stack>

                    </MessageBar>
                </Stack>
            </PivotItem>
            <PivotItem headerText="None" key="none">
                <Stack tokens={{ childrenGap: 'm', padding: 'm' }}>
                    <MessageBar messageBarType={MessageBarType.info} styles={{ root: { userSelect: 'none' }}}>This request does not use authorization.</MessageBar>
                </Stack>
            </PivotItem>
            <PivotItem headerText="Bearer token" key="token">
                <BearerToken token={(token && token.token) || ''} requestId={props.requestId} />
            </PivotItem>
            <PivotItem headerText="Basic" key="basic">
                <BasicAuthorization username={(basic && basic.username) || ''} password={(basic && basic.password) || ''} showPassword={(basic && basic.showPassword) || false} requestId={props.requestId} />
            </PivotItem>
        </Pivot>
    );
}

const AUTH_SCHEME_NAME_MAP = new Map<NetworkConsoleAuthorizationScheme, string>([
    ['none', 'No authorization (anonymous)'],
    ['inherit', 'No authorization (anonymous)'],
    ['basic', 'Basic authorization'],
    ['token', 'Bearer Token']
]);
function schemeToName(scheme: NetworkConsoleAuthorizationScheme): string {
    return AUTH_SCHEME_NAME_MAP.get(scheme) || `an unknown authorization scheme ("${scheme}")`;
}