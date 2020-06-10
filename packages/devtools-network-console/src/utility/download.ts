// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export default async function downloadFile(buffer: ArrayBuffer, outputName: string): Promise<void> {
    const blob = new Blob([new Uint8Array(buffer, 0, buffer.byteLength)]);

    if ('msSaveBlob' in window.navigator) {
        window.navigator.msSaveBlob(blob, outputName);
        return;
    }

    const anchor = document.createElement('a');
    const href = URL.createObjectURL(blob);
    anchor.href = href;
    anchor.download = outputName;
    anchor.dispatchEvent(new MouseEvent(`click`, {bubbles: true, cancelable: true, view: window}));
    anchor.style.display = 'none';
    setTimeout(() => {
        URL.revokeObjectURL(href);
    }, 10000);
}
