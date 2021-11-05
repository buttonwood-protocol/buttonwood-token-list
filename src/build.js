const {writeFile} = require('fs/promises');
const buildList = require('./buildList.js');

async function build() {
	const tokenList = await buildList();
	await writeFile('./buttonwood.tokenlist.json', JSON.stringify(tokenList, null, 2), 'utf8');
}

build().catch(console.error);
