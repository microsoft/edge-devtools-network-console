// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const path = require('path');
const runProcess = require('./run-process');

module.exports = async function runNpmInstall(packageFolder) {
    const curPath = __dirname;
    const workingPath = path.join(curPath, '..', '..', 'packages', packageFolder);
    await runProcess('npm install', workingPath, `NPM install of '${packageFolder}'`);
};
