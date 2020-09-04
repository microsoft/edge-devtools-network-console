// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// tslint:disable:no-unused-expression

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';
import { stub } from 'sinon';

chai.use(chaiAsPromised);

import IdIndexMap from '../id-index-map';

describe('src/util/id-index-map', () => {
    it('initializes with no entries', async () => {
        const map = new IdIndexMap();
        expect(Array.from(map.entries())).to.be.empty;
        expect(Array.from(map.keys())).to.be.empty;
        expect(Array.from(map.values())).to.be.empty;
    });

    it('add/entries()/keys()/values() gets a correct basic set.', async () => {
        const map = new IdIndexMap();
        map.set('a/b/0', 0);
        map.set('a/b/1', 1);
        map.set('a/b/2', 2);

        expect(Array.from(map.entries())).to.deep.equal([
            ['a/b/0', 0],
            ['a/b/1', 1],
            ['a/b/2', 2],
        ]);

        expect(Array.from(map.keys())).to.deep.equal([
            'a/b/0',
            'a/b/1',
            'a/b/2',
        ]);

        expect(map.getByKey('a/b/0')).to.equal(0);
        expect(map.getByValue(2)).to.equal('a/b/2');

        expect(Array.from(map.values())).to.deep.equal([0, 1, 2]);
    });

    it('forEach calls back with correct values', async () => {
        const map = new IdIndexMap();
        map.set('a/b/0', 0);
        map.set('a/b/1', 1);

        const cb = stub();
        map.forEach(cb);

        expect(cb.callCount).to.equal(2);
        expect(cb.lastCall.args[0]).to.equal(1);
        expect(cb.lastCall.args[1]).to.equal('a/b/1');
        expect(cb.lastCall.args[2]).to.equal(map);
    });

    it('add/clear() results in an empty map.', async () => {
        const map = new IdIndexMap();
        map.set('a/b/0', 0);
        map.set('a/b/1', 1);
        map.set('a/b/2', 2);

        map.clear();

        expect(Array.from(map.entries())).to.be.empty;
    });

    it('throws if the same key is added', async () => {
        function test() {
            const map = new IdIndexMap();
            map.set('a/b/0', 0);
            map.set('a/b/0', 1);
        }

        expect(test).to.throw(RangeError);
    });

    it('throws if the same index is added', async () => {
        function test() {
            const map = new IdIndexMap();
            map.set('a/b/0', 0);
            map.set('a/b/1', 0);
        }

        expect(test).to.throw(RangeError);
    });

    it('indexes to move forward when an early key is deleted', async () => {
        const map = new IdIndexMap();
        map.set('a/b/0', 0);
        map.set('a/b/1', 1);
        map.set('a/b/2', 2);
        map.deleteByKey('a/b/0');

        expect(Array.from(map.entries())).to.deep.equal([
            ['a/b/1', 0],
            ['a/b/2', 1],
        ]);
    });

    it('indexes to move forward when an early value is deleted', async () => {
        const map = new IdIndexMap();
        map.set('a/b/0', 0);
        map.set('a/b/1', 1);
        map.set('a/b/2', 2);
        map.deleteByValue(0);

        expect(Array.from(map.entries())).to.deep.equal([
            ['a/b/1', 0],
            ['a/b/2', 1],
        ]);
    });
});
