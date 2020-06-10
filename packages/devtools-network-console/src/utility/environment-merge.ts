// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { INetConsoleParameter, isFormDataParameter } from 'network-console-shared';

import { toESMap } from 'utility';

export function mergeEnvironments(params: INetConsoleParameter[], environment: INetConsoleParameter[]): INetConsoleParameter[] {
    const active = environment.filter(e => e.isActive);
    const map = toESMap(active, e => e.key);

    return params.map(p => {
        if (isFormDataParameter(p) && p.type === 'file') {
            return p;
        }

        const { value } = mergeStringWithDurableMap(p.value, map);
        const { description, isActive, key } = p;
        return {
            description,
            isActive,
            key,
            value,
        };
    });
}

export function mergeString(s: string, environment: INetConsoleParameter[]): { value: string; hasSubstitutions: boolean; } {
    const active = environment.filter(e => e.isActive);
    const map = toESMap(active, e => e.key);

    return mergeStringWithDurableMap(s, map);
}

export function mergeStringWithDurableMap(s: string, environment: Map<string, INetConsoleParameter>): { value: string; hasSubstitutions: boolean; } {
    const re = /{{(.+?)}}/g;
    let hasSubstitutions = false;
    const value = s.replace(re, match => {
        hasSubstitutions = true;
        const key = match.substr(2, match.length - 4);
        const param = environment.get(key);
        if (!!param) {
            return param.value;
        }
        else {
            return match;
        }
    });

    return {
        value,
        hasSubstitutions,
    };
}
