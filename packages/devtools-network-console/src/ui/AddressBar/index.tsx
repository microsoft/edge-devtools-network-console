// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { PrimaryButton, TextField, Button } from '@fluentui/react';
import { useDispatch } from 'react-redux';
import { HttpVerb } from 'network-console-shared';

import HttpVerbPicker from '../HttpVerbPicker';
import * as Styles from './styles';
import { setVerbAction, setUrlAction } from 'actions/request/basics';
import { saveRequestToHostAction } from 'actions/request/host';
import { executeRequestWithId } from 'actions/combined';
import { makeSelectCollectionForSaveAction } from 'actions/modal';

export interface IAddressBarProps {
    requestId: string;
    url: string;
    verb: HttpVerb;
    requiresSaveAs: boolean;

    canSave: boolean;
    isRequestDirty: boolean;
}

export default function AddressBar(props: IAddressBarProps) {
    const dispatch = useDispatch();

    return (
        <div {...Styles.ADDRESS_BAR_CONTAINER_STYLE}>
            <div {...Styles.VERB_PICKER_CONTAINER_STYLE}>
                <HttpVerbPicker
                    defaultVerb={props.verb}
                    onVerbPicked={v => {
                        dispatch(setVerbAction(props.requestId, v));
                    }}
                    />
            </div>
            <div {...Styles.URL_CONTAINER_STYLE}>
                <TextField
                    onChange={(_e, newValue) => {
                        const url = newValue || '';
                        dispatch(setUrlAction(props.requestId, url));
                    }}
                    onBlur={(_e) => {
                        
                    }}
                    autoFocus
                    value={props.url}
                    placeholder="Enter the URL to be requested here."
                    />
            </div>
            <div {...Styles.BUTTONS_CONTAINER_STYLE}>
                <PrimaryButton
                    text="Send"
                    onClick={e => {
                        dispatch(executeRequestWithId(props.requestId, /* isDownload: */ false));
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                    />
                {props.canSave && <Button
                    text="Save"
                    primaryDisabled={!props.isRequestDirty && !props.requiresSaveAs}
                    onClick={e => {
                        if (props.requiresSaveAs || e.ctrlKey) {
                            let parentRequest: string | null = null;
                            const lastSlash = props.requestId.lastIndexOf('/');
                            if (lastSlash > -1) {
                                parentRequest = props.requestId.substr(0, lastSlash);
                            }
                            dispatch(makeSelectCollectionForSaveAction(parentRequest, true));
                        }
                        else {
                            dispatch(saveRequestToHostAction(props.requestId));
                        }
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                    />}
            </div>
        </div>
    );
}
