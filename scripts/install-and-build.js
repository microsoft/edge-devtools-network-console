// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const buildFrontend = require('./tasks/build-frontend-component');
const buildShared = require('./tasks/build-shared-component');
const scaffoldDistPath = require('./tasks/scaffold-dist-path');
const stageShared = require('./tasks/stage-shared-component-to-dist');
const stageFrontend = require('./tasks/stage-frontend-output');

/**
 * This is a full build, including `npm install`, suitable for a CI environment.
 */
async function main() {
    await buildShared(/* devmode: */ false, /* runNpmInstall: */ true);
    await buildFrontend(/* runNpmInstall: */ true);
    await scaffoldDistPath();
    await stageShared();
    await stageFrontend();
}

main()
    .then(() => {
        console.log('NPM install on subprojects complete.');
    })
    .catch(e => {
        console.error('NPM install on subprojects failed.');
        console.error(e);
        process.exit(1);
    });
