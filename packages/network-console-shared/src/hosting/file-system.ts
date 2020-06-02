// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { EventEmitter } from 'events';
import StrictEventEmitter from 'strict-event-emitter-types';

interface Events {
    onFilesListChanged: void;
    onFileChanged: (path: string) => void;
}

export type NCHostFileSystemEvents = StrictEventEmitter<EventEmitter, Events>;

/**
 * The contract that should be implemented by the file system host.
 */
export interface INCHostFileSystem extends NCHostFileSystemEvents {
    getFilePaths(): Promise<string[]>;

    readFileAsBuffer(path: string): Promise<ArrayBufferLike>;
    readFileAsString(path: string): Promise<string>;

    writeStringToFile(contents: string, path: string): Promise<void>;
    writeBufferToFile(contents: ArrayBufferLike, path: string): Promise<void>;
}
