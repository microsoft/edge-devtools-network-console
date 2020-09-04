// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// tslint:disable:no-unused-expression

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';
import { spy } from 'sinon';

chai.use(chaiAsPromised);

import lazy from '../lazy';

describe('src/util/lazy', () => {
    it('is not produced until after the return function is called, and is only called once', async () => {
        const producer = () => 42;
        const producerSpy = spy(producer);
        const test = lazy(producerSpy);

        expect(producerSpy.callCount).to.equal(0);
        expect(test()).to.equal(42);
        expect(producerSpy.callCount).to.equal(1);
        expect(test()).to.equal(42);
        expect(producerSpy.callCount).to.equal(1);
    });

    it('re-throws an error if the producer throws, and the producer is only called once', async () => {
        const producer = () => {
            throw new RangeError('This is an expected failure.');
        };
        const producerSpy = spy(producer);
        const test = lazy(producerSpy);

        expect(test).to.throw(RangeError);
        expect(test).to.throw(RangeError);
        expect(producerSpy.callCount).to.equal(1);
    });
});
