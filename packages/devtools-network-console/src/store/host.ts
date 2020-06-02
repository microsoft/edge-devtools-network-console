// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import createApplicationHost, { AllowableApplicationHosts } from '../host';

let hostType: AllowableApplicationHosts = 'web';
if (window.location.search.indexOf('host=vscode') > -1) {
    hostType = 'vscode';
}
else if (window.location.search.indexOf('host=edge') > -1) {
    hostType = 'edge';
}

export const AppHost = createApplicationHost(hostType);
