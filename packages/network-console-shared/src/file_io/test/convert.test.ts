// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ImportMock } from 'ts-mock-imports';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';
import * as uuidv4Module from 'uuidv4';
import Sinon, { useFakeTimers } from 'sinon';

chai.use(chaiAsPromised);

import formats, { environmentFormats } from '../index';
import { convertFormats, convertEnvironment } from '../convert';

import { getContents } from '../../test-util/read-collection';
import jsonCompare from '../../test-util/json-compare';

describe('file_io/convert.ts', () => {
    describe('Collections', () => {
        async function loadKnownGoodNativeFormat() {
            const fileContents = await getContents('src/file_io/native/test/cases/starting-case-with-auths.nc.json');
            return await formats['nc-native'].parse('starting-case.nc.json', fileContents);
        }

        async function loadKnownGoodPostman2_1Format() {
            const fileContents = await getContents('src/file_io/postman/v2.1/test/cases/starting-case.postman_collection.json');
            return await formats['postman-v2.1'].parse('starting-case.postman_collection.json', fileContents);
        }

        async function loadKnownGoodOpenAPIV2Format() {
            const fileContents = await getContents('src/file_io/openapi/v2/test/cases/petstore-swagger-io.json');
            return await formats['openapi'].parse('petstore-swagger-io.json', fileContents);
        }

        before(() => {
            const uuidv4Mock = ImportMock.mockFunction(uuidv4Module, 'uuid');
            uuidv4Mock.returns('12345678-1234-2345-3456-1234567890ab');
        });

        after(() => {
            ImportMock.restore();
        });

        it('Fails if the destination format is readonly.', async () => {
            async function test() {
                const src = await loadKnownGoodNativeFormat();
                await convertFormats(src, formats.openapi);
            }
            await expect(test()).to.eventually.be.rejectedWith(RangeError);
        });

        it('Successfully converts NC Native to Postman v2.1.', async () => {
            const src = await loadKnownGoodNativeFormat();
            const result = await convertFormats(src, formats['postman-v2.1']);

            const expected = await getContents('src/file_io/test/cases/converted-from-nc-native.postman_collection.json');
            jsonCompare(await result.stringify(), expected);
        });

        it('Successfully converts Postman v2.1 to NC Native.', async () => {
            const src = await loadKnownGoodPostman2_1Format();
            const result = await convertFormats(src, formats['nc-native']);

            const expected = await getContents('src/file_io/test/cases/expected.converted-from-postman-v2.1.nc.json');
            jsonCompare(await result.stringify(), expected);
        });

        it('Successfully converts OpenAPI v2 to NC Native.', async () => {
            const src = await loadKnownGoodOpenAPIV2Format();
            const result = await convertFormats(src, formats['nc-native']);

            const expected = await getContents('src/file_io/test/cases/expected.petstore-swagger-io.nc.json');
            jsonCompare(await result.stringify(), expected);
        });

        it('Successfully converts OpenAPI v2 to Postman v2.1.', async () => {
            const src = await loadKnownGoodOpenAPIV2Format();
            const result = await convertFormats(src, formats['postman-v2.1']);

            const expected = await getContents('src/file_io/test/cases/expected.petstore-swagger-io.postman_collection.json');
            jsonCompare(await result.stringify(), expected);
        });
    });

    describe('Environments', () => {
        async function loadKnownGoodNativeFormat() {
            const fileContents = await getContents('src/file_io/test/cases/starting-case.ncenv.json');
            return await environmentFormats['nc-native-env'].parse('starting-case.ncenv.json', fileContents);
        }

        async function loadKnownGoodNativeFormatWithMultipleEnvs() {
            const fileContents = await getContents('src/file_io/test/cases/multiple-environments.ncenv.json');
            return await environmentFormats['nc-native-env'].parse('multiple-environments.nc.json', fileContents);
        }

        async function loadKnownGoodPostman2_1Format() {
            const fileContents = await getContents('src/file_io/test/cases/starting-case.postman_environment.json');
            return await environmentFormats['postman-v2.1-env'].parse('starting-case.postman_collection.json', fileContents);
        }

        async function loadKnownGoodOpenAPIV2Format() {
            const fileContents = await getContents('src/file_io/openapi/v2/test/cases/petstore-swagger-io.json');
            return await environmentFormats['openapi-env'].parse('petstore-swagger-io.json', fileContents);
        }

        let clock: Sinon.SinonFakeTimers;
        before(() => {
            const uuidv4Mock = ImportMock.mockFunction(uuidv4Module, 'uuid');
            uuidv4Mock.returns('12345678-1234-2345-3456-1234567890ab');
            clock = useFakeTimers(1599107400000); // '2020-09-03T04:30:00.000Z'
        });

        after(() => {
            ImportMock.restore();
            clock.restore();
        });

        it('Fails if the destination format is readonly.', async () => {
            async function test() {
                const src = await loadKnownGoodNativeFormat();
                await convertEnvironment(src, environmentFormats['openapi-env']);
            }
            await expect(test()).to.eventually.be.rejectedWith(RangeError);
        });

        it('Fails if the destination format does not support multiple environments but the default input has them.', async () => {
            async function test() {
                const src = await loadKnownGoodNativeFormatWithMultipleEnvs();
                await convertEnvironment(src, environmentFormats['postman-v2.1-env']);
            }
            await expect(test()).to.eventually.be.rejectedWith(RangeError);
        });

        it('Fails if the destination format does not support multiple environments but the explicit input has them.', async () => {
            async function test() {
                const src = await loadKnownGoodNativeFormatWithMultipleEnvs();
                await convertEnvironment(src, environmentFormats['postman-v2.1-env'], ...src.childIds);
            }
            await expect(test()).to.eventually.be.rejectedWith(RangeError);
        });

        it('Successfully converts NC Native to Postman v2.1.', async () => {
            const src = await loadKnownGoodNativeFormat();
            const result = await convertEnvironment(src, environmentFormats['postman-v2.1-env']);

            const expected = await getContents('src/file_io/test/cases/expected.native-to-postman.postman_environment.json');
            jsonCompare(await result.stringify(), expected);
        });

        it('Successfully converts Postman v2.1 to NC Native.', async () => {
            const src = await loadKnownGoodPostman2_1Format();
            const result = await convertEnvironment(src, environmentFormats['nc-native-env']);

            const expected = await getContents('src/file_io/test/cases/expected.postman-to-native.ncenv.json');
            jsonCompare(await result.stringify(), expected);
        });

        it('Successfully converts OpenAPI v2 to NC Native.', async () => {
            const src = await loadKnownGoodOpenAPIV2Format();
            const result = await convertEnvironment(src, environmentFormats['nc-native-env']);

            const expected = await getContents('src/file_io/test/cases/expected.petstore-swagger-io.ncenv.json');
            jsonCompare(await result.stringify(), expected);
        });

        it('Successfully converts OpenAPI v2 to Postman v2.1.', async () => {
            const src = await loadKnownGoodOpenAPIV2Format();
            const result = await convertEnvironment(src, environmentFormats['postman-v2.1-env'], src.childIds[0]);

            const expected = await getContents('src/file_io/test/cases/expected.openapi-to-postman.postman_environment.json');
            jsonCompare(await result.stringify(), expected);
        });
    });
});
