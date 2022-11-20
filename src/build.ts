import { writeFile } from 'fs/promises';
import { createLogos } from './createLogos';
import { getTokenDefinitionsFromBonds } from './getTokenDefinitionsFromBonds';
import { getTokenDefinitionsFromConfig } from './getTokenDefinitionsFromConfig';
import { getTokenList } from './getTokenList';
import { getWrapperMap } from './getWrapperMap';
import { TokenDefinitionsMap } from './TokenDefinitionsMap';
import { TokenDefinitions } from './types';

async function build(): Promise<void> {
  let tokenDefinitions: TokenDefinitions = [];
  tokenDefinitions = tokenDefinitions.concat(getTokenDefinitionsFromConfig());
  tokenDefinitions = tokenDefinitions.concat(
    await getTokenDefinitionsFromBonds(),
  );
  const tokenDefinitionsMap = new TokenDefinitionsMap(tokenDefinitions);
  await createLogos(tokenDefinitionsMap, tokenDefinitions);
  const buttonwoodTokenDefs = [];
  const buttonwoodBondsTokenDefs = [];
  for (const tokenDef of tokenDefinitions) {
    if (tokenDef.derived?.wrapper.startsWith('tranche')) {
      buttonwoodBondsTokenDefs.push(tokenDef);
    } else {
      buttonwoodTokenDefs.push(tokenDef);
    }
  }

  const buttonwoodTokenList = await getTokenList(
    {
      name: 'Buttonwood',
      keywords: ['buttonwood', 'defi'],
    },
    tokenDefinitionsMap,
    buttonwoodTokenDefs,
  );
  const buttonwoodBondsTokenList = await getTokenList(
    {
      name: 'Buttonwood Bonds',
      keywords: ['buttonwood', 'bonds', 'defi'],
    },
    tokenDefinitionsMap,
    buttonwoodBondsTokenDefs,
  );
  const wrapperMap = getWrapperMap(
    {
      name: 'Buttonwood',
      keywords: ['buttonwood', 'defi'],
    },
    buttonwoodTokenDefs,
  );

  await writeFile(
    './buttonwood.tokenlist.json',
    JSON.stringify(buttonwoodTokenList, null, 2),
    'utf8',
  );
  await writeFile(
    './buttonwood-bonds.tokenlist.json',
    JSON.stringify(buttonwoodBondsTokenList, null, 2),
    'utf8',
  );
  await writeFile(
    './buttonwood.wrappermap.json',
    JSON.stringify(wrapperMap, null, 2),
    'utf8',
  );
}

build().catch(console.error);
