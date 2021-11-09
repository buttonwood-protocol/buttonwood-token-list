const packageJson = require('../package.json');
const tokenJson = require('./tokens.json');

function getAddressKeyedTokenMap(tokenJson) {
	const keyedTokenMap = {};
	for (const token of tokenJson) {
		const key = token.chains[token.primaryChainId].address;
		keyedTokenMap[key] = token;
	}
	return keyedTokenMap;
}

function buildWrapperMap() {
	const [major, minor, patch] = packageJson.version.split('.').map(segment => parseInt(segment, 10));
	const keyedTokenMap = getAddressKeyedTokenMap(tokenJson);
	const wrappers = {};
	for (const token of tokenJson) {
		if (token.derived) {
			let wrapper = wrappers[token.derived.wrapper];
			if (!wrapper) {
				wrapper = wrappers[token.derived.wrapper] = [];
			}
			const underlyingToken = keyedTokenMap[token.derived.underlying.address];
			for (const chainId of Object.keys(token.chains)) {
				if (underlyingToken.chains.hasOwnProperty(chainId)) {
					wrapper.push({
						unwrapped: underlyingToken.chains[chainId].address,
						wrapped: token.chains[chainId].address
					});
				}
			}
		}
	}
	return {
		name: 'Buttonwood',
		timestamp: new Date().toISOString(),
		version: {
			major,
			minor,
			patch,
		},
		tags: {},
		logoURI: 'https://raw.githubusercontent.com/marktoda/buttonwood-token-list/main/assets/buttonwood.svg',
		keywords: [
			'buttonwood',
			'defi'
		],
		wrappers
	};
}

module.exports = buildWrapperMap;
