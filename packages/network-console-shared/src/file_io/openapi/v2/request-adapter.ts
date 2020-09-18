// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { OpenAPIV2 } from 'openapi-types';

import { HttpVerb } from '../../../net/verb';
import { INetConsoleRequest } from '../../../net/net-console-http';
import { ICollectionFormat, ICollectionAdapter, ICollectionItemAdapter } from '../../interfaces';
import { convertSecurityToNC } from './authorization-adapter';

export class RequestAdapter implements ICollectionItemAdapter {
    public readonly type = 'item';
    private readonly operation: OpenAPIV2.OperationObject;

    constructor(
        public readonly format: ICollectionFormat,
        public readonly collection: ICollectionAdapter,
        public readonly id: string,
        private document: OpenAPIV2.Document,
        private path: string,
        private verb: keyof OpenAPIV2.PathItemObject,
    ) {
        const operation = (document.paths[path] as OpenAPIV2.PathItemObject)[verb];
        if (!operation) {
            throw new ReferenceError('Assertion failed: RequestAdapter should not be instantiated if the verb is missing from the given PathItemObject.');
        }
        this.operation = operation as OpenAPIV2.OperationObject;
    }

    get request(): INetConsoleRequest {
        const op = this.operation;
        const queries = (op.parameters || []).filter((p: any) => p.in === 'query');
        const routes = (op.parameters || []).filter((p: any) => p.in === 'path');
        const transformedPath = replaceBracesPathsWithColonParameter(this.path);

        return {
            name: this.name,
            description: '',
            headers: [],
            queryParameters: queries.map((o: any) => {
                return {
                    key: o.name,
                    isActive: true,
                    value: '',
                    description: o.description || o.name,
                };
            }),
            routeParameters: routes.map((o: any) => {
                return {
                    key: o.name,
                    isActive: true,
                    value: '',
                    description: o.description || o.name,
                };
            }),
            bodyComponents: {
                bodySelection: 'none',
                formData: [],
                rawTextBody: {
                    contentType: (op.consumes && op.consumes[0]) || 'application/json',
                    text: '',
                },
                xWwwFormUrlencoded: [],
            },
            authorization: convertSecurityToNC(this.document, op.security, 'inherit'),
            url: `{{baseUri}}${transformedPath}`,
            verb: this.verb.toUpperCase() as HttpVerb,
            body: {
                content: '',
            },
        };
    }

    get name() {
        const op = this.operation;
        if (op.operationId) {
            return op.operationId;
        }

        const transformedPath = replaceBracesPathsWithColonParameter(this.path);
        return `${this.verb.toUpperCase()} ${transformedPath}`;
    }
}

function replaceBracesPathsWithColonParameter(path: string): string {
    return path.replace(/{(.+?)}/g, match => {
        const key = match.substr(1, match.length - 2);
        return `:${key}`;
    });
}
