import { processTokens } from './processTokens';
import packageJson from '../package.json';
import { WrapperMap } from './types';

export async function buildList(
    skipImageProcessing = false,
): Promise<WrapperMap> {
    const [major, minor, patch] = packageJson.version
        .split('.')
        .map((segment) => parseInt(segment, 10));
    const tokens = await processTokens(skipImageProcessing);
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
