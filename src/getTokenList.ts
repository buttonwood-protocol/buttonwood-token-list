import { TokenList } from '@uniswap/token-lists';
import { TokenData } from './types';
import { CommonListParams, getCommonList } from './getCommonList';

export function getTokenList(
    commonParams: CommonListParams,
    tokens: TokenData[],
): TokenList {
    return {
        ...getCommonList(commonParams),
        tokens: tokens
            // sort them by symbol for easy readability
            .sort((t1, t2) => {
                if (t1.chainId === t2.chainId) {
                    return t1.symbol.toLowerCase() < t2.symbol.toLowerCase()
                        ? -1
                        : 1;
                }
                return t1.chainId < t2.chainId ? -1 : 1;
            }),
    };
}
