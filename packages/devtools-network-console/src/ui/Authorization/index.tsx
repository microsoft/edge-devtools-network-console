// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { INetConsoleAuthorization } from 'network-console-shared';

import * as Styles from './styles';
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
import { Typography, TypographySize } from '@microsoft/fast-components-react-msft';

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
            <div {...CommonStyles.RBL_HORIZONTAL} role="radiogroup" aria-label={getText('Authorization.groupLabel', { locale })}>
                <Radio
                    inputId={inheritId}
                    name={`${props.controlIdPrefix}_authTypeRadio`}
                    value="inherit"
                    checked={props.authorization.type === 'inherit'}
                    aria-checked={props.authorization.type === 'inherit' ? 'true' : 'false'}
                    title={getText('Authorization.choice.inherit', { locale })}
                    label={(cn) => <label {...CommonStyles.RBL_HORIZ_LABEL} htmlFor={inheritId} className={cn}><LocText textKey="Authorization.choice.inherit" /></label>}
                    onChange={() => dispatch(makeSetAuthorizationSchemeAction(props.requestId, 'inherit'))}
                    />
                <Radio
                    inputId={noneId}
                    name={`${props.controlIdPrefix}_authTypeRadio`}
                    value="none"
                    checked={props.authorization.type === 'none'}
                    aria-checked={props.authorization.type === 'none' ? 'true' : 'false'}
                    title={getText('Authorization.choice.none', { locale })}
                    label={cn => <label {...CommonStyles.RBL_HORIZ_LABEL} htmlFor={noneId} className={cn}><LocText textKey="Authorization.choice.none" /></label>}
                    onChange={() => dispatch(makeSetAuthorizationSchemeAction(props.requestId, 'none'))}
                    />
                <Radio
                    inputId={tokenId}
                    name={`${props.controlIdPrefix}_authTypeRadio`}
                    value="token"
                    checked={props.authorization.type === 'token'}
                    aria-checked={props.authorization.type === 'token' ? 'true' : 'false'}
                    title={getText('Authorization.choice.token', { locale })}
                    label={cn => <label {...CommonStyles.RBL_HORIZ_LABEL} htmlFor={tokenId} className={cn}><LocText textKey="Authorization.choice.token" /></label>}
                    onChange={() => dispatch(makeSetAuthorizationSchemeAction(props.requestId, 'token'))}
                    />
                <Radio
                    inputId={basicId}
                    name={`${props.controlIdPrefix}_authTypeRadio`}
                    value="basic"
                    checked={props.authorization.type === 'basic'}
                    aria-checked={props.authorization.type === 'basic' ? 'true' : 'false'}
                    title={getText('Authorization.choice.basic', { locale })}
                    label={(cn) => <label {...CommonStyles.RBL_HORIZ_LABEL} htmlFor={basicId} className={cn}><LocText textKey="Authorization.choice.basic" /></label>}
                    onChange={() => dispatch(makeSetAuthorizationSchemeAction(props.requestId, 'basic'))}
                    />
            </div>
            <HideUnless test={props.authorization.type} match="inherit">
                <Stack>
                    <LocalAlert
                        type="info">
                        <Stack>
                            <div><Typography size={TypographySize._8} style={{ color: 'black' }} ><LocText textKey="Authorization.inherit.label" /></Typography></div>
                            {env && env.values && (
                                <dl {...Styles.INHERITED_INFORMATION}>
                                    <dt {...Styles.INHERITED_TERM}><LocText textKey="Authorization.ancestorAuthTypeLabel.label" /></dt>
                                    <dd {...Styles.INHERITED_DEFINITION}><LocText textKey={`Authorization.choice.${env.values.type}`} /></dd>
                                    <dt {...Styles.INHERITED_TERM}><LocText textKey="Authorization.ancestorAuthorizationLabel.label" /></dt>
                                    <dd {...Styles.INHERITED_DEFINITION}>{env.from.join('/')}</dd>
                                </dl>
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
