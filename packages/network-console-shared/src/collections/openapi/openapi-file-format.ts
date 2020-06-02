// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import SwaggerParser from 'swagger-parser';
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import { INetConsoleRequest } from '../../net/net-console-http';
import { ICollectionRootReader, ICollectionEntryReader } from '../shared/reader';
import { INetConsoleAuthorization } from '../../net/net-console-http';
import { HttpVerb } from '../../net/verb';

export default class SwaggerFileFormatReader implements ICollectionRootReader {
    public readonly canWrite = false;
    public readonly type = 'root';
    private readonly _children: INetConsoleRequest[] = [];
    private readonly _name: string;
    public baseUrl: string | undefined;

    private constructor(
        public readonly url: string,
        contents: OpenAPI.Document
    ) {
        this._name = contents.info.title;
        this.onDocumentBound(contents);
    }

    static async fromText(fileUri: string, fileContents: string): Promise<SwaggerFileFormatReader> {
        // swagger-parser@9.0.1 has a type error for the way the default export
        // is packaged. This typecast emits the correct code while preserving the type semantics.
        const contents = await (SwaggerParser as any as typeof SwaggerParser.default).validate(fileUri, {
            resolve: {
                external: false,
                file: {
                    canRead: info => info.url === fileUri,
                    read: () => fileContents,
                },
                http: {
                    canRead: info => info.url === fileUri,
                    read: () => fileContents,
                },
            },
        });
        return new SwaggerFileFormatReader(fileUri, contents);
    }

    private onDocumentBound(doc: OpenAPI.Document): INetConsoleRequest[] {
        if ((doc as any).swagger.startsWith('2.0')) {
            const routes = this.onV2DocumentBound(doc as OpenAPIV2.Document);
            this._children.push(...routes);
            return routes;
        }
        else if ((doc as any).swagger.startsWith('3.')) {
            return this.onV3DocumentBound(doc as OpenAPIV3.Document);
        }
        else {
            return this.onV3DocumentBound(doc as OpenAPIV3.Document);
        }
    }

    private onV2DocumentBound(doc: OpenAPIV2.Document): INetConsoleRequest[] {
        if (doc.schemes && doc.schemes.length > 0 && doc.host) {
            this.baseUrl = `${doc.schemes[0]}://${doc.host}`;
            if (doc.basePath) {
                this.baseUrl += doc.basePath;
            }
        }

        const paths = Object.keys(doc.paths);
        const requests: INetConsoleRequest[] = [];
        let index = 0;
        for (const pathString of paths) {
            const path = doc.paths[pathString] as OpenAPIV2.PathItemObject;

            if (path.delete) {
                requests.push(
                    this.requestFromOperationV2(
                        path.delete, pathString, 'DELETE', String(index++)
                    )
                );
            }
            else if (path.del) {
                requests.push(
                    this.requestFromOperationV2(
                        path.del, pathString, 'DELETE', String(index++)
                    )
                );
            }

            if (path.get) {
                requests.push(
                    this.requestFromOperationV2(
                        path.get, pathString, 'GET', String(index++)
                    )
                );
            }

            if (path.head) {
                requests.push(
                    this.requestFromOperationV2(
                        path.head, pathString, 'HEAD', String(index++)
                    )
                );
            }

            if (path.options) {
                requests.push(
                    this.requestFromOperationV2(
                        path.options, pathString, 'OPTIONS', String(index++)
                    )
                );
            }

            if (path.patch) {
                requests.push(
                    this.requestFromOperationV2(
                        path.patch, pathString, 'PATCH', String(index++)
                    )
                );
            }

            if (path.post) {
                requests.push(
                    this.requestFromOperationV2(
                        path.post, pathString, 'POST', String(index++)
                    )
                );
            }

            if (path.put) {
                requests.push(
                    this.requestFromOperationV2(
                        path.put, pathString, 'PUT', String(index++)
                    )
                );
            }
        }

        return requests;
    }

    private replaceBracesPathsWithColonParameter(path: string): string {
        return path.replace(/{(.+?)}/g, match => {
            const key = match.substr(1, match.length - 2);
            return `:${key}`;
        });
    }

    private onV3DocumentBound(doc: OpenAPIV3.Document): INetConsoleRequest[] {
        throw new Error('V3 is not yet supported.');
        // const paths = Object.keys(doc.paths);
        // const requests: INetConsoleRequest[] = [];
        // let index = 0;
        // for (const pathString of paths) {
        //     const path = doc.paths[pathString];
        // }
    }

    private requestFromOperationV2(op: OpenAPIV2.OperationObject, path: string, verb: string, id: string): INetConsoleRequest {
        const queries = (op.parameters || []).filter((p: any) => p.in === 'query');
        const routes = (op.parameters || []).filter((p: any) => p.in === 'path');
        const transformedPath = this.replaceBracesPathsWithColonParameter(path);

        return {
            name: op.operationId || `${verb} ${transformedPath}`,
            description: '',
            headers: [],
            queryParameters: queries.map((o: any, ix: number) => {
                return {
                    key: o.name,
                    isActive: true,
                    value: '',
                    description: o.description || o.name,
                };
            }),
            routeParameters: routes.map((o: any, ix: number) => {
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
            authorization: {
                type: 'inherit',
            },
            url: `{{baseUri}}${transformedPath}`,
            verb: verb.toUpperCase() as HttpVerb,
            body: {
                content: '',
            },
        };
    }

    get name() {
        return this._name;
    }

    get children() {
        return this._children.map(entry => {
            const req: ICollectionEntryReader = {
                canWrite: false,
                name: entry.name,
                request: entry,
                type: 'entry',
            };
            return req;
        });
    }

    get authorization(): INetConsoleAuthorization {
        return {
            type: 'none',
        };
    }
}
