// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const cleanOutputDirectory = require('./tasks/clean-output-directory');

async function main() {
    await cleanOutputDirectory();
}

main()
    .then(() => {
        console.log('Clean output directory complete.');
    })
    .catch(e => {
        console.error('Clean output directory failed.');
        console.error(e);
        process.exit(1);
    });
