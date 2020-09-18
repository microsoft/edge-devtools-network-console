// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// tslint:disable:no-unused-expression

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';

chai.use(chaiAsPromised);

import { CollectionFormat } from '../../collection-format';
import { CollectionAdapter } from '../collection-adapter';

describe('network-console-shared/src/file_io/openapi/collection-format', () => {
    describe('JSON format', () => {
        describe('variations of CollectionFormat#parse failures', () => {
            it('Throws if the root lacks an info field', () => {
                async function test() {
                    const format = new CollectionFormat();
                    const expected = JSON.stringify({
                        swagger: '2.0',
                        paths: {},
                    }, null, 4);
                    await format.parse('Known bad.json', expected);
                }
                return expect(test()).to.eventually.be.rejectedWith(RangeError);
            });

            it('Throws if the root lacks a Swagger version declaration', () => {
                async function test() {
                    const format = new CollectionFormat();
                    const expected = JSON.stringify({
                        info: {
                            title: 'Known bad',
                            version: '0.0.1',
                        },
                        paths: {},
                    }, null, 4);
                    await format.parse('Known bad.json', expected);
                }
                return expect(test()).to.eventually.be.rejectedWith(RangeError);
            });

            it('Throws if the root has an incompatible Swagger version declaration of 1.0', () => {
                async function test() {
                    const format = new CollectionFormat();
                    const expected = JSON.stringify({
                        info: {
                            title: 'Known bad',
                            version: '0.0.1',
                        },
                        swagger: '1.0',
                        paths: {},
                    }, null, 4);
                    await format.parse('Known bad.json', expected);
                }
                return expect(test()).to.eventually.be.rejectedWith(RangeError);
            });

            it('Throws if the root has an incompatible Swagger version declaration of 3.0', () => {
                async function test() {
                    const format = new CollectionFormat();
                    const expected = JSON.stringify({
                        info: {
                            title: 'Known bad',
                            version: '0.0.1',
                        },
                        swagger: '3.0',
                        paths: {},
                    }, null, 4);
                    await format.parse('Known bad.json', expected);
                }
                return expect(test()).to.eventually.be.rejectedWith(RangeError);
            });

            it('Throws if the root has lacks a "paths" object', () => {
                async function test() {
                    const format = new CollectionFormat();
                    const expected = JSON.stringify({
                        info: {
                            title: 'Known bad',
                            version: '0.0.1',
                        },
                        swagger: '2.0',
                    }, null, 4);
                    await format.parse('Known bad.json', expected);
                }
                return expect(test()).to.eventually.be.rejectedWith(RangeError);
            });

            it('Throws if the collection lacks an has a non-Object-type "paths" property', () => {
                async function test() {
                    const format = new CollectionFormat();
                    const expected = JSON.stringify({
                        info: {
                            title: 'Known bad',
                            version: '0.0.1',
                        },
                        swagger: '2.0',
                        paths: [],
                    }, null, 4);
                    await format.parse('Known bad.json', expected);
                }
                return expect(test()).to.eventually.be.rejectedWith(RangeError);
            });

            it('Succeeds if the collection meets the minimum requirements', async () => {
                const format = new CollectionFormat();
                const expected = JSON.stringify({
                    info: {
                        title: 'Minimum',
                        version: '0.0.1',
                    },
                    swagger: '2.0',
                    paths: {},
                }, null, 4);
                await format.parse('TestCollection.json', expected);
            });
        });

        describe('variations of CollectionFormat#tryParse failures', () => {
            it('Throws if the root lacks an info field', async () => {
                const format = new CollectionFormat();
                const expected = JSON.stringify({
                    swagger: '2.0',
                    paths: {},
                }, null, 4);
                const result = await format.tryParse('Known bad.json', expected);
                expect(result).to.be.null;
            });

            it('Throws if the root lacks a Swagger version declaration', async () => {
                const format = new CollectionFormat();
                const expected = JSON.stringify({
                    info: {
                        title: 'Known bad',
                        version: '0.0.1',
                    },
                    paths: {},
                }, null, 4);
                const result = await format.tryParse('Known bad.json', expected);
                expect(result).to.be.null;
            });

            it('Throws if the root has an incompatible Swagger version declaration of 1.0', async () => {
                const format = new CollectionFormat();
                const expected = JSON.stringify({
                    info: {
                        title: 'Known bad',
                        version: '0.0.1',
                    },
                    swagger: '1.0',
                    paths: {},
                }, null, 4);
                const result = await format.tryParse('Known bad.json', expected);
                expect(result).to.be.null;
            });

            it('Throws if the root has an incompatible Swagger version declaration of 3.0', async () => {
                const format = new CollectionFormat();
                const expected = JSON.stringify({
                    info: {
                        title: 'Known bad',
                        version: '0.0.1',
                    },
                    swagger: '3.0',
                    paths: {},
                }, null, 4);
                const result = await format.tryParse('Known bad.json', expected);
                expect(result).to.be.null;
            });

            it('Throws if the root has lacks a "paths" object', async () => {
                const format = new CollectionFormat();
                const expected = JSON.stringify({
                    info: {
                        title: 'Known bad',
                        version: '0.0.1',
                    },
                    swagger: '2.0',
                }, null, 4);
                const result = await format.tryParse('Known bad.json', expected);
                expect(result).to.be.null;
            });

            it('Throws if the collection lacks an has a non-Object-type "paths" property', async () => {
                const format = new CollectionFormat();
                const expected = JSON.stringify({
                    info: {
                        title: 'Known bad',
                        version: '0.0.1',
                    },
                    swagger: '2.0',
                    paths: [],
                }, null, 4);
                const result = await format.tryParse('Known bad.json', expected);
                expect(result).to.be.null;
            });

            it('Succeeds if the collection meets the minimum requirements', async () => {
                const format = new CollectionFormat();
                const expected = JSON.stringify({
                    info: {
                        title: 'Minimum',
                        version: '0.0.1',
                    },
                    swagger: '2.0',
                    paths: {},
                }, null, 4);
                const result = await format.tryParse('Known bad.json', expected);
                expect(result).to.be.instanceOf(CollectionAdapter);
            });
        });
    });

    describe('YAML format', () => {
        describe('variations of CollectionFormat#parse failures', () => {
            it('Throws if the root lacks an info field', () => {
                async function test() {
                    const format = new CollectionFormat();
                    const expected = `swagger: "2.0"
paths:
  /contoso:
    get:
      description: Baseline
      produces:
        - application/json
      responses:
        "200":
          description: It worked
`;
                    await format.parse('Known bad.yml', expected);
                }
                return expect(test()).to.eventually.be.rejectedWith(RangeError);
            });

            it('Throws if the root lacks a Swagger version declaration', () => {
                async function test() {
                    const format = new CollectionFormat();
                    const expected = `info:
  title: Known bad
  version: 0.0.1
paths:
  /contoso:
    get:
      description: Baseline
      produces:
        - application/json
      responses:
        "200":
          description: It worked
`;
                    await format.parse('Known bad.yml', expected);
                }
                return expect(test()).to.eventually.be.rejectedWith(RangeError);
            });

            it('Throws if the root has an incompatible Swagger version declaration of 1.0', () => {
                async function test() {
                    const format = new CollectionFormat();
                    const expected = `swagger: "1.0"
info:
  title: Known bad
  version: 0.0.1
paths:
  /contoso:
    get:
      description: Baseline
      produces:
        - application/json
      responses:
        "200":
          description: It worked
`;
                    await format.parse('Known bad.yml', expected);
                }
                return expect(test()).to.eventually.be.rejectedWith(RangeError);
            });

            it('Throws if the root has an incompatible Swagger version declaration of 3.0', () => {
                async function test() {
                    const format = new CollectionFormat();
                    const expected = `swagger: "3.0"
info:
  title: Known bad
  version: 0.0.1
paths:
  /contoso:
    get:
      description: Baseline
      produces:
        - application/json
      responses:
        "200":
          description: It worked
`;
                    await format.parse('Known bad.yml', expected);
                }
                return expect(test()).to.eventually.be.rejectedWith(RangeError);
            });

            it('Throws if the root has lacks a "paths" object', () => {
                async function test() {
                    const format = new CollectionFormat();
                    const expected = `swagger: "2.0"
info:
  title: Known bad
  version: 0.0.1
`;
                    await format.parse('Known bad.yml', expected);
                }
                return expect(test()).to.eventually.be.rejectedWith(RangeError);
            });

            it('Succeeds if the collection meets the minimum requirements', async () => {
                const format = new CollectionFormat();
                const expected = `swagger: "2.0"
info:
  title: Known bad
  version: 0.0.1
paths:
  /contoso:
    get:
      description: Baseline
      produces:
        - application/json
      responses:
        "200":
          description: It worked
`;
                await format.parse('TestCollection.yml', expected);
            });
        });

        describe('variations of CollectionFormat#tryParse failures', () => {
            it('Throws if the root lacks an info field', async () => {
                const format = new CollectionFormat();
                const expected = `swagger: "2.0"
paths:
  /contoso:
    get:
      description: Baseline
      produces:
        - application/json
      responses:
        "200":
          description: It worked
`;
                const result = await format.tryParse('Known bad.yml', expected);
                expect(result).to.be.null;
            });

            it('Throws if the root lacks a Swagger version declaration', async () => {
                const format = new CollectionFormat();
                const expected = `info:
  title: Known bad
  version: 0.0.1
paths:
  /contoso:
    get:
      description: Baseline
      produces:
        - application/json
      responses:
        "200":
          description: It worked
`;
                const result = await format.tryParse('Known bad.yml', expected);
                expect(result).to.be.null;
            });

            it('Throws if the root has an incompatible Swagger version declaration of 1.0', async () => {
                const format = new CollectionFormat();
                const expected = `swagger: "1.0"
info:
  title: Known bad
  version: 0.0.1
paths:
  /contoso:
    get:
      description: Baseline
      produces:
        - application/json
      responses:
        "200":
          description: It worked
`;
                const result = await format.tryParse('Known bad.yml', expected);
                expect(result).to.be.null;
            });

            it('Throws if the root has an incompatible Swagger version declaration of 3.0', async () => {
                const format = new CollectionFormat();
                const expected = `swagger: "3.0"
info:
  title: Known bad
  version: 0.0.1
paths:
  /contoso:
    get:
      description: Baseline
      produces:
        - application/json
      responses:
        "200":
          description: It worked
`;
                const result = await format.tryParse('Known bad.yml', expected);
                expect(result).to.be.null;
            });

            it('Throws if the root has lacks a "paths" object', async () => {
                const format = new CollectionFormat();
                const expected = `swagger: "2.0"
info:
  title: Known bad
  version: 0.0.1
`;
                const result = await format.tryParse('Known bad.yml', expected);
                expect(result).to.be.null;
            });

            it('Succeeds if the collection meets the minimum requirements', async () => {
                const format = new CollectionFormat();
                const expected = `swagger: "2.0"
info:
  title: Known bad
  version: 0.0.1
paths:
  /contoso:
    get:
      description: Baseline
      produces:
        - application/json
      responses:
        "200":
          description: It worked
`;
                await format.parse('TestCollection.yml', expected);
            });
        });

    });
});
