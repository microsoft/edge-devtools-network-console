// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { initializeIcons } from 'office-ui-fabric-react';
import ViewSelect from './ui/ViewSelect';
import store from 'store';
import { Provider } from 'react-redux';
import ModalManager from './ui/ModalManager';
import ErrorBoundary from 'ui/ErrorBoundary';

initializeIcons();

const App: React.FC = () => {
    return (
        <div className="App">
            <Provider store={store}>
                <ErrorBoundary>
                    <ViewSelect />
                    <ModalManager />
                </ErrorBoundary>
            </Provider>
        </div>
    );
}

export default App;
