import { Tags, Version } from '@uniswap/token-lists';

export type { TokenList } from '@uniswap/token-lists';

export interface WrapperPair {
    readonly unwrapped: string;
    readonly wrapped: string;
    readonly chainId: number;
}

export interface WrapperMap {
    readonly name: string;
    readonly timestamp: string;
    readonly version: Version;
    readonly wrappers?: {
        [key: string]: WrapperPair[];
    };
    readonly keywords?: string[];
    readonly tags?: Tags;
    readonly logoURI?: string;
    readonly tokens?: TokenData[];
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

export interface DerivedTokenConfig {
    wrapper: string;
    underlying: {
        address: string;
    };
}

export interface TokenData {
    name: string;
    symbol: string;
    decimals: number;
    address: string;
    chainId: number;
    logoURI?: string;
}
