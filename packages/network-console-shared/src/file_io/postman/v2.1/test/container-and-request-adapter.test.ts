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
import { CollectionFormat } from '../collection-format';
import readCollection, { getContents } from '../../../../test-util/read-collection';

describe('network-console-shared/src/file_io/postman/v2.1/container-adapter and request-adapter', () => {
    describe('Manipulates the collection correctly', () => {
        let format: ICollectionFormat;
        let collection: ICollectionAdapter;

        beforeEach(async () => {
            format = new CollectionFormat();
            collection = await readCollection('src/file_io/postman/v2.1/test/cases/starting-case.postman_collection.json', format);
        });

        it('Renames a sub-subfolder', async () => {
            const expected = await getContents('src/file_io/postman/v2.1/test/cases/expected.container-rename-of-sub-subfolder.postman_collection.json');

            const testFolderEntry = collection.getEntryById('starting-case.postman_collection.json/2');
            expect(testFolderEntry).to.not.be.null;
            expect(testFolderEntry!.type).to.equal('container');
            const testFolder = testFolderEntry as ICollectionContainerAdapter;
            const anotherSubfolderEntry = testFolder.getEntryById('starting-case.postman_collection.json/2/0');
            expect(anotherSubfolderEntry).to.not.be.null;
            expect(anotherSubfolderEntry!.type).to.equal('container');
            const anotherSubfolder = anotherSubfolderEntry as ICollectionContainerAdapter;
            anotherSubfolder.name = 'Renamed subfolder';
            expect(collection.isDirty).to.be.true;
            await collection.commit();
            jsonCompare(await collection.stringify(), expected);
        });

        it('Deletion of a top-level folder deletes a lot', async () => {
            const expected = await getContents('src/file_io/postman/v2.1/test/cases/expected.deletion-of-top-level-folder.postman_collection.json');

            await collection.deleteEntry('starting-case.postman_collection.json/2');
            const testFolderEntry = collection.getEntryById('starting-case.postman_collection.json/2');
            expect(testFolderEntry).to.be.null;

            expect(collection.isDirty).to.be.true;
            await collection.commit();
            jsonCompare(await collection.stringify(), expected);
            expect(collection.childEntryIds).to.deep.equal([
                'starting-case.postman_collection.json/0',
                'starting-case.postman_collection.json/1',
                'starting-case.postman_collection.json/3',
            ]);
        });

        it('Deletion of a subfolder works as expected', async () => {
            const expected = await getContents('src/file_io/postman/v2.1/test/cases/expected.deletion-of-subfolder.postman_collection.json');

            const testFolderEntry = collection.getEntryById('starting-case.postman_collection.json/2') as ICollectionContainerAdapter;
            const before = testFolderEntry.getEntryById('starting-case.postman_collection.json/2/0');
            expect(before).to.not.be.null;
            expect(before!.type).to.equal('container');

            await testFolderEntry.deleteEntry('starting-case.postman_collection.json/2/0');
            const after = testFolderEntry.getEntryById('starting-case.postman_collection.json/2/0');
            expect(after).to.be.null;

            expect(collection.isDirty).to.be.true;
            await collection.commit();
            jsonCompare(await collection.stringify(), expected);
            expect(testFolderEntry.childEntryIds).to.deep.equal([
                'starting-case.postman_collection.json/2/1',
                'starting-case.postman_collection.json/2/2',
                'starting-case.postman_collection.json/2/3',
            ]);
        });

        it('Modifications of a deep request are performed correctly', async () => {
            const expected = await getContents('src/file_io/postman/v2.1/test/cases/expected.modifications-of-all-properties-of-a-request.postman_collection.json');

            // setup
            const testFolderEntry = collection.getEntryById('starting-case.postman_collection.json/2');
            const testFolder = testFolderEntry as ICollectionContainerAdapter;
            const anotherSubfolderEntry = testFolder.getEntryById('starting-case.postman_collection.json/2/0');
            const anotherSubfolder = anotherSubfolderEntry as ICollectionContainerAdapter;
            const requestEntry = anotherSubfolder.getEntryById('starting-case.postman_collection.json/2/0/1');
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
            jsonCompare(await collection.stringify(), expected);
        });

        it('Modification of a request authorization marks the collection as dirty', async () => {
            const expected = await getContents('src/file_io/postman/v2.1/test/cases/expected.modified-request-authorization.postman_collection.json');

            // setup
            const testFolderEntry = collection.getEntryById('starting-case.postman_collection.json/2');
            const testFolder = testFolderEntry as ICollectionContainerAdapter;
            const anotherSubfolderEntry = testFolder.getEntryById('starting-case.postman_collection.json/2/0');
            const anotherSubfolder = anotherSubfolderEntry as ICollectionContainerAdapter;
            const requestEntry = anotherSubfolder.getEntryById('starting-case.postman_collection.json/2/0/1');
            expect(requestEntry).to.not.be.null;
            expect(requestEntry!.type).to.equal('item');
            const requestItem = requestEntry as ICollectionItemAdapter;
            expect(collection.isDirty).to.be.false;

            // test cases
            const request = requestItem.request;
            request.authorization.type = 'basic';
            request.authorization.basic = {
                username: 'user',
                password: 'florbo',
                showPassword: false,
            };
            expect(collection.isDirty).to.be.true;

            // Finally, ensure that the collection contents are updated appropriately
            await collection.commit();
            jsonCompare(await collection.stringify(), expected);
        });

        it('Modification of a container authorization marks the collection as dirty', async () => {
            const expected = await getContents('src/file_io/postman/v2.1/test/cases/expected.modified-container-authorization.postman_collection.json');

            // setup
            const testFolderEntry = collection.getEntryById('starting-case.postman_collection.json/2');
            const testFolder = testFolderEntry as ICollectionContainerAdapter;
            const anotherSubfolderEntry = testFolder.getEntryById('starting-case.postman_collection.json/2/0');
            const anotherSubfolder = anotherSubfolderEntry as ICollectionContainerAdapter;
            expect(collection.isDirty).to.be.false;

            // test cases
            anotherSubfolder.authorization.type = 'token';
            anotherSubfolder.authorization.token = {
                token: 'This is a bearer token.'
            };
            expect(collection.isDirty).to.be.true;

            // Finally, ensure that the collection contents are updated appropriately
            await collection.commit();
            jsonCompare(await collection.stringify(), expected);
        });
    });

    describe('adjacent data are not modified when entries are modified', () => {
        let format: ICollectionFormat;
        let collection: ICollectionAdapter;

        beforeEach(async () => {
            format = new CollectionFormat();
            collection = await readCollection('src/file_io/postman/v2.1/test/cases/starting-case-with-adjacent-data.postman_collection.json', format);
        });

        it('modifying a request entry does not delete adjacent data', async () => {
            const expected = await getContents('src/file_io/postman/v2.1/test/cases/expected.adjacent-data-after-modifying-item.postman_collection.json');

            const requestItem = collection.getEntryById('starting-case-with-adjacent-data.postman_collection.json/1') as ICollectionItemAdapter;
            const request = requestItem.request;
            request.description = 'Edited first request';
            request.name = 'Updated request';
            await collection.commit();
            jsonCompare(await collection.stringify(), expected);
        });

        it('modifying a container entry does not delete adjacent data', async () => {
            const expected = await getContents('src/file_io/postman/v2.1/test/cases/expected.adjacent-data-after-modifying-container.postman_collection.json');

            const container = collection.getEntryById('starting-case-with-adjacent-data.postman_collection.json/0') as ICollectionContainerAdapter;
            container.name = 'Test folder renamed';
            await collection.commit();
            jsonCompare(await collection.stringify(), expected);
        });

        it('clearing a container entry does not delete adjacent data', async () => {
            const expected = await getContents('src/file_io/postman/v2.1/test/cases/expected.adjacent-data-after-clearing-container.postman_collection.json');

            const container = collection.getEntryById('starting-case-with-adjacent-data.postman_collection.json/0') as ICollectionContainerAdapter;
            const children = container.childEntryIds;
            while (children.length) {
                await container.deleteEntry(children.shift()!);
            }
            await collection.commit();
            jsonCompare(await collection.stringify(), expected);
        });
    });
});
