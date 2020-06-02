// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import hash = require('hash-sum');

/**
 * Produces an 8-character hash for file contents.
 * @param contents a string or arraybuffer to hash.
 */
export default function digest(contents: string | ArrayBufferLike): string {
    return hash(contents);
}
