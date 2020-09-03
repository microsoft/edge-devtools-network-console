// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    INetConsoleAuthorization,
    INetConsoleRequest,
    INetConsoleParameter,
} from '../net/net-console-http';

/**
 * This interface describes a supported format for interacting with a Collection.
 * Collections are the component that contain a hierarchical arrangement of saved
 * request configurations.
 */
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

/**
 * This interface describes the root of a given Collection; that is to say, it
 * is approximately equivalent to an actual Collection file.
 */
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

/**
 * This is the base interface for records within a Collection.
 */
export interface ICollectionEntryAdapter {
    name: string;
    collection: ICollectionAdapter;
    type: 'container' | 'item';
    id: string;
}

/**
 * This is the interface that represents a conceptual "folder" within the hierarchy
 * of a Collection. A Collection Container might define a folder-level authorization
 * scheme. They can contain other containers, or items.
 */
export interface ICollectionContainerAdapter extends ICollectionEntryAdapter {
    type: 'container';

    authorization: INetConsoleAuthorization;
    readonly childEntryIds: string[];
    getEntryById(id: string): ICollectionEntryAdapter | null;

    appendItemEntry(item: INetConsoleRequest): Promise<ICollectionItemAdapter>;
    appendContainerEntry(name: string): Promise<ICollectionContainerAdapter>;
    deleteEntry(id: string): Promise<void>;
}

/**
 * This is the interface that represents a conceptual "request" within the
 * hierarchy of a Collection.
 */
export interface ICollectionItemAdapter extends ICollectionEntryAdapter {
    type: 'item';

    readonly request: INetConsoleRequest;
}

export interface IEnvironmentFormat {
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
     * Creates a new, empty environment container in this format. If `canWrite` is false,
     * this method may throw an error.
     *
     * @param name Environment container name
     */
    createEnvironmentContainer(name: string): Promise<IEnvironmentContainerAdapter>;
    /**
     * Parses text contents of a file. If errors are detected, this function may
     * raise an error; however, that is not guaranteed for all contents.
     *
     * @param id A unique ID of this collection.
     * @param contents The file contents.
     */
    parse(id: string, contents: string): Promise<IEnvironmentContainerAdapter>;
    /**
     * Tries to parse text contents of a file. If it fails, will return `null`.
     *
     * @param id A unique ID of this collection.
     * @param contents The file contents.
     */
    tryParse(id: string, contents: string): Promise<IEnvironmentContainerAdapter | null>;
}

export interface IEnvironmentContainerAdapter {
    readonly format: IEnvironmentFormat;
    readonly id: string;
    readonly isDirty: boolean;
    readonly canContainMultipleEnvironments: boolean;

    name: string;

    readonly childIds: string[];
    getEnvironmentById(id: string): IEnvironmentAdapter | null;

    appendEnvironment(name: string): Promise<IEnvironmentAdapter>;
    deleteEnvironment(id: string): Promise<void>;

    stringify(): Promise<string>;
    commit(): Promise<void>;
}

export interface IEnvironmentAdapter {
    name: string;

    variables: INetConsoleParameter[];
}
