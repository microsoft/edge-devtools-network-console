// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const path = require('path');
const rimraf = require('rimraf');
const util = require('util');

const rimrafAsync = util.promisify(rimraf);

module.exports = async function cleanOutputDirectory() {
    const root = path.join(__dirname, '..', '..');
    const dist = path.join(root, 'dist');

    await rimrafAsync(dist);
};
