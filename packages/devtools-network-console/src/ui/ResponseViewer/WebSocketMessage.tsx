// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo } from 'react';
import JsonView from 'react-json-view';
import { css } from 'glamor';

interface WebSocketMessageProps {
    dir: 'send' | 'recv';
    time: number;
    message: any;
}

export default function WebSocketMessage(props: WebSocketMessageProps) {
    let arrow = <>&uarr;</>;
    let style = MESSAGE_STYLE_SEND;
    if (props.dir === 'recv') {
        arrow = <>&darr;</>;
        style = MESSAGE_STYLE_RECV;
    }

    const [message, kind]: [any, 'obj' | 'text'] = useMemo(() => {
        try {
            return [JSON.parse(props.message), 'obj'];
        }
        catch {
            return [props.message, 'text'];
        }
    }, [props.message]);

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
    borderRadius: '20px',
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
