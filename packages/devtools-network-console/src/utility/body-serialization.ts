// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { binFromB64, INetConsoleParameter, isFormDataParameter } from 'network-console-shared';

import { mergeEnvironments } from './environment-merge';

export async function calculateFormDataBody(entries: INetConsoleParameter[], environment: INetConsoleParameter[]): Promise<{ body: string; boundary: string; }> {
    const formData = new FormData();
    for (const entry of mergeEnvironments(entries, environment)) {
        if (entry.isActive) {
            if (isFormDataParameter(entry) && entry.type === 'file' && entry.fileContents) {
                const bits = binFromB64(entry.fileContents);
                const file = new File([bits], entry.value);
                formData.append(entry.key, file, entry.value);
            }
            else {
                formData.append(entry.key, entry.value);
            }
        }
    }
    const req = new Request('ignore:///', { method: 'POST', body: formData });
    const ab = await req.arrayBuffer();

    const utf8 = new TextDecoder('utf-8');
    const body = utf8.decode(ab);

    const boundaryFinder = /--(.+?)\s/m.exec(body);
    const boundary = boundaryFinder![1];
    return { body, boundary };
}

export async function calculateUrlEncodedDataBody(entries: INetConsoleParameter[], environment: INetConsoleParameter[]): Promise<string> {
    const params = new URLSearchParams();
    for (const entry of mergeEnvironments(entries, environment)) {
        if (entry.isActive) {
            params.append(entry.key, entry.value);
        }
    }

    const req = new Request('ignore:///', { method: 'POST', body: params });
    const ab = await req.arrayBuffer();

    const utf8 = new TextDecoder('utf-8');
    return utf8.decode(ab);
}
