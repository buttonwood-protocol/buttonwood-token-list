import {
  ApolloClient,
  gql,
  HttpLink,
  InMemoryCache,
} from '@apollo/client/core';
import { getAddress } from '@ethersproject/address';
import fetch from 'cross-fetch';
import { getBondWrapper } from './getBondWrapper';
import { NetworkConfig, networkConfigs } from './networkConfigs';
import { tokensConfig } from './tokensConfig';
import { TokenDefinition, TokenDefinitions } from './types';

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

const cache = new InMemoryCache();

export const GET_TRANCHE_TOKENS = gql`
  query getTrancheTokens($creators: [ID!]!) {
    bonds(where: { creator_in: $creators }) {
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

async function getBondTokenDefinitionsForNetwork({
  chainId,
  subgraphTranche,
  bondMinters,
}: NetworkConfig): Promise<TokenDefinitions> {
  if (!subgraphTranche) {
    return [];
  }
  const clientTranche = new ApolloClient({
    cache: cache,
    link: new HttpLink({ uri: subgraphTranche, fetch }),
  });
  const res = await clientTranche.query<QueryResponse>({
    query: GET_TRANCHE_TOKENS,
    variables: {
      creators: bondMinters?.map((address) => address.toLowerCase()) || [],
    },
    fetchPolicy: 'no-cache',
  });
  const tokenDefinitions: TokenDefinitions = [];
  for (const bond of res.data.bonds) {
    const underlyingAddress = getAddress(bond.collateral.id);
    const underlying = tokensConfig.get(chainId, underlyingAddress);
    if (!underlying) {
      console.warn(
        `getBondTokenDefinitionsForNetwork: No underlying TokenConfig for ${underlyingAddress}`,
      );
      // Only list bond tokens that use collateral that we list
      continue;
    }
    const trancheCount = bond.tranches.length;
    for (const tranche of bond.tranches) {
      const address = getAddress(tranche.token.id);
      const { name, symbol } = tranche.token;
      const decimals = parseInt(tranche.token.decimals, 10);
      const wrapper = getBondWrapper(trancheCount, parseInt(tranche.index, 10));
      const tags = ['w_tranche'].sort();
      const tokenDefinition: TokenDefinition = {
        address,
        chainId,
        name,
        symbol,
        decimals,
        tags,
      };
      if (!underlying.chains[chainId]) {
        throw new Error(
          `getBondTokenDefinitionsForNetwork: No data for TokenConfig at ${underlyingAddress} on chain ${chainId}`,
        );
      }
      tokenDefinition.derived = {
        wrapper,
        underlying: {
          address: underlying.chains[chainId].address,
          chainId,
        },
      };
      tokenDefinitions.push(tokenDefinition);
    }
  }
  return tokenDefinitions;
}

export async function getTokenDefinitionsFromBonds(): Promise<TokenDefinitions> {
  let tokenDefinitions: TokenDefinitions = [];
  for (const network of networkConfigs) {
    const networkTokens = await getBondTokenDefinitionsForNetwork(network);
    tokenDefinitions = tokenDefinitions.concat(networkTokens);
  }
  return tokenDefinitions;
}
