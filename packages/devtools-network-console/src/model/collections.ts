// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface ICollection {
    id: string;
    name: string;
    children: ICollection[];
}
