// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { TextField, ITextFieldProps, Dropdown } from '@fluentui/react';
import { getText, ILocalized, LocalizationConsumer } from 'utility/loc-context';

interface IProps extends ITextFieldProps {
    canSelectMode: boolean;
    modeSelection: 'text' | 'file';
    onModeChanged: (mode: 'text' | 'file') => void;
}

function GridTextOrFileKey(props: IProps & ILocalized) {
    const textTitle = getText('EditorGrid.GridKey.textLabel', props);
    const fileTitle = getText('EditorGrid.GridKey.fileLabel', props);
    return (
        <TextField
            {...props}
            styles={{
                fieldGroup: {
                    borderColor: 'transparent',
                },
                suffix: {
                    backgroundColor: 'transparent',
                }
            }}
            onRenderSuffix={e => {
                if (!props.canSelectMode) {
                    return null;
                }

                return (
                    <Dropdown options={[
                            { key: 'text', title: textTitle, text: textTitle },
                            { key: 'file', title: fileTitle, text: fileTitle },
                        ]}
                        styles={{
                            dropdown: {
                                borderColor: 'transparent',
                            },
                            title: {
                                borderColor: 'transparent',
                                backgroundColor: 'transparent',
                            },
                        }}
                        selectedKey={props.modeSelection}
                        onChange={(e, v) => {
                            if (!v) {
                                return;
                            }
                            const mode = v.key as 'text' | 'file';
                            props.onModeChanged(mode);
                        }}
                        multiSelect={false}
                        />
                )
            }}
            />
    );
}

export default function LocalizedGridTextOrFileKey(props: IProps) {
    return (
        <LocalizationConsumer>
            {locale => (<GridTextOrFileKey {...props} locale={locale} />)}
        </LocalizationConsumer>
    );
}
