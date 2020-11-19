// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { omit } from 'lodash-es';
import { TextField, TextFieldProps } from '@microsoft/fast-components-react-msft';

import * as Styles from '../styles';
import { getText, LocalizationConsumer } from 'utility/loc-context';

export interface IGridTextInputProps extends TextFieldProps {
    previewText?: string;
}

export default function GridTextInput(props: IGridTextInputProps) {
    const textFieldProps = React.useMemo(() => omit(props, 'previewText'), [props]);
    return (
        <LocalizationConsumer>
            {locale => (
                <div>
                    <TextField
                        {...textFieldProps}
                        style={{
                            width: 'calc(100% - 8px)',
                            borderColor: 'transparent',
                            margin: '4px',
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
