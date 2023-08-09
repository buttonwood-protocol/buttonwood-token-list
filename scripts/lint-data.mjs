import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const projectRoot = path.join(fileURLToPath(new URL(import.meta.url)), '..', '..');
const chainsPath = path.join(projectRoot, 'src', 'chains.json');
const tokensPath = path.join(projectRoot, 'src', 'tokens.json');

async function readJson(path) {
  const json = await fs.readFile(path, 'utf8');
  try {
    return JSON.parse(json);
  } catch (err) {
    throw new Error(`${path} is invalid JSON`);
  }
}

function sortChainDefinitions(chainDefinitions) {
  return chainDefinitions.sort((a, b) => {
    return a.chainId - b.chainId;
  })
}

function sortTokens(tokens) {
  return tokens.sort((a, b) => {
    if (a.symbol.toLowerCase() > b.symbol.toLowerCase()) {
      return 1;
    }
    if (a.symbol.toLowerCase() < b.symbol.toLowerCase()) {
      return -1;
    }
    return 0;
  })
}

function sortTokenChainEntries(tokens, chainDefinitions) {
  // Mutate given array
  for (const token of tokens) {
    const chains = {};
    // Copy over the chain entries in the order the chains are listed in chains.json
    for (const chainDefinition of chainDefinitions) {
      if (token.chains[chainDefinition.name]) {
        chains[chainDefinition.name] = token.chains[chainDefinition.name];
      }
    }
    // Replace entry
    token.chains = chains;
  }
}

async function main() {
  let chainDefinitions = await readJson(chainsPath);
  chainDefinitions = sortChainDefinitions(chainDefinitions);
  await fs.writeFile(chainsPath, JSON.stringify(chainDefinitions, null, 2), 'utf8');

  let tokens = await readJson(tokensPath);
  tokens = sortTokens(tokens);
  sortTokenChainEntries(tokens, chainDefinitions);
  await fs.writeFile(tokensPath, JSON.stringify(tokens, null, 2), 'utf8');

  console.log("Successfully linted tokens.json");
}

main().catch(console.error);
