// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Checkbox, ActionTrigger, ActionTriggerProps } from '@microsoft/fast-components-react-msft';
import { DesignSystem } from '@microsoft/fast-components-styles-msft';
import { Base64String, INetConsoleParameter } from 'network-console-shared';

import GridTextInput from './GridTextInput';
import * as Styles from '../styles';
import GridTextOrFileKey from './GridTextOrFileKey';
import GridFileInput from './GridFileInput';
import { mergeString } from 'utility/environment-merge';
import { getText, ILocalized, LocalizationConsumer } from 'utility/loc-context';
import { DesignSystemConsumer } from '@microsoft/fast-jss-manager-react';
import { focusNextGridElement } from 'utility/editor-grid-dom-utils';

interface IGridRowPropsCommon {
    id: string;
    isNew: boolean;
    isNameFieldReadonly: boolean;
    hideDescriptionField: boolean;
    canBeFile: boolean;

    fallbackFocusTargetSelector: string;

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

const DeleteIcon = ({ color }: { color: string; }) => <svg width="16" height="16" viewBox="90 4 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M103 8.33L101.67 7 98 10.67 94.33 7 93 8.33 96.67 12 93 15.67 94.33 17 98 13.33l3.67 3.67 1.33-1.33L99.33 12z" fill={color} /></svg>;

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

    let classNames = 'nc-editor-row';
    if (props.isNew) {
        classNames += ' nc-editor-row-uncommitted';
    }

    return (
        <div {...Styles.GRID_ROW_STYLE} className={classNames}>
            <div {...Styles.ENABLED_CELL_STYLE}>
                <Checkbox
                    checked={props.initialEnabledValue}
                    inputId={`${props.id}__checkbox_enabled`}
                    onChange={(e?: any) => {
                        if (e) {
                            const isEnabled = e.currentTarget.checked;
                            props.onUpdate(props.isNew, props.id, name, value, desc, isEnabled);
                        }
                    }}
                    aria-label={getText('EditorGrid.GridRow.enabledLabel', props)}
                    aria-hidden={props.isNew}
                    style={{ display: props.isNew ? 'none' : '', paddingLeft: '3px' }}
                    className="editor-row-enabled-check"
                    {...Styles.ENABLED_CHECK_STYLE}
                    />
            </div>
            <div {...Styles.KEY_CELL_STYLE} className="nc-editor-cell-key">
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
                        aria-label={getText('EditorGrid.GridRow.keyLabel', props)}
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
                        rowId={props.id}
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
                        aria-label={getText('EditorGrid.GridRow.keyLabel', props)}
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
                        aria-label={getText('EditorGrid.GridRow.valueLabel', props)}
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
                    aria-label={getText('EditorGrid.GridRow.descriptionLabel', props)}
                    className="editor-row-description"
                    />
            </div>
            }
            <div {...Styles.DELETE_CELL_STYLE}>
                <DeleteButton
                    onClick={e => {
                        if (props.isDeleteAllowed) {
                            // TODO: Fix the 'null' pass here
                            focusNextGridElement(e.target as HTMLButtonElement, props.fallbackFocusTargetSelector);
                            requestAnimationFrame(() => {
                                props.onDelete(props.id);
                            });
                        }
                    }}
                    style={{ display: (props.isNew || !props.isDeleteAllowed) ? 'none' : '', padding: '4px', margin: '4px' }}
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

function DeleteButton(props: Omit<ActionTriggerProps, 'glyph'>) {
    const darkFill = 'rgb(80, 173, 235)';
    const darkFillHover = 'rgb(17, 119, 187)';
    const lightFill = 'rgb(80, 173, 235)';
    const lightFillHover = 'rgb(17, 119, 187)';
    const [hover, setHoverState] = React.useState(false);

    return (
        <DesignSystemConsumer>
            {system => {
                const designSystem: DesignSystem = system as any as DesignSystem;
                const isLight = designSystem.backgroundColor === '#FFFFFF';

                const hoverFill = isLight ? lightFillHover : darkFillHover;
                const nonHoverFill = isLight ? lightFill : darkFill;

                return (
                    <ActionTrigger
                        {...props}
                        onMouseEnter={() => setHoverState(true)}
                        onMouseLeave={() => setHoverState(false)}
                        glyph={() => <DeleteIcon color={hover ? hoverFill : nonHoverFill} />}
                        />
                )
            }}
        </DesignSystemConsumer>
    )
}