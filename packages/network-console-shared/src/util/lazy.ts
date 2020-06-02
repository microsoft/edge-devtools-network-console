// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const UNINITIALIZED = Symbol('uninitialized');
const ERROR_STATE = Symbol('error');
export default function lazy<T>(producer: () => T): Lazy<T> {
    let value: any = UNINITIALIZED;
    let error: Error | null = null;

    return () => {
        if (value === ERROR_STATE) {
            throw error;
        }
        else if (value !== UNINITIALIZED) {
            return value;
        }

        try {
            value = producer();
            return value;
        }
        catch (err) {
            error = err;
            value = ERROR_STATE;
            throw error;
        }
    };
}

export type Lazy<T> = () => T;