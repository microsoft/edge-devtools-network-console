// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Label, TextArea } from '@microsoft/fast-components-react-msft';

import * as Styles from './styles';
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
                <div {...Styles.AUTHORIZATION_LABEL_CONTAINER_STYLE}>
                    <Label htmlFor="bearerTokenValue">
                        <LocText textKey="AuthorizationBearerToken.TokenField.label" />
                    </Label>
                </div>
                <div {...Styles.LABELED_AREA}>
                    <TextArea
                        id="bearerTokenValue"
                        value={props.token} 
                        onChange={e => {
                            const value = e.target.value;
                            dispatch(makeSetBearerTokenAction(props.requestId, value));
                        }}
                        {...Styles.BEARER_TOKEN_TEXT_AREA}
                        />
                </div>
            </Stack>
        </Stack>
    );
}
