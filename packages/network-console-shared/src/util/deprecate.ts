// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export default function deprecated(apiName: string, replacement?: string) {
    if (replacement) {
        console.warn(`The API named "${apiName}" has been deprecated and will be removed in a future version. A potential (but likely incompatible) API is called "${replacement}".`);
    }
    else {
        console.warn(`The API named "${apiName}" has been deprecated and will be removed in a future version.`);
    }
}
