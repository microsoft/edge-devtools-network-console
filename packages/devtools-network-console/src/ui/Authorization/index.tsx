// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { INetConsoleAuthorization, NetworkConsoleAuthorizationScheme } from 'network-console-shared';

import BasicAuthorization from './BasicAuthorization';
import BearerToken from './BearerToken';
import { makeSetAuthorizationSchemeAction } from 'actions/request/auth';
import { IEnvironmentAuthorizationState } from 'store';
import { Radio } from '@microsoft/fast-components-react-msft';
import { HideUnless } from 'ui/generic/HideIf';
import Stack from 'ui/generic/Stack';
import CommonStyles from '../common-styles';
import LocText from 'ui/LocText';
import LocalAlert from 'ui/generic/LocalAlert';

export interface IAuthorizationProps {
    requestId: string;
    authorization: INetConsoleAuthorization;
    environmentAuth?: IEnvironmentAuthorizationState;
}

export default function Authorization(props: IAuthorizationProps) {
    const token = props.authorization.token;
    const basic = props.authorization.basic;
    const env = props.environmentAuth;
    const dispatch = useDispatch();

    return (
        <>
            <div {...CommonStyles.RBL_HORIZONTAL}>
                <Radio
                    inputId="authInherit"
                    name="authType"
                    value="inherit"
                    checked={props.authorization.type === 'inherit'}
                    title="Inherit"
                    label={(cn) => <label {...CommonStyles.RBL_HORIZ_LABEL} htmlFor="authInherit" className={cn}>Inherit</label>}
                    onChange={() => dispatch(makeSetAuthorizationSchemeAction(props.requestId, 'inherit'))}
                    />
                <Radio
                    inputId="authNone"
                    name="authType"
                    value="none"
                    checked={props.authorization.type === 'none'}
                    title="None"
                    label={cn => <label {...CommonStyles.RBL_HORIZ_LABEL} htmlFor="authNone" className={cn}>None</label>}
                    onChange={() => dispatch(makeSetAuthorizationSchemeAction(props.requestId, 'none'))}
                    />
                <Radio
                    inputId="authToken"
                    name="authType"
                    value="token"
                    checked={props.authorization.type === 'token'}
                    title="Bearer token"
                    label={cn => <label {...CommonStyles.RBL_HORIZ_LABEL} htmlFor="authToken" className={cn}>Bearer token</label>}
                    onChange={() => dispatch(makeSetAuthorizationSchemeAction(props.requestId, 'token'))}
                    />
                <Radio
                    inputId="authBasic"
                    name="authType"
                    value="basic"
                    checked={props.authorization.type === 'basic'}
                    title="Basic"
                    label={(cn) => <label {...CommonStyles.RBL_HORIZ_LABEL} htmlFor="authBasic" className={cn}>Basic</label>}
                    onChange={() => dispatch(makeSetAuthorizationSchemeAction(props.requestId, 'basic'))}
                    />
            </div>
            <HideUnless test={props.authorization.type} match="inherit">
                <Stack>
                    <LocalAlert
                        type="info">
                        <Stack>
                            <div><LocText textKey="Authorization.inherit.label" /></div>
                            {env && env.values && (
                                <div>The nearest authorization being inherited from its parent specifies that it
                                    should be using <strong>{schemeToName(env.values.type)} </strong>
                                    to authorize. It is coming from the collection path
                                    <strong> {env.from.join('/')}</strong>.</div>
                            )}
                        </Stack>
                    </LocalAlert>
                </Stack>
            </HideUnless>
            <HideUnless test={props.authorization.type} match="none">
                <Stack>
                    <LocalAlert
                        type="info"
                        textKey="Authorization.none.label" />
                </Stack>
            </HideUnless>
            <HideUnless test={props.authorization.type} match="token">
                <BearerToken token={(token && token.token) || ''} requestId={props.requestId} />
            </HideUnless>
            <HideUnless test={props.authorization.type} match="basic">
                <BasicAuthorization username={(basic && basic.username) || ''} password={(basic && basic.password) || ''} showPassword={(basic && basic.showPassword) || false} requestId={props.requestId} />
            </HideUnless>
        </>
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
