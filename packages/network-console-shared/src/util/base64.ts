// Copyright (c) Microsoft Corporation
// Licensed under the MIT License

import { base64 } from 'rfc4648';
export type Base64String = string & { __isB64String?: void; };

export function toB64(source: string): Base64String {
    if (source === '') {
        return source;
    }
    const encoder = new TextEncoder();
    const u8a = encoder.encode(source);
    const b64 = base64.stringify(u8a);
    return b64;
}

export function strFromB64(source: Base64String): string {
    if (source === '') {
        return source;
    }
    const u8a = base64.parse(source);
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(u8a);
}

export function binFromB64(source: Base64String): ArrayBuffer {
    const u8a = base64.parse(source);
    return u8a.buffer;
}

export function binToB64(source: ArrayBuffer): Base64String {
    const u8a = new Uint8Array(source);
    const encoded = base64.stringify(u8a);
    return encoded;
}
