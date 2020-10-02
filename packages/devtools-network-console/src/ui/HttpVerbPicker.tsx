// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { Select, SelectOption } from '@microsoft/fast-components-react-msft';
import { HttpVerb, i18n } from 'network-console-shared';

import { KNOWN_HTTP_VERBS } from 'data';
import { ILocalized, LocalizationConsumer } from 'utility/loc-context';

export interface IHttpVerbPickerProps {
    defaultVerb: HttpVerb;
    onVerbPicked: (verb: HttpVerb) => void;
}

function HttpVerbPicker(props: IHttpVerbPickerProps & ILocalized) {
    return (
        <Select
            title={i18n.getMessage('HttpVerbPicker.title', '', { language: props.locale })}
            onValueChange={(newValue, _selectedItems) => {
                props.onVerbPicked(newValue as HttpVerb);
            }}
            multiselectable={false}
            defaultSelection={[props.defaultVerb]}
            menuFlyoutConfig={{

            }}
            jssStyleSheet={{
                select: {
                    width: '205px',
                    zIndex: '500',
                    position: 'relative',
                },
            }}
            >
            {KNOWN_HTTP_VERBS.map(verb => {
                return (
                    <SelectOption
                        id={verb.name}
                        value={verb.name}
                        translate="no"
                    >
                        {verb.name}
                    </SelectOption>
                );
            })}
        </Select>
    );
}

export default function LocalizedHttpVerbPicker(props: IHttpVerbPickerProps) {
    return (
        <LocalizationConsumer>
            {locale => <HttpVerbPicker {...props} locale={locale} />}
        </LocalizationConsumer>
    );
}
