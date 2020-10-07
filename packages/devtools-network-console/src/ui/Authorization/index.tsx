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
import { getText, LocalizationContext } from 'utility/loc-context';

export interface IAuthorizationProps {
    controlIdPrefix: string;
    requestId: string;
    authorization: INetConsoleAuthorization;
    environmentAuth?: IEnvironmentAuthorizationState;
}

export default function Authorization(props: IAuthorizationProps) {
    const token = props.authorization.token;
    const basic = props.authorization.basic;
    const env = props.environmentAuth;
    const dispatch = useDispatch();
    const locale = React.useContext(LocalizationContext);

    const inheritId = `${props.controlIdPrefix}_authInherit`;
    const noneId = `${props.controlIdPrefix}_authNone`;
    const tokenId = `${props.controlIdPrefix}_authToken`;
    const basicId = `${props.controlIdPrefix}_authBasic`;

    return (
        <>
            <div {...CommonStyles.RBL_HORIZONTAL}>
                <Radio
                    inputId={inheritId}
                    name={`${props.controlIdPrefix}_authTypeRadio`}
                    value="inherit"
                    checked={props.authorization.type === 'inherit'}
                    title={getText('Authorization.choice.inherit', { locale })}
                    label={(cn) => <label {...CommonStyles.RBL_HORIZ_LABEL} htmlFor={inheritId} className={cn}><LocText textKey="Authorization.choice.inherit" /></label>}
                    onChange={() => dispatch(makeSetAuthorizationSchemeAction(props.requestId, 'inherit'))}
                    />
                <Radio
                    inputId={noneId}
                    name={`${props.controlIdPrefix}_authTypeRadio`}
                    value="none"
                    checked={props.authorization.type === 'none'}
                    title={getText('Authorization.choice.none', { locale })}
                    label={cn => <label {...CommonStyles.RBL_HORIZ_LABEL} htmlFor={noneId} className={cn}><LocText textKey="Authorization.choice.none" /></label>}
                    onChange={() => dispatch(makeSetAuthorizationSchemeAction(props.requestId, 'none'))}
                    />
                <Radio
                    inputId={tokenId}
                    name={`${props.controlIdPrefix}_authTypeRadio`}
                    value="token"
                    checked={props.authorization.type === 'token'}
                    title={getText('Authorization.choice.token', { locale })}
                    label={cn => <label {...CommonStyles.RBL_HORIZ_LABEL} htmlFor={tokenId} className={cn}><LocText textKey="Authorization.choice.token" /></label>}
                    onChange={() => dispatch(makeSetAuthorizationSchemeAction(props.requestId, 'token'))}
                    />
                <Radio
                    inputId={basicId}
                    name={`${props.controlIdPrefix}_authTypeRadio`}
                    value="basic"
                    checked={props.authorization.type === 'basic'}
                    title={getText('Authorization.choice.basic', { locale })}
                    label={(cn) => <label {...CommonStyles.RBL_HORIZ_LABEL} htmlFor={basicId} className={cn}><LocText textKey="Authorization.choice.basic" /></label>}
                    onChange={() => dispatch(makeSetAuthorizationSchemeAction(props.requestId, 'basic'))}
                    />
            </div>
            {/* TODO: Re-implement this in a way that is localizable */}
            {/* <HideUnless test={props.authorization.type} match="inherit">
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
            </HideUnless> */}
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
