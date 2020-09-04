// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';
import { ImportMock } from 'ts-mock-imports';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';
import formats from '../index';
import readCollection from '../../test-util/read-collection';

chai.use(chaiAsPromised);

import { ICollectionItemAdapter } from '../interfaces';
import { INetConsoleRequest } from '../../net/net-console-http';
import { serializeRequest } from '../serialize';

describe('src/file_io/serialize', () => {
    // TODO: needed the following types of requests: authorization with token,
    // authorization with basic, xWwwFormUrlencoded, formData

    it('Serializes an INetConsoleRequest in full correctly', async () => {
        const collection = await readCollection('src/file_io/native/test/cases/starting-case.nc.json', formats['nc-native']);
        const expected: INetConsoleRequest = {
            authorization: {
                type: 'inherit',
            },
            body: {
                content: '',
            },
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
        };

        const entry = collection.getEntryById(collection.childEntryIds[1]) as ICollectionItemAdapter;
        const formatted = serializeRequest(entry.request);
        expect(formatted).to.deep.equal(expected);
    });
});
