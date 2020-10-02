// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { i18n } from 'network-console-shared';
import { LocalizationConsumer } from 'utility/loc-context';

interface ITextProps {
    textKey: string;
}

function LocText({ textKey: key }: ITextProps) {
    return (
        <LocalizationConsumer>
            {locale => {
                let message = i18n.getMessage(key, '', { language: locale });
                if (!message) {
                    message = `[LOC FAILED] (${locale}) ${key}`;
                }
                return message;
            }}
        </LocalizationConsumer>
    );
}

export default React.memo(LocText);
