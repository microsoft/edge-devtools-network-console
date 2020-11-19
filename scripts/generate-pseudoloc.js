// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const path = require('path');
const fs = require('fs').promises;
const { createPsuedoLocaleStrings } = require('./tasks/generate-psuedoloc');

async function main() {
    const enFilePath = path.join(__dirname, '..', 'packages/devtools-network-console/src/_locales/en/messages.json');
    const outputFilePath = path.join(__dirname, '..', 'packages/devtools-network-console/src/_locales/ps-PS/messages.json');
    
    const enJson = await fs.readFile(enFilePath, { encoding: 'utf-8' });
    const messages = JSON.parse(enJson);
    const converted = createPsuedoLocaleStrings(messages);
    const convertedJson = JSON.stringify(converted, null, 4);
    await fs.writeFile(outputFilePath, convertedJson, { encoding: 'utf-8' });
}

main()
    .then(() => {
        console.log('Pseudoloc content written.');
    })
    .catch(e => {
        console.error(e.stack);
    });
