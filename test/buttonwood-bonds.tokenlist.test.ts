import fs from 'fs/promises';
import path from 'path';
import packageJson from '../package.json';
import schema from '@uniswap/token-lists/src/tokenlist.schema.json';
import { expect } from 'chai';
import { getAddress } from '@ethersproject/address';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { buildBondList } from '../src/buildBondList';

const rootPath = process.cwd();

const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);
const validator = ajv.compile(schema);

describe('buildBondList', () => {
    const tokenListPromise = buildBondList(true);

    it('validates', async () => {
        const tokenList = await tokenListPromise;
        const validates = validator(tokenList);
        if (!validates) {
            console.error(validator.errors);
        }
        expect(validates).to.equal(true);
    });

    it('contains no duplicate addresses', async () => {
        const tokenList = await tokenListPromise;
        const map: any = {};
        for (const token of tokenList.tokens) {
            const key = `${token.chainId}-${token.address}`;
            expect(typeof map[key]).to.equal('undefined');
            map[key] = true;
        }
    });

    it('all tokenlist addresses are valid and checksummed', async () => {
        const tokenList = await tokenListPromise;
        for (const token of tokenList.tokens) {
            expect(token.address).to.eq(getAddress(token.address));
        }
    });

    it('all asset addresses are valid and checksummed', async () => {
        const chain1Files = await fs.readdir(
            path.join(rootPath, 'assets', 'tokens'),
            { withFileTypes: true },
        );
        const assetFileNames = [];
        for (const file of chain1Files) {
            if (file.isDirectory()) {
                const chainAltFiles = await fs.readdir(
                    path.join(rootPath, 'assets', 'tokens', file.name),
                );
                assetFileNames.push(...chainAltFiles);
            } else {
                assetFileNames.push(file.name);
            }
        }
        for (const fileName of assetFileNames) {
            const ext = path.extname(fileName);
            expect(ext).to.eq('.png');
            const name = path.basename(fileName, ext);
            expect(name).to.eq(getAddress(name));
        }
    });

    it('version matches package.json', async () => {
        const tokenList = await tokenListPromise;
        expect(packageJson.version).to.match(/^\d+\.\d+\.\d+$/);
        expect(packageJson.version).to.equal(
            `${tokenList.version.major}.${tokenList.version.minor}.${tokenList.version.patch}`,
        );
    });
});
