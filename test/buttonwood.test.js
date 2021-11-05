const packageJson = require('../package.json');
const schema = require('@uniswap/token-lists/src/tokenlist.schema.json');
const {expect} = require('chai');
const {getAddress} = require('@ethersproject/address');
const Ajv = require('ajv');
const addFormats = require('ajv-formats').default;
const buildList = require('../src/buildList');

const ajv = new Ajv({allErrors: true, verbose: true});
addFormats(ajv);
const validator = ajv.compile(schema);

describe('buildList', () => {
	const tokenListPromise = buildList(true);

	it('validates', async () => {
		const tokenList = await tokenListPromise;
		const validates = validator(tokenList);
		if (!validates) {
			console.error(validator.errors);
		}
		expect(validates).to.equal(true);
	});

	it('contains no duplicate addresses', async () => {
		const tokenList = await tokenListPromise;
		const map = {};
		for (let token of tokenList.tokens) {
			const key = `${token.chainId}-${token.address}`;
			expect(typeof map[key])
				.to.equal('undefined');
			map[key] = true;
		}
	});

	it('contains no duplicate symbols', async () => {
		const tokenList = await tokenListPromise;
		const map = {};
		for (let token of tokenList.tokens) {
			const key = `${token.chainId}-${token.symbol.toLowerCase()}`;
			expect(typeof map[key])
				.to.equal('undefined');
			map[key] = true;
		}
	})

	it('contains no duplicate names', async () => {
		const tokenList = await tokenListPromise;
		const map = {};
		for (let token of tokenList.tokens) {
			const key = `${token.chainId}-${token.name.toLowerCase()}`;
			expect(typeof map[key])
				.to.equal('undefined', `duplicate name: ${token.name}`);
			map[key] = true;
		}
	})

	it('all addresses are valid and checksummed', async () => {
		const tokenList = await tokenListPromise;
		for (let token of tokenList.tokens) {
			expect(getAddress(token.address)).to.eq(token.address);
		}
	});

	it('version matches package.json', async () => {
		const tokenList = await tokenListPromise;
		expect(packageJson.version).to.match(/^\d+\.\d+\.\d+$/);
		expect(packageJson.version).to.equal(`${tokenList.version.major}.${tokenList.version.minor}.${tokenList.version.patch}`);
	});
});