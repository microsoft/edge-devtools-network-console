// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const fs = require('fs');
const path = require('path');
const util = require('util');

const readdirAsync = util.promisify(fs.readdir);
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const copyFileAsync = util.promisify(fs.copyFile);

/**
 * Copies the output files from packages/devtools-network-console/build to the root/dist folder;
 * it also renames the files to a more consistent naming scheme. By default, the scaffolded
 * create-react-app build produces files such as:
 * build/static/js/2.6b3b9e57.chunk.js. This file contains dependencies and the like. This file is
 * renamed to deps.js, because the pattern of naming a file with a checksum is important on the
 * public web, but not relevant for inclusion in DevTools. You can see how the name matches are
 * renamed below in the `JS_FILES_TO_MATCH` map in the `findFilesToCopy` function.
 */
module.exports = async function stageFrontendOutput() {
    const networkConsoleRoot = path.join(__dirname, '..', '..');
    const buildOutputPath = path.join(networkConsoleRoot, 'packages', 'devtools-network-console', 'build');
    const targetOutputPath = path.join(networkConsoleRoot, 'dist');

    const filesToChange = await findFilesToCopy(buildOutputPath);
    await processIndexHtml(buildOutputPath, targetOutputPath, filesToChange);
    await copyRenamedFiles(buildOutputPath, targetOutputPath, filesToChange);
};

/**
 * Identifies the files from /build/ and produces the rename output, but doesn't actually
 * perform the copy and rename. Does not include /build/index.html because that file needs to
 * be munged first.
 * @returns {!Promise<!Map<string, string>>}
 */
async function findFilesToCopy(srcPath) {
    const JS_FILES_TO_MATCH = [
        [/^2\.[0-9a-f]{8}\.chunk\.js$/, 'deps.js'],
        [/^2\.[0-9a-f]{8}\.chunk\.js\.LICENSE\.txt$/i, 'deps.js.license.txt'],
        [/^main\.[0-9a-f]{8}\.chunk\.js$/, 'main.js'],
        [/^runtime-main\.[0-9a-f]{8}\.js$/, 'runtime.js'],
    ];
    const result = new Map();
    const srcJsPath = path.join(srcPath, 'static', 'js');
    const jsFiles = await readdirAsync(srcJsPath);

    jsFiles.forEach(file => {
        JS_FILES_TO_MATCH.some(([matcher, renameTo]) => {
            if (matcher.test(file)) {
                result.set(file, renameTo);
                return true;
            }
        });
    });

    return result;
}

/**
 * Replaces references from the "old" file names to the "new" file names, and writes
 * the result HTML file to the output path.
 * @param {string} srcPath
 * @param {string} outputPath
 * @param {!Map<string, string>} renamedFiles
 */
async function processIndexHtml(srcPath, outputPath, renamedFiles) {
    const srcHtmlPath = path.join(srcPath, 'index.html');
    const input = await readFileAsync(srcHtmlPath, { encoding: 'utf8' });
    let output = input;

    const replaceFiles = renamedFiles.keys();
    for (const file of replaceFiles) {
        output = output.replace(file, renamedFiles.get(file));
    }

    const htmlOutputPath = path.join(outputPath, 'index.html');
    console.log(`${srcHtmlPath} --> ${htmlOutputPath}`);
    await writeFileAsync(htmlOutputPath, output, { encoding: 'utf8' });
}

/**
 * Copies the renamed files from the source directory to the destination, performing
 * the rename in doing so.
 *
 * @param {string} srcPath
 * @param {string} outputPath
 * @param {!Map<string, string>} renamedFiles
 */
async function copyRenamedFiles(srcPath, outputPath, renamedFiles) {
    const srcs = renamedFiles.keys();
    for (const src of srcs) {
        if (src.endsWith('.js') || src.endsWith('.txt')) {
            const srcFilePath = path.join(srcPath, 'static', 'js', src);
            const outFilePath = path.join(outputPath, 'static', 'js', renamedFiles.get(src));
            console.log(`${srcFilePath} --> ${outFilePath}`);
            await copyFileAsync(srcFilePath, outFilePath);
        }
        else {
            console.warn(`Don't know how to emit file: '${src}'.`);
        }
    }
}
