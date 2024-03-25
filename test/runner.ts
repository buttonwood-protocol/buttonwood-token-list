import { start } from 'lwtf';
import './buttonwood-bonds.tokenlist.test';
import './buttonwood.tokenlist.test';
import './buttonwood.wrappermap.test';

async function run() {
  await start();
}

run().catch(console.error);
