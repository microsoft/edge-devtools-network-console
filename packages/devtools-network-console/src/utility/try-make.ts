// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export default function tryMake<TFrom, TTo>(maker: (from: TFrom) => TTo, from: TFrom): TTo | null {
    try {
        return maker(from);
    }
    catch (_e) {
        return null;
    }
}
