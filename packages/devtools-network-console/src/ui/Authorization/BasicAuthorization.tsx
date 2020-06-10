// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Stack, TextField, Checkbox, MessageBar, MessageBarType } from '@fluentui/react';
import { makeSetBasicAuthAction } from 'actions/request/auth';

export interface IBasicAuthorizationProps {
    requestId: string;

    username: string;
    password: string;
    showPassword: boolean;
}

export default function BasicAuthorization(props: IBasicAuthorizationProps) {
    const dispatch = useDispatch();

    return (
        <Stack tokens={{ childrenGap: 'm', padding: 'm' }}>
            <MessageBar
                messageBarType={MessageBarType.severeWarning}
                isMultiline={true}
                messageBarIconProps={{ iconName: 'Warning' }}
                styles={{ root: { userSelect: 'none' }}}>
                These parameters may contain sensitive information. Consider specifying these with environment variables here, and specifying
                that your environment variables aren't checked in to source control.
            </MessageBar>
            <MessageBar
                messageBarType={MessageBarType.info}
                messageBarIconProps={{iconName: 'Info'}}
                styles={{root: { userSelect: 'none'}}}>
                Environment variable substitutions are not shown here for privacy purposes.
            </MessageBar>
            <TextField
                onChange={e => {
                    const value = (e.target as HTMLInputElement).value;
                    dispatch(makeSetBasicAuthAction(props.requestId, value, props.password, props.showPassword));
                }}
                label="User name"
                value={props.username}
                underlined
                />
            <TextField onChange={e => {
                    const value = (e.target as HTMLInputElement).value;
                    dispatch(makeSetBasicAuthAction(props.requestId, props.username, value, props.showPassword));
                }}
                label="Password"
                value={props.password}
                underlined
                type={props.showPassword ? 'text' : 'password'}
                />
            <Checkbox label="Show password" checked={props.showPassword} onChange={(_e, checked) => {
                    dispatch(makeSetBasicAuthAction(props.requestId, props.username, props.password, !!checked));
                }}
                />
        </Stack>
    );
}
