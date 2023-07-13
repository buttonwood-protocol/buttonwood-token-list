import {tokensConfig} from './tokensConfig';
import {TokenDefinition, TokenDefinitions} from './types';

export function getTokenDefinitionsFromConfig(): TokenDefinitions {
  const tokenDefinitions: TokenDefinitions = [];
  for (const tokenConfig of tokensConfig.getTokens()) {
    const chainIds = Object.keys(tokenConfig.chains).map((key) =>
      parseInt(key, 10),
    );
    const {primaryChainId, derived, chains} = tokenConfig;
    const primaryAddress: string = chains[primaryChainId].address;

    for (const chainId of chainIds) {
      const {address, name, symbol, decimals, tags} = {
        ...tokenConfig,
        ...chains[chainId],
      };
      const tokenDefinition: TokenDefinition = {
        address,
        chainId,
        name,
        symbol,
        decimals,
      };
      if (tags) {
        tokenDefinition.tags = tags.sort();
      }
      if (derived) {
        const underlying = tokensConfig.get(
          primaryChainId,
          derived.underlying.address,
        );
        if (!underlying) {
          throw new Error(
            `getTokenDefinitionsFromConfig: No underlying TokenConfig for ${derived.underlying.address}`,
          );
        }
        if (!underlying.chains[chainId]) {
          throw new Error(
            `getTokenDefinitionsFromConfig: No data for TokenConfig at ${derived.underlying.address} on chain ${chainId}`,
          );
        }
        tokenDefinition.derived = {
          wrapper: derived.wrapper,
          underlying: {
            address: underlying.chains[chainId].address,
            chainId,
          },
          bespokeLogo: derived.bespokeLogo,
        };
      }
      if (chainId !== primaryChainId) {
        tokenDefinition.dedupe = {
          address: primaryAddress,
          chainId: primaryChainId,
        };
      }
      tokenDefinitions.push(tokenDefinition);
    }
  }
  return tokenDefinitions;
}
