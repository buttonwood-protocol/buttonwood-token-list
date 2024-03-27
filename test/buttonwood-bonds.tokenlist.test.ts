import { getAddress } from '@ethersproject/address';
import schema from '@uniswap/token-lists/src/tokenlist.schema.json';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { describe } from 'lwtf';
import path from 'path';
import packageJson from '../package.json';
import { buttonwoodBondsTokenList } from '../src';
import { getLocalPath } from './getLocalPath';

const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);
const validator = ajv.compile(schema);

describe('buildBondList', ({ it }) => {
  it('validates', async ({ assert }) => {
    const validates = validator(buttonwoodBondsTokenList);
    if (!validates) {
      console.error(validator.errors);
    }
    assert('validates is true').boolean(validates).isTrue();
  });

  it('contains no duplicate addresses', async ({ assert }) => {
    const map: Record<string, true> = {};
    for (const token of buttonwoodBondsTokenList.tokens) {
      const key = `${token.chainId}-${token.address}`;
      assert(`unique address: ${token.address}`).object(map).lacksKey(key);
      map[key] = true;
    }
  });

  it('all tokenlist addresses are valid and checksummed', async ({
    assert,
  }) => {
    for (const token of buttonwoodBondsTokenList.tokens) {
      assert(`valid checksum: ${token.address}`)
        .string(token.address)
        .equalTo(getAddress(token.address));
    }
  });

  it('all asset addresses are valid and checksummed', async ({ assert }) => {
    for (const token of buttonwoodBondsTokenList.tokens) {
      if (token.logoURI) {
        const localPath = getLocalPath(token.logoURI);
        if (localPath) {
          const ext = path.extname(localPath);
          assert(`extension is .png: ${token.logoURI}`)
            .string(ext)
            .equalTo('.png');
          const name = path.basename(localPath, ext);
          const [address] = name.split('-');
          assert(`filename is checksummed address: ${token.logoURI}`)
            .string(address)
            .equalTo(getAddress(address));
        }
      }
    }
  });

  it('version matches package.json', async ({ assert }) => {
    assert('valid version')
      .string(packageJson.version)
      .matches(/^\d+\.\d+\.\d+$/);
    assert('expected version')
      .string(packageJson.version)
      .equalTo(
        `${buttonwoodBondsTokenList.version.major}.${buttonwoodBondsTokenList.version.minor}.${buttonwoodBondsTokenList.version.patch}`,
      );
  });
});
