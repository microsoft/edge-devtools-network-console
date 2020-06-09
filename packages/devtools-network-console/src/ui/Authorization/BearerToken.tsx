// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Stack, TextField, MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { makeSetBearerTokenAction } from 'actions/request/auth';

export interface IBearerTokenProps {
    requestId: string;

    token: string;
}

export default function BearerToken(props: IBearerTokenProps) {
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
                    dispatch(makeSetBearerTokenAction(props.requestId, value));
                }}
                label="Token"
                value={props.token}
                styles={{
                    field: {
                        fontFamily: 'Consolas, monospace !important',
                        fontSize: 'small'
                    },
                }}
                underlined
                multiline
                autoAdjustHeight
                />
        </Stack>
    );
}
