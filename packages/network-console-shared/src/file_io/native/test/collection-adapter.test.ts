// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// tslint:disable:no-unused-expression

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';

chai.use(chaiAsPromised);

import { ICollectionAdapter, ICollectionFormat } from '../../interfaces';
import { CollectionFormat } from '../collection-format';

/**
 * Contains a simple testing collection string, containing a request, a
 * request, a folder, and a request at the top level.The folder is empty.
 */
const TEST_DATA = JSON.stringify({
    meta: {
        networkConsoleCollectionVersion: '0.11.0-preview',
    },
    name: 'Test collection',
    entries: [{
        request: {
            authorization: {
                type: 'inherit',
            },
            body: { content: '' },
            bodyComponents: {
                bodySelection: 'none',
            },
            description: 'Request #1 is the first request.',
            headers: [],
            name: 'First request',
            queryParameters: [],
            routeParameters: [],
            url: 'http://localhost:9999/',
            verb: 'GET',
        }
    }, {
        request: {
            authorization: {
                type: 'token',
                token: {
                    token: '1234abcd',
                },
            },
            body: { content: '' },
            bodyComponents: {
                bodySelection: 'raw',
                rawTextBody: {
                    contentType: 'text/plain',
                    text: 'Hello, world.',
                },
            },
            description: 'Request #2 is the second request.',
            headers: [{
                description: 'The API key of the request.',
                isActive: true,
                key: 'X-ApiKey',
                value: 'not-really-an-api-key',
            }],
            name: 'Second request',
            queryParameters: [],
            routeParameters: [],
            url: 'http://localhost:9999/',
            verb: 'GET',
        }
    }, {
        name: 'Test folder',
        entries: [],
        auth: {
            type: 'basic',
            basic: {
                username: 'user',
                password: 'pass',
                showPassword: false,
            },
        },
    }, {
        request: {
            authorization: {
                type: 'inherit',
            },
            body: { content: '' },
            bodyComponents: {
                bodySelection: 'none',
            },
            description: 'Request #3 is the third request.',
            headers: [],
            name: 'Third request',
            queryParameters: [],
            routeParameters: [{
                description: '',
                isActive: true,
                key: 'bar',
                value: 'key-of-life',
            }, {
                description: '',
                isActive: true,
                key: 'baz',
                value: '42',
            }],
            url: 'http://localhost:9999/foo/:bar/:baz',
            verb: 'DELETE',
        }
    }],
}, null, 4);

describe('network-console-shared/src/file_io/native/collection-adapter', () => {
    describe('Manipulation of an empty collection', () => {
        let collection: ICollectionAdapter;

        beforeEach(async () => {
            (CollectionFormat as any)._nextNewCollectionId = 0;
            const format = new CollectionFormat();
            collection = await format.createCollection('Test collection');
        });

        it('renames the root successfully', async () => {
            const expected = JSON.stringify({
                meta: {
                    networkConsoleCollectionVersion: '0.11.0-preview',
                },
                name: 'Renamed collection',
                entries: [],
            }, null, 4);
            expect(collection.isDirty).to.equal(false);
            collection.name = 'Renamed collection';
            expect(collection.isDirty).to.equal(true);
            await collection.commit();
            expect(collection.isDirty).to.equal(false);
            expect(await collection.stringify()).to.equal(expected);
        });

        it('adds a new collection folder to the root successfully', async () => {
            const expected = JSON.stringify({
                meta: {
                    networkConsoleCollectionVersion: '0.11.0-preview',
                },
                name: 'Test collection',
                entries: [{
                    name: 'Test top-level folder',
                    entries: [],
                }],
            }, null, 4);
            expect(collection.isDirty).to.equal(false);
            await collection.appendContainerEntry('Test top-level folder');
            expect(collection.isDirty).to.equal(true);
            await collection.commit();
            expect(collection.isDirty).to.equal(false);
            expect(await collection.stringify()).to.equal(expected);
        });

        it('adds three new requests and a folder to the root successfully', async () => {
            const expected = TEST_DATA;

            await collection.appendItemEntry({
                authorization: {
                    type: 'inherit',
                },
                body: { content: '' },
                bodyComponents: {
                    bodySelection: 'none',
                },
                description: 'Request #1 is the first request.',
                headers: [],
                name: 'First request',
                queryParameters: [],
                routeParameters: [],
                url: 'http://localhost:9999/',
                verb: 'GET',
            });

            await collection.appendItemEntry({
                authorization: {
                    type: 'token',
                    token: {
                        token: '1234abcd',
                    },
                },
                body: { content: '' },
                bodyComponents: {
                    bodySelection: 'raw',
                    rawTextBody: {
                        contentType: 'text/plain',
                        text: 'Hello, world.',
                    },
                },
                description: 'Request #2 is the second request.',
                headers: [{
                    description: 'The API key of the request.',
                    isActive: true,
                    key: 'X-ApiKey',
                    value: 'not-really-an-api-key',
                }],
                name: 'Second request',
                queryParameters: [],
                routeParameters: [],
                url: 'http://localhost:9999/',
                verb: 'GET',
            });

            const container = await collection.appendContainerEntry('Test folder');
            container.authorization.type = 'basic';
            container.authorization.basic = {
                username: 'user',
                password: 'pass',
                showPassword: false,
            };

            await collection.appendItemEntry({
                authorization: {
                    type: 'inherit',
                },
                body: { content: '' },
                bodyComponents: {
                    bodySelection: 'none',
                },
                description: 'Request #3 is the third request.',
                headers: [],
                name: 'Third request',
                queryParameters: [],
                routeParameters: [{
                    description: '',
                    isActive: true,
                    key: 'bar',
                    value: 'key-of-life',
                }, {
                    description: '',
                    isActive: true,
                    key: 'baz',
                    value: '42',
                }],
                url: 'http://localhost:9999/foo/:bar/:baz',
                verb: 'DELETE',
            });

            await collection.commit();
            expect(collection.isDirty).to.equal(false);
            expect(await collection.stringify()).to.equal(expected);
            expect(collection.childEntryIds).to.deep.equal([
                'nc-native-format-new-collection-0/0',
                'nc-native-format-new-collection-0/1',
                'nc-native-format-new-collection-0/2',
                'nc-native-format-new-collection-0/3',
            ]);
            let entry = collection.getEntryById('nc-native-format-new-collection-0/0');
            expect(entry).to.not.be.null;
            expect(entry!.type).to.equal('item');
            expect(entry!.name).to.equal('First request');
            entry = collection.getEntryById('nc-native-format-new-collection-0/2');
            expect(entry).to.not.be.null;
            expect(entry!.type).to.equal('container');
        });
    });

    describe('Manipulates the collection correctly', () => {
        let format: ICollectionFormat;
        let collection: ICollectionAdapter;

        beforeEach(async () => {
            (CollectionFormat as any)._nextNewCollectionId = 0;
            format = new CollectionFormat();
            collection = await format.parse('req_req_folder_req.nc.json', TEST_DATA);
        });

        it('deletes the 2nd entry', async () => {
            const expected = JSON.stringify({
                meta: {
                    networkConsoleCollectionVersion: '0.11.0-preview',
                },
                name: 'Test collection',
                entries: [{
                    request: {
                        authorization: {
                            type: 'inherit',
                        },
                        body: { content: '' },
                        bodyComponents: {
                            bodySelection: 'none',
                        },
                        description: 'Request #1 is the first request.',
                        headers: [],
                        name: 'First request',
                        queryParameters: [],
                        routeParameters: [],
                        url: 'http://localhost:9999/',
                        verb: 'GET',
                    }
                }, {
                    name: 'Test folder',
                    entries: [],
                    auth: {
                        type: 'basic',
                        basic: {
                            username: 'user',
                            password: 'pass',
                            showPassword: false,
                        },
                    },
                }, {
                    request: {
                        authorization: {
                            type: 'inherit',
                        },
                        body: { content: '' },
                        bodyComponents: {
                            bodySelection: 'none',
                        },
                        description: 'Request #3 is the third request.',
                        headers: [],
                        name: 'Third request',
                        queryParameters: [],
                        routeParameters: [{
                            description: '',
                            isActive: true,
                            key: 'bar',
                            value: 'key-of-life',
                        }, {
                            description: '',
                            isActive: true,
                            key: 'baz',
                            value: '42',
                        }],
                        url: 'http://localhost:9999/foo/:bar/:baz',
                        verb: 'DELETE',
                    }
                }],
            }, null, 4);

            await collection.deleteEntry('req_req_folder_req.nc.json/1');
            expect(collection.isDirty).to.be.true;
            await collection.commit();
            expect(collection.childEntryIds).to.deep.equal([
                'req_req_folder_req.nc.json/0',
                'req_req_folder_req.nc.json/2',
                'req_req_folder_req.nc.json/3',
            ]);
            expect(await collection.stringify()).to.equal(expected);
            let entry = collection.getEntryById('req_req_folder_req.nc.json/2');
            expect(entry).to.not.be.null;
            expect(entry!.type).to.equal('container');
        });

        it('deleteEntry throws if an ID is not found', async () => {
            async function test() {
                await collection.deleteEntry('will not be found');
            }
            expect(test()).to.eventually.be.rejectedWith(RangeError);
        });

        it('appends correctly after deletion', async () => {
            const expected = JSON.stringify({
                meta: {
                    networkConsoleCollectionVersion: '0.11.0-preview',
                },
                name: 'Test collection',
                entries: [{
                    request: {
                        authorization: {
                            type: 'inherit',
                        },
                        body: { content: '' },
                        bodyComponents: {
                            bodySelection: 'none',
                        },
                        description: 'Request #1 is the first request.',
                        headers: [],
                        name: 'First request',
                        queryParameters: [],
                        routeParameters: [],
                        url: 'http://localhost:9999/',
                        verb: 'GET',
                    }
                }, {
                    name: 'Test folder',
                    entries: [],
                    auth: {
                        type: 'basic',
                        basic: {
                            username: 'user',
                            password: 'pass',
                            showPassword: false,
                        },
                    },
                }, {
                    request: {
                        authorization: {
                            type: 'inherit',
                        },
                        body: { content: '' },
                        bodyComponents: {
                            bodySelection: 'none',
                        },
                        description: 'Request #3 is the third request.',
                        headers: [],
                        name: 'Third request',
                        queryParameters: [],
                        routeParameters: [{
                            description: '',
                            isActive: true,
                            key: 'bar',
                            value: 'key-of-life',
                        }, {
                            description: '',
                            isActive: true,
                            key: 'baz',
                            value: '42',
                        }],
                        url: 'http://localhost:9999/foo/:bar/:baz',
                        verb: 'DELETE',
                    }
                }, {
                    name: 'The last container',
                    entries: [],
                }],
            }, null, 4);

            await collection.deleteEntry('req_req_folder_req.nc.json/1');
            await collection.appendContainerEntry('The last container');
            expect(collection.childEntryIds).to.deep.equal([
                'req_req_folder_req.nc.json/0',
                'req_req_folder_req.nc.json/2',
                'req_req_folder_req.nc.json/3',
                'req_req_folder_req.nc.json/4',
            ]);
            await collection.commit();
            expect(await collection.stringify()).to.equal(expected);
            let entry = collection.getEntryById('req_req_folder_req.nc.json/4');
            expect(entry).to.not.be.null;
            expect(entry!.type).to.equal('container');
        });

        it('appends correctly after deleting all of the top-level items', async () => {
            const expected = JSON.stringify({
                meta: {
                    networkConsoleCollectionVersion: '0.11.0-preview',
                },
                name: 'Test collection',
                entries: [{
                    name: 'The last container',
                    entries: [],
                }],
            }, null, 4);

            await collection.deleteEntry('req_req_folder_req.nc.json/1');
            await collection.deleteEntry('req_req_folder_req.nc.json/3');
            await collection.deleteEntry('req_req_folder_req.nc.json/2');
            await collection.deleteEntry('req_req_folder_req.nc.json/0');
            await collection.appendContainerEntry('The last container');
            expect(collection.childEntryIds).to.deep.equal([
                'req_req_folder_req.nc.json/4',
            ]);
            await collection.commit();
            expect(await collection.stringify()).to.equal(expected);
            let entry = collection.getEntryById('req_req_folder_req.nc.json/4');
            expect(entry).to.not.be.null;
            expect(entry!.type).to.equal('container');
        });

        it('is marked dirty after modifying the collection-level authorization', async () => {
            const expected = JSON.stringify({
                ...JSON.parse(TEST_DATA),
                auth: {
                    type: 'token',
                    token: {
                        token: 'abcd1234',
                    },
                },
            }, null, 4);

            collection.authorization.type = 'token';
            collection.authorization.token = {
                token: 'abcd1234',
            };
            expect(collection.isDirty).to.be.true;
            await collection.commit();
            expect(await collection.stringify()).to.equal(expected);
        });
    });
});
