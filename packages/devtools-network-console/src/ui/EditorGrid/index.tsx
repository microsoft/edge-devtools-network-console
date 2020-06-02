// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from 'react';
import { Map } from 'immutable';
import { Base64String, INetConsoleParameter, isFormDataParameter } from 'network-console-shared';

import GridHeader from './GridHeader';
import GridRow from './GridRow';

interface IEditorGridPropsCommon {
    rows: Map<string, INetConsoleParameter>;
    hideDescriptionField: boolean;
    hideAddRow?: boolean;
    isNameFieldReadonly: boolean;

    updateRow: (isNewRow: boolean, id: string, key: string, value: string, description: string, enabled: boolean) => void;

    canHaveFiles: boolean;
    updateRowFileInfo?: (id: string, mode: 'text' | 'file', fileName: string, fileContents: Base64String) => void;
    idStart: string;

    previewEnvironmentMerge: boolean;
    environmentVariables?: INetConsoleParameter[];
}
interface IEditorGridPropsWithDelete {
    isDeleteAllowed: true;
    deleteRow: (id: string) => void;
}

interface IEditorGridPropsWithoutDelete {
    isDeleteAllowed: false;
    deleteRow: undefined;
}

export type IEditorGridProps = IEditorGridPropsCommon & (
    IEditorGridPropsWithDelete | IEditorGridPropsWithoutDelete
);

export default function EditorGrid(props: IEditorGridProps) {
    if (props.canHaveFiles && !props.updateRowFileInfo) {
        throw new RangeError('Expected "updateRowFileInfo" for this EditorGrid.');
    }

    function* generateGridRows() {
        const rows = props.rows.toArray();
        for (const tuple of rows) {
            let fileType: 'text' | 'file' = 'text';
            const id = tuple[0];
            const row = tuple[1];
            let fileContents = '';
            if (isFormDataParameter(row)) {
                fileType = row.type;
                fileContents = row.fileContents || '';
            }
            yield (
                <GridRow
                    canBeFile={props.canHaveFiles}
                    onUpdateFile={(mode, fileName, contents) => {
                        props.updateRowFileInfo &&
                            props.updateRowFileInfo(id, mode, fileName, contents);
                    }}
                    initialFileContents={fileContents}
                    initialTypeForFileTextToggle={fileType}
                    id={id}
                    key={id}
                    hideDescriptionField={props.hideDescriptionField}
                    isNameFieldReadonly={props.isNameFieldReadonly}
                    initialDescriptionValue={row.description}
                    initialEnabledValue={row.isActive}
                    initialNameValue={row.key}
                    initialValueValue={row.value}
                    isNew={false}
                    isDeleteAllowed={props.isDeleteAllowed as any}
                    onUpdate={(isNew, id, name, value, description, enabled) => {
                        props.updateRow(isNew, id, name, value, description, enabled);
                    }}
                    onDelete={props.deleteRow as any}
                    previewEnvironmentMerge={props.previewEnvironmentMerge}
                    environmentVariables={props.environmentVariables}
                    />
            )
        }

        if (!props.hideAddRow) {
            const newRowId = `${props.idStart}${rows.length}`;
            yield (
                <GridRow
                    canBeFile={props.canHaveFiles}
                    initialFileContents=""
                    initialTypeForFileTextToggle="text"
                    id={newRowId}
                    key={newRowId}
                    hideDescriptionField={props.hideDescriptionField}
                    isNameFieldReadonly={props.isNameFieldReadonly}
                    initialDescriptionValue=""
                    initialEnabledValue={true}
                    initialNameValue=""
                    initialValueValue=""
                    isNew={true}
                    isDeleteAllowed={props.isDeleteAllowed as any}
                    onUpdate={(isNew, id, name, value, description, enabled) => {
                        props.updateRow(isNew, id, name, value, description, enabled);
                    }}
                    onDelete={props.deleteRow as any}
                    previewEnvironmentMerge={false}
                    />
            );
        }
    }

    const [keyColumnWidth, setKeyColumnWidth] = useState(35);
    const [valueColumnWidth, setValueColumnWidth] = useState(35);
    const [descriptionColumnWidth, setDescriptionColumnWidth] = useState(props.hideDescriptionField ? 0 : 30);
    useEffect(() => {
        setDescriptionColumnWidth(props.hideDescriptionField ? 0 : 30);
    }, [props.hideDescriptionField]);

    const outerStyle = {
        '--grid-key-column-width': `${keyColumnWidth}fr`,
        '--grid-value-column-width': `${valueColumnWidth}fr`,
        '--grid-description-column-width': `${descriptionColumnWidth}fr`,
    };
    return (
        <div style={outerStyle as any}>
            <GridHeader
                hideDescriptionField={props.hideDescriptionField}
                onResize={(key, value, desc) => {
                    setKeyColumnWidth(key);
                    setValueColumnWidth(value);
                    setDescriptionColumnWidth(desc);
                }}
                />

            {Array.from(generateGridRows())}
        </div>
    );
}
