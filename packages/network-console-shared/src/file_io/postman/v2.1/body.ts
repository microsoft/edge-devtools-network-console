// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Body, Mode, RequestObject } from '../../../collections/postman/v2.1/schema-generated';
import {
    BodyFormat,
    IFormDataParameter,
    INetConsoleBodyComponents,
    INetConsoleParameter,
    INetConsoleRawBody,
} from '../../../net/net-console-http';

export class BodyAdapter implements INetConsoleBodyComponents {
    constructor(private body: Body, private request: RequestObject, private setDirty: () => void) {

    }

    get rawTextBody(): INetConsoleRawBody | undefined {
        return new RawBodyAdapter(this.body, this.request, this.setDirty);
    }

    set rawTextBody(value: INetConsoleRawBody | undefined) {
        if (!value) {
            delete this.body.raw;
            return;
        }

        const adapter = this.rawTextBody;
        adapter!.contentType = value.contentType;
        adapter!.text = value.text;
        this.setDirty();
    }

    get formData(): IFormDataParameter[] | undefined {
        if (!this.body.formdata) {
            return undefined;
        }

        return this.body.formdata.map(fd => {
            if (fd.type === 'file') {
                return {
                    type: 'file',
                    description: !!fd.description ? String(fd.description) : '',
                    isActive: !fd.disabled,
                    key: fd.key,
                    value: Array.isArray(fd.src) ? '' : (fd.src || ''),
                };
            }

            return {
                type: 'text',
                description: !!fd.description ? String(fd.description) : '',
                isActive: !fd.disabled,
                key: fd.key,
                value: fd.value || '',
            };
        });
    }

    set formData(value: IFormDataParameter[] | undefined) {
        this.setDirty();
        if (!value) {
            delete this.body.formdata;
            return;
        }

        this.body.formdata = value.map(fd => {
            if (fd.type === 'file') {
                return {
                    type: 'file',
                    description: fd.description,
                    disabled: !fd.isActive,
                    key: fd.key,
                    src: fd.value,
                };
            }

            return {
                type: 'text',
                description: fd.description,
                disabled: !fd.isActive,
                key: fd.key,
                value: fd.value,
            };
        });
    }

    get xWwwFormUrlencoded(): INetConsoleParameter[] | undefined {
        if (!this.body.urlencoded) {
            return undefined;
        }

        return this.body.urlencoded.map(ue => {
            return {
                description: !!ue.description ? String(ue.description) : '',
                isActive: !ue.disabled,
                key: ue.key || '',
                value: ue.value || '',
            };
        });
    }

    set xWwwFormUrlencoded(value: INetConsoleParameter[] | undefined) {
        this.setDirty();
        if (!value) {
            delete this.body.urlencoded;
            return;
        }

        this.body.urlencoded = value.map(p => {
            return {
                key: p.key,
                description: p.description,
                disabled: !p.isActive,
                value: p.value,
            };
        });
    }

    get bodySelection(): BodyFormat {
        if (!this.body.mode) {
            return 'none';
        }

        switch (this.body.mode) {
            case Mode.File:
            case Mode.Graphql:
                // Currently unsupported
                return 'none';
            case Mode.Formdata:
                return 'form-data';
            case Mode.Raw:
                return 'raw';
            case Mode.Urlencoded:
                return 'x-www-form-urlencoded';

            default:
                return 'none';
        }
    }

    set bodySelection(value: BodyFormat) {
        this.setDirty();
        switch (value) {
            case 'none':
                delete this.body.mode;
                break;
            case 'raw':
                this.body.mode = Mode.Raw;
                break;
            case 'x-www-form-urlencoded':
                this.body.mode = Mode.Urlencoded;
                break;
            case 'form-data':
                this.body.mode = Mode.Formdata;
                break;

            default:
                // Unsupported
                throw new RangeError(`Unrecognized value "${value}" for Body type.`);
        }
    }
}

export class RawBodyAdapter implements INetConsoleRawBody {
    constructor(private body: Body, private request: RequestObject, private setDirty: () => void) {

    }

    get text() {
        return this.body.raw || '';
    }

    set text(value: string) {
        this.body.raw = value;
        this.setDirty();
    }

    get contentType() {
        if (Array.isArray(this.request.header)) {
            const contentTypeHeader = this.request.header.find(h => h.key.toLowerCase() === 'content-type');
            if (!contentTypeHeader) {
                return '';
            }

            let val = contentTypeHeader.value;
            if (val) {
                const separatorIndex = val.indexOf(';');
                if (separatorIndex > -1) {
                    val = val.substr(0, separatorIndex);
                }

                return val;
            }
        }

        return '';
    }

    set contentType(value: string) {
        if (Array.isArray(this.request.header)) {
            const contentTypeHeader = this.request.header.find(h => h.key.toLowerCase() === 'content-type');
            if (contentTypeHeader) {
                contentTypeHeader.value = value;
            }
            else {
                this.request.header.push({
                    key: 'Content-Type',
                    value,
                    description: 'Set by body selection',
                });
            }
        }
        else {
            this.request.header = [{
                key: 'Content-Type',
                value,
                description: 'Set by body selection',
            }];
        }
        this.setDirty();
    }
}
