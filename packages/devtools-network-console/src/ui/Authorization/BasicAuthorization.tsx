// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Label, TextField, TextFieldType, Toggle } from '@microsoft/fast-components-react-msft';

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

    return (
        <Stack>
            <LocalAlert
                type="severeWarning"
                textKey="Authorization.Shared.dataSensitiveWarning" />
            <LocalAlert
                type="info"
                textKey="Authorization.Shared.noEnvironmentCalcuations" />
            <Stack horizontal>
                <div style={{ flexGrow: 0, flexShrink: 0, width: '75px', padding: '15px 0 0 10px', fontWeight: 'bold' }}>
                    <Label htmlFor="basicUsername">
                        <LocText textKey="AuthorizationBasic.userNameLabel" />
                    </Label>
                </div>
                <div style={{ flexGrow: 1 }}>
                    <TextField
                        id="basicUsername"
                        value={props.username} 
                        onChange={e => {
                            const value = e.target.value;
                            dispatch(makeSetBasicAuthAction(props.requestId, value, props.password, props.showPassword));
                        }}
                        style={{
                            width: '96%',
                            margin: '1% 0% 1% 3.5%',
                            fontFamily: 'Consolas, monospace',
                        }}
                        />
                </div>
            </Stack>
            <Stack horizontal>
                <div style={{ flexGrow: 0, flexShrink: 0, width: '75px', padding: '15px 0 0 10px', fontWeight: 'bold' }}>
                    <Label htmlFor="basicPassword">
                        <LocText textKey="AuthorizationBasic.passwordLabel" />
                    </Label>
                </div>
                <div style={{ flexGrow: 1 }}>
                    <TextField
                        id="basicPassword"
                        type={TextFieldType.password}
                        value={props.password} 
                        onChange={e => {
                            const value = e.target.value;
                            dispatch(makeSetBasicAuthAction(props.requestId, value, props.password, props.showPassword));
                        }}
                        style={{
                            width: '96%',
                            margin: '1% 0% 1% 3.5%',
                            fontFamily: 'Consolas, monospace',
                        }}
                        />
                </div>
            </Stack>

            <Stack horizontal>
                <div style={{ flexGrow: 0, flexShrink: 0, width: '75px', padding: '15px 0 0 10px', fontWeight: 'bold' }}>

                </div>
                <div style={{ flexGrow: 1 }}>
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
