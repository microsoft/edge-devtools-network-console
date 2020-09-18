// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { INetConsoleParameter } from '../../../../net/net-console-http';
import { constructURLObject } from '../url';
import chai, { expect } from 'chai';
import cAP from 'chai-as-promised';
import 'mocha';

chai.use(cAP);

describe('network-console-shared/src/file_io/postman/v2.1/url.ts', () => {
    it('parses a vanilla URL appropriately', async () => {
        const testCase = 'https://www.contoso.com/foo/bar/baz/foo.aspx';
        const testCaseQueries: INetConsoleParameter[] = [{
            description: '',
            isActive: true,
            key: 'foo',
            value: 'bar',
        }, {
            description: '',
            isActive: true,
            key: 'bar',
            value: '#baz',
        }];
        const expectedUrl = 'https://www.contoso.com/foo/bar/baz/foo.aspx?foo=bar&bar=%23baz';
        const expected = {
            host: [
                'www',
                'contoso',
                'com',
            ],
            path: [
                'foo',
                'bar',
                'baz',
                'foo.aspx',
            ],
            protocol: 'https',
            query: [
                {
                    description: '',
                    disabled: false,
                    key: 'foo',
                    value: 'bar',
                },
                {
                    description: '',
                    disabled: false,
                    key: 'bar',
                    value: '#baz'
                },
            ],
            raw: expectedUrl,
        };
        const result = constructURLObject(testCase, [], testCaseQueries);
        expect(result).to.deep.equal(expected);
    });

    it('parses a vanilla URL with route params', async () => {
        const testCase = 'https://www.contoso.com/:foo/:bar/:baz/foo.aspx';
        const testCaseParams: INetConsoleParameter[] = [{
            description: 'The foo',
            isActive: true,
            key: 'foo',
            value: '5',
        }, {
            description: 'The bar',
            isActive: true,
            key: 'bar',
            value: '10',
        }, {
            description: 'The baz',
            isActive: true,
            key: 'baz',
            value: 'frob',
        }];
        const expectedUrl = 'https://www.contoso.com/:foo/:bar/:baz/foo.aspx';
        const expected = {
            host: [
                'www',
                'contoso',
                'com',
            ],
            path: [
                ':foo',
                ':bar',
                ':baz',
                'foo.aspx',
            ],
            protocol: 'https',
            variable: [
                {
                    description: 'The foo',
                    disabled: false,
                    key: 'foo',
                    value: '5',
                    type: 'string',
                },
                {
                    description: 'The bar',
                    disabled: false,
                    key: 'bar',
                    value: '10',
                    type: 'string',
                },
                {
                    description: 'The baz',
                    disabled: false,
                    key: 'baz',
                    value: 'frob',
                    type: 'string',
                }
            ],
            raw: expectedUrl,
        };
        const result = constructURLObject(testCase, testCaseParams, []);
        expect(result).to.deep.equal(expected);
    });

    it('parses a URL with a root variable appropriately', async () => {
        const testCase = '{{uriroot}}/foo/bar/baz/foo.aspx';
        const expectedUrl = '{{uriroot}}/foo/bar/baz/foo.aspx';
        const expected = {
            host: [
                '{{uriroot}}',
            ],
            path: [
                'foo',
                'bar',
                'baz',
                'foo.aspx',
            ],
            raw: expectedUrl,
        };
        const result = constructURLObject(testCase, [], []);
        expect(result).to.deep.equal(expected);
    });
});
