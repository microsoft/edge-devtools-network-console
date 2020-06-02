// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CollectionsAction } from 'actions/collections';
import { ICollection } from 'model/collections';

const DEFAULT_COLLECTIONS: ICollection[] = [];

export default function reduceCollections(state = DEFAULT_COLLECTIONS, action: CollectionsAction): ICollection[] {
    switch (action.type) {
        case 'COLLECTIONS_TREE_SET_ALL':
            return action.rootCollections;
    }

    return state;
}
