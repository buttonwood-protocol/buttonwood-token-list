import { TokenList } from '@uniswap/token-lists';
export type { TokenList } from '@uniswap/token-lists';
export declare type CommonList = Omit<TokenList, 'tokens'>;
export interface WrapperPair {
    readonly unwrapped: string;
    readonly wrapped: string;
    readonly chainId: number;
}
export interface WrapperMapWrappers {
    [key: string]: WrapperPair[];
}
export interface WrapperMap extends CommonList {
    readonly wrappers: WrapperMapWrappers;
}
export interface TokenDefinition {
    address: string;
    chainId: number;
    name: string;
    symbol: string;
    decimals: number;
    tags?: string[];
    derived?: {
        wrapper: string;
        underlying: {
            address: string;
            chainId: number;
        };
        bespokeLogo?: boolean;
    };
    dedupe?: {
        address: string;
        chainId: number;
    };
}
export declare type TokenDefinitions = TokenDefinition[];
