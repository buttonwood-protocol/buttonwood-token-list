import { Tags } from '@uniswap/token-lists/dist/types';

// Note: the schema imposes a limit of 10 characters on the tag ID.
// It also limits tokens to no more than 10 tags each.

export const validTags: Tags = {
  aave_eco: {
    name: 'aave_ecosystem',
    description: 'The token is used within the AAVE ecosystem',
  },
  ampl_eco: {
    name: 'ampleforth_ecosystem',
    description: 'The token is used within the Ampleforth ecosystem',
  },
  avax_eco: {
    name: 'avalanche_ecosystem',
    description: 'The token is used within the Avalanche ecosystem',
  },
  btc_eco: {
    name: 'bitcoin_ecosystem',
    description: 'The token is used within the Bitcoin ecosystem',
  },
  comp_eco: {
    name: 'compound_ecosystem',
    description: 'The token is used within the Compound ecosystem',
  },
  eth_eco: {
    name: 'ethereum_ecosystem',
    description: 'The token is used within the Ethereum ecosystem',
  },
  net: {
    name: 'network',
    description: 'The token is the network token for a chain',
  },
  net_d: {
    name: 'network_derived',
    description: 'The token is derived from the network token for a chain',
  },
  rebasing: {
    name: 'rebasing',
    description: 'The token is rebasing',
  },
  sei_eco: {
    name: 'sei_ecosystem',
    description: 'The token is used within the Sei ecosystem',
  },
  staked_ava: {
    name: 'staked_avax',
    description: 'The token is a staked Avax token',
  },
  staked_eth: {
    name: 'staked_ether',
    description: 'The token is a staked Ether token',
  },
  usd: {
    name: 'usd',
    description: 'The token is a fiat backed stablecoin',
  },
  wavax: {
    name: 'wrapped_avalanche',
    description: 'The token is specifically wrapped Avalanche',
  },
  weth: {
    name: 'wrapped_ether',
    description: 'The token is specifically wrapped Ether',
  },
  w_button: {
    name: 'wrapper_button',
    description: 'The token uses the Buttonwood Button wrapper',
  },
  w_net: {
    name: 'wrapper_network',
    description: 'The token is a wrapped network token',
  },
  w_tranche: {
    name: 'wrapper_tranche',
    description: 'The token uses the Buttonwood Tranche wrapper',
  },
  w_unbutton: {
    name: 'wrapper_unbutton',
    description: 'The token uses the Buttonwood Unbutton wrapper',
  },
};
