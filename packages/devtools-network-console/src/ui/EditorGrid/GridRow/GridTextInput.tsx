// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { TextField, TextFieldProps } from '@microsoft/fast-components-react-msft';

import * as Styles from '../styles';
import { getText, LocalizationConsumer } from 'utility/loc-context';

export interface IGridTextInputProps extends TextFieldProps {
    previewText?: string;
}

export default function GridTextInput(props: IGridTextInputProps) {
    return (
        <LocalizationConsumer>
            {locale => (
                <div>
                    <TextField
                        {...props}
                        style={{
                            width: '100%',
                            borderColor: 'transparent',
                            height: '33px',
                        }}
                        />
                    {props.previewText && <div aria-label={getText('EditorGrid.GridTextInput.previewLabel', { locale })} {...Styles.PREVIEW_TEXT_STYLE}>
                        {props.previewText}
                    </div>}
                </div>
            )}
        </LocalizationConsumer>
    );
}
