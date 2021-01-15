// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Label, TextField, TextFieldType, Toggle } from '@microsoft/fast-components-react-msft';

import * as Styles from './styles';
import { makeSetBasicAuthAction } from 'actions/request/auth';
import Stack from 'ui/generic/Stack';
import LocText from 'ui/LocText';
import { getText, ILocalized, LocalizationConsumer } from 'utility/loc-context';
import LocalAlert from 'ui/generic/LocalAlert';

export interface IBasicAuthorizationProps {
    requestId: string;

    username: string;
    password: string;
    showPassword: boolean;
}

function BasicAuthorization(props: IBasicAuthorizationProps & ILocalized) {
    const dispatch = useDispatch();
    React.useEffect(() => {
        const showPasswordInput = document.querySelector('#basicAuthorizationShowPassword');
        if (showPasswordInput) {
            showPasswordInput.setAttribute('aria-labelledby', 'basicAuthorizationShowPasswordLabel');
        }
    });

    return (
        <Stack>
            <LocalAlert
                type="severeWarning"
                textKey="Authorization.Shared.dataSensitiveWarning" />
            <LocalAlert
                type="info"
                textKey="Authorization.Shared.noEnvironmentCalcuations" />
            <Stack horizontal>
                <div {...Styles.AUTHORIZATION_LABEL_CONTAINER_STYLE}>
                    <Label htmlFor="basicUsername">
                        <LocText textKey="AuthorizationBasic.userNameLabel" />
                    </Label>
                </div>
                <div {...Styles.LABELED_AREA}>
                    <TextField
                        id="basicUsername"
                        value={props.username}
                        onChange={e => {
                            const value = e.target.value;
                            dispatch(makeSetBasicAuthAction(props.requestId, value, props.password, props.showPassword));
                        }}
                        {...Styles.AUTHORIZATION_TEXT_FIELD_STYLE}
                        />
                </div>
            </Stack>
            <Stack horizontal>
                <div {...Styles.AUTHORIZATION_LABEL_CONTAINER_STYLE}>
                    <Label htmlFor="basicPassword">
                        <LocText textKey="AuthorizationBasic.passwordLabel" />
                    </Label>
                </div>
                <div {...Styles.LABELED_AREA}>
                    <TextField
                        id="basicPassword"
                        type={props.showPassword ? TextFieldType.text : TextFieldType.password}
                        value={props.password}
                        onChange={e => {
                            const value = e.target.value;
                            dispatch(makeSetBasicAuthAction(props.requestId, props.username, value, props.showPassword));
                        }}
                        {...Styles.AUTHORIZATION_TEXT_FIELD_STYLE}
                        />
                </div>
            </Stack>

            <Stack horizontal>
                <div {...Styles.AUTHORIZATION_LABEL_CONTAINER_STYLE}>

                </div>
                <div {...Styles.BASIC_AUTH_SHOW_PASSWORD_CHECKBOX_AREA}>
                    <Toggle
                        inputId="basicAuthorizationShowPassword"
                        selectedMessage={getText('AuthorizationBasic.showPasswordLabel', props)}
                        unselectedMessage={getText('AuthorizationBasic.showPasswordLabel', props)}
                        selected={props.showPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const checked = e.target.checked;
                            dispatch(makeSetBasicAuthAction(props.requestId, props.username, props.password, !!checked));
                        }}
                    />
                    <span id="basicAuthorizationShowPasswordLabel" style={{display: 'none'}}>
                        <LocText textKey="AuthorizationBasic.showPasswordLabel" />
                    </span>
                </div>
            </Stack>

        </Stack>
    );
}

export default function LocalizedBasicAuthorization(props: IBasicAuthorizationProps) {
    return (
        <LocalizationConsumer>
            {locale => <BasicAuthorization {...props} locale={locale} />}
        </LocalizationConsumer>
    );
}
