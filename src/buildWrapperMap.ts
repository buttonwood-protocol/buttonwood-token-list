import tokenJson from './tokens.json';
import { TokenConfig, WrapperMap, WrapperMapWrappers } from './types';
import { getWrapperMap } from './getWrapperMap';

interface KeyedTokenMap {
    [key: string]: TokenConfig;
}

function getAddressKeyedTokenMap(tokenJson: TokenConfig[]): KeyedTokenMap {
    const keyedTokenMap: KeyedTokenMap = {};

    for (const token of tokenJson) {
        const key = token.chains[token.primaryChainId].address;
        keyedTokenMap[key] = token;
    }

    return keyedTokenMap;
}

export function buildWrapperMap(): WrapperMap {
    const keyedTokenMap = getAddressKeyedTokenMap(tokenJson as TokenConfig[]);
    const wrappers: WrapperMapWrappers = {};
    for (const token of tokenJson as TokenConfig[]) {
        if (token.derived) {
            let wrapper = wrappers[token.derived.wrapper];
            if (!wrapper) {
                wrapper = wrappers[token.derived.wrapper] = [];
            }
            const underlyingToken =
                keyedTokenMap[token.derived.underlying.address];

            for (const chainId of Object.keys(token.chains)) {
                if (underlyingToken.chains[chainId]) {
                    wrapper.push({
                        unwrapped: underlyingToken.chains[chainId].address,
                        wrapped: token.chains[chainId].address,
                        chainId: parseInt(chainId),
                    });
                }
            }
        }
    }
    return getWrapperMap(
        {
            name: 'Buttonwood',
            keywords: ['buttonwood', 'defi'],
        },
        wrappers,
    );
}
