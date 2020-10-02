// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { HttpVerb } from '../../net/verb';
import {
    BodyFormat,
    IFormDataParameter,
    INetConsoleAuthorization,
    INetConsoleBodyComponents,
    INetConsoleParameter,
    INetConsoleRawBody,
    INetConsoleRequest,
} from '../../net/net-console-http';
import { ICollectionFormat, ICollectionAdapter, ICollectionItemAdapter } from '../interfaces';
import { RequestAuthorizationAdapter } from './authorization';
import {
    INCNativeRequest,
} from './format';

export class RequestAdapter implements ICollectionItemAdapter {
    public readonly type = 'item';

    constructor(
        public readonly format: ICollectionFormat,
        public readonly collection: ICollectionAdapter,
        public readonly id: string,
        private readonly realObject: INCNativeRequest,
        private setDirty: () => void,
    ) {

    }

    get request(): INetConsoleRequest {
        return new RequestWrapper(this.realObject.request, this.setDirty);
    }

    get name() {
        return this.realObject.request.name;
    }
}

export class RequestWrapper implements INetConsoleRequest {
    constructor(private realObject: INetConsoleRequest, private setDirty: () => void) {
    }

    get url(): string {
        return this.realObject.url;
    }

    set url(value: string) {
        this.realObject.url = value;
        this.setDirty();
    }

    get verb(): HttpVerb {
        return this.realObject.verb;
    }

    set verb(value: HttpVerb) {
        this.realObject.verb = value;
        this.setDirty();
    }

    get name(): string {
        return this.realObject.name || '';
    }

    set name(value: string) {
        this.realObject.name = value;
        this.setDirty();
    }

    get description(): string {
        return this.realObject.description;
    }

    get body() {
        return {
            content: '',
        };
    }

    set body(_value: any) {
        // Not preserved for file data
    }

    set description(value: string) {
        this.realObject.description = value;
        this.setDirty();
    }

    get authorization(): INetConsoleAuthorization {
        return new RequestAuthorizationAdapter(this.realObject, this.setDirty);
    }

    set authorization(value: INetConsoleAuthorization) {
        const adapter = this.authorization;
        adapter.type = value.type;
        adapter.basic = value.basic;
        adapter.token = value.token;
        this.setDirty();
    }

    get headers(): INetConsoleParameter[] {
       return this.realObject.headers.slice();
    }

    set headers(value: INetConsoleParameter[]) {
        this.realObject.headers = value.slice();
        this.setDirty();
    }

    get queryParameters(): INetConsoleParameter[] {
        return this.realObject.queryParameters.slice();
    }

    set queryParameters(value: INetConsoleParameter[]) {
        this.realObject.queryParameters = value.slice();
        this.setDirty();
    }

    get routeParameters(): INetConsoleParameter[] {
        return this.realObject.routeParameters.slice();
    }

    set routeParameters(value: INetConsoleParameter[]) {
        this.realObject.routeParameters = value.slice();
        this.setDirty();
    }

    get bodyComponents() {
        return new BodyAdapter(this.realObject.bodyComponents, this.setDirty);
    }

    set bodyComponents(value: INetConsoleBodyComponents) {
        const adapter = this.bodyComponents;
        adapter.bodySelection = value.bodySelection;
        adapter.formData = value.formData?.slice();
        adapter.rawTextBody = value.rawTextBody ? {
            ...value.rawTextBody,
        } : undefined;
        adapter.xWwwFormUrlencoded = value.xWwwFormUrlencoded?.slice();
        this.setDirty();
    }
}

export class BodyAdapter implements INetConsoleBodyComponents {
    constructor(private realObj: INetConsoleBodyComponents, private setDirty: () => void) {

    }

    get rawTextBody(): INetConsoleRawBody | undefined {
        return this.realObj.rawTextBody ? {
            ...this.realObj.rawTextBody,
        } : undefined;
    }

    set rawTextBody(value: INetConsoleRawBody | undefined) {
        this.realObj.rawTextBody = value;
        this.setDirty();
    }

    get formData(): IFormDataParameter[] | undefined {
        return this.realObj.formData ? this.realObj.formData.slice() : undefined;
    }

    set formData(value: IFormDataParameter[] | undefined) {
        this.realObj.formData = value;
        this.setDirty();
    }

    get xWwwFormUrlencoded(): INetConsoleParameter[] | undefined {
        return this.realObj.xWwwFormUrlencoded ? this.realObj.xWwwFormUrlencoded.slice() : undefined;
    }

    set xWwwFormUrlencoded(value: INetConsoleParameter[] | undefined) {
        this.realObj.xWwwFormUrlencoded = value?.slice();
        this.setDirty();
    }

    get bodySelection(): BodyFormat {
        return this.realObj.bodySelection;
    }

    set bodySelection(value: BodyFormat) {
        this.realObj.bodySelection = value;
        this.setDirty();
    }
}
