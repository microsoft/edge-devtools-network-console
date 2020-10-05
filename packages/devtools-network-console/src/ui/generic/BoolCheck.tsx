// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { getText, ILocalized, LocalizationConsumer } from 'utility/loc-context';

export interface IBoolCheckProps {
    isChecked: boolean;
}

function BoolCheck(props: IBoolCheckProps & ILocalized) {
    const label = props.isChecked ? 
        getText('BoolCheck.yesLabel', props) :
        getText('BoolCheck.noLabel', props);

    if (props.isChecked) {
        return <span aria-label={label}>✓</span>;
    }

    return <span aria-label={label} />;
}

function LocalizedBoolCheck(props: IBoolCheckProps) {
    return (
        <LocalizationConsumer>
            {locale => (<BoolCheck {...props} locale={locale} />)}
        </LocalizationConsumer>
    );
}

export default React.memo(LocalizedBoolCheck);
