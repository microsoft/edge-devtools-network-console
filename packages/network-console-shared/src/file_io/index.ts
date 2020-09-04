// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICollectionFormat } from './interfaces';
import { CollectionFormat as NativeCollectionFormat } from './native/collection-format';
import { CollectionFormat as PostmanV2Point1CollectionFormat } from './postman/v2.1/collection-format';
import { CollectionFormat as OpenAPICollectionFormat } from './openapi/collection-format';

const formats = {
    'nc-native': new NativeCollectionFormat() as ICollectionFormat,
    'postman-v2.1': new PostmanV2Point1CollectionFormat() as ICollectionFormat,
    'openapi': new OpenAPICollectionFormat() as ICollectionFormat,
};
export default formats;
