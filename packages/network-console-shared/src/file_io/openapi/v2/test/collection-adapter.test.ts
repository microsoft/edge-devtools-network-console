// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// tslint:disable:no-unused-expression

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';
import jsonCompare from '../../../../test-util/json-compare';

chai.use(chaiAsPromised);

import { CollectionFormat } from '../../collection-format';
import { getContents } from '../../../../test-util/read-collection';

async function loadValidCollection() {
    const fileContents = await getContents('src/file_io/openapi/v2/test/cases/petstore-swagger-io.json');
    const format = new CollectionFormat();
    return await format.parse('petstore-swagger-io.json', fileContents);
}

describe('network-console-shared/src/file_io/openapi/v2/collection-adapter', () => {
    describe('Manipulation of an empty collection', () => {
        it('Throws if you try to create a collection.', async () => {
            function test() {
                const format = new CollectionFormat();
                return format.createCollection('Will not work');
            }
            await expect(test()).to.eventually.be.rejectedWith(ReferenceError);
        });

        it('Throws if you try to rename a collection', async () => {
            async function test() {
                const collection = await loadValidCollection();
                collection.name = 'Hello world.';
            }
            await expect(test()).to.be.rejectedWith(ReferenceError);
        });

        it('Throws if you try to add a container to the root', async () => {
            async function test() {
                const collection = await loadValidCollection();
                await collection.appendContainerEntry('This will fail');
            }

            await expect(test()).to.be.rejectedWith(ReferenceError);
        });

        it('Throws if you try to add a request to the root', async () => {
            async function test() {
                const collection = await loadValidCollection();
                await collection.appendItemEntry({
                    authorization: { type: 'inherit' },
                    body: {
                        content: '',
                    },
                    bodyComponents: {
                        bodySelection: 'none',
                    },
                    description: '',
                    headers: [],
                    name: 'Will not work',
                    queryParameters: [],
                    routeParameters: [],
                    url: 'https://www.contoso.com/',
                    verb: 'GET',
                });
            }
            await expect(test()).to.eventually.be.rejectedWith(ReferenceError);
        });
    });

    describe('Manipulates the collection correctly', () => {
        it('Throws if trying to delete', async () => {
            async function test() {
                const collection = await loadValidCollection();
                const toDelete = collection.childEntryIds[0];
                await collection.deleteEntry(toDelete);
            }
            await expect(test()).to.eventually.be.rejectedWith(ReferenceError);
        });

        it('Throws if trying to commit', async () => {
            async function test() {
                const collection = await loadValidCollection();
                await collection.commit();
            }
            await expect(test()).to.eventually.be.rejectedWith(ReferenceError);
        });
    });
});
