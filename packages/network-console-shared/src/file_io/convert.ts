// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { INetConsoleAuthorization } from '../net/net-console-http';
import {
    ICollectionFormat,
    ICollectionAdapter,
    ICollectionContainerAdapter,
    ICollectionItemAdapter,
} from './interfaces';

export async function convertFormats(source: ICollectionAdapter, target: ICollectionFormat): Promise<ICollectionAdapter> {
    if (!target.canWrite) {
        throw new RangeError('Destination format is not writable.');
    }

    const targetCollection = await target.createCollection(source.name);
    for (const id of source.childEntryIds) {
        const child = source.getEntryById(id);
        if (child!.type === 'container') {
            await convertContainer(child as ICollectionContainerAdapter, targetCollection);
        }
        else {
            await convertRequest(child as ICollectionItemAdapter, targetCollection);
        }
    }

    await targetCollection.commit();
    return targetCollection;
}

async function convertContainer(source: ICollectionAdapter | ICollectionContainerAdapter, targetContainer: ICollectionAdapter | ICollectionContainerAdapter): Promise<void> {
    const newContainer = await targetContainer.appendContainerEntry(source.name);
    for (const id of source.childEntryIds) {
        const child = source.getEntryById(id);
        if (child!.type === 'container') {
            await convertContainer(child as ICollectionContainerAdapter, newContainer);
        }
        else {
            await convertRequest(child as ICollectionItemAdapter, newContainer);
        }
    }
    newContainer.authorization = source.authorization;
}

async function convertRequest(source: ICollectionItemAdapter, targetContainer: ICollectionAdapter | ICollectionContainerAdapter): Promise<void> {
    const result = await targetContainer.appendItemEntry(source.request);
    result.request.authorization = source.request.authorization;
}

export function migrateAuthorization(target: INetConsoleAuthorization, source: INetConsoleAuthorization) {
    target.type = source.type;
    if (source.basic) {
        target.basic = {
            username: source.basic.username,
            password: source.basic.password,
            showPassword: source.basic.showPassword,
        };
    }
    if (source.token) {
        target.token = {
            token: source.token.token,
        };
    }
}
