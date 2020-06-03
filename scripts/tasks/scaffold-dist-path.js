// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const fs = require('fs');
const path = require('path');
const util = require('util');

const existsAsync = util.promisify(fs.exists);
const mkdirAsync = util.promisify(fs.mkdir);

async function makeManyDirs(dirs) {
    for (const dir of dirs) {
        if (!await existsAsync(dir)) {
            await mkdirAsync(dir);
        }
    }
}

module.exports = async function scaffoldDistPath() {
    const networkConsoleRoot = path.join(__dirname, '..', '..');
    const targetOutputPath = path.join(networkConsoleRoot, 'dist');

    await makeManyDirs([
        targetOutputPath,
        path.join(targetOutputPath, 'static'),
        path.join(targetOutputPath, 'static', 'js'),
    ]);
};
