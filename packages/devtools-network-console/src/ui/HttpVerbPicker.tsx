// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { Select, SelectOption } from '@microsoft/fast-components-react-msft';
import { HttpVerb } from 'network-console-shared';

import { KNOWN_HTTP_VERBS } from 'data';
import { getText, ILocalized, LocalizationConsumer } from 'utility/loc-context';

export interface IHttpVerbPickerProps {
    defaultVerb: HttpVerb;
    onVerbPicked: (verb: HttpVerb) => void;
}

function HttpVerbPicker(props: IHttpVerbPickerProps & ILocalized) {
    return (
        <Select
            title={getText('HttpVerbPicker.title', props)}
            onValueChange={(newValue, _selectedItems) => {
                props.onVerbPicked(newValue as HttpVerb);
            }}
            multiselectable={false}
            defaultSelection={[props.defaultVerb]}
            menuFlyoutConfig={{

            }}
            jssStyleSheet={{
                select: {
                    width: '92px',
                },
            }}
            >
            {KNOWN_HTTP_VERBS.map(verb => {
                return (
                    <SelectOption
                        key={verb.name}
                        id={verb.name}
                        value={verb.name}
                        aria-label={getText(verb.descriptionKey, props)}
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
