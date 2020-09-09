// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import SwaggerParser from 'swagger-parser';
import { OpenAPIV2 } from 'openapi-types';
import {
    IEnvironmentFormat,
    IEnvironmentContainerAdapter,
} from '../interfaces';
import { EnvironmentContainerAdapter as EnvironmentContainerAdapterV2 } from './v2/environment-container-adapter';

export class EnvironmentFormat implements IEnvironmentFormat {
    public readonly formatId = 'openapi-v2-env';
    public readonly canWrite = false;

    constructor() {}

    async createEnvironmentContainer(name: string): Promise<IEnvironmentContainerAdapter> {
        throw new ReferenceError('Writing is not supported for this format.');
    }

    async parse(id: string, fileContents: string): Promise<IEnvironmentContainerAdapter> {
        try {
            let loadState = false;
            const contents = await (SwaggerParser as any as typeof SwaggerParser.default).validate(id, {
                resolve: {
                    external: false,
                    file: {
                        canRead: () => {
                            if (loadState === false) {
                                loadState = true;
                                return true;
                            }
                            return false;
                        },
                        read: () => {
                            return fileContents;
                        }
                    },
                    http: {
                        canRead: () => {
                            if (loadState === false) {
                                loadState = true;
                                return true;
                            }
                            return false;
                        },
                        read: () => {
                            return fileContents;
                        },
                    },
                },
            });
            if ((contents as any).swagger?.startsWith?.('2.0')) {
                return new EnvironmentContainerAdapterV2(this, id, contents as OpenAPIV2.Document);
            }

            throw new ReferenceError(`Version "${(contents as any).swagger}" not supported.`);
        }
        catch (err) {
            throw new RangeError(err.message);
        }
    }

    async tryParse(id: string, contents: string): Promise<IEnvironmentContainerAdapter | null> {
        try {
            return await this.parse(id, contents);
        }
        catch (_err) {
            return null;
        }
    }
}
