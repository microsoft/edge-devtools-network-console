// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// tslint:disable:no-unused-expression

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';
import jsonCompare from '../../../test-util/json-compare';

chai.use(chaiAsPromised);

import { IEnvironmentContainerAdapter } from '../../interfaces';
import { EnvironmentFormat } from '../environment-format';

describe('network-console-shared/src/file_io/native/environment-container-adapter', () => {
    describe('Manipulation of an empty Environment container', () => {
        let container: IEnvironmentContainerAdapter;

        beforeEach(async () => {
            (EnvironmentFormat as any)._nextNewEnvironmentId = 0;
            const format = new EnvironmentFormat();
            container = await format.createEnvironmentContainer('Test container');
        });

        it('renames the environment container correctly', async () => {
            const expected = JSON.stringify({
                meta: {
                    networkConsoleEnvironmentVersion: '0.11.1-preview',
                },
                name: 'Renamed environment container',
                environments: [],
            });
            expect(container.isDirty).to.be.false;
            container.name = 'Renamed environment container';
            expect(container.isDirty).to.be.true;
            await container.commit();
            expect(container.isDirty).to.be.false;
            jsonCompare(await container.stringify(), expected);
        });

        it('adds a new environment to the container correctly', async () => {
            const expected = JSON.stringify({
                meta: {
                    networkConsoleEnvironmentVersion: '0.11.1-preview',
                },
                name: 'Test container',
                environments: [{
                    name: 'Test environment',
                    variables: []
                }],
            });
            await container.appendEnvironment('Test environment');
            expect(container.isDirty).to.be.true;
            await container.commit();
            jsonCompare(await container.stringify(), expected);
        });

        it('adds a new environment and variables to the container correctly', async () => {
            const expected = JSON.stringify({
                meta: {
                    networkConsoleEnvironmentVersion: '0.11.1-preview',
                },
                name: 'Test container',
                environments: [{
                    name: 'Test environment',
                    variables: [{
                        description: 'The base part of URI requests',
                        isActive: true,
                        key: 'uriroot',
                        value: 'http://localhost:3000/'
                    }],
                }],
            });
            const env = await container.appendEnvironment('Test environment');
            await container.commit();
            env.variables = [{
                description: 'The base part of URI requests',
                isActive: true,
                key: 'uriroot',
                value: 'http://localhost:3000/',
            }];
            expect(container.isDirty).to.be.true;
            await container.commit();
            jsonCompare(await container.stringify(), expected);
        });
    });
});
