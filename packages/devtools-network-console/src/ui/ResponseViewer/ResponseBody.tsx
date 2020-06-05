// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { useDispatch } from 'react-redux';
import { ControlledEditor as MonacoEditor } from '@monaco-editor/react';

import { THEME_TYPE } from 'themes/vscode-theme';
import { downloadResponse } from 'actions/combined';
import { ISerializableHttpBody } from 'network-console-shared';
import { strFromB64 } from 'utility/b64';

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
                <MessageBar
                    messageBarType={MessageBarType.info}
                    isMultiline
                    messageBarIconProps={{ iconName: 'Warning' }}
                    styles={{ root: { userSelect: 'none' } }}>
                    The response message body size exceeded 64KiB. To avoid potentially slowing down
                    (particularly if the content is binary), it isn't shown by default. If you want
                    to still see it,
                    <a
                        href="#show"
                        onClick={e => {
                            e.preventDefault();
                            setHiddenBody(false);
                        }}>click here</a>.
                    Alternatively, you can simply
                    <a
                        href="#download"
                        onClick={e => {
                            e.preventDefault();
                            dispatch(downloadResponse(props.requestId));
                        }}>download the response</a>.
                </MessageBar>
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