// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CollectionFormat } from './collection-format';
import { CollectionAdapter } from './collection-adapter';
import { ContainerAdapter } from './container-adapter';
import { RequestAdapter } from './request-adapter';

export default CollectionFormat;

export const NetworkConsoleNativeFileFormat = {
    CollectionFormat,
    CollectionAdapter,
    ContainerAdapter,
    RequestAdapter,
};
Object.freeze(NetworkConsoleNativeFileFormat);
