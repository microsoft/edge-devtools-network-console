// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const buildFrontend = require('./tasks/build-frontend-component');
const buildShared = require('./tasks/build-shared-component');
const scaffoldDistPath = require('./tasks/scaffold-dist-path');
const stageShared = require('./tasks/stage-shared-component-to-dist');
const stageFrontend = require('./tasks/stage-frontend-output');

async function main() {
    await buildShared();
    await buildFrontend();
    await scaffoldDistPath();
    await stageShared();
    await stageFrontend();
}

main()
    .then(() => {
        console.log('Build all complete.');
    })
    .catch(e => {
        console.error('Build all failed.');
        console.error(e);
        process.exit(1);
    });
