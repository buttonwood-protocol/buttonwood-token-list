import fs from 'fs/promises';
import path from 'path';
import {createCanvas, loadImage} from 'canvas';
import tokenJson from './tokens.json';
import {DerivedTokenConfig, TokenConfig, TokenData} from './types';

const logoSize = 256;

function getLocalLogoPath(address: string): string {
    return path.join('.', 'assets', 'tokens', `${address}.png`);
}

function getWrapperPath(wrapper: string) {
    return path.join('.', 'src', 'wrappers', wrapper,);
}

async function downloadLogo(address: string) {
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

async function doesLogoExist(address: string): Promise<boolean> {
    try {
        await fs.access(getLocalLogoPath(address));
        return true;
    } catch (err) {
        return false;
    }
}

async function generateWrapperLogo(
    address: string,
    wrapperConfig: DerivedTokenConfig,
): Promise<void> {
    const wrapperPath = getWrapperPath(wrapperConfig.wrapper);
    const canvas = createCanvas(logoSize, logoSize);
    const ctx = canvas.getContext('2d');
    ctx.quality = 'best';
    const underlyingAssetImage = await loadImage(
        getLocalLogoPath(wrapperConfig.underlying.address),
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
        path.join('.', 'assets', 'tokens', `${address}.png`),
        output,
    );
}

async function processLogo(
    address: string,
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
        const addressUnderlying = wrapperConfig.underlying.address;
        // check underlying asset logo exists already
        if (!(await doesLogoExist(addressUnderlying))) {
            // underlying asset logo doesn't exist, so grab it
            await downloadLogo(addressUnderlying);
        }
        await generateWrapperLogo(address, wrapperConfig);
    } else {
        // check logo exists already
        if (!(await doesLogoExist(address))) {
            // logo doesn't exist, so grab it
            await downloadLogo(address);
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
                if (!(await doesLogoExist(primaryAddress))) {
                    throw new Error(`Local asset doesn't exist`);
                }
            } else {
                await processLogo(primaryAddress, tokenConfig.derived);
            }

            logoURI = `https://buttonwood-protocol.github.io/buttonwood-token-list/assets/tokens/${primaryAddress}.png`;
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
