// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import ReactDOM from 'react-dom';
import { initializeIcons } from 'office-ui-fabric-react';
import { monaco } from '@monaco-editor/react';

import App from './App';

initializeIcons();
monaco
    .config({
        paths: {
            vs: 'https://devtools.azureedge.net/monaco/v0.20.0/vs',
        },
    });


// https://github.com/microsoft/edge-devtools-network-console/issues/2
// import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

// https://github.com/microsoft/edge-devtools-network-console/issues/2
// serviceWorker.unregister();
