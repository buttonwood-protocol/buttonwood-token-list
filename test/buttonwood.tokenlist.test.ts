import { getAddress } from '@ethersproject/address';
import { TokenList } from '@uniswap/token-lists';
import schema from '@uniswap/token-lists/src/tokenlist.schema.json';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { expect } from 'chai';
import path from 'path';
import packageJson from '../package.json';
import { getLocalPath } from './getLocalPath';
import { loadJson } from './loadJson';

const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);
const validator = ajv.compile(schema);

describe('buildList', () => {
  const tokenListPromise = loadJson<TokenList>(
    path.join('.', 'buttonwood.tokenlist.json'),
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
    const map: Record<string, true> = {};
    for (const token of tokenList.tokens) {
      const key = `${token.chainId}-${token.address}`;
      expect(typeof map[key]).to.equal('undefined');
      map[key] = true;
    }
  });

  it('contains no duplicate symbols', async () => {
    const tokenList = await tokenListPromise;
    const map: Record<string, true> = {};
    for (const token of tokenList.tokens) {
      const key = `${token.chainId}-${token.symbol.toLowerCase()}`;
      expect(typeof map[key]).to.equal('undefined');
      map[key] = true;
    }
  });

  it('contains no duplicate names', async () => {
    const tokenList = await tokenListPromise;
    const map: Record<string, true> = {};
    for (const token of tokenList.tokens) {
      const key = `${token.chainId}-${token.name.toLowerCase()}`;
      expect(typeof map[key]).to.equal(
        'undefined',
        `duplicate name: ${token.name}`,
      );
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
