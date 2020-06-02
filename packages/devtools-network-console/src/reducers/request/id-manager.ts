// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Map as IMap } from 'immutable';
import { INetConsoleParameter } from 'network-console-shared';

export function resetIDs<TParam extends INetConsoleParameter>(requestId: string, divider: string, headers: Iterable<TParam>): IMap<string, TParam> {
    let result = IMap<string, TParam>();
    let index = 0;
    for (const item of headers) {
        result = result.set(`${requestId}${divider}${index++}`, item);
    }
    return result;
}

export const ID_DIV_HEADER = 'H';
export const ID_DIV_FORM_DATA = 'FD';
export const ID_DIV_FORM_URLENCODED = 'UE';
export const ID_DIV_QUERY = 'QP';
export const ID_DIV_ROUTE = 'RP';
export const ID_DIV_ENVIRONMENT = 'ENV';
