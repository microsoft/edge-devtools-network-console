// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { IconButton } from '@fluentui/react';
import { Base64String, INetConsoleParameter } from 'network-console-shared';

import GridTextInput from './GridTextInput';
import * as Styles from '../styles';
import GridTextOrFileKey from './GridTextOrFileKey';
import GridFileInput from './GridFileInput';
import { mergeString } from 'utility/environment-merge';
import { getText, ILocalized, LocalizationConsumer } from 'utility/loc-context';

interface IGridRowPropsCommon {
    id: string;
    isNew: boolean;
    isNameFieldReadonly: boolean;
    hideDescriptionField: boolean;
    canBeFile: boolean;

    previewEnvironmentMerge: boolean;
    environmentVariables?: INetConsoleParameter[];

    initialEnabledValue: boolean;
    initialNameValue: string;
    initialValueValue: string;
    initialDescriptionValue: string;
    initialFileContents: Base64String;
    initialTypeForFileTextToggle: 'text' | 'file';

    onUpdate: (isNewRow: boolean, id: string, name: string, value: string, description: string, enabled: boolean) => void;
    onUpdateFile?:
        (mode: 'text' | 'file', fileName: string, fileContents: Base64String) => void;
}

interface IGridRowPropsWithoutDelete {
    isDeleteAllowed: false;
    onDelete: undefined;
}

interface IGridRowPropsWithDelete {
    isDeleteAllowed: true;
    onDelete: (id: string) => void;
}

export type IGridRowProps = IGridRowPropsCommon &
    (IGridRowPropsWithoutDelete | IGridRowPropsWithDelete);

function GridRow(props: IGridRowProps & ILocalized) {
    const name = props.initialNameValue;
    const value = props.initialValueValue;
    const desc = props.initialDescriptionValue;
    const enabled = props.initialEnabledValue;
    const canBeFile = props.canBeFile;

    let previewValue: string | undefined;
    if (props.previewEnvironmentMerge) {
        const merged = mergeString(value, props.environmentVariables || []);
        if (merged.hasSubstitutions) {
            previewValue = merged.value;
        }
    }

    return (
        <div {...Styles.GRID_ROW_STYLE}>
            <div {...Styles.ENABLED_CELL_STYLE}>
                <input
                    type="checkbox"
                    checked={props.initialEnabledValue}
                    onChange={e => {
                        const isEnabled = e.currentTarget.checked;
                        props.onUpdate(props.isNew, props.id, name, value, desc, isEnabled);
                    }}
                    aria-label={getText('EditorGrid.GridRow.enabledLabel', props)}
                    aria-hidden={props.isNew}
                    style={{ display: props.isNew ? 'none' : '' }}
                    className="editor-row-enabled-check"
                    {...Styles.ENABLED_CHECK_STYLE}
                    />
            </div>
            <div {...Styles.KEY_CELL_STYLE}>
                {canBeFile ?
                    <GridTextOrFileKey
                        canSelectMode={!props.isNew}
                        modeSelection={props.initialTypeForFileTextToggle || 'text'}
                        value={name}
                        placeholder={getText('EditorGrid.GridRow.keyLabel', props)}
                        readOnly={props.isNameFieldReadonly}
                        onChange={e => {
                            const newName = (e.target as HTMLInputElement).value;
                            if (newName !== props.initialNameValue) {
                                props.onUpdate(props.isNew, props.id, newName, value, desc, enabled);
                            }
                        }}
                        ariaLabel={getText('EditorGrid.GridRow.keyLabel', props)}
                        className="editor-row-key"
                        onModeChanged={newMode => {
                            let contents = props.initialFileContents;
                            let fileName = props.initialValueValue;
                            if (newMode === 'text') {
                                contents = '';
                                fileName = '';
                            }
                            props.onUpdateFile && props.onUpdateFile(newMode, fileName, contents);
                        }}
                        />
                    :
                    <GridTextInput
                        value={name}
                        placeholder={getText('EditorGrid.GridRow.keyLabel', props)}
                        readOnly={props.isNameFieldReadonly}
                        onChange={e => {
                            const newName = (e.target as HTMLInputElement).value;
                            if (newName !== props.initialNameValue) {
                                props.onUpdate(props.isNew, props.id, newName, value, desc, enabled);
                            }
                        }}
                        ariaLabel={getText('EditorGrid.GridRow.keyLabel', props)}
                        className="editor-row-key"
                        />
                }

            </div>
            <div {...Styles.VALUE_CELL_STYLE}>
                {props.canBeFile && props.initialTypeForFileTextToggle === 'file' ?
                    <GridFileInput
                        fileContents={props.initialFileContents}
                        fileName={props.initialValueValue}
                        onFileChanged={(fileName, contents) => {
                            props.onUpdateFile &&
                                props.onUpdateFile(props.initialTypeForFileTextToggle, fileName, contents);
                        }}
                        />
                    :
                    <GridTextInput
                        value={value}
                        placeholder={getText('EditorGrid.GridRow.valueLabel', props)}
                        onChange={e => {
                            const newValue = (e.target as HTMLInputElement).value;
                            if (newValue !== props.initialValueValue) {
                                props.onUpdate(props.isNew, props.id, name, newValue, desc, enabled);
                            }
                        }}
                        ariaLabel={getText('EditorGrid.GridRow.valueLabel', props)}
                        className="editor-row-value"
                        previewText={previewValue}
                        />
                }
            </div>
            {props.hideDescriptionField ? <></> :
            <div {...Styles.DESCRIPTION_CELL_STYLE}>
                <GridTextInput
                    value={desc}
                    placeholder={getText('EditorGrid.GridRow.descriptionLabel', props)}
                    onChange={e => {
                        const newDesc = (e.target as HTMLInputElement).value;
                        if (newDesc !== props.initialDescriptionValue) {
                            props.onUpdate(props.isNew, props.id, name, value, newDesc, enabled);
                        }
                    }}
                    ariaLabel={getText('EditorGrid.GridRow.descriptionLabel', props)}
                    className="editor-row-description"
                    />
            </div>
            }
            <div {...Styles.DELETE_CELL_STYLE}>
                <IconButton
                    {...Styles.DELETE_BUTTON_STYLE}
                    onClick={_e => {
                        props.isDeleteAllowed && props.onDelete(props.id);
                    }}
                    iconProps={{ iconName: 'Delete' }}
                    style={{ display: (props.isNew || !props.isDeleteAllowed) ? 'none' : '' }}
                    aria-label={getText('EditorGrid.GridRow.deleteLabel', props)}
                    className="editor-row-delete-btn"
                    />
            </div>
        </div>
    );
}

export default function LocalizedGridRow(props: IGridRowProps) {
    return (
        <LocalizationConsumer>
            {locale => (<GridRow {...props} locale={locale} />)}
        </LocalizationConsumer>
    );
}
