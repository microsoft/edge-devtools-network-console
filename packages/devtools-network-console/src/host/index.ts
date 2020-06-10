// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { INetConsoleHost } from './interfaces';
import WebApplicationHost from './web-application-host';
import VsCodeApplicationHost from './vscode-application-host';
import EdgeApplicationHost from './edge-application-host';

export type AllowableApplicationHosts = 'vscode' | 'edge' | 'web' | 'default';

export default function createApplicationHost(kind: AllowableApplicationHosts): INetConsoleHost {
    switch (kind) {
        case 'vscode':
            return new VsCodeApplicationHost();
        case 'edge':
            return new EdgeApplicationHost();

        case 'web':
        case 'default':
        default:
            return new WebApplicationHost();
    }
}
