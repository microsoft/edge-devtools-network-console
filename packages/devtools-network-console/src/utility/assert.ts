// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export default function assert(test: boolean, error: string): void | never {
    if (!test) {
        throw new AssertionError(error);
    }
}

class AssertionError extends Error {
    constructor(msg: string) {
        super('Assertion failed: ' + msg);
    }
}
