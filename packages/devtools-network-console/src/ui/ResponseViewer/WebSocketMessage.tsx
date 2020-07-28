// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo } from 'react';
import JsonView from 'react-json-view';
import { css } from 'glamor';
import tryMake from 'utility/try-make';
import { unpackMessage } from 'utility/msgpack';

interface WebSocketMessageProps {
    dir: 'send' | 'recv';
    time: number;
    message: any;
    messageEncoding: 'text' | 'base64';
}

export default function WebSocketMessage(props: WebSocketMessageProps) {
    let arrow = <>&uarr;</>;
    let style = MESSAGE_STYLE_SEND;
    if (props.dir === 'recv') {
        arrow = <>&darr;</>;
        style = MESSAGE_STYLE_RECV;
    }

    const [message, kind]: [any, 'obj' | 'text'] = useMemo(() => {
        let msg: [any, 'obj' | 'text'];
        if (props.messageEncoding === 'base64') {
            msg = tryMake(unpackMessage, props.message);
            if (msg) {
                return [msg, 'obj'];
            }
        }
        msg = tryMake(JSON.parse, props.message);
        if (msg && typeof msg === 'object') {
            return [msg, 'obj'];
        }
        return [props.message, 'text'];
    }, [props.message, props.messageEncoding]);

    return (
        <div {...style}>
            <div {...DESCRIPTOR_STYLE}>
                <div {...ARROW_STYLE}>{arrow}</div>
                <div {...TIMER_STYLE}>{props.time}ms</div>
            </div>
            <div className="json-view-with-transparent-background">
                {
                    (kind === 'text' ? (
                        <code>
                            {message}
                        </code>
                    ) : (
                        <JsonView
                            src={message}
                            displayDataTypes={false}
                            enableClipboard={false}
                            iconStyle="triangle"
                            theme="shapeshifter:inverted"
                            shouldCollapse={cfp => {
                                return cfp.namespace.length > 1;
                            }}
                            />
                    ))
                }
            </div>
        </div>
    );
}

var MESSAGE_STYLE_BASE = css({
    width: '90%',
    display: 'grid',
    gridTemplateColumns: '85px auto',
    borderRadius: '4px',
    padding: '15px',
    marginTop: '5px',
});

var MESSAGE_STYLE_RECV = css(MESSAGE_STYLE_BASE, {
    alignSelf: 'flex-start',
    backgroundColor: '#dfd',
});

var MESSAGE_STYLE_SEND = css(MESSAGE_STYLE_BASE, {
    alignSelf: 'flex-end',
    backgroundColor: '#ddf',
});

var DESCRIPTOR_STYLE = css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: '15px',
});

var TIMER_STYLE = css({
    fontSize: '10px',
});

var ARROW_STYLE = css({
    fontSize: '24px',
    fontWeight: 'bolder',
});
