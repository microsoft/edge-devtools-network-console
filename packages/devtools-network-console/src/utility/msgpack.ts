// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { encode, decode } from 'msgpack-lite';
import { Base64String, binToB64, binFromB64 } from 'network-console-shared';

export function packMessage(message: any): Base64String {
    const buf = encode(message);
    return binToB64(buf);
}

export function unpackMessage(message: Base64String): any {
    const buf = binFromB64(message);
    return decode(new Uint8Array(buf));
}
