// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const deployToChromium = require('./tasks/deploy-to-chromium');

/**
 * This script scaffolds the dist/ output into a Chromium devtools-frontend repo. It is
 * primarily a CLI frontend; for more information, see the deployToChromium task.
 */
async function main() {
    const indexOfDevtoolsSrcPathArg = process.argv.indexOf('--devtools_src_path');
    let devtoolsSrcPath = process.env['NETCONSOLE_DEVTOOLS_SRC_PATH'];
    if (indexOfDevtoolsSrcPathArg > -1) {
        devtoolsSrcPath = process.argv[indexOfDevtoolsSrcPathArg + 1];
    }

    if (!devtoolsSrcPath) {
        console.error(' -- Usage: node ./scripts/deploy --devtools_src_path "<path>"');
        console.error(' --   (or) npm run deploy -- --devtools_src_path "<path>"');
        console.error(' -- ');
        console.error('You may omit the --devtools_src_path argument if you instead');
        console.error(' specify the NETCONSOLE_DEVTOOLS_SRC_PATH environment variable.');
        process.exit(3);
    }

    await deployToChromium(devtoolsSrcPath);
}

main()
    .then(() => {
        console.log('Deploy build results to Chromium source complete.');
    })
    .catch(e => {
        console.error('Deploy build results to Chromium source failed.');
        console.error(e);
        process.exit(1);
    });
