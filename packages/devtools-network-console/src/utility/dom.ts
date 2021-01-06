// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { AppHost } from 'store/host';

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

export function focusInModal(modalRootSelector: string, candidateRecipientsSelectors: string[]) {
    const root = document.querySelector(modalRootSelector);
    const candidates = root?.querySelectorAll('input,a[href],button');
    if (candidates && candidates.length) {
        (candidates[0] as HTMLElement).focus();
    }
}

type RestoreTarget = 'host' | HTMLElement;
export class FocusRestorer {
    private static _focusStack: RestoreTarget[] = [];

    static focusInModal(modalRootSelector: string, candidateRecipientsSelectors: string[] = ['input,a[href],button']) {
        let currentlyFocused = document.activeElement;
        if (document.hasFocus()) {
            this._focusStack.push(currentlyFocused as HTMLElement);
        }
        else {
            this._focusStack.push('host');
        }
        focusInModal(modalRootSelector, candidateRecipientsSelectors);
    }

    static restoreNext() {
        const next = this._focusStack.pop();
        if (next) {
            if (next === 'host') {
                AppHost.restoreFocusToHost();
            }
            else {
                next.focus();
            }
        }
    }

    static clear() {
        this._focusStack.splice(0, this._focusStack.length);
    }
}