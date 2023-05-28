import { getAddress } from '@ethersproject/address';
import schema from '@uniswap/token-lists/src/tokenlist.schema.json';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { expect } from 'chai';
import path from 'path';
import packageJson from '../package.json';
import { buttonwoodTokenList } from '../src';
import { getLocalPath } from './getLocalPath';

const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);
const validator = ajv.compile(schema);

describe('buildList', () => {
  it('validates', async () => {
    const validates = validator(buttonwoodTokenList);
    if (!validates) {
      console.error(validator.errors);
    }
    expect(validates).to.equal(true);
  });

  it('contains no duplicate addresses', async () => {
    const map: Record<string, true> = {};
    for (const token of buttonwoodTokenList.tokens) {
      const key = `${token.chainId}-${token.address}`;
      expect(typeof map[key]).to.equal('undefined');
      map[key] = true;
    }
  });

  it('contains no duplicate symbols', async () => {
    const map: Record<string, true> = {};
    for (const token of buttonwoodTokenList.tokens) {
      const key = `${token.chainId}-${token.symbol.toLowerCase()}`;
      expect(typeof map[key]).to.equal('undefined');
      map[key] = true;
    }
  });

  it('contains no duplicate names', async () => {
    const map: Record<string, true> = {};
    for (const token of buttonwoodTokenList.tokens) {
      const key = `${token.chainId}-${token.name.toLowerCase()}`;
      expect(typeof map[key]).to.equal(
        'undefined',
        `duplicate name: ${token.name}`,
      );
      map[key] = true;
    }
  });

  it('all tokenlist addresses are valid and checksummed', async () => {
    for (const token of buttonwoodTokenList.tokens) {
      expect(token.address).to.eq(getAddress(token.address));
    }
  });

  it('all asset addresses are valid and checksummed', async () => {
    for (const token of buttonwoodTokenList.tokens) {
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
    expect(packageJson.version).to.match(/^\d+\.\d+\.\d+$/);
    expect(packageJson.version).to.equal(
      `${buttonwoodTokenList.version.major}.${buttonwoodTokenList.version.minor}.${buttonwoodTokenList.version.patch}`,
    );
  });
});
