// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { useDispatch } from 'react-redux';
import { ControlledEditor as MonacoEditor } from '@monaco-editor/react';

import { THEME_TYPE } from 'themes/vscode-theme';
import { downloadResponse } from 'actions/combined';
import { ISerializableHttpBody } from 'network-console-shared';
import { strFromB64 } from 'utility/b64';
import Stack from 'ui/generic/Stack';
import LocalAlert from 'ui/generic/LocalAlert';
import LocText from 'ui/LocText';
import { AccentButton, NeutralButton } from '@microsoft/fast-components-react-msft';

interface IResponseBodyProps {
    languageChoice: string;
    theme: THEME_TYPE;
    serializedBody: ISerializableHttpBody;
    requestId: string;
    size: number;
}

export default function ResponseBody(props: IResponseBodyProps) {
    const [hiddenBody, setHiddenBody] = React.useState(props.size > 65536);
    const dispatch = useDispatch();

    if (hiddenBody) {
        return (
            <div>
                <Stack>
                    <LocalAlert type="info">
                        <LocText textKey="ResponseBody.largeResponseBody" />
                        <AccentButton onClick={e => setHiddenBody(false)}>
                            <LocText textKey="ResponseBody.largeResponseBody.show" />
                        </AccentButton>
                        <NeutralButton onClick={e => dispatch(downloadResponse(props.requestId))}>
                            <LocText textKey="ResponseBody.largeResponseBody.download" />
                        </NeutralButton>
                    </LocalAlert>
                </Stack>
            </div>
        );
    }

    const value = strFromB64(props.serializedBody.content);
    return (
        <MonacoEditor
            language={props.languageChoice}
            theme={props.theme}
            options={{ readOnly: true, automaticLayout: true, wordWrap: 'on', }}
            value={value}
        />
    );
}