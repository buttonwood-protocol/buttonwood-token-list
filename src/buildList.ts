import { processTokens } from './processTokens';
import { TokenList } from '@uniswap/token-lists';
import { getTokenList } from './getTokenList';

export async function buildList(
    skipImageProcessing = false,
): Promise<TokenList> {
    const tokens = await processTokens(skipImageProcessing);
    return getTokenList(
        {
            name: 'Buttonwood',
            keywords: ['buttonwood', 'defi'],
        },
        tokens,
    );
}
