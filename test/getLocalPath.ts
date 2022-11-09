import path from 'path';
import { getAssetUri } from '../src/getAssetUri';

const base = getAssetUri('');

export function getLocalPath(logoURI: string): string | null {
    if (logoURI.startsWith(base)) {
        const pathSegs = logoURI.slice(base.length).split('/');
        return path.join('.', 'assets', 'tokens', ...pathSegs);
    }
    return null;
}
