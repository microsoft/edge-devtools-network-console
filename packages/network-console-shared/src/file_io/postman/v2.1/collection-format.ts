// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { uuid } from 'uuidv4';
import { ICollectionFormat, ICollectionAdapter } from '../../interfaces';
import { Postman21Schema } from '../../../collections/postman/v2.1/schema-generated';
import { CollectionAdapter } from './collection-adapter';

export class CollectionFormat implements ICollectionFormat {
    public readonly formatId = 'nc-native';
    public readonly canWrite = true;
    constructor() {}

    async createCollection(name: string): Promise<ICollectionAdapter> {
        const pmid = uuid();
        const DEFAULT_COLLECTION: Postman21Schema = {
            info: {
                name,
                schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
                description: '',
                '_postman_id': pmid,
            },
            item: [],
        };

        const id = `postman-format-new-collection-${pmid}`;
        return new CollectionAdapter(this, id, JSON.stringify(DEFAULT_COLLECTION, null, 4));
    }

    async parse(id: string, contents: string): Promise<ICollectionAdapter> {
        return new CollectionAdapter(this, id, contents);
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
