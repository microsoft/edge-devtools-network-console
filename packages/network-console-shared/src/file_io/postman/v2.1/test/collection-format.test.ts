// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ImportMock } from 'ts-mock-imports';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';
import * as uuidv4Module from 'uuidv4';

chai.use(chaiAsPromised);
const uuidv4Mock = ImportMock.mockFunction(uuidv4Module, 'uuid');
uuidv4Mock.returns('12345678-1234-2345-3456-1234567890ab');

import { CollectionFormat } from '../collection-format';

describe('network-console-shared/src/file_io/postman/v2.1/collection-format', () => {
    it('creates a default collection and serializes it correctly', async () => {
        const format = new CollectionFormat();
        const name = 'Empty test collection';
        const expected = JSON.stringify({
            info: {
                name,
                schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
                description: '',
                _postman_id: '12345678-1234-2345-3456-1234567890ab',
            },
            item: [],
        }, null, 4);

        const collection = await format.createCollection(name);
        expect(await collection.stringify()).to.equal(expected);
        expect(collection.id).to.equal('postman-format-new-collection-12345678-1234-2345-3456-1234567890ab');
    });

    describe('variations of CollectionFormat#parse failures', () => {
        it('Throws if the root lacks an info field', () => {
            async function test() {
                const format = new CollectionFormat();
                const expected = JSON.stringify({
                    item: [],
                }, null, 4);
                await format.parse('Known bad', expected);
            }
            return expect(test()).to.eventually.be.rejectedWith(RangeError);
        });

        it('Throws if the info field has an invalid schema value', () => {
            async function test() {
                const format = new CollectionFormat();
                const expected = JSON.stringify({
                    info: {
                        name: 'Known bad',
                        schema: 'https://deliberately.invalid/json/collection/v2.0.0/collection.json',
                        description: '',
                        _postman_id: '12345678-1234-2345-3456-1234567890ab',
                    },
                    item: [],
                }, null, 4);
                await format.parse('Known bad', expected);
            }
            return expect(test()).to.eventually.be.rejectedWith(RangeError);
        });

        it('Throws if the collection lacks an "item" property', () => {
            async function test() {
                const format = new CollectionFormat();
                const expected = JSON.stringify({
                    info: {
                        name: 'Known bad',
                        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
                        description: '',
                        _postman_id: '12345678-1234-2345-3456-1234567890ab',
                    },
                }, null, 4);
                await format.parse('Known bad', expected);
            }
            return expect(test()).to.eventually.be.rejectedWith(RangeError);
        });

        it('Throws if the collection lacks an has a non-Array-type "item" property', () => {
            async function test() {
                const format = new CollectionFormat();
                const expected = JSON.stringify({
                    info: {
                        name: 'Known bad',
                        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
                        description: '',
                        _postman_id: '12345678-1234-2345-3456-1234567890ab',
                    },
                    item: 'deliberately invalid',
                }, null, 4);
                await format.parse('Known bad', expected);
            }
            return expect(test()).to.eventually.be.rejectedWith(RangeError);
        });
    });

    describe('variations of CollectionFormat#tryParse failures', () => {
        it('Returns null if the root lacks a info field', async () => {
            const format = new CollectionFormat();
            const expected = JSON.stringify({
                item: [],
            }, null, 4);
            const result = await format.tryParse('Known bad', expected);
            expect(result).to.be.null;
        });

        it('Returns null if the info field has an invalid schema value', async () => {
            const format = new CollectionFormat();
            const expected = JSON.stringify({
                info: {
                    name: 'Known bad',
                    schema: 'https://deliberately.invalid/json/collection/v2.0.0/collection.json',
                    description: '',
                    _postman_id: '12345678-1234-2345-3456-1234567890ab',
                },
                item: [],
            }, null, 4);
            const result = await format.tryParse('Known bad', expected);
            expect(result).to.be.null;
        });

        it('Returns null if the collection lacks an "item" property', async () => {
            const format = new CollectionFormat();
            const expected = JSON.stringify({
                info: {
                    name: 'Known bad',
                    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
                    description: '',
                    _postman_id: '12345678-1234-2345-3456-1234567890ab',
                },
            }, null, 4);
            const result = await format.tryParse('Known bad', expected);
            expect(result).to.be.null;
        });

        it('Returns null if the collection lacks an has a non-Array-type "item" property', async () => {
            const format = new CollectionFormat();
            const expected = JSON.stringify({
                info: {
                    name: 'Known bad',
                    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
                    description: '',
                    _postman_id: '12345678-1234-2345-3456-1234567890ab',
                },
                item: 'deliberately invalid',
            }, null, 4);
            const result = await format.tryParse('Known bad', expected);
            expect(result).to.be.null;
        });
    });
});
