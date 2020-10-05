// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Label, TextArea } from '@microsoft/fast-components-react-msft';

import Stack from 'ui/generic/Stack';
import { makeSetBearerTokenAction } from 'actions/request/auth';
import LocText from 'ui/LocText';
import LocalAlert from 'ui/generic/LocalAlert';

export interface IBearerTokenProps {
    requestId: string;

    token: string;
}

export default function BearerToken(props: IBearerTokenProps) {
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
                    <Label htmlFor="bearerTokenValue">
                        <LocText textKey="AuthorizationBearerToken.TokenField.label" />
                    </Label>
                </div>
                <div style={{ flexGrow: 1 }}>
                    <TextArea
                        id="bearerTokenValue"
                        value={props.token} 
                        onChange={e => {
                            const value = e.target.value;
                            dispatch(makeSetBearerTokenAction(props.requestId, value));
                        }}
                        style={{
                            width: '96%',
                            margin: '1% 0% 1% 3.5%',
                            minHeight: '85px',
                            fontFamily: 'Consolas, monospace',
                        }}
                        />
                </div>
            </Stack>
        </Stack>
    );
}
