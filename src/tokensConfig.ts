import tokenJson from './tokens.json';

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

export interface TokenConfig {
    name: string;
    symbol: string;
    decimals: number;
    primaryChainId: number;
    chains: {
        [key: string]: Partial<TokenData> & Pick<TokenData, 'address'>;
    };
    derived?: DerivedTokenConfig;
}

class TokensConfig {
    readonly data: TokenConfig[];
    readonly map: Map<string, TokenConfig>;

    static getKey(chainId: number, address: string): string {
        return `${chainId}:${address}`;
    }

    constructor() {
        this.data = tokenJson as TokenConfig[];
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
