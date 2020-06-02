// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useRef, useState } from 'react';

import * as Styles from './styles';

export interface IGridHeaderProps {
    hideDescriptionField: boolean;
    onResize: (keyColumnWidthFr: number, valueColumnWidthFr: number, descriptionColumnWidthFr: number) => void;
}

enum DraggingMode {
    NOT_DRAGGING,
    DRAGGING_KEY_RESIZER,
    DRAGGING_VALUE_RESIZER,
}

export default function GridHeader(props: IGridHeaderProps) {
    const [isDragging, setIsDragging] = useState(DraggingMode.NOT_DRAGGING);

    const containerRef = useRef<HTMLDivElement>(null);
    const keyResizeDraggerRef = useRef<HTMLDivElement>(null);
    const valueResizeDraggerRef = useRef<HTMLDivElement>(null);

    const keyRef = useRef<HTMLDivElement>(null);
    const valueRef = useRef<HTMLDivElement>(null);
    const descRef = useRef<HTMLDivElement>(null);

    function updateDrag(position: { clientX: number; }) {
        if (!containerRef.current || !keyResizeDraggerRef.current || !valueResizeDraggerRef.current) {
            throw new Error('Invariant assertion failure: one or more refs are invalid.');
        }

        const totalWidth = containerRef.current.clientWidth;
        // const delta = e.clientX - dragStart;
        const targetRef = isDragging === DraggingMode.DRAGGING_KEY_RESIZER ? keyResizeDraggerRef : valueResizeDraggerRef;
        const delta = position.clientX - (targetRef.current as HTMLDivElement).getBoundingClientRect().left;

        if (isNaN(delta)) {
            setIsDragging(DraggingMode.NOT_DRAGGING);
            return;
        }

        if (!keyRef.current || !valueRef.current || !descRef.current) {
            throw new Error('Invariant assertion failure: one or more required refs are invalid.');
        }

        let keyWidth = keyRef.current.clientWidth;
        let valueWidth = valueRef.current.clientWidth;
        let descWidth = descRef.current.clientWidth;

        const minWidth = totalWidth * 0.1;
        if (isDragging === DraggingMode.DRAGGING_KEY_RESIZER) {
            // resizing the key and value fields; description stays exactly what it is
            const sizeOfFieldsBeingResized = keyWidth + valueWidth;
            keyWidth = keyWidth + delta;
            if (keyWidth < minWidth) {
                keyWidth = minWidth;
            }
            valueWidth = sizeOfFieldsBeingResized - keyWidth;
            if (valueWidth < minWidth) {
                valueWidth = minWidth;
                keyWidth = sizeOfFieldsBeingResized - valueWidth;
            }
        }
        else {
            // resizing the value and description fields; key stays exactly what it is
            const sizeOfFieldsBeingResized = valueWidth + descWidth
            valueWidth = valueWidth + delta;
            if (valueWidth < minWidth) {
                valueWidth = minWidth;
            }
            descWidth = sizeOfFieldsBeingResized - valueWidth;
            if (descWidth < minWidth) {
                descWidth = minWidth;
                valueWidth = sizeOfFieldsBeingResized - descWidth;
            }
        }

        props.onResize(keyWidth, valueWidth, descWidth);
    }

    return (
        <div
            onMouseMove={e => {
                if (isDragging) {
                    e.preventDefault();

                    updateDrag(e);
                }
            }}
            onTouchMove={e => {
                if (isDragging) {
                    e.preventDefault();

                    updateDrag(e.touches[0]);
                }
            }}
            onMouseUp={e => {
                setIsDragging(DraggingMode.NOT_DRAGGING);
                e.preventDefault();
            }}
            onMouseLeave={e => {
                setIsDragging(DraggingMode.NOT_DRAGGING);
                e.preventDefault();
            }}
            ref={containerRef}
            {...Styles.GRID_HEADER_STYLE}
            >
            <div>&nbsp;</div>
            <div {...Styles.GRID_HEADER_DIVIDER_STYLE}></div>
            <div ref={keyRef} {...Styles.GRID_HEADER_CELL_STYLE}>Key</div>
            <div
                onMouseDown={e => {
                    setIsDragging(DraggingMode.DRAGGING_KEY_RESIZER);
                    e.preventDefault();
                }}
                onTouchStart={e => {
                    setIsDragging(DraggingMode.DRAGGING_KEY_RESIZER);
                    e.preventDefault();
                }}
                onMouseUp={e => {
                    setIsDragging(DraggingMode.NOT_DRAGGING);
                    e.preventDefault();
                }}
                onTouchEnd={e => {
                    setIsDragging(DraggingMode.NOT_DRAGGING);
                    e.preventDefault();
                }}
                ref={keyResizeDraggerRef}
                {...Styles.GRID_HEADER_DIVIDER_STYLE}
                >
                    &nbsp;
            </div>
            <div ref={valueRef} {...Styles.GRID_HEADER_CELL_STYLE}>Value</div>
            {props.hideDescriptionField ? <></> : <>
            <div
                onMouseDown={e => {
                    setIsDragging(DraggingMode.DRAGGING_VALUE_RESIZER);
                    e.preventDefault();
                }}
                onTouchStart={e => {
                    setIsDragging(DraggingMode.DRAGGING_VALUE_RESIZER);
                    e.preventDefault();
                }}
                onMouseUp={e => {
                    setIsDragging(DraggingMode.NOT_DRAGGING);
                    e.preventDefault();
                }}
                onTouchEnd={e => {
                    setIsDragging(DraggingMode.NOT_DRAGGING);
                    e.preventDefault();
                }}
                ref={valueResizeDraggerRef}
                {...Styles.GRID_HEADER_DIVIDER_STYLE}
                >
                    &nbsp;
            </div>
            <div ref={descRef} {...Styles.GRID_HEADER_CELL_STYLE}>Description</div>
            </>
            }
        </div>
    )
}
