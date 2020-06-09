// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { TextField, ITextFieldProps, Dropdown } from '@fluentui/react';

interface IProps extends ITextFieldProps {
    canSelectMode: boolean;
    modeSelection: 'text' | 'file';
    onModeChanged: (mode: 'text' | 'file') => void;
}

export default function GridTextOrFileKey(props: IProps) {
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
                            { key: 'text', title: 'Text', text: 'Text' },
                            { key: 'file', title: 'File', text: 'File' },
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
