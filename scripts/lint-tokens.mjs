import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const projectRoot = path.join(fileURLToPath(new URL(import.meta.url)), '..', '..');
const tokensPath = path.join(projectRoot, 'src', 'tokens.json');

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

async function main() {
  const tokensJson = await fs.readFile(tokensPath, 'utf8');
  let tokens;
  try {
    tokens = JSON.parse(tokensJson);
  } catch (err) {
    throw new Error(`tokens.json is invalid JSON`);
  }
  tokens = sortTokens(tokens);
  await fs.writeFile(tokensPath, JSON.stringify(tokens, null, 2), 'utf8');
  console.log("Successfully linted tokens.json");
}

main().catch(console.error);
