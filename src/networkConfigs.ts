import { getChainDefinitionFromName } from './chains';

export interface NetworkConfig {
  chainId: number;
  subgraphTranche?: string;
  bondMinters?: string[];
}

export const networkConfigs: NetworkConfig[] = [
  {
    chainId: getChainDefinitionFromName('Ethereum Mainnet').chainId,
    subgraphTranche:
      'https://api.thegraph.com/subgraphs/name/buttonwood-protocol/tranche',
    bondMinters: [
      '0xd7e86bd77784217324b4e94aedc68e5c8227ec2b',
      '0xc09e2b5532803fc065dc31418ddf9f34ae070dbb',
      '0xf7aba9b064a12330a00eafaa930e2fe8e76e65f0',
    ],
  },
  {
    chainId: getChainDefinitionFromName('Goerli').chainId,
    subgraphTranche:
      'https://api.thegraph.com/subgraphs/name/buttonwood-protocol/tranche-goerli',
    bondMinters: [
      '0x584feeeb3d87e6fe80f3360c48d5a7835d987e51',
      '0xa6b4ef3446749fc653272f4de387379f263b9d70',
      '0xa404c9676d58b08119d431493eeb963139a36bcf',
      '0x0aa379757db57625ac2919a57e37d427a334b7b8',
      '0xfd99d2d103b09f95c3dfc458f57178bf0cd587b1',
      '0x9d0c0d398fbb997a5814e5fa107673685f0e1e9f',
    ],
  },
];
