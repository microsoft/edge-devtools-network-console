// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICollectionFormat, ICollectionAdapter } from '../interfaces';
import { INCNativeRoot } from './format';
import { CollectionAdapter } from './collection-adapter';

export class CollectionFormat implements ICollectionFormat {
    public readonly formatId = 'nc-native';
    public readonly canWrite = true;

    private static _nextNewCollectionId = 0;

    constructor() {}

    async createCollection(name: string): Promise<ICollectionAdapter> {
        const DEFAULT_COLLECTION: INCNativeRoot = {
            meta: {
                networkConsoleCollectionVersion: '0.11.1-preview',
            },
            name,
            entries: [],
        };

        const id = `nc-native-format-new-collection-${CollectionFormat._nextNewCollectionId++}`;
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
