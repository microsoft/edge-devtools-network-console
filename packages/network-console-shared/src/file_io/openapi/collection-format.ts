// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICollectionFormat, ICollectionAdapter } from '../interfaces';
import SwaggerParser from 'swagger-parser';
import { OpenAPIV2 } from 'openapi-types';
import { CollectionAdapter as CollectionAdapterV2 } from './v2/collection-adapter';

export class CollectionFormat implements ICollectionFormat {
    public readonly formatId = 'openapi';
    public readonly canWrite = false;

    constructor() {}

    async createCollection(name: string): Promise<ICollectionAdapter> {
        throw new ReferenceError('Create / write are not supported.');
    }

    async parse(id: string, fileContents: string): Promise<ICollectionAdapter> {
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
                return new CollectionAdapterV2(this, id, contents as OpenAPIV2.Document);
            }

            throw new ReferenceError(`Version "${(contents as any).swagger}" not supported.`);
        }
        catch (err) {
            throw new RangeError(err.message);
        }
    }

    async tryParse(id: string, contents: string): Promise<ICollectionAdapter | null> {
        try {
            return await this.parse(id, contents);
        }
        catch (_err) {
            return null;
        }
    }
}
