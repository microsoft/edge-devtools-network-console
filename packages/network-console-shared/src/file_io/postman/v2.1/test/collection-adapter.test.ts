// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// tslint:disable:no-unused-expression

import { ImportMock } from 'ts-mock-imports';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';
import jsonCompare from '../../../../test-util/json-compare';
import * as uuidv4Module from 'uuidv4';

chai.use(chaiAsPromised);

import { ICollectionAdapter, ICollectionFormat } from '../../../interfaces';
import { CollectionFormat } from '../collection-format';

/**
 * Contains a simple testing Postman 2.1-schema-compatible collection string,
 * containing a request, a request, a folder, and a request at the top level.
 * The folder is empty.
 */
const TEST_DATA = JSON.stringify({
    info: {
        name: 'Test collection',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        description: '',
        _postman_id: '12345678-1234-2345-3456-1234567890ab',
    },
    item: [{
        name: 'First request',
        request: {
            body: {},
            description: 'Request #1 is the first request.',
            method: 'GET',
            header: [],
            url: {
                protocol: 'http',
                host: ['localhost'],
                port: '9999',
                raw: 'http://localhost:9999/',
                path: [
                    ""
                ],
            },
        },
    }, {
        name: 'Second request',
        request: {
            auth: {
                type: 'bearer',
                bearer: [
                    {
                        key: "token",
                        value: "1234abcd",
                        type: "string"
                    },
                ],
            },
            body: {
                mode: 'raw',
                raw: 'Hello, world.',
            },
            description: 'Request #2 is the second request.',
            header: [
                {
                    description: 'The API key of the request.',
                    key: 'X-ApiKey',
                    value: 'not-really-an-api-key',
                    disabled: false,
                },
            ],
            method: 'GET',
            url: {
                protocol: 'http',
                host: ['localhost'],
                port: '9999',
                raw: 'http://localhost:9999/',
                path: [
                    ""
                ],
            },
        },
    }, {
        name: 'Test folder',
        auth: {
            type: 'basic',
            basic: [{
                key: 'username',
                value: 'user',
                type: 'string',
            }, {
                key: 'password',
                value: 'pass',
                type: 'string',
            }, {
                key: 'showPassword',
                value: false,
                type: 'boolean',
            },
            ],
        },
        item: [],
    }, {
        name: 'Third request',
        request: {
            body: {},
            description: 'Request #3 is the third request.',
            method: 'DELETE',
            header: [],
            url: {
                protocol: 'http',
                host: ['localhost'],
                path: [
                    'foo',
                    ':bar',
                    ':baz',
                ],
                port: '9999',
                raw: 'http://localhost:9999/foo/:bar/:baz',
                variable: [
                    {
                        description: '',
                        key: 'bar',
                        value: 'key-of-life',
                        disabled: false,
                        type: 'string',
                    }, {
                        description: '',
                        key: 'baz',
                        value: '42',
                        disabled: false,
                        type: 'string',
                    },
                ],
            },
        },
    },
    ],
}, null, 4);

describe('network-console-shared/src/file_io/postman/v2.1/collection-adapter', () => {
    before(() => {
        const uuidv4Mock = ImportMock.mockFunction(uuidv4Module, 'uuid');
        uuidv4Mock.returns('12345678-1234-2345-3456-1234567890ab');
    });

    after(() => {
        ImportMock.restore();
    });

    describe('Manipulation of an empty collection', () => {
        let collection: ICollectionAdapter;

        beforeEach(async () => {
            const format = new CollectionFormat();
            collection = await format.createCollection('Test collection');
        });

        it('renames the root successfully', async () => {
            const expected = JSON.stringify({
                info: {
                    name: 'Renamed collection',
                    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
                    description: '',
                    _postman_id: '12345678-1234-2345-3456-1234567890ab',
                },
                item: [],
            }, null, 4);
            expect(collection.isDirty).to.equal(false);
            collection.name = 'Renamed collection';
            expect(collection.isDirty).to.equal(true);
            await collection.commit();
            expect(collection.isDirty).to.equal(false);
            jsonCompare(await collection.stringify(), expected);
        });

        it('adds a new collection folder to the root successfully', async () => {
            const expected = JSON.stringify({
                info: {
                    name: 'Test collection',
                    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
                    description: '',
                    _postman_id: '12345678-1234-2345-3456-1234567890ab',
                },
                item: [
                    {
                        name: 'Test top-level folder',
                        item: [],
                    }
                ],
            }, null, 4);
            expect(collection.isDirty).to.equal(false);
            await collection.appendContainerEntry('Test top-level folder');
            expect(collection.isDirty).to.equal(true);
            await collection.commit();
            expect(collection.isDirty).to.equal(false);
            jsonCompare(await collection.stringify(), expected);
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
            jsonCompare(await collection.stringify(), expected);
            expect(collection.childEntryIds).to.deep.equal([
                'postman-format-new-collection-12345678-1234-2345-3456-1234567890ab/0',
                'postman-format-new-collection-12345678-1234-2345-3456-1234567890ab/1',
                'postman-format-new-collection-12345678-1234-2345-3456-1234567890ab/2',
                'postman-format-new-collection-12345678-1234-2345-3456-1234567890ab/3',
            ]);
            let entry = collection.getEntryById('postman-format-new-collection-12345678-1234-2345-3456-1234567890ab/0');
            expect(entry).to.not.be.null;
            expect(entry!.type).to.equal('item');
            expect(entry!.name).to.equal('First request');
            entry = collection.getEntryById('postman-format-new-collection-12345678-1234-2345-3456-1234567890ab/2');
            expect(entry).to.not.be.null;
            expect(entry!.type).to.equal('container');
        });
    });

    describe('Manipulates the collection correctly', () => {
        let format: ICollectionFormat;
        let collection: ICollectionAdapter;

        beforeEach(async () => {
            format = new CollectionFormat();
            collection = await format.parse('req_req_folder_req.postman_collection.json', TEST_DATA);
        });

        it('deletes the 2nd entry', async () => {
            const expected = JSON.stringify({
                info: {
                    name: 'Test collection',
                    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
                    description: '',
                    _postman_id: '12345678-1234-2345-3456-1234567890ab',
                },
                item: [{
                    name: 'First request',
                    request: {
                        body: {},
                        description: 'Request #1 is the first request.',
                        method: 'GET',
                        header: [],
                        url: {
                            protocol: 'http',
                            host: ['localhost'],
                            port: '9999',
                            raw: 'http://localhost:9999/',
                            path: [
                                ""
                            ],
                        },
                    },
                }, {
                    name: 'Test folder',
                    auth: {
                        type: 'basic',
                        basic: [{
                            key: 'username',
                            value: 'user',
                            type: 'string',
                        }, {
                            key: 'password',
                            value: 'pass',
                            type: 'string',
                        }, {
                            key: 'showPassword',
                            value: false,
                            type: 'boolean',
                        },
                        ],
                    },
                    item: [],
                }, {
                    name: 'Third request',
                    request: {
                        body: {},
                        description: 'Request #3 is the third request.',
                        method: 'DELETE',
                        header: [],
                        url: {
                            protocol: 'http',
                            host: ['localhost'],
                            path: [
                                'foo',
                                ':bar',
                                ':baz',
                            ],
                            port: '9999',
                            raw: 'http://localhost:9999/foo/:bar/:baz',
                            variable: [
                                {
                                    description: '',
                                    key: 'bar',
                                    value: 'key-of-life',
                                    disabled: false,
                                    type: 'string',
                                }, {
                                    description: '',
                                    key: 'baz',
                                    value: '42',
                                    disabled: false,
                                    type: 'string',
                                },
                            ],
                        },
                    },
                },
                ],
            }, null, 4);

            await collection.deleteEntry('req_req_folder_req.postman_collection.json/1');
            expect(collection.isDirty).to.be.true;
            await collection.commit();
            expect(collection.childEntryIds).to.deep.equal([
                'req_req_folder_req.postman_collection.json/0',
                'req_req_folder_req.postman_collection.json/2',
                'req_req_folder_req.postman_collection.json/3',
            ]);
            jsonCompare(await collection.stringify(), expected);
            let entry = collection.getEntryById('req_req_folder_req.postman_collection.json/2');
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
                info: {
                    name: 'Test collection',
                    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
                    description: '',
                    _postman_id: '12345678-1234-2345-3456-1234567890ab',
                },
                item: [{
                    name: 'First request',
                    request: {
                        body: {},
                        description: 'Request #1 is the first request.',
                        method: 'GET',
                        header: [],
                        url: {
                            protocol: 'http',
                            host: ['localhost'],
                            port: '9999',
                            raw: 'http://localhost:9999/',
                            path: [
                                ""
                            ],
                        },
                    },
                }, {
                    name: 'Test folder',
                    auth: {
                        type: 'basic',
                        basic: [{
                            key: 'username',
                            value: 'user',
                            type: 'string',
                        }, {
                            key: 'password',
                            value: 'pass',
                            type: 'string',
                        }, {
                            key: 'showPassword',
                            value: false,
                            type: 'boolean',
                        },
                        ],
                    },
                    item: [],
                }, {
                    name: 'Third request',
                    request: {
                        body: {},
                        description: 'Request #3 is the third request.',
                        method: 'DELETE',
                        header: [],
                        url: {
                            protocol: 'http',
                            host: ['localhost'],
                            path: [
                                'foo',
                                ':bar',
                                ':baz',
                            ],
                            port: '9999',
                            raw: 'http://localhost:9999/foo/:bar/:baz',
                            variable: [
                                {
                                    description: '',
                                    key: 'bar',
                                    value: 'key-of-life',
                                    disabled: false,
                                    type: 'string',
                                }, {
                                    description: '',
                                    key: 'baz',
                                    value: '42',
                                    disabled: false,
                                    type: 'string',
                                },
                            ],
                        },
                    },
                }, {
                    name: 'The last container',
                    item: [],
                }
                ],
            }, null, 4);

            await collection.deleteEntry('req_req_folder_req.postman_collection.json/1');
            await collection.appendContainerEntry('The last container');
            expect(collection.childEntryIds).to.deep.equal([
                'req_req_folder_req.postman_collection.json/0',
                'req_req_folder_req.postman_collection.json/2',
                'req_req_folder_req.postman_collection.json/3',
                'req_req_folder_req.postman_collection.json/4',
            ]);
            await collection.commit();
            jsonCompare(await collection.stringify(), expected);
            let entry = collection.getEntryById('req_req_folder_req.postman_collection.json/4');
            expect(entry).to.not.be.null;
            expect(entry!.type).to.equal('container');
        });

        it('appends correctly after deleting all of the top-level items', async () => {
            const expected = JSON.stringify({
                info: {
                    name: 'Test collection',
                    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
                    description: '',
                    _postman_id: '12345678-1234-2345-3456-1234567890ab',
                },
                item: [{
                    name: 'The last container',
                    item: [],
                }],
            }, null, 4);

            await collection.deleteEntry('req_req_folder_req.postman_collection.json/1');
            await collection.deleteEntry('req_req_folder_req.postman_collection.json/3');
            await collection.deleteEntry('req_req_folder_req.postman_collection.json/2');
            await collection.deleteEntry('req_req_folder_req.postman_collection.json/0');
            await collection.appendContainerEntry('The last container');
            expect(collection.childEntryIds).to.deep.equal([
                'req_req_folder_req.postman_collection.json/4',
            ]);
            await collection.commit();
            jsonCompare(await collection.stringify(), expected);
            let entry = collection.getEntryById('req_req_folder_req.postman_collection.json/4');
            expect(entry).to.not.be.null;
            expect(entry!.type).to.equal('container');
        });

        it('is marked dirty after modifying the collection-level authorization', async () => {
            const expected = JSON.stringify({
                ...JSON.parse(TEST_DATA),
                auth: {
                    type: 'bearer',
                    bearer: [{
                        key: 'token',
                        value: 'abcd1234',
                        type: 'string',
                    }],
                },
            }, null, 4);

            collection.authorization.type = 'token';
            collection.authorization.token = {
                token: 'abcd1234',
            };
            expect(collection.isDirty).to.be.true;
            await collection.commit();
            jsonCompare(await collection.stringify(), expected);
        });
    });
});
