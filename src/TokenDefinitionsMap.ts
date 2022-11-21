import { TokenDefinition, TokenDefinitions } from './types';

export class TokenDefinitionsMap {
    readonly map: Map<string, TokenDefinition>;

    static getKey(chainId: number, address: string): string {
        return `${chainId}:${address}`;
    }

    constructor(tokenDefinitions: TokenDefinitions) {
        this.map = new Map();
        for (const tokenDefinition of tokenDefinitions) {
            const { chainId, address } = tokenDefinition;
            const key = TokenDefinitionsMap.getKey(chainId, address);
            if (this.map.has(key)) {
                throw new Error(`Duplicate definition for ${key}`);
            }
            this.map.set(key, tokenDefinition);
        }
    }

    get(chainId: number, address: string): TokenDefinition {
        const key = TokenDefinitionsMap.getKey(chainId, address);
        const tokenDefinition = this.map.get(key);
        if (!tokenDefinition) {
            throw new Error(`No definition for ${key}`);
        }
        return tokenDefinition;
    }
}
