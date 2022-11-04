import { WrapperMap, WrapperMapWrappers } from './types';
import { CommonListParams, getCommonList } from './getCommonList';

export function getWrapperMap(
    commonParams: CommonListParams,
    wrappers?: WrapperMapWrappers,
): WrapperMap {
    return {
        ...getCommonList(commonParams),
        wrappers,
    };
}
