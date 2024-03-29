import { TokenInfo, TokenList } from '@uniswap/token-lists';
import { CommonListParams, getCommonList } from './getCommonList';
import { getLogoLocation } from './getLogoLocation';
import { TokenDefinitionsMap } from './TokenDefinitionsMap';
import { TokenDefinition, TokenDefinitions } from './types';
import { pathExists } from './utils/pathExists';

async function getTokenInfo(
  tokenDefinitionsMap: TokenDefinitionsMap,
  tokenDefinition: TokenDefinition,
): Promise<TokenInfo> {
  const { chainId, address, name, decimals, symbol, tags } = tokenDefinition;
  const { localPath, logoURI } = getLogoLocation(
    tokenDefinitionsMap,
    chainId,
    address,
  );
  return {
    chainId,
    address,
    name,
    decimals,
    symbol,
    tags,
    logoURI: (await pathExists(localPath)) ? logoURI : undefined,
  };
}

export async function getTokenList(
  commonParams: CommonListParams,
  tokenDefinitionsMap: TokenDefinitionsMap,
  tokenDefinitions: TokenDefinitions,
): Promise<TokenList> {
  const tokens = await Promise.all(
    tokenDefinitions.map((tokenDefinition) => {
      return getTokenInfo(tokenDefinitionsMap, tokenDefinition);
    }),
  );
  return {
    ...getCommonList(commonParams),
    tokens: tokens
      // sort them by symbol for easy readability
      .sort((t1, t2) => {
        if (t1.chainId === t2.chainId) {
          return t1.symbol.toLowerCase() < t2.symbol.toLowerCase() ? -1 : 1;
        }
        return t1.chainId < t2.chainId ? -1 : 1;
      }),
  };
}
