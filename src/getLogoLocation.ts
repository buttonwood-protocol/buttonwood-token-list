import { TokenDefinitionsMap } from './TokenDefinitionsMap';
import path from 'path';
import { getAssetUri } from './getAssetUri';

/**
 * Dictates the location for an asset's logo
 *
 * For the sake of efficiency we attempt to de-duplicate logos that look the same.
 * This is simple enough for non wrapped assets, as we can designate one chain the asset exists
 *   on as being primary and then have the other chain versions of that asset point to that file.
 * Wrapped assets introduce extra complexity however, as they can be nested, and the tokens
 *   themselves can be dynamically created with no clear equivalents across chains.
 * To resolve this, we use their base non-wrapped token address as the identifying address, with
 *   the rest of the filename being the ordered list of wrap operations.
 * This should result in otherwise disconnected wrapped tokens sharing the same de-duplicated
 *   file.
 *
 * @param tokenDefinitionsMap
 * @param chainId
 * @param address
 */
export function getLogoLocation(
    tokenDefinitionsMap: TokenDefinitionsMap,
    chainId: number,
    address: string,
) {
    const wrappers = [];
    let tokenDefinition = tokenDefinitionsMap.get(chainId, address);
    let infinityBlocker = 100;
    while (tokenDefinition.derived && !tokenDefinition.derived.bespokeLogo) {
        const { wrapper, underlying } = tokenDefinition.derived;
        wrappers.push(wrapper);
        tokenDefinition = tokenDefinitionsMap.get(
            underlying.chainId,
            underlying.address,
        );
        infinityBlocker--;
        if (infinityBlocker <= 0) {
            const key = TokenDefinitionsMap.getKey(chainId, address);
            throw new Error(`Cyclic wrapper definitions for ${key}`);
        }
    }
    if (tokenDefinition.dedupe) {
        const { dedupe } = tokenDefinition;
        tokenDefinition = tokenDefinitionsMap.get(
            dedupe.chainId,
            dedupe.address,
        );
    }
    if (
        (tokenDefinition.derived && !tokenDefinition.derived.bespokeLogo) ||
        tokenDefinition.dedupe
    ) {
        throw new Error(`Foundational assumptions have proven to be wrong`);
    }
    const filename = `${[tokenDefinition.address]
        .concat(wrappers.reverse())
        .join('-')}.png`;
    const localDir = path.join(
        '.',
        'assets',
        'tokens',
        tokenDefinition.chainId.toString(),
    );
    const localPath = path.join(localDir, filename);
    const logoURI = getAssetUri(
        path.posix.join('tokens', tokenDefinition.chainId.toString(), filename),
    );
    return {
        localDir,
        localPath,
        logoURI,
    };
}
