// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { 
    TextField, 
    TextFieldProps,
    Select, 
    SelectOption,
} from '@microsoft/fast-components-react-msft';
import { omit } from 'lodash-es';

import { getText, ILocalized, LocalizationConsumer } from 'utility/loc-context';

interface IProps extends TextFieldProps {
    rowId: string;
    canSelectMode: boolean;
    modeSelection: 'text' | 'file';
    onModeChanged: (mode: 'text' | 'file') => void;
}

function GridTextOrFileKey(props: IProps & ILocalized) {
    const textTitle = getText('EditorGrid.GridKey.textLabel', props);
    const fileTitle = getText('EditorGrid.GridKey.fileLabel', props);

    const textFieldProps = React.useMemo(() => omit(props, 'rowId', 'canSelectMode', 'modeSelection', 'onModeChanged'), [props]);
    const isSelectVisible = props.canSelectMode;
    const textWidth = isSelectVisible ? 'calc(100% - 85px)' : 'calc(100% - 8px)';

    return (
        <div style={{width: '100%', height: '100%', position: 'relative'}}>
            <TextField
                {...textFieldProps}
                style={{
                    width: textWidth,
                    borderColor: 'transparent',
                    margin: '4px',
                }}
                />
            {isSelectVisible && (<Select
                onValueChange={(newValue, _selectedItems) => {
                    const mode = newValue as 'text' | 'file';
                    props.onModeChanged(mode);
                }}
                multiselectable={false}
                defaultSelection={[`${props.rowId}_typeselect_${props.modeSelection}`]}
                menuFlyoutConfig={{}}
                jssStyleSheet={{
                    select: {
                        zIndex: '500',
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '77px',
                    },
                }}
                displayStringFormatter={v => {
                    const selected = v[0].value;
                    return selected === 'text' ? textTitle : fileTitle;
                }}
                >
                <SelectOption 
                    value="text" 
                    id={`${props.rowId}_typeselect_text`}
                    key="text"
                    aria-label={textTitle}
                    >
                    {textTitle}
                </SelectOption>
                <SelectOption 
                    value="file" 
                    id={`${props.rowId}_typeselect_file`}
                    key="file"
                    aria-label={fileTitle}
                    >
                    {fileTitle}
                </SelectOption>
            </Select>)}
        </div>
    );
}

export default function LocalizedGridTextOrFileKey(props: IProps) {
    return (
        <LocalizationConsumer>
            {locale => (<GridTextOrFileKey {...props} locale={locale} />)}
        </LocalizationConsumer>
    );
}
