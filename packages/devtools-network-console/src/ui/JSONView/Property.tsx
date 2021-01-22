// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { LocalizationConsumer, getText } from 'utility/loc-context';

interface PropertyProps {
    keyKind: 'string' | 'number';
    name: string | number;
    value: any;
}

function Property(props: PropertyProps) {
    const classList = ['json-view-key'];
    if (props.keyKind === 'string') {
        classList.push('json-view-string');
    }
    else {
        classList.push('json-view-number');
    }

    const typeofValue = typeof props.value;
    const isArray = Array.isArray(props.value);
    const isEmptyArray = isArray && props.value.length === 0;
    const isObjectType = !isArray && typeofValue === 'object';
    const isObject = isObjectType && props.value !== null;
    const isNull = isObjectType && props.value === null;
    const isEmptyObject = isObject && Object.keys(props.value).length === 0;
    // This value is assigned (and therefore truthy) if none of the other conditions is met.
    // In that case, the value is one of: number, bigint, string, boolean, or undefined
    let otherPrimitiveClassName = '';
    if (typeofValue === 'undefined') {
        otherPrimitiveClassName = 'json-view-undefined-or-null';
    }
    else if (typeofValue === 'number' || typeofValue === 'bigint') {
        otherPrimitiveClassName = 'json-view-number';
    }
    else if (typeofValue === 'string') {
        otherPrimitiveClassName = 'json-view-string';
    }
    else if (typeofValue === 'boolean') {
        otherPrimitiveClassName = 'json-view-boolean';
    }
    else {
        // Should not occur for JSON-deserialized values
        // Leave it empty to avoid rendering anything
    }

    return (
        <LocalizationConsumer>
            {locale => {
                return (
                    <div className="json-view-item">
                        <span className={classList.join(' ')}>{props.name}</span>
                        &nbsp;
                        {isEmptyArray && (
                            <span className="json-view-array-value" aria-label={getText('JSONView.property.emptyArray', { locale })}>[ ]</span>
                        )}

                        {(isArray && !isEmptyArray) && (
                            <span className="json-view-array-value" aria-label={getText('JSONView.property.arrayValue', { locale })}>[{(props.value as Array<unknown>).length}]</span>
                        )}

                        {isEmptyObject && (
                            <span className="json-view-object-value" aria-label={getText('JSONView.property.emptyObject', { locale })}>{`{ }`}</span>
                        )}

                        {(isObject && !isEmptyObject) && (
                            <span className="json-view-object-value" aria-label={getText('JSONView.property.objectValue', { locale })}>{`{…}`}</span>
                        )}

                        {isNull && (
                            <span className="json-view-undefined-or-null">null</span>
                        )}

                        {!!otherPrimitiveClassName && (
                            <span className={otherPrimitiveClassName}>{String(props.value)}</span>
                        )}
                    </div>
                );
            }}
        </LocalizationConsumer>
    );
}

const PropertyMemoized = React.memo(Property);
export default PropertyMemoized;
