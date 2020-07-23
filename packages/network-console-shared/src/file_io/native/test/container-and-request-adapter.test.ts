// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// tslint:disable:no-unused-expression

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';

chai.use(chaiAsPromised);

import {
    ICollectionAdapter,
    ICollectionContainerAdapter,
    ICollectionFormat,
    ICollectionItemAdapter,
} from '../../interfaces';
import { CollectionFormat } from '../collection-format';
import readCollection, { getContentsAndFormat } from '../../../test-util/read-collection';

describe('network-console-shared/src/file_io/native/container-adapter and request-adapter', () => {
    describe('Manipulates the collection correctly', () => {
        let format: ICollectionFormat;
        let collection: ICollectionAdapter;

        beforeEach(async () => {
            (CollectionFormat as any)._nextNewCollectionId = 0;
            format = new CollectionFormat();
            collection = await readCollection('src/file_io/native/test/cases/starting-case.nc.json', format);
        });

        it('Renames a sub-subfolder', async () => {
            const expected = await getContentsAndFormat('src/file_io/native/test/cases/container-rename-of-sub-subfolder.nc.json');

            const testFolderEntry = collection.getEntryById('starting-case.nc.json/2');
            expect(testFolderEntry).to.not.be.null;
            expect(testFolderEntry!.type).to.equal('container');
            const testFolder = testFolderEntry as ICollectionContainerAdapter;
            const anotherSubfolderEntry = testFolder.getEntryById('starting-case.nc.json/2/0');
            expect(anotherSubfolderEntry).to.not.be.null;
            expect(anotherSubfolderEntry!.type).to.equal('container');
            const anotherSubfolder = anotherSubfolderEntry as ICollectionContainerAdapter;
            anotherSubfolder.name = 'Renamed subfolder';
            expect(collection.isDirty).to.be.true;
            await collection.commit();
            const result = await collection.stringify();
            expect(result).to.equal(expected);
        });

        it('Deletion of a top-level folder deletes a lot', async () => {
            const expected = await getContentsAndFormat('src/file_io/native/test/cases/deletion-of-top-level-folder.nc.json');

            await collection.deleteEntry('starting-case.nc.json/2');
            const testFolderEntry = collection.getEntryById('starting-case.nc.json/2');
            expect(testFolderEntry).to.be.null;

            expect(collection.isDirty).to.be.true;
            await collection.commit();
            const result = await collection.stringify();
            expect(result).to.equal(expected);
            expect(collection.childEntryIds).to.deep.equal([
                'starting-case.nc.json/0',
                'starting-case.nc.json/1',
                'starting-case.nc.json/3',
            ]);
        });

        it('Deletion of a subfolder works as expected', async () => {
            const expected = await getContentsAndFormat('src/file_io/native/test/cases/deletion-of-subfolder.nc.json');

            const testFolderEntry = collection.getEntryById('starting-case.nc.json/2') as ICollectionContainerAdapter;
            const before = testFolderEntry.getEntryById('starting-case.nc.json/2/0');
            expect(before).to.not.be.null;
            expect(before!.type).to.equal('container');

            await testFolderEntry.deleteEntry('starting-case.nc.json/2/0');
            const after = testFolderEntry.getEntryById('starting-case.nc.json/2/0');
            expect(after).to.be.null;

            expect(collection.isDirty).to.be.true;
            await collection.commit();
            const result = await collection.stringify();
            expect(result).to.equal(expected);
            expect(testFolderEntry.childEntryIds).to.deep.equal([
                'starting-case.nc.json/2/1',
                'starting-case.nc.json/2/2',
                'starting-case.nc.json/2/3',
            ]);
        });

        it('Modifications of a deep request are performed correctly', async () => {
            const expected = await getContentsAndFormat('src/file_io/native/test/cases/modifications-of-all-properties-of-a-request.nc.json');

            // setup
            const testFolderEntry = collection.getEntryById('starting-case.nc.json/2');
            const testFolder = testFolderEntry as ICollectionContainerAdapter;
            const anotherSubfolderEntry = testFolder.getEntryById('starting-case.nc.json/2/0');
            const anotherSubfolder = anotherSubfolderEntry as ICollectionContainerAdapter;
            const requestEntry = anotherSubfolder.getEntryById('starting-case.nc.json/2/0/1');
            expect(requestEntry).to.not.be.null;
            expect(requestEntry!.type).to.equal('item');
            const requestItem = requestEntry as ICollectionItemAdapter;
            expect(collection.isDirty).to.be.false;

            // test cases
            const request = requestItem.request;
            expect(collection.isDirty).to.be.false;
            request.bodyComponents = {
                bodySelection: 'form-data',
                formData: [{
                    description: 'Form data item',
                    isActive: true,
                    key: 'username',
                    type: 'text',
                    value: 'aaronaaronson',
                }],
            };
            expect(collection.isDirty).to.be.true;
            await collection.commit();

            expect(collection.isDirty).to.be.false;
            request.description = 'This request got updated';
            expect(collection.isDirty).to.be.true;
            await collection.commit();

            expect(collection.isDirty).to.be.false;
            request.headers = [{
                description: 'The API key for the request',
                isActive: true,
                key: 'X-ApiKey',
                value: 'not really an api key',
            }];
            expect(collection.isDirty).to.be.true;
            await collection.commit();

            expect(collection.isDirty).to.be.false;
            request.name = 'Renamed request';
            expect(collection.isDirty).to.be.true;
            await collection.commit();

            expect(collection.isDirty).to.be.false;
            request.queryParameters = [{
                description: '',
                isActive: false,
                key: 'testmode',
                value: 'false',
            }];
            expect(collection.isDirty).to.be.true;
            await collection.commit();

            expect(collection.isDirty).to.be.false;
            request.url = 'http://localhost:9999/foo/bar/baz';
            expect(collection.isDirty).to.be.true;
            await collection.commit();

            expect(collection.isDirty).to.be.false;
            request.routeParameters = [];
            expect(collection.isDirty).to.be.true;
            await collection.commit();

            expect(collection.isDirty).to.be.false;
            request.verb = 'GET';
            expect(collection.isDirty).to.be.true;
            await collection.commit();

            // Finally, ensure that the collection contents are updated appropriately
            const result = await collection.stringify();
            expect(result).to.equal(expected);
        });
    });

    describe('adjacent data are not modified when entries are modified', () => {
        let format: ICollectionFormat;
        let collection: ICollectionAdapter;

        beforeEach(async () => {
            (CollectionFormat as any)._nextNewCollectionId = 0;
            format = new CollectionFormat();
            collection = await readCollection('src/file_io/native/test/cases/starting-case-with-adjacent-data.nc.json', format);
        });

        it('modifying a request entry does not delete adjacent data', async () => {
            const expected = await getContentsAndFormat('src/file_io/native/test/cases/adjacent-data-after-modifying-item.nc.json');

            const requestItem = collection.getEntryById('starting-case-with-adjacent-data.nc.json/0') as ICollectionItemAdapter;
            const request = requestItem.request;
            request.description = 'Edited first request';
            request.name = 'Updated request';
            await collection.commit();
            expect(await collection.stringify()).to.equal(expected);
        });

        it('modifying a container entry does not delete adjacent data', async () => {
            const expected = await getContentsAndFormat('src/file_io/native/test/cases/adjacent-data-after-modifying-container.nc.json');

            const container = collection.getEntryById('starting-case-with-adjacent-data.nc.json/2') as ICollectionContainerAdapter;
            container.name = 'Test folder renamed';
            await collection.commit();
            expect(await collection.stringify()).to.equal(expected);
        });

        it('clearing a container entry does not delete adjacent data', async () => {
            const expected = await getContentsAndFormat('src/file_io/native/test/cases/adjacent-data-after-clearing-container.nc.json');

            const container = collection.getEntryById('starting-case-with-adjacent-data.nc.json/2') as ICollectionContainerAdapter;
            const children = container.childEntryIds;
            while (children.length) {
                await container.deleteEntry(children.shift()!);
            }
            await collection.commit();
            expect(await collection.stringify()).to.equal(expected);
        });
    });
});
