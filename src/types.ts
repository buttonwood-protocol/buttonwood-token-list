import {Tags, Version} from "@uniswap/token-lists";

export {TokenList} from "@uniswap/token-lists";

export interface WrapperPair {
    readonly unwrapped: string;
    readonly wrapped: string;
}

export interface WrapperMap {
    readonly name: string;
    readonly timestamp: string;
    readonly version: Version;
    readonly wrappers: {
        button: WrapperPair[];
        unbutton: WrapperPair[];
    };
    readonly keywords?: string[];
    readonly tags?: Tags;
    readonly logoURI?: string;
}
