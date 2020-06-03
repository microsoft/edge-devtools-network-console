// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const path = require('path');
const npmInstall = require('./npm-install');
const runProcess = require('./run-process');

/**
 * Builds the frontend component.
 * @param {boolean=} runNpmInstall
 */
module.exports = async function buildFrontendComponent(runNpmInstall = false) {
    const packageName = 'devtools-network-console';
    const curPath = __dirname;

    if (runNpmInstall) {
        await npmInstall(packageName);
    }

    const workingPath = path.join(curPath, '..', '..', 'packages', packageName);
    const commandLine = 'npm run build';
    await runProcess(commandLine, workingPath, 'Frontend build');
};
