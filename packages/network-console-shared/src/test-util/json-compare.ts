// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// tslint:disable:no-unused-expression

import { expect } from 'chai';

export default function compareJson(actual: string, expected: string) {
    expect(JSON.parse(actual)).to.deep.equal(JSON.parse(expected));
}
