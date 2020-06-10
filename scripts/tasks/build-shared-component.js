// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const path = require('path');
const npmInstall = require('./npm-install');
const runProcess = require('./run-process');

/**
 * Builds the `network-console-shared` component.
 * @param {boolean=} devMode
 * @param {boolean=} runNpmInstall
 */
module.exports = async function buildSharedComponent(devMode = false, runNpmInstall = false) {
    const packageName = 'network-console-shared';
    const curPath = __dirname;

    if (runNpmInstall) {
        await npmInstall(packageName);
    }

    const workingPath = path.join(curPath, '..', '..', 'packages', packageName);
    const buildCommandLine = devMode ? 'npm run build' : 'npm run build:prod';
    const packageCommandLine = devMode ? 'npm run package' : 'npm run package:prod';
    await Promise.all([
        runProcess(buildCommandLine, workingPath, 'Shared component build'),
        runProcess(packageCommandLine, workingPath, 'Shared global packaging'),
    ]);
};
