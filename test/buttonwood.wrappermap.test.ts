import packageJson from '../package.json';
import { expect } from 'chai';
import { getAddress } from '@ethersproject/address';
import { loadJson } from './loadJson';
import path from 'path';

describe('buildWrapperMap', () => {
    const wrapperMapPromise = loadJson(
        path.join('.', 'buttonwood.wrappermap.json'),
    );

    it('contains no duplicate entries', async () => {
        const wrapperMap = await wrapperMapPromise;
        const map: any = {};
        if (wrapperMap.wrappers) {
            for (const wrapper of Object.keys(wrapperMap.wrappers)) {
                for (const wrapperPair of wrapperMap.wrappers[wrapper]) {
                    const key: any = `${
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
        const wrapperMap = await wrapperMapPromise;
        if (wrapperMap.wrappers) {
            for (const wrapper of Object.keys(wrapperMap.wrappers)) {
                for (const wrapperPair of wrapperMap.wrappers[wrapper]) {
                    expect(wrapperPair.unwrapped).to.eq(
                        getAddress(wrapperPair.unwrapped),
                    );
                    expect(wrapperPair.wrapped).to.eq(
                        getAddress(wrapperPair.wrapped),
                    );
                }
            }
        }
    });

    it('version matches package.json', async () => {
        const wrapperMap = await wrapperMapPromise;
        expect(packageJson.version).to.match(/^\d+\.\d+\.\d+$/);
        expect(packageJson.version).to.equal(
            `${wrapperMap.version.major}.${wrapperMap.version.minor}.${wrapperMap.version.patch}`,
        );
    });
});
