// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// tslint:disable:no-unused-expression

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';
import jsonCompare from '../../../../test-util/json-compare';

chai.use(chaiAsPromised);

import {
    ICollectionAdapter,
    ICollectionContainerAdapter,
    ICollectionFormat,
    ICollectionItemAdapter,
} from '../../../interfaces';
import { CollectionFormat } from '../../collection-format';
import readCollection, { getContents } from '../../../../test-util/read-collection';

async function loadValidCollection() {
    const fileContents = await getContents('src/file_io/openapi/v2/test/cases/petstore-swagger-io.json');
    const format = new CollectionFormat();
    return await format.parse('petstore-swagger-io.json', fileContents);
}

describe('network-console-shared/src/file_io/openapi/v2/container-adapter and request-adapter', () => {
    describe('Manipulates the collection correctly', () => {
        let format: ICollectionFormat;
        let collection: ICollectionAdapter;

        beforeEach(async () => {
            format = new CollectionFormat();
            collection = await loadValidCollection();
        });

        it('Throws when renaming a subfolder', async () => {
            async function test() {
                const containerId = collection.childEntryIds[0];
                const container = collection.getEntryById(containerId);
                expect(container).to.not.be.null;
                expect(container!.type).to.equal('container');

                container!.name = 'This should not work.';
            }
            await expect(test()).to.eventually.be.rejectedWith(ReferenceError);
        });

        it('Retrieves a request correctly', async () => {
            const containerId = collection.childEntryIds[0];
            const container = collection.getEntryById(containerId);
            expect(container).to.not.be.null;
            expect(container!.type).to.equal('container');

            const folder = container as ICollectionContainerAdapter;
            const requestId = folder.childEntryIds[0];
            const request = folder.getEntryById(requestId);
            expect(request).to.not.be.null;
            expect(request!.type).to.equal('item');
            const ncr = (request as ICollectionItemAdapter).request;
            expect(ncr.name).to.equal('addPet');
            expect(ncr.url).to.equal('{{baseUri}}/pet');
        });
    });
});
