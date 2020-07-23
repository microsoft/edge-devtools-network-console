// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const fs = require('fs');
const path = require('path');
const util = require('util');
const runProcess = require('./tasks/run-process');

const readFileAsync = util.promisify(fs.readFile);

/**
 * @return {never}
 */
function dumpUsage() {
    console.log('Usage: node scripts/run-package-task --package-name <package_name> --task-name <task_name>');
    console.log('  Runs a script from the package.json file belonging to the package specified by --package-name.');
    console.log('  The task must be specified in the "scripts" section of package.json.');
    console.log('  The task will be started from the package as the working directory.');

    process.exit(1);
}

async function main() {
    let packageName = '';
    let taskName = '';

    const argv = process.argv.slice();
    while (argv.length) {
        const nextArg = argv.shift();
        if (nextArg === '--package-name') {
            packageName = argv.shift();
            continue;
        }

        if (nextArg === '--task-name') {
            taskName = argv.shift();
            continue;
        }
    }

    if (!packageName || !taskName) {
        dumpUsage();
    }

    const packagePath = path.join('.', 'packages', packageName);
    const packageJsonPath = path.join(packagePath, 'package.json');
    const packageJson = await readFileAsync(packageJsonPath, { encoding: 'utf8' });
    const packageContents = JSON.parse(packageJson);
    const scripts = packageContents.scripts;
    const task = scripts[taskName];
    if (!taskName) {
        console.error(`Could not find task "${taskName}" in "${packageName}".`);
        process.exit(2);
    }

    await runProcess(task, path.resolve(packagePath));
}

main()
    .then(() => {
        console.log('Tests passed.');
    })
    .catch(e => {
        console.error(e.stack);
        process.exit(3);
    });
