// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const fs = require('fs');
const copy = require('recursive-copy');
const path = require('path');
const rimraf = require('rimraf');
const git = require('simple-git/promise');
const util = require('util');

const copyAsync = util.promisify(copy);
const existsAsync = util.promisify(fs.exists);
const rimrafAsync = util.promisify(rimraf);
const writeFileAsync = util.promisify(fs.writeFile);

const README_BASE = `Name: Edge DevTools Network Console
Short Name: network_console
URL: github.com/microsoft/edge-devtools-network-console
Version: {hash}
License: MIT
Security Critical: no

Description:
Frontend component for Network Console UI.

Local Modifications:
None.
`;

/**
 *
 * @param {string} chromiumDevtoolsFrontendSrcPath The path to the devtools-frontend/src
 * path from your Chromium enlistment. Typically this is something like
 * f:\chromium\src\third_party\devtools-frontend\src or
 * ~/chromium/src/third_party/devtools-frontend/src
 */
module.exports = async function deployToChromium(chromiumDevtoolsFrontendSrcPath) {
    const rootPath = path.join(__dirname, '..', '..');
    const srcPath = path.join(rootPath, 'dist');

    if (!await existsAsync(srcPath)) {
        console.error('Network Console distribution folder not found.');
        console.error('Run <npm run install-and-build> or <npm run build-locally> to build first.');
        process.exit(2);
    }

    const destinationRootFolder = path.join(chromiumDevtoolsFrontendSrcPath, 'front_end', 'third_party', 'network-console');
    const destinationDistFolder = path.join(destinationRootFolder, 'dist');

    await rimrafAsync(destinationDistFolder);
    await copyAsync(srcPath, destinationDistFolder);

    const readmePath = path.join(destinationRootFolder, 'README.chromium');
    await writeReadme(rootPath, readmePath);
};

async function writeReadme(repoRootPath, outputFilePath) {

    const repo = git(repoRootPath);

    const status = await repo.status();
    if (!status.isClean()) {
        console.warn('Chromium deploy: This branch is not clean.');
        console.warn('Branch should be clean before rolling into Chromium.');
        console.warn('A warning will be made part of the readme.');
    }

    const history = await repo.log({ '--max-count': '1' });
    const version = status.isClean() ?
                        history.latest.hash :
                        `${history.latest.hash} (unclean local branch)`;
    const readme = README_BASE.replace(/\{hash\}/g, version);

    await writeFileAsync(outputFilePath, readme, { encoding: 'utf8' });
}
