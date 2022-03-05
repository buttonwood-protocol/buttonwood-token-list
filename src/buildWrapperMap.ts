import packageJson from '../package.json';
import tokenJson from './tokens.json';
import { WrapperPair, WrapperMap, TokenConfig } from './types';

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
    const [major, minor, patch] = packageJson.version
        .split('.')
        .map((segment) => parseInt(segment, 10));
    const keyedTokenMap = getAddressKeyedTokenMap(tokenJson as TokenConfig[]);
    const wrappers: { [key: string]: WrapperPair[] } = {};
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
    return {
        name: 'Buttonwood',
        timestamp: new Date().toISOString(),
        version: {
            major,
            minor,
            patch,
        },
        tags: {},
        logoURI:
            'https://raw.githubusercontent.com/marktoda/buttonwood-token-list/main/assets/buttonwood.svg',
        keywords: ['buttonwood', 'defi'],
        wrappers,
    };
}
