// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Map as IMap } from 'immutable';
import { CollectionsAction } from 'actions/collections';
import { IHostCollection } from 'network-console-shared';

export interface IFrontendCollectionsState {
    rootCollections: string[];
    allCollections: IMap<string, IHostCollection>;
}

const DEFAULT_COLLECTIONS_STATE: IFrontendCollectionsState = {
    rootCollections: [],
    allCollections: IMap(),
};

const DEFAULT_COLLECTIONS: IHostCollection[] = [];

export default function reduceCollections(state = DEFAULT_COLLECTIONS_STATE, action: CollectionsAction): IFrontendCollectionsState {
    switch (action.type) {
        case 'COLLECTIONS_TREE_SET_ALL':
            const flattenedCollections: [string, IHostCollection][] = [];
            function walkCollection(collection: IHostCollection) {
                flattenedCollections.push([collection.id, collection]);
                collection.children.forEach(child => {
                    walkCollection(child);
                });
            }
            action.rootCollections.forEach(root => {
                walkCollection(root);
            });

            return {
                rootCollections: action.rootCollections.map(c => c.id),
                allCollections: IMap(flattenedCollections),
            };
    }

    return state;
}

export function findNearestInheritedAuthorization(state: IFrontendCollectionsState, requestId: string): IHostCollection | undefined {
    let idToCheck = requestId;
    let indexOfLastDivider = idToCheck.lastIndexOf('/');
    while (indexOfLastDivider > -1) {
        idToCheck = idToCheck.substr(0, indexOfLastDivider);
        const collectionWithId = state.allCollections.get(idToCheck);
        if (collectionWithId) {
            if (collectionWithId.authorization && collectionWithId.authorization.type !== 'inherit') {
                return collectionWithId;
            }
        }

        indexOfLastDivider = idToCheck.lastIndexOf('/');
    }

    return undefined;
}
