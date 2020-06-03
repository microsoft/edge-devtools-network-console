// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const path = require('path');
const runProcess = require('./run-process');

/**
 * Runs `npm install` in the specified package folder.
 * @param {string} packageFolder The name of a folder beneath 'packages/'.
 */
module.exports = async function runNpmInstall(packageFolder) {
    const curPath = __dirname;
    const workingPath = path.join(curPath, '..', '..', 'packages', packageFolder);
    await runProcess('npm install', workingPath, `NPM install of '${packageFolder}'`);
};
