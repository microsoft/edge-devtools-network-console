// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';
import path from 'path';
import util from 'util';
import { ICollectionFormat, ICollectionAdapter } from '../file_io/interfaces';

const readFileAsync = util.promisify(fs.readFile);

export default async function readCollection(filePath: string, format: ICollectionFormat): Promise<ICollectionAdapter> {
    const fileContents = await getContents(filePath);
    const fileName = path.basename(filePath);
    return format.parse(fileName, fileContents);
}

export async function getContents(filePath: string): Promise<string> {
    return await readFileAsync(filePath, { encoding: 'utf8' });
}

export async function getContentsAndFormat(filePath: string): Promise<string> {
    const json = await readFileAsync(filePath, { encoding: 'utf8' });
    const parsed = JSON.parse(json);
    const formatted = JSON.stringify(parsed, null, 4);
    return formatted;
}
