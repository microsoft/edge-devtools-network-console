// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import createApplicationHost, { AllowableApplicationHosts } from '../host';

function checkForHost(kind: AllowableApplicationHosts) {
    const test = `host=${kind}`;
    if (window.location.search.indexOf(test) > -1) {
        return true;
    }
    if (window.location.hash.indexOf(test) > -1) {
        return true;
    }

    return false;
}

let hostType: AllowableApplicationHosts = 'web';
if (checkForHost('vscode')) {
    hostType = 'vscode';
}
else if (checkForHost('edge')) {
    hostType = 'edge';
}

export const AppHost = createApplicationHost(hostType);
