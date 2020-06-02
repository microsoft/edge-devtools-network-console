// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const path = require('path');
const copyAndUpdateFile = require('./copy-and-update-file');

const COPYRIGHT_HEADER = `/**
 * Copyright (c) Microsoft Corp.
 * Licensed under the MIT License.
 */
`;

/**
 * Copies the output files from network-console-shared's local build output folder
 * to the output folder for the top-level project.
 */
module.exports = async function stageSharedBuildOutputToDistFolder() {
    /**
     * Files to output:
     * packages/ncs/dist/global.js -> dist/global.js
     * packages/ncs/dist/index.d.ts -> dist/index.d.ts (processed)
     * packages/ncs/dist/network-console-shared.d.ts -> dist/network-console-shared.d.ts
     */

    const networkConsoleRoot = path.join(__dirname, '..', '..');
    const ncsBuildOutputPath = path.join(networkConsoleRoot, 'packages', 'network-console-shared', 'dist');
    const targetOutputPath = path.join(networkConsoleRoot, 'dist');

    await copyAndUpdateFile(
        /* srcPath: */ path.join(ncsBuildOutputPath, 'global.js'),
        /* destPath: */ path.join(targetOutputPath, 'global.js'),
        COPYRIGHT_HEADER
    );
    await copyAndUpdateFile(
        path.join(ncsBuildOutputPath, 'index.d.ts'),
        path.join(targetOutputPath, 'index.d.ts'),
        COPYRIGHT_HEADER,
        /* suffix: */ 'export as namespace NCShared;\n',
        /* replacements: */ [{
            from: / from \'\.\//g,
            to: ' from \'network-console-shared/',
        }]
    );
    await copyAndUpdateFile(
        path.join(ncsBuildOutputPath, 'network-console-shared.d.ts'),
        path.join(targetOutputPath, 'network-console-shared.d.ts'),
        COPYRIGHT_HEADER
    );
};
