// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { DataGridHeaderRenderConfig } from '@microsoft/fast-components-react-base';

import LocText from 'ui/LocText';

interface ITableHeaderPropsBase {
    config: DataGridHeaderRenderConfig;
    /**
     * The base path into the localization strings.
     */
    locBase?: string;

    bypassLoc?: boolean;
}

interface ILocalizedTableHeaderProps {
    /**
     * The base path into the localization strings. The complete localization key will be formed 
     * as `${locBase}.${config.title}`.
     */
    locBase: string;
}

interface INonLocalizedTableHeaderProps {
    bypassLoc: true;
}

type ITableHeaderProps = ITableHeaderPropsBase & (ILocalizedTableHeaderProps | INonLocalizedTableHeaderProps);

export default function TableHeader({ config, locBase, bypassLoc = false }: ITableHeaderProps) {
    return (
        <div className={config.classNames} role="columnheader" style={{gridColumn: `${config.columnIndex + 1} / auto`, textAlign: 'center'}}>
            {bypassLoc ? (config.title) : <LocText textKey={`${locBase}.${config.title}`} />}
        </div>
    );
}
