// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { TreeView, TreeViewItem } from '@microsoft/fast-components-react-msft';
import { IHostCollection } from 'network-console-shared';

import { Dispatch } from 'redux';
import { makeChooseCollectionForSaveAction } from 'actions/modal';

export interface ISaveToCollectionProps {
    rootCollections: IHostCollection[];
}

export default function SaveToCollection(props: ISaveToCollectionProps) {
    const dispatch = useDispatch();

    function renderItem(this: Dispatch<any>, item: IHostCollection) {
        return (
            <TreeViewItem
                titleContent={item.name}
                key={item.id}
                onSelected={_e => {
                    dispatch(makeChooseCollectionForSaveAction(item.id));
                }}
                >
                {item.children.map(renderItem)}
            </TreeViewItem>
        );
    }

    return (
        <TreeView>
            {props.rootCollections.map(renderItem)}
        </TreeView>
    );
}
