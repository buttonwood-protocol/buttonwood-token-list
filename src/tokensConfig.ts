import { getChainDefinitionFromName } from './chains';
import rawTokenJson from './tokens.json';

export interface TokenData {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  chainId: number;
  logoURI?: string;
}

export interface DerivedTokenConfig {
  wrapper: string;
  underlying: {
    address: string;
  };
  bespokeLogo?: boolean;
}

export interface RawTokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  primaryChain: string;
  chains: {
    [key: string]: Partial<TokenData> & Pick<TokenData, 'address'>;
  };
  derived?: DerivedTokenConfig;
  tags?: string[];
}

export interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  primaryChainId: number;
  chains: {
    [key: string]: Partial<TokenData> & Pick<TokenData, 'address'>;
  };
  derived?: DerivedTokenConfig;
  tags?: string[];
}

class TokensConfig {
  readonly data: TokenConfig[];
  readonly map: Map<string, TokenConfig>;

  constructor() {
    // First convert raw data config to regular config
    // It's preferable to handle the rest of the build task using chainId rather than chainName
    const rawData = rawTokenJson as RawTokenConfig[];
    this.data = [];
    for (const rawTokenConfig of rawData) {
      const {
        name,
        symbol,
        decimals,
        primaryChain,
        chains: rawChains,
        derived,
        tags,
      } = rawTokenConfig;
      const primaryChainId = getChainDefinitionFromName(primaryChain).chainId;
      const chains: TokenConfig['chains'] = {};
      Object.keys(rawChains).forEach((chainName) => {
        const chainId = getChainDefinitionFromName(chainName).chainId;
        chains[chainId] = rawChains[chainName];
      });
      const tokenConfig = {
        name,
        symbol,
        decimals,
        primaryChainId,
        chains,
        derived,
        tags,
      };
      this.data.push(tokenConfig);
    }
    // Now do everything else
    this.map = new Map();
    for (const tokenConfig of this.data) {
      const chainIds = Object.keys(tokenConfig.chains).map((key) =>
        parseInt(key, 10),
      );
      for (const chainId of chainIds) {
        const { address } = tokenConfig.chains[chainId];
        const key = TokensConfig.getKey(chainId, address);
        if (this.map.has(key)) {
          throw new Error(`Duplicate definition for ${key}`);
        }
        this.map.set(key, tokenConfig);
      }
    }
  }

  static getKey(chainId: number, address: string): string {
    return `${chainId}:${address}`;
  }

  get(chainId: number, address: string) {
    const key = TokensConfig.getKey(chainId, address);
    const tokenDefinition = this.map.get(key);
    if (!tokenDefinition) {
      throw new Error(`No definition for ${key}`);
    }
    return tokenDefinition;
  }

  getTokens() {
    return this.data.slice();
  }
}

export const tokensConfig = new TokensConfig();
