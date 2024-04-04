import { Tags } from '@uniswap/token-lists';
import packageJson from '../package.json';
import { getAssetUri } from './getAssetUri';
import { CommonList } from './types';

export interface CommonListParams {
  name: string;
  timestamp: Date;
  tags?: Tags;
  keywords?: string[];
}

export function getCommonList(params: CommonListParams): CommonList {
  const [major, minor, patch] = packageJson.version
    .split('.')
    .map((segment) => parseInt(segment, 10));
  return {
    name: params.name,
    timestamp: params.timestamp.toISOString(),
    version: {
      major,
      minor,
      patch,
    },
    tags: params.tags,
    logoURI: getAssetUri('buttonwood.svg'),
    keywords: params.keywords,
  };
}
