// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { OpenAPIV2 } from 'openapi-types';

import { INetConsoleAuthorization } from '../../../net/net-console-http';

export function convertSecurityToNC(_document: OpenAPIV2.Document, security?: OpenAPIV2.SecurityRequirementObject[], fallback: 'inherit' | 'none' = 'inherit'): INetConsoleAuthorization {
    if (!security) {
        return {
            type: fallback,
        };
    }

    // TODO: We don't support traversing the document to handle this today.
    // We need to investigate how to support all that.
    return {
        type: fallback,
    };
}
