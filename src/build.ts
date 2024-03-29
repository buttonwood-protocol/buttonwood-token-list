import { readFile, writeFile } from 'fs/promises';
import { createLogos } from './createLogos';
import { getTokenDefinitionsFromBonds } from './getTokenDefinitionsFromBonds';
import { getTokenDefinitionsFromConfig } from './getTokenDefinitionsFromConfig';
import { getTokenList } from './getTokenList';
import { getWrapperMap } from './getWrapperMap';
import { TokenDefinitionsMap } from './TokenDefinitionsMap';
import { TokenDefinitions, TokenList } from './types';
import { validTags } from './validTags';

async function build(): Promise<void> {
  let timestamp = new Date();
  if (process.argv.includes('--reuse-timestamp')) {
    try {
      const previousTokenlist = JSON.parse(
        await readFile('./src/buttonwood.tokenlist.json', 'utf8'),
      ) as TokenList;
      timestamp = new Date(previousTokenlist.timestamp);
    } catch (err) {
      // Give up, use new timestamp
    }
  }
  let tokenDefinitions: TokenDefinitions = [];
  tokenDefinitions = tokenDefinitions.concat(getTokenDefinitionsFromConfig());
  tokenDefinitions = tokenDefinitions.concat(
    await getTokenDefinitionsFromBonds(),
  );
  for (const tokenDefinition of tokenDefinitions) {
    if (tokenDefinition.tags) {
      tokenDefinition.tags.forEach((tagId) => {
        if (!validTags[tagId]) {
          throw new Error(
            `Invalid tagId "${tagId}" listed for tokenDefinition ${JSON.stringify(
              tokenDefinition,
            )}`,
          );
        }
      });
    }
  }
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
      timestamp,
      keywords: ['buttonwood', 'defi'],
      tags: validTags,
    },
    tokenDefinitionsMap,
    buttonwoodTokenDefs,
  );
  const buttonwoodBondsTokenList = await getTokenList(
    {
      name: 'Buttonwood Bonds',
      timestamp,
      keywords: ['buttonwood', 'bonds', 'defi'],
      tags: validTags,
    },
    tokenDefinitionsMap,
    buttonwoodBondsTokenDefs,
  );
  const wrapperMap = getWrapperMap(
    {
      name: 'Buttonwood',
      timestamp,
      keywords: ['buttonwood', 'defi'],
      tags: validTags,
    },
    buttonwoodTokenDefs,
  );

  await writeFile(
    './src/buttonwood.tokenlist.json',
    JSON.stringify(buttonwoodTokenList, null, 2),
    'utf8',
  );
  await writeFile(
    './src/buttonwood-bonds.tokenlist.json',
    JSON.stringify(buttonwoodBondsTokenList, null, 2),
    'utf8',
  );
  await writeFile(
    './src/buttonwood.wrappermap.json',
    JSON.stringify(wrapperMap, null, 2),
    'utf8',
  );
}

build().catch(console.error);
