import { getAddress } from '@ethersproject/address';
import { expect } from 'chai';
import packageJson from '../package.json';
import { buttonwoodWrapperMap } from '../src';

describe('buildWrapperMap', () => {
  it('contains no duplicate entries', async () => {
    const map: Record<string, true> = {};
    if (buttonwoodWrapperMap.wrappers) {
      for (const wrapper of Object.keys(buttonwoodWrapperMap.wrappers)) {
        for (const wrapperPair of buttonwoodWrapperMap.wrappers[wrapper]) {
          const key = `${
            wrapperPair.chainId
          }-${wrapperPair.unwrapped.toLowerCase()}-${wrapperPair.wrapped.toLowerCase()}`;
          expect(typeof map[key]).to.equal(
            'undefined',
            `duplicate entry: ${JSON.stringify(wrapperPair)}`,
          );
          map[key] = true;
        }
      }
    }
  });

  it('all wrapperMap addresses are valid and checksummed', async () => {
    if (buttonwoodWrapperMap.wrappers) {
      for (const wrapper of Object.keys(buttonwoodWrapperMap.wrappers)) {
        for (const wrapperPair of buttonwoodWrapperMap.wrappers[wrapper]) {
          expect(wrapperPair.unwrapped).to.eq(
            getAddress(wrapperPair.unwrapped),
          );
          expect(wrapperPair.wrapped).to.eq(getAddress(wrapperPair.wrapped));
        }
      }
    }
  });

  it('version matches package.json', async () => {
    expect(packageJson.version).to.match(/^\d+\.\d+\.\d+$/);
    expect(packageJson.version).to.equal(
      `${buttonwoodWrapperMap.version.major}.${buttonwoodWrapperMap.version.minor}.${buttonwoodWrapperMap.version.patch}`,
    );
  });
});
