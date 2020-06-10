// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICollection } from 'model/collections';
import { AnyAction } from 'redux';

export interface ISetCollectionTreeAction {
    type: 'COLLECTIONS_TREE_SET_ALL';
    rootCollections: ICollection[];
}


const KNOWN_COLLECTION_ACTIONS = new Set<string>([
    'COLLECTIONS_TREE_SET_ALL',
]);
export type CollectionsAction =
    ISetCollectionTreeAction
    ;

export function isCollectionAction(action: AnyAction): action is CollectionsAction {
    return KNOWN_COLLECTION_ACTIONS.has(action.type);
}

export function makeSetCollectionTreeAction(rootCollections: ICollection[]): ISetCollectionTreeAction {
    return {
        type: 'COLLECTIONS_TREE_SET_ALL',
        rootCollections,
    };
}
