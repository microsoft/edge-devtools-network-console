// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const cp = require('child_process');
const stream = require('stream');

/**
 * This task doesn't do anything intrinsically. Rather, it provides a central place in
 * which a "run-process" task can be abstracted into a Promise and associate the process'
 * output with a label.
 * @param {string} commandLine
 * @param {string} workingDirectory
 * @param {string=} stepName Prefix for transformed output
 */
module.exports = function runProcess(commandLine, workingDirectory, stepName = '') {
    return new Promise(async (resolve, reject) => {
        const proc = cp.exec(commandLine, {
            cwd: workingDirectory,
            windowsHide: true,
        });
        proc.stdout.pipe(new stream.Transform({
            transform: (chunk, _encoding, callback) => {
                callback(false, `${stepName}: ${chunk}`);
            },
        })).pipe(process.stdout);
        proc.stderr.pipe(process.stderr);
        proc.on('exit', async code => {
            if (code === 0) {
                return resolve();
            }
            else {
                console.error(`${stepName} step exited with code ${code}`);
                return reject(`${stepName} step exited with error code ${code}.`);
            }
        });
    });
}
