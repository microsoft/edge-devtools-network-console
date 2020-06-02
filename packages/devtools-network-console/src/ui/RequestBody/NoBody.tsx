// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import * as Styles from './styles';
import { MessageBar } from 'office-ui-fabric-react';

export default function NoBody() {
    return (
        <div {...Styles.NO_BODY_TEXT}>
            <MessageBar>
                To include a request body, choose one of the other modes above.
            </MessageBar>
        </div>
    );
}
