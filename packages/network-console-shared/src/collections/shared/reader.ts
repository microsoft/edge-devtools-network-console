// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { INetConsoleAuthorization, INetConsoleRequest } from '../../net/net-console-http';
import { NCNativeReader } from '../native/native-file-format';
import { Postman21NativeReader } from '../postman/v2.1/postman-2.1-file-format';
import SwaggerFileFormatReader from '../openapi/openapi-file-format';
import deprecated from '../../util/deprecate';

export interface ICollectionsReader {
    readCollection(fileContents: string): Promise<ICollectionRootReader>;
}

export type CollectionItemType = 'root' | 'folder' | 'entry';

export interface ICollectionItemBase {
    readonly name: string;
    readonly type: CollectionItemType;
    readonly canWrite: boolean;
}

/**
 * Represents the reader-part of a root of a collection.
 */
export interface ICollectionRootReader extends ICollectionItemBase {
    readonly type: 'root';
    readonly children: ICollectionItemBase[];
    readonly authorization: INetConsoleAuthorization;

    readonly url: string;
    readonly baseUrl?: string;
}

/**
 * Represents the reader-part of a folder of a collection.
 */
export interface ICollectionFolderReader extends ICollectionItemBase {
    readonly type: 'folder';
    readonly children: ICollectionItemBase[];
    readonly authorization: INetConsoleAuthorization;
}

/**
 * Represents the reader-part of a leaf entry in a collection (that represents a request).
 */
export interface ICollectionEntryReader extends ICollectionItemBase {
    readonly type: 'entry';
    readonly request: INetConsoleRequest;
}

export async function tryReadCollection(sourceUrl: string, collectionText: string): Promise<ICollectionRootReader | null> {
    deprecated('Collections.tryReadCollectionAsync', 'FileFormats.CollectionFormat');

    try {
        // First, attempt to examine whether it's a known JSON format.

        // Network Console native file format
        const jsonObj = JSON.parse(collectionText);
        if ('meta' in jsonObj) {
            if ('networkConsoleCollectionVersion' in jsonObj.meta) {
                return new NCNativeReader(sourceUrl, collectionText);
            }
        }

        // Postman v2.1 schema format
        if ('info' in jsonObj) {
            if ('schema' in jsonObj.info) {
                if (jsonObj.info.schema === 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json') {
                    return new Postman21NativeReader(sourceUrl, collectionText);
                }
            }
        }
    }
    catch {}

    // OpenAPI JSON or YAML
    try {
        const swaggerReader = await SwaggerFileFormatReader.fromText(sourceUrl, collectionText);
        return swaggerReader;
    }
    catch { }

    return null;
}
