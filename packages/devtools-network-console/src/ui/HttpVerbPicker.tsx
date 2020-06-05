// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { ComboBox, IComboBoxOption } from 'office-ui-fabric-react';
import { HttpVerb } from 'network-console-shared';

import { IHttpVerbDef, KNOWN_HTTP_VERBS } from 'data';

export interface IHttpVerbPickerProps {
    defaultVerb: HttpVerb;
    onVerbPicked: (verb: HttpVerb) => void;
}

function verbDefinitionToOption(verb: IHttpVerbDef): IComboBoxOption {
    return {
        key: verb.name,
        text: verb.name,
        ariaLabel: verb.description,
        data: verb,
        title: verb.description,
    };
}
const HTTP_VERB_OPTIONS: IComboBoxOption[] =
    KNOWN_HTTP_VERBS.map(verbDefinitionToOption);

export default function HttpVerbPicker(props: IHttpVerbPickerProps) {

    return (
        <ComboBox
            options={HTTP_VERB_OPTIONS}
            selectedKey={props.defaultVerb}
            autoComplete="on"
            placeholder="METHOD"
            allowFreeform={true}
            onChange={(_e, option, _index, value) => props.onVerbPicked((option ? option.text : value) as HttpVerb)}
            openOnKeyboardFocus={true}
            />
    );
}
