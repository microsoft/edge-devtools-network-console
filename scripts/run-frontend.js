// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const path = require('path');
const runProcess = require('./tasks/run-process');

async function main() {
    const root = path.join(__dirname, '..');
    const frontendPath = path.join(root, 'packages', 'devtools-network-console');
    await runProcess('npm run start', frontendPath, 'Frontend run');
}

main()
    .then(() => {
        console.log('Frontend run complete.');
    })
    .catch(e => {
        console.error('Frontend run failed.');
        console.error(e);
        process.exit(1);
    });
