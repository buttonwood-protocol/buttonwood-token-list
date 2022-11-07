import { TokenDefinition, TokenDefinitions } from './types';
import fs from 'fs/promises';
import { getLogoLocation } from './getLogoLocation';
import { TokenDefinitionsMap } from './TokenDefinitionsMap';
import { createCanvas, loadImage } from 'canvas';
import { pathExists } from './utils/pathExists';
import path from 'path';
import { ensureDir } from './utils/ensureDir';

const logoSize = 256;

function getWrapperPath(wrapper: string) {
    return path.join('.', 'src', 'wrappers', wrapper);
}

async function downloadLogo(chainId: number, address: string, dst: string) {
    const canvas = createCanvas(logoSize, logoSize);
    const ctx = canvas.getContext('2d');
    ctx.quality = 'best';
    let url;
    if (chainId === 1) {
        url = `https://tokens.1inch.exchange/${address.toLowerCase()}.png`;
    } else {
        throw new Error(
            `Automatic logo retrieval not supported for this network. Please manually supply ${dst}`,
        );
    }
    console.log(`Attempting to download ${url}`);
    const image = await loadImage(url);
    // If they're really small, treat them as pixel art and scale with nearest neighbour
    if (image.width < logoSize / 4 || image.height < logoSize / 4) {
        ctx.patternQuality = 'nearest';
    }
    ctx.drawImage(image, 0, 0, logoSize, logoSize);
    const output = canvas.toBuffer('image/png');
    await fs.writeFile(dst, output);
}

async function createWrapperLogo(
    tokenDefinitionsMap: TokenDefinitionsMap,
    tokenDefinition: TokenDefinition,
): Promise<void> {
    if (!tokenDefinition.derived) {
        throw new Error(
            `createWrapperLogo: trying to create wrapper logo for a non-wrapped asset`,
        );
    }
    const { wrapper, underlying } = tokenDefinition.derived;
    const wrapperPath = getWrapperPath(wrapper);
    if (!pathExists(wrapperPath)) {
        throw new Error(`Unrecognised wrapper: ${wrapper}`);
    }
    const canvas = createCanvas(logoSize, logoSize);
    const ctx = canvas.getContext('2d');
    ctx.quality = 'best';
    const underlyingAssetImage = await loadImage(
        getLogoLocation(
            tokenDefinitionsMap,
            underlying.chainId,
            underlying.address,
        ).localPath,
    );
    const overlayImage = await loadImage(path.join(wrapperPath, 'overlay.png'));
    const maskImage = await loadImage(path.join(wrapperPath, 'mask.png'));
    ctx.drawImage(maskImage, 0, 0, logoSize, logoSize);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.drawImage(underlyingAssetImage, 0, 0, logoSize, logoSize);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(overlayImage, 0, 0, logoSize, logoSize);
    const output = canvas.toBuffer('image/png');
    const { localDir, localPath } = getLogoLocation(
        tokenDefinitionsMap,
        tokenDefinition.chainId,
        tokenDefinition.address,
    );
    await ensureDir(localDir);
    await fs.writeFile(localPath, output);
}

async function createLogo(
    tokenDefinitionsMap: TokenDefinitionsMap,
    tokenDefinition: TokenDefinition,
): Promise<void> {
    const { chainId, address, name, symbol, derived, dedupe } = tokenDefinition;
    if (derived && !derived.bespokeLogo) {
        // Always regenerate composite logos
        await createWrapperLogo(tokenDefinitionsMap, tokenDefinition);
    } else {
        const { localDir, localPath } = getLogoLocation(
            tokenDefinitionsMap,
            chainId,
            address,
        );
        if (!(await pathExists(localPath))) {
            try {
                await ensureDir(localDir);
                if (dedupe) {
                    await downloadLogo(
                        dedupe.chainId,
                        dedupe.address,
                        localPath,
                    );
                } else {
                    await downloadLogo(chainId, address, localPath);
                }
            } catch (err) {
                console.error(
                    `Failed to get logoURI for ${name} [${symbol}]: ${err}`,
                );
            }
        }
    }
}

export async function createLogos(
    tokenDefinitionsMap: TokenDefinitionsMap,
    tokenDefinitions: TokenDefinitions,
): Promise<void> {
    let queue = tokenDefinitions;
    let queueLengthPrevious = -1;
    let infinityBlocker = 100;
    while (queueLengthPrevious !== queue.length) {
        queueLengthPrevious = queue.length;
        const active = queue;
        queue = [];
        for (const tokenDefinition of active) {
            try {
                await createLogo(tokenDefinitionsMap, tokenDefinition);
            } catch (err) {
                queue.push(tokenDefinition);
            }
        }
        infinityBlocker--;
        if (infinityBlocker <= 0) {
            throw new Error(
                `createLogos: processing unexpectedly high iteration count`,
            );
        }
    }
    for (const { chainId, address } of queue) {
        console.error(`Unable to create logo for ${chainId}:${address}`);
    }
}
