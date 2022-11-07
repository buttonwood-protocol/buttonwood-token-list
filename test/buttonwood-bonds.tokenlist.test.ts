import path from 'path';
import packageJson from '../package.json';
import schema from '@uniswap/token-lists/src/tokenlist.schema.json';
import { expect } from 'chai';
import { getAddress } from '@ethersproject/address';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { loadJson } from './loadJson';
import { getLocalPath } from './getLocalPath';

const rootPath = process.cwd();

const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);
const validator = ajv.compile(schema);

describe('buildBondList', () => {
    const tokenListPromise = loadJson(
        path.join('.', 'buttonwood-bonds.tokenlist.json'),
    );

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
        const tokenList = await tokenListPromise;
        for (const token of tokenList.tokens) {
            if (token.logoURI) {
                const localPath = getLocalPath(token.logoURI);
                if (localPath) {
                    const ext = path.extname(localPath);
                    expect(ext).to.eq('.png');
                    const name = path.basename(localPath, ext);
                    const [address] = name.split('-');
                    expect(address).to.eq(getAddress(address));
                }
            }
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
