// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICollectionFormat, IEnvironmentFormat } from './interfaces';

import { CollectionFormat as NativeCollectionFormat } from './native/collection-format';
import { CollectionFormat as PostmanV2Point1CollectionFormat } from './postman/v2.1/collection-format';
import { CollectionFormat as OpenAPICollectionFormat } from './openapi/collection-format';

import { EnvironmentFormat as NativeEnvironmentFormat } from './native/environment-format';
import { EnvironmentFormat as PostmanEnvironmentFormat } from './postman/v2.1/environment-format';
import { EnvironmentFormat as OpenAPIEnvironmentFormat } from './openapi/environment-format';

const formats = {
    'nc-native': new NativeCollectionFormat() as ICollectionFormat,
    'postman-v2.1': new PostmanV2Point1CollectionFormat() as ICollectionFormat,
    'openapi': new OpenAPICollectionFormat() as ICollectionFormat,
};
export default formats;

export const environmentFormats = {
    'nc-native-env': (new NativeEnvironmentFormat()) as IEnvironmentFormat,
    'postman-v2.1-env': (new PostmanEnvironmentFormat()) as IEnvironmentFormat,
    'openapi-env': (new OpenAPIEnvironmentFormat()) as IEnvironmentFormat,
};
