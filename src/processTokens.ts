import fs from 'fs/promises';
import path from 'path';
import {createCanvas, loadImage} from 'canvas';
import tokenJson from './tokens.json';
import {DerivedTokenConfig, TokenConfig, TokenData} from './types';

const logoSize = 256;

function getLocalLogoPath(symbol: string): string {
    return path.join('.', 'assets', 'tokens', `${symbol}.png`);
}

function getWrapperPath(wrapper: string) {
    return path.join('.', 'src', 'wrappers', wrapper,);
}

async function downloadLogo(symbol: string, address: string) {
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
    await fs.writeFile(getLocalLogoPath(symbol), output);
}

async function doesLogoExist(address: string): Promise<boolean> {
    try {
        await fs.access(getLocalLogoPath(address));
        return true;
    } catch (err) {
        return false;
    }
}

async function generateWrapperLogo(
    symbol: string,
    wrapperConfig: DerivedTokenConfig,
): Promise<void> {
    const wrapperPath = getWrapperPath(wrapperConfig.wrapper);
    const canvas = createCanvas(logoSize, logoSize);
    const ctx = canvas.getContext('2d');
    ctx.quality = 'best';
    const underlyingAssetImage = await loadImage(
        getLocalLogoPath(wrapperConfig.underlying.symbol),
    );
    const overlayImage = await loadImage(path.join(wrapperPath, 'overlay.png'));
    const maskImage = await loadImage(path.join(wrapperPath, 'mask.png'));
    ctx.drawImage(maskImage, 0, 0, logoSize, logoSize);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.drawImage(underlyingAssetImage, 0, 0, logoSize, logoSize);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(overlayImage, 0, 0, logoSize, logoSize);
    const output = canvas.toBuffer('image/png');
    await fs.writeFile(
        path.join('.', 'assets', 'tokens', `${symbol}.png`),
        output,
    );
}

async function processLogo(
    address: string,
    symbol: string,
    wrapperConfig?: DerivedTokenConfig,
): Promise<void> {
    let handleWrapped = false;
    if (wrapperConfig) {
        const wrapperPath = getWrapperPath(wrapperConfig.wrapper);
        try {
            await fs.stat(wrapperPath);
            // wrapper defined
            handleWrapped = true;
        } catch (err) {
            // wrapper not defined, handle like unwrapped asset
        }
    }
    if (handleWrapped && wrapperConfig) {
        // regenerate logo
        const underlyingSymbol = wrapperConfig.underlying.symbol;
        // check underlying asset logo exists already
        if (!(await doesLogoExist(underlyingSymbol))) {
            // underlying asset logo doesn't exist, so grab it
            await downloadLogo(symbol, underlyingSymbol);
        }
        await generateWrapperLogo(symbol, wrapperConfig);
    } else {
        // check logo exists already
        if (!(await doesLogoExist(symbol))) {
            // logo doesn't exist, so grab it
            await downloadLogo(symbol, address);
        }
    }
}

export async function processTokens(
    skipImageProcessing: boolean,
): Promise<TokenData[]> {
    const tokens: TokenData[] = [];

    for (const tokenConfig of tokenJson as TokenConfig[]) {
        const chainIds = Object.keys(tokenConfig.chains).map((key) =>
            parseInt(key, 10),
        );
        const primaryAddress: string =
            tokenConfig.chains[tokenConfig.primaryChainId].address;
        let logoURI = null;

        try {
            if (skipImageProcessing) {
                if (!(await doesLogoExist(tokenConfig.symbol))) {
                    throw new Error(`Local asset doesn't exist`);
                }
            } else {
                await processLogo(primaryAddress, tokenConfig.symbol, tokenConfig.derived);
            }

            logoURI = `https://buttonwood-protocol.github.io/buttonwood-token-list/assets/tokens/${tokenConfig.symbol}.png`;
        } catch (err) {
            console.error(
                `Failed to get logoURI for ${tokenConfig.name} [${tokenConfig.symbol}]: ${err}`,
            );
        }

        for (const chainId of chainIds) {
            const {name, symbol, address, decimals} = {
                ...tokenConfig,
                ...tokenConfig.chains[chainId],
            };
            const tokenData = {name, symbol, address, decimals, chainId};
            if (logoURI) {
                Object.assign(tokenData, {logoURI});
            }
            tokens.push(tokenData);
        }
    }

    return tokens;
}
