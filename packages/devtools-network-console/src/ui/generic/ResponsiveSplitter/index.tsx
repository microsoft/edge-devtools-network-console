// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import * as Styles from './styles';
import * as SplitPaneStyle from './resize-styles';

export interface IResponsiveSplitterProps {
    children: React.ReactNode[];
    firstPaneProps?: React.DetailedHTMLProps<React.DetailsHTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    secondPaneProps?: React.DetailedHTMLProps<React.DetailsHTMLAttributes<HTMLDivElement>, HTMLDivElement>;
}

export default function ResponsiveSplitter(props: IResponsiveSplitterProps) {
    if (!props.children || props.children.length !== 2) {
        throw new Error('Assertion failed: Expected exactly 2 children.');
    }

    return (
        <div {...Styles.SPLITTER_CONTAINER_STYLE} {...(props.firstPaneProps || { })}>
            <div {...Styles.LEFT_SIDE_STYLE}>
                {props.children[0]}
            </div>
            <div {...Styles.MIDDLE_STYLE}>&nbsp;</div>
            <div {...Styles.RIGHT_SIDE_STYLE} {...(props.secondPaneProps || { })}>
                {props.children[1]}
            </div>
        </div>
    );
}

interface ISplitterState {
    isDragging: boolean;
    draggingPane1Size: number; // percentage
    committedPane1Size: number; // percentage
}

interface ISplitterLocation {
    clientX: number;
    clientY: number;
}

interface ISplitterMotion extends ISplitterLocation {
    currentTarget: HTMLElement;
}

export class ResizableSplitter extends React.Component<IResponsiveSplitterProps, ISplitterState> {
    private _dragStart: number;
    private _root: HTMLDivElement | null;

    constructor(props: IResponsiveSplitterProps) {
        super(props);

        this._root = null;
        this._dragStart = NaN;
        this.state = {
            isDragging: false,
            draggingPane1Size: NaN,
            committedPane1Size: 50,
        };
    }

    setState(
        state: any,
        callback?: () => void
    ): void {
        if (state && typeof state.committedPane1Size !== 'undefined' && isNaN(state.committedPane1Size)) {
            throw new Error('NaN invalid.');
        }

        super.setState(state, callback);
    }

    public render() {
        let resizingContainer: JSX.Element | undefined;
        if (this.state.isDragging) {
            resizingContainer = (
                <div {...Styles.calculateResizingContainerStyle(this.state.draggingPane1Size)}>
                    <div {...Styles.SIDE_STYLE}>
                        <div style={SplitPaneStyle.resizingPanelStyle}>
                            <div style={SplitPaneStyle.sizeOffsetStyle}></div>
                        </div>
                    </div>
                    <div {...Styles.MIDDLE_RESIZABLE_STYLE}>
                        <div {...Styles.MIDDLE_DIVIDER_STYLE}>&nbsp;</div>
                    </div>
                    <div {...Styles.SIDE_STYLE}>
                        <div style={SplitPaneStyle.resizingPanelStyle}>
                            <div style={SplitPaneStyle.sizeOffsetStyle}></div>
                        </div>
                    </div>
                </div>
            );
        }
        const left = this.props.children && this.props.children[0];
        const right = this.props.children && this.props.children[1];

        return (
            <div
                ref={r => this._root = r}
                {...Styles.calculateSplitterContainerStyle(this.state.committedPane1Size)}
                onMouseLeave={this._containerMouseLeave}
                onMouseMove={this._containerMouseMove}
                onTouchMove={this._containerTouchMove}
                onMouseUp={this._containerMouseUp}
            >
                <div className="PANE1" {...Styles.SIDE_STYLE}>
                    {left}
                </div>
                <div
                    {...Styles.MIDDLE_RESIZABLE_STYLE}
                    onMouseDown={this._resizerMouseDown}
                    onMouseUp={this._resizerMouseUp}
                    onTouchStart={this._resizerTouchStart}
                    onTouchEnd={this._resizerTouchEnd}
                >
                    <div {...Styles.MIDDLE_DIVIDER_STYLE}>&nbsp;</div>
                </div>
                <div className="PANE2" {...Styles.SIDE_STYLE}>
                    {right}
                </div>

                {resizingContainer}
            </div>
        );
    }

    private isHorizontal(): boolean {
        return window.matchMedia(Styles.REACTIVE_SPLITTER_WIDTH_MEDIA_QUERY).matches;
    }

    private updatePosition(motion: ISplitterMotion) {
        if (!this._root) {
            return;
        }

        const container = this._root;
        let containerSize: number;
        let delta: number;
        let newVal: number;
        const horiz = this.isHorizontal();
        if (horiz) {
            delta = motion.clientX - this._dragStart;
            newVal = motion.clientX;
            containerSize = container.clientWidth;
        } else {
            delta = motion.clientY - this._dragStart;
            newVal = motion.clientY;
            containerSize = container.clientHeight;
        }

        if (isNaN(delta)) {
            this.setState({
                isDragging: false,
            });
            return;
        }

        // todo: get rid of known values here
        const SPLITTER_SIZE = 14;

        let size1: number;
        let size2: number;
        size1 = (this.state.draggingPane1Size * containerSize / 100.0) + delta;
        size2 = containerSize - size1 - SPLITTER_SIZE;

        const minSize = containerSize * 0.3;
        const totalSize = size1 + SPLITTER_SIZE + size2;
        size1 = Math.max(size1, minSize);
        size2 = Math.max(size2, minSize);
        if (totalSize > (minSize * 2 + SPLITTER_SIZE)) {
            // Ensure the minimum size is observed when the width of the total size
            // allows for that
            if (size1 === minSize) {
                size2 = totalSize - SPLITTER_SIZE - minSize;
            } else if (size2 === minSize) {
                size1 = totalSize - SPLITTER_SIZE - minSize;
            }
        }
        const sizePercent = size1 / containerSize * 100.0;

        this.setState({
            draggingPane1Size: sizePercent,
        });
        this._dragStart = newVal;
    }

    private beginDrag(position: ISplitterLocation, target: HTMLElement) {
        if (!this._root) {
            return;
        }

        const horiz = this.isHorizontal();
        this._dragStart = horiz ? position.clientX : position.clientY;
        const clientSize = horiz ? this._root.clientWidth : this._root.clientHeight;

        const splitPane = this._root;
        const first = splitPane.querySelector(".PANE1") as HTMLElement;
        const leftSize = horiz ? first.clientWidth : first.clientHeight;
        const leftSizePct = (leftSize + 7.0) / clientSize * 100.0;
        this.setState({
            draggingPane1Size: leftSizePct,
            isDragging: true,
        });
    }

    private commitDrag() {
        if (!this.state.isDragging) {
            return;
        }
        this.setState({
            committedPane1Size: this.state.draggingPane1Size,
            isDragging: false,
            draggingPane1Size: NaN,
        });
    }

    private cancelDrag() {
        this.setState({
            isDragging: false,
            draggingPane1Size: NaN,
        });
    }

    private _containerMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => void = event => {
        if (this.state.isDragging) {
            this.cancelDrag();
            event.preventDefault();
        }
    }
    private _containerMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void = event => {
        if (this.state.isDragging) {
            event.preventDefault();
            this.updatePosition(event);
        }
    }
    private _containerTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void = event => {
        if (this.state.isDragging) {
            if (event.touches.length !== 1) {
                return;
            }

            event.preventDefault();
            this.updatePosition({ clientX: event.touches[0].clientX,
                                  clientY: event.touches[0].clientY,
                                  currentTarget: event.currentTarget });
        }
    }
    private _containerMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void = e => {
        if (this.state.isDragging) {
            this.commitDrag();
            e.preventDefault();
        }
    }
    private _resizerMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void = event => {
        this.beginDrag(event, event.target as HTMLElement);
    }
    private _resizerMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void = event => {
        if (this.state.isDragging) {
            this.commitDrag();
            event.preventDefault();
         }
     }
    private _resizerTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void = event => {
        if (event.touches.length !== 1) {
            return;
        }

        this.beginDrag(event.touches[0], event.target as HTMLElement);
        event.preventDefault();
    }
    private _resizerTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => void = event => {
        if (this.state.isDragging) {
           this.commitDrag();
           event.preventDefault();
        }
    }
}
