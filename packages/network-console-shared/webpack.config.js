// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

//@ts-check

'use strict';

const path = require('path');
const DtsBundleWebpack = require('dts-bundle-webpack');

/**@type {import('webpack').Configuration}*/
const config = {
  target: 'web',

  entry: './src/index.ts',
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  devtool: 'source-map',
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js']
  },
  plugins: [
    new DtsBundleWebpack({
      name: 'network-console-shared',
      main: 'dist/index.d.ts',
      baseDir: 'dist',
      out: 'network-console-shared.d.ts',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                declaration: true,
              },
            },
          },
        ],
      },
    ]
  }
};
module.exports = config;
