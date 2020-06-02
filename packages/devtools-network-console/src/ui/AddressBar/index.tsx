// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { PrimaryButton, TextField, Button } from 'office-ui-fabric-react';
import { useDispatch } from 'react-redux';
import { HttpVerb } from 'network-console-shared';

import HttpVerbPicker from '../HttpVerbPicker';
import * as Styles from './styles';
import { setVerbAction, setUrlAction } from 'actions/request/basics';
import { saveRequestToHostAction } from 'actions/request/host';
import { executeRequestWithId } from 'actions/combined';
import { makeSelectCollectionForSaveAction } from 'actions/modal';
import { DEFAULT_EMPTY_REQUEST_ID } from 'actions/common';

export interface IAddressBarProps {
    requestId: string;
    url: string;
    verb: HttpVerb;

    canSave: boolean;
    isRequestDirty: boolean;
}

export default function AddressBar(props: IAddressBarProps) {
    const dispatch = useDispatch();
    const [url, setUrl] = React.useState('');
    React.useEffect(() => {
        setUrl(props.url);
    }, [props.url]);

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
                        setUrl(newValue || '');
                    }}
                    onBlur={(_e) => {
                        dispatch(setUrlAction(props.requestId, url));
                    }}
                    value={url}
                    placeholder="Enter the URL to be requested here."
                    styles={{
                        fieldGroup: Styles.ADDRESS_TEXT_CSS,
                    }}
                    />
            </div>
            <div {...Styles.BUTTONS_CONTAINER_STYLE}>
                <PrimaryButton
                    text="Send"
                    split
                    menuProps={{
                        items: [
                            {
                                key: 'sendAndDownload',
                                text: 'Send and Download Result',
                                iconProps: { iconName: 'download' },
                                onClick: e => {
                                    dispatch(executeRequestWithId(props.requestId, true));
                                    e && e.stopPropagation() && e.preventDefault();
                                },
                            },
                        ],
                    }}
                    onClick={e => {
                        dispatch(executeRequestWithId(props.requestId, /* isDownload: */ false));
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                    {...Styles.BUTTON_STYLE}
                    {...Styles.SAVE_BUTTON_STYLE}
                    />
                {props.canSave && <Button
                    text="Save"
                    primaryDisabled={!props.isRequestDirty && props.requestId !== DEFAULT_EMPTY_REQUEST_ID}
                    onClick={e => {
                        if (props.requestId === DEFAULT_EMPTY_REQUEST_ID) {
                            dispatch(makeSelectCollectionForSaveAction(null, true));
                        }
                        else {
                            dispatch(saveRequestToHostAction(props.requestId));
                        }
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                    split
                    menuProps={{
                        items: [
                            {
                                key: 'saveToFolder',
                                text: 'Save into another folder',
                                iconProps: { iconName: 'save' },
                                onClick: e => {
                                    let parentRequest: string | null = null;
                                    const lastSlash = props.requestId.lastIndexOf('/');
                                    if (lastSlash > -1) {
                                        parentRequest = props.requestId.substr(0, lastSlash);
                                    }
                                    dispatch(makeSelectCollectionForSaveAction(parentRequest, true));
                                },
                            },
                        ],
                    }}
                    {...Styles.BUTTON_STYLE}
                    {...Styles.SAVE_BUTTON_STYLE}
                    />}
            </div>
        </div>
    );
}
