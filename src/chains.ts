import chains from './chains.json';

interface ChainDefinition {
  name: string;
  title?: string;
  chainId: number;
}

export function getChainDefinitionFromName(chainName: string): ChainDefinition {
  const chain = chains.find((chain) => {
    return chain.name === chainName;
  });
  if (!chain) {
    throw new Error(`Invalid chain name "${chainName}"`);
  }
  return chain;
}
