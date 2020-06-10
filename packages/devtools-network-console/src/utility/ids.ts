// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Map } from 'immutable';

export function idToMap<T extends { id: string }>(items: T[]): Map<string, T> {
    return Map(items.map(t => [t.id, t]));
}
