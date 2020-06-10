// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function toESMap<T, TKey>(source: T[], keySelector: (item: T) => TKey): Map<TKey, T> {
    return source.reduce((accum, item) => {
        const key = keySelector(item);
        accum.set(key, item);
        return accum;
    }, new Map<TKey, T>());
}
