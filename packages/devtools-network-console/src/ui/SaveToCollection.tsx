// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { AccentButton, TreeView, TreeViewItem, Typography, TypographySize } from '@microsoft/fast-components-react-msft';
import { IHostCollection } from 'network-console-shared';

import { Dispatch } from 'redux';
import { makeChooseCollectionForSaveAction, requestHostCreateNewCollection } from 'actions/modal';
import Stack from './generic/Stack';
import LocText from './LocText';

export interface ISaveToCollectionProps {
    rootCollections: IHostCollection[];
    selectedCollectionId: string | null;
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
                selected={props.selectedCollectionId === item.id}
                >
                {item.children.map(renderItem)}
            </TreeViewItem>
        );
    }

    if (props.rootCollections.length) {
        return (
            <TreeView>
                {props.rootCollections.map(renderItem)}
            </TreeView>
        );
    }

    return (
        <Stack center>
            <Typography size={TypographySize._7}>
                <LocText textKey="SaveToCollection.noCollections" />
            </Typography>
            <AccentButton onClick={_e => {
                dispatch(requestHostCreateNewCollection());
            }}>
                <LocText textKey="SaveToCollection.createNewCollectionLabel" />
            </AccentButton>
        </Stack>
    );
}
