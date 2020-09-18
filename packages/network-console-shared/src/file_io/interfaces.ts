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

/**
 * Represents a file format for Environments, which are collections of variables
 * which can be substituted into requests.
 */
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

/**
 * This interface represents the root of a given set of Environments; that is,
 * it represents a top-level file. Environments are a little less uniform than
 * Collections in that they don't ever have a full hierarchical structure, and
 * some implementations (notably Postman) don't support multiple environments
 * per file.
 */
export interface IEnvironmentContainerAdapter {
    /**
     * Gets a reference to the format this container was loaded from.
     */
    readonly format: IEnvironmentFormat;
    /**
     * A unique ID for this environment container. It might not be the same
     * from session to session.
     */
    readonly id: string;
    /**
     * Whether this environment container presently has changes that haven't yet
     * been committed.
     */
    readonly isDirty: boolean;
    /**
     * Whether this environment container supports multiple environments.
     */
    readonly canContainMultipleEnvironments: boolean;

    /**
     * The name of this environment (intended to be human-readable).
     */
    name: string;

    /**
     * Gets an array of child IDs. These IDs may change across sessions.
     */
    readonly childIds: string[];
    /**
     * Gets an environment from this container by its id.
     * @param id The ID to request
     */
    getEnvironmentById(id: string): IEnvironmentAdapter | null;

    /**
     * Creates an Environment within this container. By default, it will have
     * no variables defined.
     *
     * This function may throw a {ReferenceError} if the container's
     * {canContainMultipleEnvironments} is {false}.
     *
     * @param name The name of the new environment to create.
     */
    appendEnvironment(name: string): Promise<IEnvironmentAdapter>;
    /**
     * Deletes an environment.
     *
     * This function may throw a {ReferenceError} if the container's
     * {canContainMultipleEnvironments} is {false}.
     *
     * @param id The ID of the environment to delete.
     */
    deleteEnvironment(id: string): Promise<void>;

    /**
     * Returns a JSON representation of the most recently committed
     * version of the Environment container.
     */
    stringify(): Promise<string>;
    /**
     * Updates the internal serialized state of the Environment
     * Container to be consistent with any created or changed environments.
     */
    commit(): Promise<void>;
}

/**
 * Represents an individual collection of environment variables, collectively
 * called an "environment".
 */
export interface IEnvironmentAdapter {
    /**
     * A unique ID for this environment. It might not be the same
     * from session to session.
     */
    readonly id: string;

    /**
     * The name of the environment.
     */
    name: string;

    /**
     * The variables set in the environment.
     *
     * Readers and writers should not change individual parameters, but must assign
     * this property as a group for it to take effect. Similarly, updating individual
     * properties of individual variables may not be noticed. That is, the proper
     * usage is:
     *
     *     env.variables = someUpdatedVariables;
     *
     * The following will not work as expected:
     *
     *     // THESE ARE BAD!
     *     env.variables[0] = theUpdatedParameter;
     *     env.variables[0].key = 'baseUri';
     *
     */
    variables: INetConsoleParameter[];
}
