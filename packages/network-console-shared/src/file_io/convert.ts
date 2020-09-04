// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { INetConsoleAuthorization } from '../net/net-console-http';
import {
    ICollectionFormat,
    ICollectionAdapter,
    ICollectionContainerAdapter,
    ICollectionItemAdapter,
    IEnvironmentContainerAdapter,
    IEnvironmentFormat,
} from './interfaces';
import { serializeRequest, serializeAuthorization } from './serialize';

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
    const request = serializeRequest(source.request);
    const resultRequest = await targetContainer.appendItemEntry(request);
    resultRequest.request.authorization = request.authorization;
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

export async function convertEnvironment(source: IEnvironmentContainerAdapter, target: IEnvironmentFormat, ...environmentIds: string[]): Promise<IEnvironmentContainerAdapter> {
    if (!target.canWrite) {
        throw new RangeError('Destination format is not writable');
    }

    const targetEnvironmentContainer = await target.createEnvironmentContainer(source.name);
    const copyingMultipleEnvironments = (environmentIds.length > 1) ||
        (environmentIds.length === 0 && source.childIds.length > 1);
    if (copyingMultipleEnvironments && !targetEnvironmentContainer.canContainMultipleEnvironments) {
        throw new RangeError('Destination format does not support multiple environments per file.');
    }

    const srcIds = environmentIds.length === 0 ? source.childIds : environmentIds;
    if (targetEnvironmentContainer.canContainMultipleEnvironments) {
        for (const id of srcIds) {
            const env = source.getEnvironmentById(id);
            if (!env) {
                throw new RangeError(`Source environment with ID "${id}" was not found.`);
            }
            const dest = await targetEnvironmentContainer.appendEnvironment(env.name);
            dest.variables = env.variables;
        }
    }
    else {
        const src = source.getEnvironmentById(srcIds[0]);
        if (!src) {
            throw new RangeError(`Source environment with ID "${srcIds[0]}" was not found.`);
        }
        const dest = targetEnvironmentContainer.getEnvironmentById(targetEnvironmentContainer.childIds[0])!;
        dest.name = src.name;
        dest.variables = src.variables;
    }

    await targetEnvironmentContainer.commit();
    return targetEnvironmentContainer;
}
