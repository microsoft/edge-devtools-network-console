// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function nodeOrAncestor(node: Node, test: (node: Node) => boolean): Node | null {
    let current: Node | null = node;
    while (current) {
        if (test(current)) {
            return current;
        }

        current = current.parentNode;
    }

    return null;
}

export function findInAncestors(element: HTMLElement, test: (e: HTMLElement) => boolean): HTMLElement | null {
    let current: HTMLElement | null = element;
    while (current) {
        if (test(current)) {
            return current;
        }

        current = current.parentElement;
    }

    return null;
}
