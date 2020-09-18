// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';

chai.use(chaiAsPromised);

import { CollectionFormat } from '../collection-format';

describe('network-console-shared/src/file_io/native/collection-format', () => {
    it('creates a default collection and serializes it correctly', async () => {
        const format = new CollectionFormat();
        const name = 'Empty test collection';
        const expected = JSON.stringify({
            meta: {
                networkConsoleCollectionVersion: '0.10.0-preview',
            },
            name,
            entries: [],
        }, null, 4);

        const collection = await format.createCollection(name);
        expect(await collection.stringify()).to.equal(expected);
    });

    describe('variations of CollectionFormat#parse failures', () => {
        it('Throws if the root lacks a meta field', () => {
            async function test() {
                const format = new CollectionFormat();
                const expected = JSON.stringify({
                    name: 'Known bad',
                    entries: [],
                }, null, 4);
                await format.parse('Known bad', expected);
            }
            return expect(test()).to.eventually.be.rejectedWith(RangeError);
        });

        it('Throws if the meta field lacks a version identifier', () => {
            async function test() {
                const format = new CollectionFormat();
                const expected = JSON.stringify({
                    meta: {},
                    name: 'Known bad',
                    entries: [],
                }, null, 4);
                await format.parse('Known bad', expected);
            }
            return expect(test()).to.eventually.be.rejectedWith(RangeError);
        });

        it('Throws if the collection lacks a name field', () => {
            async function test() {
                const format = new CollectionFormat();
                const expected = JSON.stringify({
                    meta: {
                        networkConsoleCollectionVersion: '0.10.0-preview',
                    },
                    entries: [],
                }, null, 4);
                await format.parse('Known bad', expected);
            }
            return expect(test()).to.eventually.be.rejectedWith(RangeError);
        });

        it('Throws if the collection lacks an "entries" property', () => {
            async function test() {
                const format = new CollectionFormat();
                const expected = JSON.stringify({
                    meta: {
                        networkConsoleCollectionVersion: '0.10.0-preview',
                    },
                    name: 'Known bad',
                }, null, 4);
                await format.parse('Known bad', expected);
            }
            return expect(test()).to.eventually.be.rejectedWith(RangeError);
        });

        it('Throws if the collection lacks an has a non-Array-type "entries" property', () => {
            async function test() {
                const format = new CollectionFormat();
                const expected = JSON.stringify({
                    meta: {
                        networkConsoleCollectionVersion: '0.10.0-preview',
                    },
                    name: 'Known bad',
                    entries: 'hello world',
                }, null, 4);
                await format.parse('Known bad', expected);
            }
            return expect(test()).to.eventually.be.rejectedWith(RangeError);
        });
    });

    describe('variations of CollectionFormat#tryParse failures', () => {
        it('Returns null if the root lacks a meta field', async () => {
            const format = new CollectionFormat();
            const expected = JSON.stringify({
                name: 'Known bad',
                entries: [],
            }, null, 4);
            const result = await format.tryParse('Known bad', expected);
            expect(result).to.be.null;
        });

        it('Returns null if the meta field lacks a version identifier', async () => {
            const format = new CollectionFormat();
            const expected = JSON.stringify({
                meta: {},
                name: 'Known bad',
                entries: [],
            }, null, 4);
            const result = await format.tryParse('Known bad', expected);
            expect(result).to.be.null;
        });

        it('Returns null if the collection lacks a name field', async () => {
            const format = new CollectionFormat();
            const expected = JSON.stringify({
                meta: {
                    networkConsoleCollectionVersion: '0.10.0-preview',
                },
                entries: [],
            }, null, 4);
            const result = await format.tryParse('Known bad', expected);
            expect(result).to.be.null;
        });

        it('Returns null if the collection lacks an "entries" property', async () => {
            const format = new CollectionFormat();
            const expected = JSON.stringify({
                meta: {
                    networkConsoleCollectionVersion: '0.10.0-preview',
                },
                name: 'Known bad',
            }, null, 4);
            const result = await format.tryParse('Known bad', expected);
            expect(result).to.be.null;
        });

        it('Returns null if the collection lacks an has a non-Array-type "entries" property', async () => {
            const format = new CollectionFormat();
            const expected = JSON.stringify({
                meta: {
                    networkConsoleCollectionVersion: '0.10.0-preview',
                },
                name: 'Known bad',
                entries: 'hello world',
            }, null, 4);
            const result = await format.tryParse('Known bad', expected);
            expect(result).to.be.null;
        });
    });
});
