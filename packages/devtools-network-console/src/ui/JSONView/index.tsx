// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { TreeView, TreeViewItem } from '@microsoft/fast-components-react-msft';
import { LocalizationConsumer, getText } from 'utility/loc-context';
import Property from './Property';

interface IJSONViewProps {
    value: any;
}

function produceChildren(value: any, depth: number) {
    if (typeof value !== 'object' || value === null) {
        return undefined;
    }

    let children: Array<React.ReactNode>;
    const isArray = Array.isArray(value);
    if (isArray) {
        children = Array.from(produceArrayChildren(value, depth));
    }
    else {
        children = Array.from(produceObjectChildren(value, depth));
    }
    return children;
}

function* produceObjectChildren(value: object, depth: number): IterableIterator<React.ReactNode> {
    const keys = Object.keys(value);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const childValue = (value as Record<string, unknown>)[key];
        const itemProps = {
            key,
            className: 'json-tree-view-item-can-wrap',
            titleContent: (<Property keyKind="string" name={key} value={childValue} />),
            'aria-level': depth,
        };

        if (typeof childValue === 'object' && childValue !== null && Object.keys(childValue).length > 0) {
            yield <TreeViewItem
                        {...itemProps}
                        children={produceChildren(childValue, depth + 1)}
                        />;
        }
        else {
            yield <TreeViewItem {...itemProps} />;
        }
    }
}

function* produceArrayChildren(value: Array<unknown>, depth: number): IterableIterator<React.ReactNode> {
    for (let i = 0; i < value.length; i++) {
        const childValue = value[i];
        const itemProps = {
            key: i,
            className: 'json-tree-view-item-can-wrap',
            titleContent: (<Property keyKind="number" name={i} value={childValue} />),
            'aria-level': depth,
        };

        if (typeof childValue === 'object' && childValue !== null && Object.keys(childValue).length > 0) {
            yield <TreeViewItem
                        {...itemProps}
                        children={produceChildren(childValue, depth + 1)}
                        />;
        }
        else {
            yield <TreeViewItem {...itemProps} />;
        }
    }
}

function JSONViewComposed(props: IJSONViewProps) {
    return (
        <LocalizationConsumer>
            {locale => {
                return (
                    <TreeView>
                        <TreeViewItem
                            className="json-tree-view-item-can-wrap"
                            titleContent={<Property keyKind="string" name={getText('JSONView.rootElement.title', { locale })} value={props.value} />}
                            children={produceChildren(props.value, 1)}
                            aria-level={0}
                            defaultExpanded
                            />
                    </TreeView>
                );
            }}
        </LocalizationConsumer>
    );
}

const JSONViewComposedMemoized = React.memo(JSONViewComposed);
export default JSONViewComposedMemoized;
