// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const fs = require('fs');
const util = require('util');

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

/**
 * Copies a file, optionally adding a prefix, suffix, and/or doing regex replacements.
 *
 * @param {string} srcPath
 * @param {string} destPath
 * @param {string=} prefix
 * @param {string=} suffix
 * @param {!Array<{ from: !RegExp; to: string; }>=} replacements
 */
module.exports = async function copyAndUpdateFile(srcPath, destPath, prefix = '', suffix = '', replacements = []) {
    const srcContent = await readFileAsync(srcPath, { encoding: 'utf8' });
    let result = `${prefix}\n\n${srcContent}\n\n${suffix}`;

    for (const { from, to } of replacements) {
        result = result.replace(from, to);
    }

    await writeFileAsync(destPath, result, { encoding: 'utf8', flag: 'w' });
}
