// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// tslint:disable:no-unused-expression

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';

chai.use(chaiAsPromised);

import { toB64, strFromB64, binFromB64, binToB64 } from '../base64';

describe('src/util/base64', () => {

    describe('toB64', () => {
        it('Encodes correctly', async () => {
            expect(toB64('this is a test')).to.equal('dGhpcyBpcyBhIHRlc3Q=');
        });
        it('returns an empty string from an empty buffer', async () => {
            expect(toB64('')).to.equal('');
        });
    });

    describe('strFromB64', () => {
        it('Decodes correctly', async () => {
            expect(strFromB64('dGhpcyBpcyBhIHRlc3Q=')).to.equal('this is a test');
        });
        it('Throws with invalid input', async () => {
            function test() {
                strFromB64('!$#$^');
            }
            expect(test).to.throw;
        });
        it('returns an empty string from an empty b64 input', async () => {
            expect(strFromB64('')).to.equal('');
        });
    });

    describe('binFromB64', () => {
        it('Decodes correctly', async () => {
            const buf = binFromB64('AAECAwQFBgcICQoLDA0ODw==');
            expect(buf.byteLength).to.equal(16);
            const u8a = new Uint8Array(buf);
            for (let i = 0; i < 16; i++) {
                expect(u8a[i]).to.equal(i);
            }
        });
        it('Throws with invalid input', async () => {
            function test() {
                binFromB64('!$#$^');
            }
            expect(test).to.throw;
        });
    });

    describe('binToB64', () => {
        it('Encodes correctly', async () => {
            const buf = new ArrayBuffer(16);
            const src = new Uint8Array(buf);
            for (let i = 0; i < 16; i++) {
                src[i] = i;
            }

            expect(binToB64(src)).to.equal('AAECAwQFBgcICQoLDA0ODw==');
        });
    });
});
