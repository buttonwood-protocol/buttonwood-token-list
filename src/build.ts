import { writeFile } from 'fs/promises';
import { buildList } from './buildList';
import { buildWrapperMap } from './buildWrapperMap';
import { buildBondList } from './buildBondList';

async function build(): Promise<void> {
    const tokenList = await buildList();
    await writeFile(
        './buttonwood.tokenlist.json',
        JSON.stringify(tokenList, null, 2),
        'utf8',
    );
    const tokenListBonds = await buildBondList();
    await writeFile(
        './buttonwood-bonds.tokenlist.json',
        JSON.stringify(tokenListBonds, null, 2),
        'utf8',
    );
    const wrapperMap = buildWrapperMap();
    await writeFile(
        './buttonwood.wrappermap.json',
        JSON.stringify(wrapperMap, null, 2),
        'utf8',
    );
}

build().catch(console.error);
