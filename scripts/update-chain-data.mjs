import fs from "node:fs/promises";
import https from "node:https";
import path from "node:path";
import {fileURLToPath} from "node:url";

const projectRoot = path.join(fileURLToPath(new URL(import.meta.url)), '..', '..');
const chainsPath = path.join(projectRoot, 'src', 'chains.json');

const watchedChains = [
  1,
  5,
  42161,
  43113,
  43114,
  421613,
  11155111
];

async function fetchData() {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'raw.githubusercontent.com',
      path: 'henter/chain-list-org/main/chains.json',
      method: 'GET'
    }, (res) => {
      let text = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        text += chunk;
      });
      res.on('end', () => {
        resolve(text);
      });
    });
    req.on('error', (err) => {
      reject(err);
    })
    req.end();
  });
}

function filterForWatchedChains(chains) {
  return chains.filter((chain) => {
    return watchedChains.includes(chain.chainId);
  })
}

function extractRelevantData(chains) {
  return chains.map((chain) => {
    const {name, title, chainId} = chain;
    return {name, title, chainId};
  });
}

async function main() {
  const chainsJson = await fetchData();
  let chains;
  try {
    chains = JSON.parse(chainsJson);
  } catch (err) {
    throw new Error(`chainsJson is invalid JSON`);
  }
  chains = filterForWatchedChains(chains);
  chains = extractRelevantData(chains);
  await fs.writeFile(chainsPath, JSON.stringify(chains, null, 2), 'utf8');
  console.log("Successfully updated chains.json");
}

main().catch(console.error);
