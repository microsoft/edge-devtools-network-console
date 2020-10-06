// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { TextField, AccentButton, NeutralButton } from '@microsoft/fast-components-react-msft';
import { useDispatch } from 'react-redux';
import { HttpVerb } from 'network-console-shared';

import HttpVerbPicker from '../HttpVerbPicker';
import * as Styles from './styles';
import { setVerbAction, setUrlAction } from 'actions/request/basics';
import { saveRequestToHostAction } from 'actions/request/host';
import { executeRequestWithId } from 'actions/combined';
import { makeSelectCollectionForSaveAction } from 'actions/modal';
import LocText from 'ui/LocText';
import { getText, ILocalized, LocalizationConsumer } from 'utility/loc-context';

export interface IAddressBarProps {
    requestId: string;
    url: string;
    verb: HttpVerb;
    requiresSaveAs: boolean;

    canSave: boolean;
    isRequestDirty: boolean;
}

function AddressBar(props: IAddressBarProps & ILocalized) {
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
                    onChange={e => {
                        const newValue = e.target.value;
                        const url = newValue || '';
                        dispatch(setUrlAction(props.requestId, url));
                    }}
                    style={{ width: '100%' }}
                    autoFocus
                    value={props.url}
                    placeholder={getText('AddressBar.placeholder', props)}
                    />
            </div>
            <div {...Styles.BUTTONS_CONTAINER_STYLE}>
                <AccentButton
                    onClick={e => {
                        dispatch(executeRequestWithId(props.requestId, /* isDownload: */ false));
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >
                    <LocText textKey="AddressBar.send" />
                </AccentButton>
                {props.canSave && (
                <NeutralButton
                    disabled={!props.isRequestDirty && !props.requiresSaveAs}
                    title={getText('AddressBar.saveTitle', props)}
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
                >
                    <LocText textKey="AddressBar.save" />
                </NeutralButton>)}
            </div>
        </div>
    );
}

export default function LocalizedAddressBar(props: IAddressBarProps) {
    return (
        <LocalizationConsumer>
            {locale => <AddressBar {...props} locale={locale} />}        
        </LocalizationConsumer>
    );
}
