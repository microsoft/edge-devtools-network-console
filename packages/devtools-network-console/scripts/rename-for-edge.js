// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const fs = require('fs');
const rimraf = require('rimraf');
const util = require('util');

const rimrafAsync = util.promisify(rimraf);
const mkdirAsync = util.promisify(fs.mkdir);
const readdirAsync = util.promisify(fs.readdir);
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const copyFileAsync = util.promisify(fs.copyFile);

async function main() {
    await rimrafAsync('./build-browser');
    await makeManyDirs([
        './build-browser',
        './build-browser/static',
        './build-browser/static/css',
        './build-browser/static/js',
    ]);

    const filesToChange = await findFilesToCopy();
    await processIndexHtml(filesToChange);
    await copyRenamedFiles(filesToChange);
}

main()
    .then(() => console.log('Edge build complete.'))
    .catch(e => {
        console.error(e.stack);
        process.exit(1);
    });

async function makeManyDirs(dirs) {
    for (const dir of dirs) {
        await mkdirAsync(dir);
    }
}

/**
 * Identifies the files from /build/ and produces the rename output, but doesn't actually
 * perform the copy and rename. Does not include /build/index.html because that file needs to
 * be munged first.
 * @returns {!Promise<!Map<string, string>>}
 */
async function findFilesToCopy() {
    const JS_FILES_TO_MATCH = [
        [/^2\.[0-9a-f]{8}\.chunk\.js$/, 'deps.js'],
        [/^2\.[0-9a-f]{8}\.chunk\.js\.LICENSE\.txt$/i, 'deps.js.license.txt'],
        [/^main\.[0-9a-f]{8}\.chunk\.js$/, 'main.js'],
        [/^runtime-main\.[0-9a-f]{8}\.js$/, 'runtime.js'],
    ];
    const CSS_FILES_TO_MATCH = [
        [/^main\.[0-9a-f]{8}\.chunk\.css$/, 'main.css'],
    ];
    const result = new Map();

    const cssFiles = await readdirAsync('./build/static/css');
    const jsFiles = await readdirAsync('./build/static/js');

    cssFiles.forEach(file => {
        CSS_FILES_TO_MATCH.some(([matcher, renameTo]) => {
            if (matcher.test(file)) {
                result.set(file, renameTo);
                return true;
            }
        });
    });

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
 *
 * @param {!Map<string, string>} renamedFiles
 */
async function processIndexHtml(renamedFiles) {
    const input = await readFileAsync('./build/index.html', { encoding: 'utf8' });
    let output = input;

    const replaceFiles = renamedFiles.keys();
    for (const file of replaceFiles) {
        output = output.replace(file, renamedFiles.get(file));
    }

    await writeFileAsync('./build-browser/index.html', output, { encoding: 'utf8' });
}

/**
 *
 * @param {!Map<string, string>} renamedFiles
 */
async function copyRenamedFiles(renamedFiles) {
    const srcs = renamedFiles.keys();
    for (const src of srcs) {
        if (src.endsWith('.css')) {
            await copyFileAsync(`./build/static/css/${src}`, `./build-browser/static/css/${renamedFiles.get(src)}`);
        }
        else if (src.endsWith('.js') || src.endsWith('.txt')) {
            await copyFileAsync(`./build/static/js/${src}`, `./build-browser/static/js/${renamedFiles.get(src)}`);
        }
        else {
            console.warn(`Don't know how to emit file: ${src}.`);
        }
    }
}
