// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const npmInstall = require('./tasks/npm-install');

/**
 * Runs an `npm install` on all sub-projects under packages/
 */
async function main() {
    await Promise.all([
        npmInstall('network-console-shared'),
        npmInstall('devtools-network-console'),
    ]);
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
