// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';
chai.use(chaiAsPromised);

import { EnvironmentFormat, INCNativeEnvironmentFile } from '../environment-format';

describe('network-console-shared/src/file_io/native/environment-format', () => {
    it('creates a default environment and serializes it correctly', async () => {
        const format = new EnvironmentFormat();
        const name = 'Empty test environment';
        const expected: INCNativeEnvironmentFile = {
            meta: {
                networkConsoleEnvironmentVersion: '0.10.0-preview',
            },
            name,
            environments: [],
        };

        const collection = await format.createEnvironmentContainer(name);
        expect(await collection.stringify()).to.deep.equal(JSON.stringify(expected, null, 4));
    });

    describe('Variations of EnvironmentFormat#parse failures', () => {
        it('Throws if the root lacks a meta field', () => {
            async function test() {
                const format = new EnvironmentFormat();
                const expected = JSON.stringify({
                    name: 'Known bad',
                    environments: [],
                }, null, 4);
                await format.parse('Known bad', expected);
            }

            return expect(test()).to.eventually.be.rejectedWith(RangeError);
        });

        it('Throws if the root metadata lacks a version field', () => {
            async function test() {
                const format = new EnvironmentFormat();
                const expected = JSON.stringify({
                    meta: {},
                    name: 'Known bad',
                    environments: [],
                }, null, 4);
                await format.parse('Known bad', expected);
            }

            return expect(test()).to.eventually.be.rejectedWith(RangeError);
        });

        it('Throws if the root lacks a name field', () => {
            async function test() {
                const format = new EnvironmentFormat();
                const expected = JSON.stringify({
                    meta: {
                        version: '0.10.0-preview',
                    },
                    environments: [],
                }, null, 4);
                await format.parse('Known bad', expected);
            }

            return expect(test()).to.eventually.be.rejectedWith(RangeError);
        });

        it('Throws if the root lacks a meta field', () => {
            async function test() {
                const format = new EnvironmentFormat();
                const expected = JSON.stringify({
                    meta: {
                        version: '0.10.0-preview',
                    },
                    name: 'Known bad',
                    environments: 'This should have been an array.',
                }, null, 4);
                await format.parse('Known bad', expected);
            }

            return expect(test()).to.eventually.be.rejectedWith(RangeError);
        });
    });

    describe('Variations of EnvironmentFormat#tryParse failures', () => {
        it('Throws if the root lacks a meta field', () => {
            async function test() {
                const format = new EnvironmentFormat();
                const expected = JSON.stringify({
                    name: 'Known bad',
                    environments: [],
                }, null, 4);
                return await format.tryParse('Known bad', expected);
            }

            return expect(test()).to.eventually.be.null;
        });

        it('Throws if the root metadata lacks a version field', () => {
            async function test() {
                const format = new EnvironmentFormat();
                const expected = JSON.stringify({
                    meta: {},
                    name: 'Known bad',
                    environments: [],
                }, null, 4);
                return await format.tryParse('Known bad', expected);
            }

            return expect(test()).to.eventually.be.null;
        });

        it('Throws if the root lacks a name field', () => {
            async function test() {
                const format = new EnvironmentFormat();
                const expected = JSON.stringify({
                    meta: {
                        version: '0.10.0-preview',
                    },
                    environments: [],
                }, null, 4);
                return await format.tryParse('Known bad', expected);
            }

            return expect(test()).to.eventually.be.null;
        });

        it('Throws if the root lacks a meta field', () => {
            async function test() {
                const format = new EnvironmentFormat();
                const expected = JSON.stringify({
                    meta: {
                        version: '0.10.0-preview',
                    },
                    name: 'Known bad',
                    environments: 'This should have been an array.',
                }, null, 4);
                return await format.tryParse('Known bad', expected);
            }

            return expect(test()).to.eventually.be.null;
        });
    });
});
