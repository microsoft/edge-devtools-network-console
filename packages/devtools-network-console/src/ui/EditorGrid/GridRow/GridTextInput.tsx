// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { TextField, ITextFieldProps } from 'office-ui-fabric-react';

import * as Styles from '../styles';

export interface IGridTextInputProps extends ITextFieldProps {
    previewText?: string;
}

export default function GridTextInput(props: IGridTextInputProps) {
    const multiline = !!(props.value && props.value.length > 40);
    return (
        <div>
            <TextField
                {...props}
                styles={{
                    fieldGroup: {
                        borderColor: 'transparent',
                    },
                }}
                autoAdjustHeight={true}
                multiline={multiline}
                underlined={multiline && !!props.previewText}
                />
            {props.previewText && <div aria-label="Preview of the rendered value based on your current environment" {...Styles.PREVIEW_TEXT_STYLE}>
                {props.previewText}
            </div>}
        </div>
    );
}
