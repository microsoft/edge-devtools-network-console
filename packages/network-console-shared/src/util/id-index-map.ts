// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import BidiMap from './bidi-map';

/**
 * Specializes a bidirectional map to specifically track a generated ID against
 * an index into an array. The array is something that we can't control, so we
 * don't attempt to do so here; however, because we know this maps to an index,
 * on deletion, we correct the indexes upon deletion.
 */
export default class IdIndexMap extends BidiMap<string, number> {
    deleteByKey(key: string) {
        const value = this._keyToValue.get(key);
        super.deleteByKey(key);
        if (value !== undefined) {
            this._shiftForward(value);
        }
    }

    deleteByValue(value: number) {
        const key = this._valueToKey.get(value);
        super.deleteByValue(value);
        if (key !== undefined) {
            this._shiftForward(value);
        }
    }

    private _shiftForward(after: number) {
        const indexesToMoveUp = Array.from(this._keyToValue.values()).filter(v => v > after);
        indexesToMoveUp.sort();
        for (const oldIndex of indexesToMoveUp) {
            const key = this._valueToKey.get(oldIndex)!;
            this._keyToValue.delete(key);
            this._valueToKey.delete(oldIndex);
            this._keyToValue.set(key, oldIndex - 1);
            this._valueToKey.set(oldIndex - 1, key);
        }
    }
}
