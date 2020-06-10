// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    ICollectionRootReader,
    ICollectionItemBase,
    ICollectionFolderReader,
    ICollectionEntryReader,
} from '../shared/reader';
import { INetConsoleAuthorization, INetConsoleRequest } from '../../net/net-console-http';
import lazy, { Lazy } from '../../util/lazy';
import { ICollectionEntryWriter, IHostFileSystem, ICollectionFolderWriter } from '../shared/writer';

type NCChild = INCNativeFolder | INCNativeRequest;
interface INCNativeFolder {
    name: string;
    auth?: INetConsoleAuthorization;
    entries: NCChild[];
}

interface INCNativeRequest {
    auth?: INetConsoleAuthorization;
    request: INetConsoleRequest;
}

/**
 * Describes the root definition of a native Network Console (.ns.json) file.
 */
interface INCNativeRoot extends INCNativeFolder {
    meta: {
        networkConsoleCollectionVersion: string;
    };
}

function isNCFolder(entry: NCChild): entry is INCNativeFolder {
    return 'entries' in entry;
}

export class NCNativeReader implements ICollectionRootReader, ICollectionFolderWriter {
    public readonly type = 'root';
    public readonly canWrite = true;
    private root: INCNativeFolder;
    private _children: Lazy<ICollectionItemBase[]>;

    constructor(public readonly url: string, json: string, private readonly fileSystem?: IHostFileSystem) {
        this.root = JSON.parse(json);

        this._children = lazy(() => {
            return this.root.entries.map(entry => itemFromNative(entry, this));
        });
    }

    public get name() {
        return this.root.name;
    }

    public get children() {
        return this._children().slice();
    }

    public get authorization(): INetConsoleAuthorization {
        return this.root.auth || {
            type: 'inherit',
        };
    }

    public async persist(): Promise<boolean> {
        if (!this.fileSystem) {
            return false;
        }

        const serialized = JSON.stringify(this.root, null, 2);
        await this.fileSystem.write(this.url, serialized);
        return true;
    }

    async deleteChild(childIndex: number): Promise<boolean> {
        if (childIndex < 0 || childIndex >= this.root.entries.length) {
            return false;
        }

        this.root.entries.splice(childIndex, 1);
        return await this.persist();
    }

    async updateAuthorization(authorization: INetConsoleAuthorization): Promise<void> {
        this.root.auth = authorization;
        await this.persist();
    }

    async rename(newName: string): Promise<void> {
        this.root.name = newName;
        await this.persist();
    }

    async appendFolder(newFolderName: string): Promise<ICollectionFolderReader> {
        const newFolder: INCNativeFolder = {
            entries: [],
            name: newFolderName,
            auth: {
                type: 'inherit',
            },
        };
        this.root.entries.push(newFolder);
        await this.persist();

        return new NCNativeFolderReader(newFolder, this);
    }

    async appendRequest(request: INetConsoleRequest): Promise<ICollectionEntryReader> {
        const newEntry: INCNativeRequest = {
            request,
        };
        this.root.entries.push(newEntry);
        await this.persist();

        return new NCNativeEntryReader(newEntry, this);
    }
}

function itemFromNative(native: NCChild, root: NCNativeReader): ICollectionItemBase {
    if (isNCFolder(native)) {
        return new NCNativeFolderReader(native, root);
    }
    else {
        return new NCNativeEntryReader(native, root);
    }
}

class NCNativeFolderReader implements ICollectionFolderReader, ICollectionFolderWriter {
    public readonly type = 'folder';
    public readonly canWrite = true;
    private _children: Lazy<ICollectionItemBase[]>;
    constructor(private readonly entry: INCNativeFolder,
                private root: NCNativeReader) {
        this._children = lazy(() => {
            return entry.entries.map(entry => itemFromNative(entry, root));
        });
    }

    public get name() {
        return this.entry.name;
    }

    public get children() {
        return this._children().slice();
    }

    public get authorization(): INetConsoleAuthorization {
        return this.entry.auth || {
            type: 'inherit',
        };
    }

    async deleteChild(childIndex: number): Promise<boolean> {
        if (childIndex < 0 || childIndex >= this.entry.entries.length) {
            return false;
        }

        this.entry.entries.splice(childIndex, 1);
        return await this.root.persist();
    }

    async updateAuthorization(authorization: INetConsoleAuthorization): Promise<void> {
        this.entry.auth = authorization;
        await this.root.persist();
    }

    async rename(newName: string): Promise<void> {
        this.entry.name = newName;
        await this.root.persist();
    }

    async appendFolder(newFolderName: string): Promise<ICollectionFolderReader> {
        const newFolder: INCNativeFolder = {
            entries: [],
            name: newFolderName,
            auth: {
                type: 'inherit',
            },
        };
        this.entry.entries.push(newFolder);
        await this.root.persist();

        return new NCNativeFolderReader(newFolder, this.root);
    }

    async appendRequest(request: INetConsoleRequest): Promise<ICollectionEntryReader> {
        const newEntry: INCNativeRequest = {
            request,
        };
        this.entry.entries.push(newEntry);
        await this.root.persist();

        return new NCNativeEntryReader(newEntry, this.root);
    }
}

class NCNativeEntryReader implements ICollectionEntryReader, ICollectionEntryWriter {
    public readonly type = 'entry';
    public readonly canWrite = true;
    private _request: Lazy<INetConsoleRequest>;
    constructor(private readonly entry: INCNativeRequest,
                private root: NCNativeReader) {
        this._request = lazy(() => {
            return {
                ...entry.request,
            };
        });
    }

    public get name() {
        return this.entry.request.name;
    }

    public get request() {
        return this._request();
    }

    async save(newParameters: INetConsoleRequest): Promise<void> {
        this._request = lazy(() => {
            return {
                ...newParameters,
            };
        });
        this.entry.request = newParameters;

        await this.root.persist();
    }
}
