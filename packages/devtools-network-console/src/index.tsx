// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// https://github.com/microsoft/edge-devtools-network-console/issues/2
// import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

// https://github.com/microsoft/edge-devtools-network-console/issues/2
// serviceWorker.unregister();
