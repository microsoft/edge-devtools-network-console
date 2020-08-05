// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { INetConsoleAuthorization, INetConsoleRequest } from '../net/net-console-http';

export interface ICollectionFormat {
    /**
     * Gets an internal ID for the format.
     */
    readonly formatId: string;
    /**
     * Gets whether this format, or any of the objects it produces, are writable.
     * If not, attempting to write to any of them will raise an exception.
     */
    readonly canWrite: boolean;

    /**
     * Creates a new, empty collection in this format. If `canWrite` is false,
     * this method may throw an error.
     *
     * @param name Collection name
     */
    createCollection(name: string): Promise<ICollectionAdapter>;
    /**
     * Parses text contents of a file. If errors are detected, this function may
     * raise an error; however, that is not guaranteed for all contents.
     *
     * @param id A unique ID of this collection.
     * @param contents The file contents.
     */
    parse(id: string, contents: string): Promise<ICollectionAdapter>;
    /**
     * Tries to parse text contents of a file. If it fails, will return `null`.
     *
     * @param id A unique ID of this collection.
     * @param contents The file contents.
     */
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
    authorization: INetConsoleAuthorization;
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

    authorization: INetConsoleAuthorization;
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
