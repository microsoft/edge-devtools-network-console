// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { findInAncestors } from './dom';

/**
 * When deleting a row, we need to traverse to a new grid element or else focus is lost. However,
 * the problem is that focus management within a functional React component where all of the
 * individually-rendered DOM elements exist in different components is "hard."
 *
 * This function has special knowledge about the internals of EditorGrid and its sub-components.
 *
 * It follows this algorithm:
 *  - If we are on the last row:
 *   - If there is only one row, focus to the nearest pivot header
 *   - Otherwise, focus on the "key" field of the previous row
 *  - If we are not on the last "real" row (a row with data), we focus on the next row "key" field.
 *  - If we are on the last "real" row, then:
 *   - If we're also on the first "real" row (meaning there is only one row), we focus to the "key"
 *     field of the "input" row. If there is no "input" row, we focus to the nearest pivot header.
 *   - Otherwise we focus to the "key" field of the previous sibling row.
 *
 * @param currentTarget The button which is being activated
 * @param fallbackTarget A fallback target to focus if the algorithm fails
 */
export function focusNextGridElement(currentTarget: HTMLButtonElement, fallbackTargetSelector: string): void {
    const currentRow = findInAncestors(currentTarget, e => e.classList.contains('nc-editor-row')) as HTMLDivElement;
    const grid = findInAncestors(currentTarget, e => e.classList.contains('nc-editor-grid')) as HTMLDivElement;
    // invariant: currentRow and grid should be defined
    if (!currentRow || !grid) {
        throw new Error('Current target does not appear to be part of an editor grid.');
    }

    const rows = grid.querySelectorAll('.nc-editor-row') as NodeListOf<HTMLDivElement>;
    const currentRowIndex = Array.from(rows).indexOf(currentRow);
    // invariant: currentRowIndex should be > -1
    if (!rows.length || currentRowIndex === -1) {
        throw new Error('Current target does not appear to be part of an editor grid or the grid is in an invalid state.');
    }

    const isOnLastRow = rows.length === currentRowIndex + 1;
    if (isOnLastRow) {
        const fallbackTarget = document.querySelector(fallbackTargetSelector) as HTMLElement;
        scheduleFocus(fallbackTarget);
    }
    else {
        let targetRowIndex = currentRowIndex;
        if (targetRowIndex === rows.length - 2) {
            // If the row to focus on will be a 'new' item, try to focus backwards one row
            // Otherwise allow it to focus in on the 'new' item.
            targetRowIndex = Math.max(targetRowIndex - 1, 0);
        }
        const targetGridCell = rows[targetRowIndex].querySelector('.nc-editor-cell-key') as HTMLDivElement;
        // invariant: targetGridCell must be defined
        if (!targetGridCell) {
            throw new Error('Invariant failed: Unexpected DOM structure (missing div.nc-editor-cell-key within a grid row)');
        }

        const targetInput = targetGridCell.querySelector('input,button,select') as HTMLElement;
        // invariant: There must be SOME input element within this area
        if (!targetInput) {
            throw new Error('Invariant failed: Unexpected DOM structure (missing input,button,select within a div.nc-editor-cell-key)');
        }
        scheduleFocus(targetInput);
    }
}

function scheduleFocus(target: HTMLElement) {
    target.focus();
}
