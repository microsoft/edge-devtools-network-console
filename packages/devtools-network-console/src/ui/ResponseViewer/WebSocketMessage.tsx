// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo } from 'react';
import JsonView from 'react-json-view';
import { css } from 'glamor';
import { useSelector } from 'react-redux';
import { IView, IThemeInfo } from 'store';
import { IWebsocketMessage } from 'reducers/websocket';

interface WebSocketMessageProps {
    time?: number;
    message: IWebsocketMessage;
}

export function WebSocketMessage(props: WebSocketMessageProps) {
    const themeType = useSelector<IView, IThemeInfo>(s => s.theme);
    const applyDark = themeType.theme === 'dark';
    const [arrow, style, isStatus] = useMemo(() => {
        let isStatus = false;
        let arrow;
        let style;
        switch(props.message.direction) {
            case 'recv':
                arrow = <>&darr;</>;
                style = applyDark? MESSAGE_STYLE_RECV_DARK : MESSAGE_STYLE_RECV;
                break;
            case 'send':
                arrow = <>&uarr;</>;
                style = applyDark? MESSAGE_STYLE_SEND_DARK : MESSAGE_STYLE_SEND;
                break;
            case 'status':
            default:
                style = applyDark ? MESSAGE_STYLE_STATUS_DARK : MESSAGE_STYLE_STATUS;
                isStatus = true;
                break;
        }
        return [arrow, style, isStatus];
    }, [props.message, applyDark])

    const [message, kind]: [any, 'obj' | 'text'] = useMemo(() => {
        try {
            return [JSON.parse(props.message.content), 'obj'];
        }
        catch {
            return [props.message.content, 'text'];
        }
    }, [props.message.content]);

    return (
        <div {...style}>
            {!isStatus && <div {...DESCRIPTOR_STYLE}>
                <div {...ARROW_STYLE}>{arrow}</div>
                {(props.time !== undefined) && <div {...TIMER_STYLE}>{props.time}ms</div>}
            </div>}
            {
                (kind === 'text' ? (
                    <div className="json-view-with-transparent-background">
                        <code>
                            {message}
                        </code>
                    </div>
                ) : (
                    <div>
                        <JsonView
                            src={message}
                            displayDataTypes={false}
                            enableClipboard={false}
                            iconStyle="triangle"
                            theme={applyDark ? "shapeshifter" : "shapeshifter:inverted"}
                            shouldCollapse={cfp => {
                                return cfp.namespace.length > 1;
                            }}
                        />
                    </div>)
                )
            }
        </div>
    );
}

export default React.memo(WebSocketMessage);

var MESSAGE_STYLE_BASE = css({
    minWidth: '15%',
    maxWidth: '80%',
    display: 'grid',
        // flexDirection: 'column',
    gridTemplateRows: '20px auto',
    borderRadius: '4px',
    padding: '5px',
    marginTop: '5px',
    fontSize: '12px',
    overflowWrap: 'break-word',
});

var MESSAGE_STYLE_RECV = css(MESSAGE_STYLE_BASE, {
    alignSelf: 'flex-start',
    backgroundColor: '#dfd',
});

var MESSAGE_STYLE_SEND = css(MESSAGE_STYLE_BASE, {
    alignSelf: 'flex-end',
    backgroundColor: '#ddf',
});

var MESSAGE_STYLE_STATUS = css(MESSAGE_STYLE_BASE, {
    maxWidth: '100%',
    alignSelf: 'stretch',
    backgroundColor: '#ddd',
});

var DESCRIPTOR_STYLE = css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'start',
    alignItems: 'center',
});

var TIMER_STYLE = css({
    fontSize: '10px',
    paddingLeft: '5px',
});

var ARROW_STYLE = css({
    fontSize: '12px',
    fontWeight: 'bolder',
});

var MESSAGE_STYLE_RECV_DARK = css(MESSAGE_STYLE_RECV, {
    backgroundColor: '#353',
});

var MESSAGE_STYLE_SEND_DARK = css(MESSAGE_STYLE_SEND, {
    backgroundColor: '#335',
});

var MESSAGE_STYLE_STATUS_DARK = css(MESSAGE_STYLE_STATUS, {
    backgroundColor: '#333',
});
