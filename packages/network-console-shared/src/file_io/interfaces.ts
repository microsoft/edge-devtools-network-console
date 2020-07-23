// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { INetConsoleAuthorization, INetConsoleRequest } from '../net/net-console-http';

export interface ICollectionFormat {
    readonly formatId: string;
    createCollection(name: string): Promise<ICollectionAdapter>;
    parse(id: string, contents: string): Promise<ICollectionAdapter>;
    tryParse(id: string, contents: string): Promise<ICollectionAdapter | null>;
}

export interface ICollectionAdapter {
    readonly format: ICollectionFormat;
    readonly id: string;
    readonly isDirty: boolean;

    /**
     * Gets or sets the name of the collection.
     */
    name: string;

    /**
     * Gets a reference to an object that implements INetConsoleAuthorization.
     */
    readonly authorization: INetConsoleAuthorization;
    /**
     * Gets a list of IDs representing the direct descendants of this collection, that is,
     * top-level
     */
    readonly childEntryIds: string[];
    getEntryById(id: string): ICollectionEntryAdapter | null;

    appendItemEntry(item: INetConsoleRequest): Promise<ICollectionItemAdapter>;
    appendContainerEntry(name: string): Promise<ICollectionContainerAdapter>;
    deleteEntry(id: string): Promise<void>;

    stringify(): Promise<string>;
    commit(): Promise<void>;
}

export interface ICollectionEntryAdapter {
    name: string;
    collection: ICollectionAdapter;
    type: 'container' | 'item';
    id: string;
}

export interface ICollectionContainerAdapter extends ICollectionEntryAdapter {
    type: 'container';

    readonly authorization: INetConsoleAuthorization;
    readonly childEntryIds: string[];
    getEntryById(id: string): ICollectionEntryAdapter | null;

    appendItemEntry(item: INetConsoleRequest): Promise<ICollectionItemAdapter>;
    appendContainerEntry(name: string): Promise<ICollectionContainerAdapter>;
    deleteEntry(id: string): Promise<void>;
}

export interface ICollectionItemAdapter extends ICollectionEntryAdapter {
    type: 'item';

    readonly request: INetConsoleRequest;
}
