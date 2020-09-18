// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ImportMock } from 'ts-mock-imports';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';
import Sinon, { useFakeTimers } from 'sinon';
import * as uuidv4Module from 'uuidv4';
chai.use(chaiAsPromised);

import { EnvironmentFormat, IPostmanEnvironmentFile } from '../environment-format';

describe('network-console-shared/src/file_io/native/environment-format', () => {
    let clock: Sinon.SinonFakeTimers;
    before(() => {
        const uuidv4Mock = ImportMock.mockFunction(uuidv4Module, 'uuid');
        uuidv4Mock.returns('12345678-1234-2345-3456-1234567890ab');
        clock = useFakeTimers(Date.now());
    });

    after(() => {
        ImportMock.restore();
        clock.restore();
    });

    it('creates a default environment and serializes it correctly', async () => {
        const format = new EnvironmentFormat();
        const name = 'Empty test environment';
        const expected: IPostmanEnvironmentFile = {
            id: '12345678-1234-2345-3456-1234567890ab',
            name,
            values: [],
            _postman_variable_scope: 'environment',
	        _postman_exported_at: new Date().toISOString(),
	        _postman_exported_using: 'edge-devtools-network-console/0.10.0-preview'
        };

        const collection = await format.createEnvironmentContainer(name);
        expect(await collection.stringify()).to.deep.equal(JSON.stringify(expected, null, 4));
    });

    describe('Variations of EnvironmentFormat#parse failures', () => {
        it('Throws if the root lacks an ID field', () => {
            async function test() {
                const format = new EnvironmentFormat();
                const expected = JSON.stringify({
                    name: 'Known bad',
                    values: [],
                }, null, 4);
                await format.parse('Known bad', expected);
            }

            return expect(test()).to.eventually.be.rejectedWith(RangeError);
        });

        it('Throws if the root lacks a name field', () => {
            async function test() {
                const format = new EnvironmentFormat();
                const expected = JSON.stringify({
                    id: '01234567-89ab-cdef-0123-456789abcdef',
                    environments: [],
                }, null, 4);
                await format.parse('Known bad', expected);
            }

            return expect(test()).to.eventually.be.rejectedWith(RangeError);
        });

        it('Throws if the root lacks a values field', () => {
            async function test() {
                const format = new EnvironmentFormat();
                const expected = JSON.stringify({
                    id: '01234567-89ab-cdef-0123-456789abcdef',
                    name: 'Known bad',
                }, null, 4);
                await format.parse('Known bad', expected);
            }

            return expect(test()).to.eventually.be.rejectedWith(RangeError);
        });

        it('Throws if the values field is not an array', () => {
            async function test() {
                const format = new EnvironmentFormat();
                const expected = JSON.stringify({
                    id: '01234567-89ab-cdef-0123-456789abcdef',
                    name: 'Known bad',
                    values: 'This should be an array, not a string',
                }, null, 4);
                await format.parse('Known bad', expected);
            }

            return expect(test()).to.eventually.be.rejectedWith(RangeError);
        });
    });

    describe('Variations of EnvironmentFormat#tryParse failures', () => {
        it('Throws if the root lacks an ID field', () => {
            async function test() {
                const format = new EnvironmentFormat();
                const expected = JSON.stringify({
                    name: 'Known bad',
                    values: [],
                }, null, 4);
                return await format.tryParse('Known bad', expected);
            }

            return expect(test()).to.eventually.be.null;
        });

        it('Throws if the root lacks a name field', () => {
            async function test() {
                const format = new EnvironmentFormat();
                const expected = JSON.stringify({
                    id: '01234567-89ab-cdef-0123-456789abcdef',
                    environments: [],
                }, null, 4);
                return await format.tryParse('Known bad', expected);
            }

            return expect(test()).to.eventually.be.null;
        });

        it('Throws if the root lacks a values field', () => {
            async function test() {
                const format = new EnvironmentFormat();
                const expected = JSON.stringify({
                    id: '01234567-89ab-cdef-0123-456789abcdef',
                    name: 'Known bad',
                }, null, 4);
                return await format.tryParse('Known bad', expected);
            }

            return expect(test()).to.eventually.be.null;
        });

        it('Throws if the values field is not an array', () => {
            async function test() {
                const format = new EnvironmentFormat();
                const expected = JSON.stringify({
                    id: '01234567-89ab-cdef-0123-456789abcdef',
                    name: 'Known bad',
                    values: 'This should be an array, not a string',
                }, null, 4);
                return await format.tryParse('Known bad', expected);
            }

            return expect(test()).to.eventually.be.null;
        });
    });
});
