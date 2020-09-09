// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// tslint:disable:no-unused-expression

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';
import { getContents } from '../../../../test-util/read-collection';

chai.use(chaiAsPromised);

import { EnvironmentFormat } from '../../environment-format';

async function loadValidEnvironment() {
    const fileContents = await getContents('src/file_io/openapi/v2/test/cases/petstore-swagger-io.json');
    const format = new EnvironmentFormat();

    return await format.parse('petstore-swagger-io.json', fileContents);
}

describe('network-console-shared/src/file_io/openapi/v2/environment-container-adapter', () => {
    describe('Manipulation of an environment container', () => {
        it('Throws if you try to create an environment', async () => {
            function test() {
                const format = new EnvironmentFormat();
                return format.createEnvironmentContainer('Will not work');
            }

            await expect(test()).to.eventually.be.rejectedWith(ReferenceError);
        });

        it('Throws if you try to rename an environment', async () => {
            async function test() {
                const environment = await loadValidEnvironment();
                environment.name = 'Hello world.';
            }

            await expect(test()).to.eventually.be.rejectedWith(ReferenceError);
        });

        it('Throws if you try to add an environment to the root', async () => {
            async function test() {
                const env = await loadValidEnvironment();
                await env.appendEnvironment('This will fail.');
            }

            await expect(test()).to.eventually.be.rejectedWith(ReferenceError);
        });

        it('Throws if you try to delete an environment', async () => {
            async function test() {
                const env = await loadValidEnvironment();
                const firstChild = env.childIds[0];
                await env.deleteEnvironment(firstChild);
            }

            await expect(test()).to.eventually.be.rejectedWith(ReferenceError);
        });

        it('Throws if trying to commit', async () => {
            async function test() {
                const env = await loadValidEnvironment();
                await env.commit();
            }

            await expect(test()).to.eventually.be.rejectedWith(ReferenceError);
        });
    });

    describe('Loads an environment appropriately', () => {
        it('Loads a valid environment with two configurations', async () => {
            const env = await loadValidEnvironment();
            const expectedIds = [`${env.id}/https`, `${env.id}/http`];
            expect(env.childIds).to.deep.equal(expectedIds);

            const expectedHttpsVariables = [
                {
                    description: 'Auto-generated from the OpenAPI document to access the root of the API service',
                    isActive: true,
                    key: 'baseUri',
                    value: 'https://petstore.swagger.io/v2',
                },
            ];
            const httpsEnv = env.getEnvironmentById(`${env.id}/https`);
            expect(httpsEnv!.name).to.equal('https');
            expect(httpsEnv!.variables).to.deep.equal(expectedHttpsVariables);

            const expectedHttpVariables = [
                {
                    description: 'Auto-generated from the OpenAPI document to access the root of the API service',
                    isActive: true,
                    key: 'baseUri',
                    value: 'http://petstore.swagger.io/v2',
                },
            ];
            const httpEnv = env.getEnvironmentById(`${env.id}/http`);
            expect(httpEnv!.name).to.equal('http');
            expect(httpEnv!.variables).to.deep.equal(expectedHttpVariables);
        });
    });
});
