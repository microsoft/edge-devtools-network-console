// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import * as Styles from './styles';
import LocalAlert from 'ui/generic/LocalAlert'
import LocText from 'ui/LocText';

export default function NoBody() {
    return (
        <div {...Styles.NO_BODY_TEXT}>
            <LocalAlert type="info">
                <LocText textKey="RequestEditor.NoBody.message" />
            </LocalAlert>
        </div>
    );
}
