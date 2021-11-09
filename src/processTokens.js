const fs = require('fs/promises');
const path = require('path');
const {createCanvas, loadImage} = require('canvas');
const tokenJson = require('./tokens.json');

const logoSize = 256;

function getLocalLogoPath(address) {
	return path.join('.', 'assets', 'tokens', `${address}.png`);
}

async function ensureDir(dir) {
	try {
		await fs.mkdir(dir, {recursive: true});
	} catch (err) {
		// don't care
	}
}

async function downloadLogo(address) {
	const canvas = createCanvas(logoSize, logoSize);
	const ctx = canvas.getContext('2d');
	ctx.quality = 'best';
	const url1inch = `https://tokens.1inch.exchange/${address.toLowerCase()}.png`;
	console.log(`Attempting to download ${url1inch}`);
	const image = await loadImage(url1inch);
	// If they're really small, treat them as pixel art and scale with nearest neighbour
	if (image.width < logoSize / 4 || image.height < logoSize / 4) {
		ctx.patternQuality = 'nearest';
	}
	ctx.drawImage(image, 0, 0, logoSize, logoSize);
	const output = canvas.toBuffer('image/png');
	await fs.writeFile(getLocalLogoPath(address), output);
}

async function doesLogoExist(address) {
	try {
		await fs.access(getLocalLogoPath(address));
		return true;
	} catch (err) {
		return false;
	}
}

async function generateWrapperLogo(address, wrapperConfig) {
	const wrapperPath = path.join('.', 'src', 'wrappers', wrapperConfig.wrapper);
	const canvas = createCanvas(logoSize, logoSize);
	const ctx = canvas.getContext('2d');
	ctx.quality = 'best';
	const underlyingAssetImage = await loadImage(getLocalLogoPath(wrapperConfig.underlying.address));
	const overlayImage = await loadImage(path.join(wrapperPath, 'overlay.png'));
	const maskImage = await loadImage(path.join(wrapperPath, 'mask.png'));
	ctx.drawImage(maskImage, 0, 0, logoSize, logoSize);
	ctx.globalCompositeOperation = 'source-atop';
	ctx.drawImage(underlyingAssetImage, 0, 0, logoSize, logoSize);
	ctx.globalCompositeOperation = 'source-over';
	ctx.drawImage(overlayImage, 0, 0, logoSize, logoSize);
	const output = canvas.toBuffer('image/png');
	await fs.writeFile(path.join('.', 'assets', 'tokens', `${address}.png`), output);
}

async function processLogo(address, wrapperConfig) {
	if (wrapperConfig) {
		// regenerate logo
		const addressUnderlying = wrapperConfig.underlying.address;
		// check underlying asset logo exists already
		if (!await doesLogoExist(addressUnderlying)) {
			// underlying asset logo doesn't exist, so grab it
			await downloadLogo(addressUnderlying);
		}
		await generateWrapperLogo(address, wrapperConfig);
	} else {
		// check logo exists already
		if (!await doesLogoExist(address)) {
			// logo doesn't exist, so grab it
			await downloadLogo(address);
		}
	}
}

async function processTokens(skipImageProcessing) {
	const tokens = [];
	for (const tokenConfig of tokenJson) {
		const chainIds = Object.keys(tokenConfig.chains).map(key => parseInt(key, 10));
		const primaryAddress = tokenConfig.chains[tokenConfig.primaryChainId].address;
		let logoURI = null;
		try {
			if (skipImageProcessing) {
				if (!await doesLogoExist(primaryAddress)) {
					throw new Error(`Local asset doesn't exist`);
				}
			} else {
				await processLogo(primaryAddress, tokenConfig.derived);
			}
			logoURI = `https://buttonwood-protocol.github.io/buttonwood-token-list/assets/tokens/${primaryAddress}.png`;
		} catch (err) {
			console.error(`Failed to get logoURI for ${tokenConfig.name} [${tokenConfig.symbol}]: ${err}`);
		}
		for (const chainId of chainIds) {
			const {name, symbol, address, decimals} = {...tokenConfig, ...tokenConfig.chains[chainId]};
			const tokenData = {name, symbol, address, decimals, chainId};
			if (logoURI) {
				tokenData.logoURI = logoURI;
			}
			tokens.push(tokenData);
		}
	}
	return tokens;
}

module.exports = processTokens;
