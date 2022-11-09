import { TokenDefinitions, WrapperMap, WrapperMapWrappers } from './types';
import { CommonListParams, getCommonList } from './getCommonList';

export function getWrapperMap(
    commonParams: CommonListParams,
    tokenDefinitions: TokenDefinitions,
): WrapperMap {
    const wrappers: WrapperMapWrappers = {};
    for (const tokenDefinition of tokenDefinitions) {
        const { derived, address, chainId } = tokenDefinition;
        if (derived) {
            const { wrapper, underlying } = derived;
            let wrapperPairs = wrappers[wrapper];
            if (!wrapperPairs) {
                wrapperPairs = wrappers[wrapper] = [];
            }
            wrapperPairs.push({
                unwrapped: underlying.address,
                wrapped: address,
                chainId,
            });
        }
    }
    return {
        ...getCommonList(commonParams),
        wrappers,
    };
}
