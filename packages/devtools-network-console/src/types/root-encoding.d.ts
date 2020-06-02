// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

declare type BinaryString = string;

declare module '@root/encoding/bytes' {
    export function binToStr(bin: BinaryString): string;
    export function binToBuf(bin: BinaryString): Uint8Array;
    export function buftoBin(buf: Uint8Array): BinaryString;
    export function bufToStr(buf: Uint8Array): string;
    export function strToBin(str: string): BinaryString;
    export function strToBuf(str: string): Uint8Array;
}