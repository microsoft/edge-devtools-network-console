// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// tslint:disable:no-unused-expression

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';
import Sinon, { spy } from 'sinon';

chai.use(chaiAsPromised);

import deprecate from '../deprecate';

describe('src/util/deprecate', () => {
    it('Calls console.warn in all cases', async () => {
        const warnSpy = spy();
        Sinon.replace(console, 'warn', warnSpy);

        deprecate('foo', 'bar');
        expect(warnSpy.lastCall.args[0]).to.equal('The API named "foo" has been deprecated and will be removed in a future version. A potential (but likely incompatible) API is called "bar".');
        deprecate('frob');
        expect(warnSpy.lastCall.args[0]).to.equal('The API named "frob" has been deprecated and will be removed in a future version.');

        Sinon.restore();
    });
});
