// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';
import { ImportMock } from 'ts-mock-imports';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';
import * as uuidv4Module from 'uuidv4';

chai.use(chaiAsPromised);

import formats from '../index';
import { convertFormats } from '../convert';

import { getContents } from '../../test-util/read-collection';
import jsonCompare from '../../test-util/json-compare';

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

describe('file_io/convert.ts', () => {
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
        await convertFormats(src, formats['nc-native']);
    });

    it('Successfully converts OpenAPI v2 to NC Native.', async () => {
        const src = await loadKnownGoodOpenAPIV2Format();
        const result = await convertFormats(src, formats['nc-native']);

        const expected = await getContents('src/file_io/test/cases/expected.petstore-swagger-io.nc.json');
        jsonCompare(await result.stringify(), expected);
    });

    /**
     * This doesn't work presently because we need to implement {{baseUri}} or variable substitution and
     * expansion within the Postman URI parser.
     */
    it.skip('Successfully converts OpenAPI v2 to Postman v2.1.', async () => {
        const src = await loadKnownGoodOpenAPIV2Format();
        const result = await convertFormats(src, formats['postman-v2.1']);

        const expected = await getContents('src/file_io/test/cases/expected.petstore-swagger-io.postman_collection.json');
        // fs.writeFileSync('src/file_io/test/cases/expected.petstore-swagger-io.postman_collection.json', await result.stringify(), { encoding: 'utf8' });
        jsonCompare(await result.stringify(), expected);
    });
});
