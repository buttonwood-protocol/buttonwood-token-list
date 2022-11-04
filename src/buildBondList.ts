import fs from 'fs/promises';
import path from 'path';
import {
    ApolloClient,
    gql,
    HttpLink,
    InMemoryCache,
} from '@apollo/client/core';
import fetch from 'cross-fetch';
import { TokenList } from '@uniswap/token-lists';
import { getTokenList } from './getTokenList';
import { BondTokenLogoUriDedupeMap, TokenConfig, TokenData } from './types';
import tokenJson from './tokens.json';
import { getAddress } from '@ethersproject/address';
import { doesLogoExist, processLogo } from './processTokens';
import { getAssetUri } from './getAssetUri';
import { getBondWrapper } from './getBondWrapper';

let bondTokenLogoUriDedupeMap: BondTokenLogoUriDedupeMap = {};
const bondTokenLogoUriDedupeMapPath = path.join(
    '.',
    'src',
    'bondTokenLogoUriDedupeMap.json',
);

interface NetworkConfig {
    chainId: number;
    subgraphTranche: string;
}

interface TrancheData {
    index: string;
    token: {
        id: string;
        name: string;
        symbol: string;
        decimals: string;
    };
}

interface BondData {
    collateral: {
        id: string;
    };
    tranches: TrancheData[];
}

interface QueryResponse {
    bonds: BondData[];
}

const networks: NetworkConfig[] = [
    {
        chainId: 1,
        subgraphTranche:
            'https://api.thegraph.com/subgraphs/name/buttonwood-protocol/tranche',
    },
    {
        chainId: 5,
        subgraphTranche:
            'https://api.thegraph.com/subgraphs/name/buttonwood-protocol/tranche-goerli',
    },
];

const cache = new InMemoryCache();

const secondaryToPrimaryTokenMap = new Map();
for (const tokenConfig of tokenJson as TokenConfig[]) {
    const primaryAddress =
        tokenConfig.chains[tokenConfig.primaryChainId].address;
    Object.values(tokenConfig.chains).forEach(({ address }) =>
        secondaryToPrimaryTokenMap.set(address.toLowerCase(), primaryAddress),
    );
}

export const GET_TRANCHE_TOKENS = gql`
    query getTrancheTokens {
        bonds {
            collateral {
                id
            }
            tranches {
                index
                token {
                    id
                    name
                    symbol
                    decimals
                }
            }
        }
    }
`;

async function getBondTokensForNetwork(
    network: NetworkConfig,
    skipImageProcessing: boolean,
): Promise<TokenData[]> {
    const clientTranche = new ApolloClient({
        cache: cache,
        link: new HttpLink({ uri: network.subgraphTranche, fetch }),
    });
    const res = await clientTranche.query<QueryResponse>({
        query: GET_TRANCHE_TOKENS,
        fetchPolicy: 'no-cache',
    });
    const tokens: TokenData[] = [];
    for (const bond of res.data.bonds) {
        const collateralPrimaryAddress = secondaryToPrimaryTokenMap.get(
            bond.collateral.id,
        );
        if (!collateralPrimaryAddress) {
            // Only list bond tokens that use collateral that we list
            continue;
        }
        const trancheCount = bond.tranches.length;
        for (const tranche of bond.tranches) {
            const address = getAddress(tranche.token.id);
            const wrapper = getBondWrapper(
                trancheCount,
                parseInt(tranche.index, 10),
            );
            if (!bondTokenLogoUriDedupeMap[collateralPrimaryAddress]) {
                bondTokenLogoUriDedupeMap[collateralPrimaryAddress] = {};
            }
            const wrapperToLogoUriMap =
                bondTokenLogoUriDedupeMap[collateralPrimaryAddress];
            if (!skipImageProcessing && !wrapperToLogoUriMap[wrapper]) {
                try {
                    await processLogo(address, {
                        wrapper,
                        underlying: {
                            address: collateralPrimaryAddress,
                        },
                    });
                    let logoURINew;
                    if (await doesLogoExist(address, network.chainId)) {
                        logoURINew = getAssetUri(
                            `tokens/${network.chainId}/${address}.png`,
                        );
                    } else if (await doesLogoExist(address)) {
                        logoURINew = getAssetUri(`tokens/${address}.png`);
                    }
                    if (logoURINew) {
                        wrapperToLogoUriMap[wrapper] = logoURINew;
                        await fs.writeFile(
                            bondTokenLogoUriDedupeMapPath,
                            JSON.stringify(
                                bondTokenLogoUriDedupeMap,
                                null,
                                '\t',
                            ),
                            'utf8',
                        );
                    }
                } catch (err) {
                    // Don't care
                }
            }
            const logoURI = wrapperToLogoUriMap[wrapper];
            tokens.push({
                name: tranche.token.name,
                symbol: tranche.token.symbol,
                decimals: parseInt(tranche.token.decimals, 10),
                address,
                chainId: network.chainId,
                logoURI,
            });
        }
    }
    return tokens;
}

async function getBondTokens(
    skipImageProcessing: boolean,
): Promise<TokenData[]> {
    // Need to load and save this mapping between sessions because there's no deterministic way
    //   to ensure that the same bond token address is used as the primary address for a
    //   collateral-wrapper combo across different executions
    bondTokenLogoUriDedupeMap = JSON.parse(
        await fs.readFile(bondTokenLogoUriDedupeMapPath, 'utf8'),
    );
    let tokens: TokenData[] = [];
    for (const network of networks) {
        const networkTokens = await getBondTokensForNetwork(
            network,
            skipImageProcessing,
        );
        tokens = tokens.concat(networkTokens);
    }
    return tokens;
}

export async function buildBondList(
    skipImageProcessing = false,
): Promise<TokenList> {
    const tokens = await getBondTokens(skipImageProcessing);
    return getTokenList(
        {
            name: 'Buttonwood Bonds',
            keywords: ['buttonwood', 'bonds', 'defi'],
        },
        tokens,
    );
}
