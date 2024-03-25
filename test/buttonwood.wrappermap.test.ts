import { getAddress } from '@ethersproject/address';
import { describe } from 'lwtf';
import packageJson from '../package.json';
import { buttonwoodWrapperMap } from '../src';

describe('buildWrapperMap', ({ it }) => {
  it('contains no duplicate entries', async ({ assert }) => {
    const map: Record<string, true> = {};
    if (buttonwoodWrapperMap.wrappers) {
      for (const wrapper of Object.keys(buttonwoodWrapperMap.wrappers)) {
        for (const wrapperPair of buttonwoodWrapperMap.wrappers[wrapper]) {
          const key = `${
            wrapperPair.chainId
          }-${wrapperPair.unwrapped.toLowerCase()}-${wrapperPair.wrapped.toLowerCase()}`;
          assert(`unique entry: ${JSON.stringify(wrapperPair)}`)
            .object(map)
            .lacksKey(key);
          map[key] = true;
        }
      }
    }
  });

  it('all wrapperMap addresses are valid and checksummed', async ({
    assert,
  }) => {
    if (buttonwoodWrapperMap.wrappers) {
      for (const wrapper of Object.keys(buttonwoodWrapperMap.wrappers)) {
        for (const wrapperPair of buttonwoodWrapperMap.wrappers[wrapper]) {
          assert('unwrapped address is checksummed')
            .string(wrapperPair.unwrapped)
            .equalTo(getAddress(wrapperPair.unwrapped));
          assert('wrapped address is checksummed')
            .string(wrapperPair.wrapped)
            .equalTo(getAddress(wrapperPair.wrapped));
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
        `${buttonwoodWrapperMap.version.major}.${buttonwoodWrapperMap.version.minor}.${buttonwoodWrapperMap.version.patch}`,
      );
  });
});
