// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useRef, useEffect } from 'react';
import { css } from 'glamor';
import { ControlledEditor as MonacoEditor } from '@monaco-editor/react';
import CommonStyles from 'ui/common-styles';
import WebSocketMessage from './WebSocketMessage';
import { Select, SelectOption, Button, ButtonAppearance } from '@microsoft/fast-components-react-msft';
import { sendWsMessage, sendWsDisconnect } from 'actions/websocket';
import { useDispatch, useSelector } from 'react-redux';
import { IView } from 'store';
import { IWebSocketConnection } from 'reducers/websocket';
import { THEME_TYPE } from 'themes/vscode-theme';

const CONTAINER_VIEW = css(CommonStyles.FULL_SIZE_NOT_SCROLLABLE, {
    display: 'grid',
    gridTemplateRows: '8fr 24px 2fr',
    bottom: '35px',
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
    paddingBottom: '5px',
    marginRight: '10px',
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
const COMMAND_BAR_BUTTON_STYLE = css({
    marginLeft: '5px'
});

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
    theme: THEME_TYPE;
}

export type IWebSocketViewProps = IOwnProps;

// The 'monaco-editor' package would be used for type checking, but it's not really
// necessary, and if we actually import it, what ends up happening is that it blows up
// the build output size. This declaration avoids it to avoid the following import:
//     import { editor, KeyCode } from 'monaco-editor';
declare namespace editor {
    type IStandaloneCodeEditor = any;
}

export default function WebSocketView(props: IWebSocketViewProps) {
    const [toSend, setToSend] = useState('');
    const [format, setFormat] = useState('text');
    const [hasScrolledUp, setHasScrolledUp] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch();
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>();
    const connection = useSelector<IView, IWebSocketConnection | undefined>(store => store.websocket.get(props.requestId));
    const messages = connection?.messages;
    const connected = connection?.connected;

    function handleEditorDidMount(_: any, monacoInstance: editor.IStandaloneCodeEditor) {
        editorRef.current = monacoInstance;
        monacoInstance.onKeyDown((e: any) => {
            if (e.keyCode === /* KeyCode.Enter */ 3 && e.ctrlKey) {
                dispatch(sendWsMessage(props.requestId, editorRef.current!.getValue()));
                setToSend('');
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }

    useEffect(() => {
        if (hasScrolledUp) {
            return;
        }
        const div = scrollContainerRef.current;
        if (!div || !div.lastElementChild) {
            return;
        }

        div.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [hasScrolledUp, messages]);

    if (!messages) {
        return (
            <div {...CONTAINER_VIEW}>
                <h4>No WebSocket found for this request-response pair.</h4>
            </div>
        );
    }

    return (
        <div {...CONTAINER_VIEW}>
            <div {...MESSAGES_OVERVIEW_STYLE}>
                <div {...SCROLL_VERT} ref={scrollContainerRef} onScroll={e => {
                    const div = scrollContainerRef.current;
                    if (!div) {
                        return;
                    }

                    // Allow for a padding of ~3 pixels to scroll down.
                    setHasScrolledUp(div.scrollTop + div.offsetHeight < (div.scrollHeight - 3));
                }}>
                    <div {...MESSAGES_CONTAINER_STYLE}>
                        {messages.map((m, i) => {
                            return (
                                <WebSocketMessage
                                    key={m.entryNumber}
                                    time={m.time}
                                    message={m}
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
                                width: '300px',
                                zIndex: '500',
                                position: 'relative',
                            },
                        }}
                        menuFlyoutConfig={{
                            verticalAlwaysInView: true,
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
                    <div {...COMMAND_BAR_BUTTON_STYLE}>
                        <Button
                            appearance={ButtonAppearance.primary}
                            disabled={!connected || !editorRef.current || editorRef.current!.getValue() === ''}
                            onClick={e => {
                                dispatch(sendWsMessage(props.requestId, editorRef.current!.getValue()));
                                setToSend('');
                                e.stopPropagation();
                                e.preventDefault();
                            }}>Send</Button>
                    </div>
                    <div {...COMMAND_BAR_BUTTON_STYLE}>
                        <Button
                            appearance={ButtonAppearance.outline}
                            disabled={!connected}
                            onClick={e => {
                                dispatch(sendWsDisconnect(props.requestId));
                                e.stopPropagation();
                                e.preventDefault();
                            }}>Disconnect</Button>
                    </div>
                </div>
                <div className="ht100 flxcol">
                    <MonacoEditor
                        language={format}
                        theme={props.theme}
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
            Websocket disconnected. Resend the request to re-connect.
        </div>
    );
}
