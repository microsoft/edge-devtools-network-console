// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CSSProperties as CSS } from 'react';

const RESIZING_PANE_COLOR = 'rgba(224, 224, 224, 0.4)';

export const containerStyle: CSS = {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'stretch',
    height: '100%',
    width: '100%',
    position: 'relative',
};

export const containerStyleHorizontal: CSS = {
    ...containerStyle,
    flexDirection: 'row',
};

export const containerStyleVertical: CSS = {
    ...containerStyle,
    flexDirection: 'column',
};

export const basicPanelStyle: CSS = {
    overflow: 'hidden',
};

export const resizingContainerStyle: CSS = {
    ...containerStyle,
    position: 'absolute',
    top: 0,
    left: 0,
};

export function getResizingContainerStyle(desiredContainerStyle: CSS): CSS {
    return {
        ...desiredContainerStyle,
        position: 'absolute',
        top: 0,
        left: 0,
    };
}

export const resizingPanelStyle: CSS = {
    height: '100%',
    width: '100%',
    backgroundColor: RESIZING_PANE_COLOR,
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
};

export const sizeOffsetStyle: CSS = {
    position: 'absolute',
    top: '45%',
    left: '45%',
};
