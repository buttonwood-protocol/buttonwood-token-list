import { TokenList } from '@uniswap/token-lists';

export type { TokenList } from '@uniswap/token-lists';

export type CommonList = Omit<TokenList, 'tokens'>;

export interface WrapperPair {
    readonly unwrapped: string;
    readonly wrapped: string;
    readonly chainId: number;
}

export interface WrapperMapWrappers {
    [key: string]: WrapperPair[];
}

export interface WrapperMap extends CommonList {
    readonly wrappers?: WrapperMapWrappers;
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

export interface BondTokenLogoUriDedupeMap {
    [key: string]: {
        [key: string]: string;
    };
}
