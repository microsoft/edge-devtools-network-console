// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { MessageBar, MessageBarType } from '@fluentui/react';
import LocText from 'ui/LocText';

/**
 * @fileoverview
 * The purpose of this component is to give us a transitional point away from the 
 * Fluent UI as we pivot away. For now we don't have a replacement, so we'll add
 * a component that will wrap it.
 */

interface ILocalAlertProps {
    type: 'info' | 'severeWarning' | 'error';
    textKey?: string;
    children?: React.ReactNode;
}

const Info = {
    messageBarType: MessageBarType.info,
    messageBarIconProps: { iconName: 'Info' },
};
const SevereWarning = {
    messageBarType: MessageBarType.severeWarning,
    messageBarIconProps: { iconName: 'Warning' },
};
const ErrorKind = {
    messageBarType: MessageBarType.error,
};

export default function LocalAlert(props: ILocalAlertProps) {
    const choiceProps = 
        props.type === 'info' ? Info :
        props.type === 'severeWarning' ? SevereWarning :
                        ErrorKind;

    if (props.children) {
        return (
            <MessageBar {...choiceProps} isMultiline style={{ userSelect: 'none' }}>
                {props.children}
            </MessageBar>
        );
    }

    if (!props.textKey) {
        throw new Error('Assertion failed: LocalAlert requires either children or textKey to be set.');
    }

    return (
        <MessageBar {...choiceProps} isMultiline style={{ userSelect: 'none' }}>
            <LocText textKey={props.textKey} />
        </MessageBar>
    );
}
