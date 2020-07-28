// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useRef } from 'react';
import { css } from 'glamor';
import { ControlledEditor as MonacoEditor } from '@monaco-editor/react';
import CommonStyles from 'ui/common-styles';
import WebSocketMessage from './WebSocketMessage';
import { Select, SelectOption, Button, ButtonAppearance } from '@microsoft/fast-components-react-msft';
import { editor, KeyCode } from 'monaco-editor';
import { sendWsMessage, sendWsDisconnect } from 'actions/websocket';
import { useDispatch, connect } from 'react-redux';
import { IView } from 'store';
import { IWebSocketConnection } from 'reducers/websocket';
import { AppHost } from 'store/host';

const CONTAINER_VIEW = css(CommonStyles.FULL_SIZE_NOT_SCROLLABLE, {
    display: 'grid',
    gridTemplateRows: '8fr 24px 2fr',
});
const MESSAGES_OVERVIEW_STYLE = css(CommonStyles.SCROLL_CONTAINER_STYLE, {
    display: 'flex',
    flexDirection: 'column',
});
const SCROLL_VERT = css({
    overflowY: 'auto',
    height: '100%',
});
const MESSAGES_CONTAINER_STYLE = css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    height: 'calc(100% - 5px)',
    paddingBottom: '5px',
});
const DISCONNECTED_STYLE = css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
});
const COMMAND_BAR_STYLE = css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
});
// const messages = [
//     ['send', 4, { type: 'INIT_CONNECTION', client: 'ws1-info' }],
//     ['recv', 27, { type: 'PROTOCOL_NEGOTIATION', capabilities: ['authentication', 'synchronization', 'push'] }],
//     ['send', 4952, { type: 'AUTHENTICATE', id: 1, user: 'rob@contoso.com', token: 'adDSAFADSFssda=-1=9331hnhnsdjhjaf.1akjdlfjd' }],
//     ['recv', 5005, { type: 'AUTHENTICATION_ERROR', id: 1, message: 'TOKEN_EXPIRED' }],
//     ['send', 4, { type: 'INIT_CONNECTION', client: 'ws1-info' }],
//     ['recv', 27, { type: 'PROTOCOL_NEGOTIATION', capabilities: ['authentication', 'synchronization', 'push'] }],
//     ['send', 4952, { type: 'AUTHENTICATE', id: 1, user: 'rob@contoso.com', token: 'adDSAFADSFssda=-1=9331hnhnsdjhjaf.1akjdlfjd' }],
//     ['recv', 5005, { type: 'AUTHENTICATION_ERROR', id: 1, message: 'TOKEN_EXPIRED' }],
//     ['send', 4, { type: 'INIT_CONNECTION', client: 'ws1-info' }],
//     ['recv', 27, { type: 'PROTOCOL_NEGOTIATION', capabilities: ['authentication', 'synchronization', 'push'] }],
//     ['send', 4952, { type: 'AUTHENTICATE', id: 1, user: 'rob@contoso.com', token: 'adDSAFADSFssda=-1=9331hnhnsdjhjaf.1akjdlfjd' }],
//     ['recv', 5005, { type: 'AUTHENTICATION_ERROR', id: 1, message: 'TOKEN_EXPIRED' }],
// ];

const BODY_CONTENT_TYPES = [{
    key: 'text',
    text: 'Plain text',
},
{
    key: 'json',
    text: 'JSON',
},
{
    key: 'xml',
    text: 'XML',
},
{
    key: 'html',
    text: 'HTML',
},
{
    key: 'javascript',
    text: 'JavaScript',
}];

export interface IOwnProps {
    requestId: string;
}

interface IConnectedProps {
    connection: IWebSocketConnection;
}
export type IWebSocketViewProps = IConnectedProps & IOwnProps;

export function WebSocketView(props: IWebSocketViewProps) {
    const [toSend, setToSend] = useState('');
    const [format, setFormat] = useState('text');
    const dispatch = useDispatch();
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>();
    const messages = props.connection.messages;
    const connected = props.connection.connected;

    function handleEditorDidMount(_: any, editor: editor.IStandaloneCodeEditor) {
        editorRef.current = editor;
        editor.onKeyDown(e => {
            if (e.keyCode === KeyCode.Enter && e.ctrlKey) {
                dispatch(sendWsMessage(props.requestId, editorRef.current!.getValue()));
                setToSend('');
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }

    return (
        <div {...CONTAINER_VIEW}>
            <div {...MESSAGES_OVERVIEW_STYLE}>
                <div {...SCROLL_VERT}>
                    <div {...MESSAGES_CONTAINER_STYLE}>
                        {messages.toArray().map((m, i) => {
                            return (
                                <WebSocketMessage
                                    key={i}
                                    dir={m.direction}
                                    time={m.time}
                                    message={m.content}
                                    />
                            );
                        })}
                    </div>
                </div>
            </div>
            {connected ?
            (<>
                <div {...COMMAND_BAR_STYLE}>
                <Select
                    placeholder="Content Type"
                    jssStyleSheet={{
                        select: {
                            width: '205px',
                            zIndex: '500',
                            position: 'relative',
                        },
                    }}
                    onMenuSelectionChange={items => {
                        const item = items[0]!;
                        setFormat(item.id);
                    }}>
                    {BODY_CONTENT_TYPES.map(item => {
                        return (
                            <SelectOption key={item.key} id={item.key} value={item.text} title={item.text} displayString={item.text} />
                        );
                    })}
                </Select>
                <Button
                    appearance={ButtonAppearance.primary}
                    disabled={!connected}
                    onClick={e => {
                        dispatch(sendWsDisconnect(props.requestId));
                        e.stopPropagation();
                        e.preventDefault();
                    }}>Disconnect</Button>
                </div>
                <div className="ht100 flxcol">
                    <MonacoEditor
                        language={format}
                        theme="light"
                        value={toSend}
                        onChange={(_e, newValue) => {
                            setToSend(newValue!);
                        }}
                        editorDidMount={handleEditorDidMount}
                        options={{
                            automaticLayout: true,
                        }}
                        />
                </div>
            </>): <NotConnected />}
        </div>
    );
}

function NotConnected() {
    return (
        <div {...DISCONNECTED_STYLE}>
            Websocket disconnected! Resend the request to re-connect!
        </div>
    );
}

function mapStateToProps(state: IView, ownProps: IOwnProps): IConnectedProps {
    const wsConnection = state.websocket.get(ownProps.requestId);
    if (!wsConnection) {
        AppHost.log({
            message: 'Invariant failure, no WebSocketConnection for ID',
            where: 'ConnectedWebSocketViewer:mapStateToProps',
            state,
            ownProps,
            wsConnection,
        });
        throw new Error('Invariant failed: WebsocketConnection not found for given request ID');
    }

    return {
        connection: wsConnection
    };
}

export const ConnectedWebSocketViewer = connect(mapStateToProps)(WebSocketView);
export default ConnectedWebSocketViewer;
