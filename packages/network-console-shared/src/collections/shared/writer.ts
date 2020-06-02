// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { INetConsoleAuthorization, INetConsoleRequest } from '../../net/net-console-http';
import {
    ICollectionEntryReader,
    ICollectionFolderReader,
    ICollectionRootReader,
    ICollectionItemBase,
} from './reader';

export interface ICollectionEntryWriter extends ICollectionEntryReader {
    save(newParameters: INetConsoleRequest): Promise<void>;
}

export interface ICollectionFolderWriter {
    deleteChild(childIndex: number): Promise<boolean>;
    updateAuthorization(authorization: INetConsoleAuthorization): Promise<void>;
    rename(newName: string): Promise<void>;
    appendFolder(newFolderName: string): Promise<ICollectionFolderReader>;
    appendRequest(request: INetConsoleRequest): Promise<ICollectionEntryReader>;
}

export interface IHostFileSystem {
    write(url: string, contents: string): Promise<void>;
}

export function isWritableEntry(entry: ICollectionEntryReader): entry is ICollectionEntryWriter {
    return entry.canWrite;
}

type Maybe<T> = T | never;
export function isWritableFolder<T extends (ICollectionFolderReader | ICollectionRootReader)>(folder: T & Maybe<ICollectionFolderWriter>): folder is (T & ICollectionFolderWriter) {
    return folder.canWrite;
}
