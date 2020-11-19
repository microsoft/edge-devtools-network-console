// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { LocalizationConsumer, getText } from 'utility/loc-context';

interface ITextProps {
    textKey: string;
}

function LocText({ textKey }: ITextProps) {
    return (
        <LocalizationConsumer>
            {locale => getText(textKey, { locale })}
        </LocalizationConsumer>
    );
}

export default React.memo(LocText);
