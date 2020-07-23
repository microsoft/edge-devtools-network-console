// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export default class BidiMap<TKey, TValue> {
    private _keyToValue: Map<TKey, TValue>;
    private _valueToKey: Map<TValue, TKey>;

    constructor() {
        this._keyToValue = new Map();
        this._valueToKey = new Map();
    }

    set(key: TKey, value: TValue) {
        if (this._keyToValue.has(key) || this._valueToKey.has(value)) {
            throw new RangeError('Key or Value already in this map.');
        }
        this._keyToValue.set(key, value);
        this._valueToKey.set(value, key);
    }

    getByKey(key: TKey) {
        return this._keyToValue.get(key);
    }

    getByValue(value: TValue) {
        return this._valueToKey.get(value);
    }

    clear() {
        this._keyToValue.clear();
        this._valueToKey.clear();
    }

    deleteByKey(key: TKey) {
        const value = this._keyToValue.get(key);
        this._keyToValue.delete(key);
        if (value !== undefined) {
            this._valueToKey.delete(value);
        }
    }

    deleteByValue(value: TValue) {
        const key = this._valueToKey.get(value);
        this._valueToKey.delete(value);
        if (key !== undefined) {
            this._keyToValue.delete(key);
        }
    }

    entries() {
        return this._keyToValue.entries();
    }

    keys() {
        return this._keyToValue.keys();
    }

    values() {
        return this._keyToValue.values();
    }

    forEach(callback: (value: TValue, key: TKey, map: BidiMap<TKey, TValue>) => void) {
        this._keyToValue.forEach((v, k) => {
            callback(v, k, this);
        });
    }
}
