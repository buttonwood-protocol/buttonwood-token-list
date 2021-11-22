"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTokens = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const canvas_1 = require("canvas");
const tokens_json_1 = __importDefault(require("./tokens.json"));
const logoSize = 256;
function getLocalLogoPath(address) {
    return path_1.default.join('.', 'assets', 'tokens', `${address}.png`);
}
function getWrapperPath(wrapper) {
    return path_1.default.join('.', 'src', 'wrappers', wrapper);
}
function downloadLogo(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const canvas = (0, canvas_1.createCanvas)(logoSize, logoSize);
        const ctx = canvas.getContext('2d');
        ctx.quality = 'best';
        const url1inch = `https://tokens.1inch.exchange/${address.toLowerCase()}.png`;
        console.log(`Attempting to download ${url1inch}`);
        const image = yield (0, canvas_1.loadImage)(url1inch);
        // If they're really small, treat them as pixel art and scale with nearest neighbour
        if (image.width < logoSize / 4 || image.height < logoSize / 4) {
            ctx.patternQuality = 'nearest';
        }
        ctx.drawImage(image, 0, 0, logoSize, logoSize);
        const output = canvas.toBuffer('image/png');
        yield promises_1.default.writeFile(getLocalLogoPath(address), output);
    });
}
function doesLogoExist(address) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield promises_1.default.access(getLocalLogoPath(address));
            return true;
        }
        catch (err) {
            return false;
        }
    });
}
function generateWrapperLogo(address, wrapperConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        const wrapperPath = getWrapperPath(wrapperConfig.wrapper);
        const canvas = (0, canvas_1.createCanvas)(logoSize, logoSize);
        const ctx = canvas.getContext('2d');
        ctx.quality = 'best';
        const underlyingAssetImage = yield (0, canvas_1.loadImage)(getLocalLogoPath(wrapperConfig.underlying.address));
        const overlayImage = yield (0, canvas_1.loadImage)(path_1.default.join(wrapperPath, 'overlay.png'));
        const maskImage = yield (0, canvas_1.loadImage)(path_1.default.join(wrapperPath, 'mask.png'));
        ctx.drawImage(maskImage, 0, 0, logoSize, logoSize);
        ctx.globalCompositeOperation = 'source-atop';
        ctx.drawImage(underlyingAssetImage, 0, 0, logoSize, logoSize);
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(overlayImage, 0, 0, logoSize, logoSize);
        const output = canvas.toBuffer('image/png');
        yield promises_1.default.writeFile(path_1.default.join('.', 'assets', 'tokens', `${address}.png`), output);
    });
}
function processLogo(address, wrapperConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        let handleWrapped = false;
        if (wrapperConfig) {
            const wrapperPath = getWrapperPath(wrapperConfig.wrapper);
            try {
                yield promises_1.default.stat(wrapperPath);
                // wrapper defined
                handleWrapped = true;
            }
            catch (err) {
                // wrapper not defined, handle like unwrapped asset
            }
        }
        if (handleWrapped && wrapperConfig) {
            // regenerate logo
            const addressUnderlying = wrapperConfig.underlying.address;
            // check underlying asset logo exists already
            if (!(yield doesLogoExist(addressUnderlying))) {
                // underlying asset logo doesn't exist, so grab it
                yield downloadLogo(addressUnderlying);
            }
            yield generateWrapperLogo(address, wrapperConfig);
        }
        else {
            // check logo exists already
            if (!(yield doesLogoExist(address))) {
                // logo doesn't exist, so grab it
                yield downloadLogo(address);
            }
        }
    });
}
function processTokens(skipImageProcessing) {
    return __awaiter(this, void 0, void 0, function* () {
        const tokens = [];
        for (const tokenConfig of tokens_json_1.default) {
            const chainIds = Object.keys(tokenConfig.chains).map((key) => parseInt(key, 10));
            const primaryAddress = tokenConfig.chains[tokenConfig.primaryChainId].address;
            let logoURI = null;
            try {
                if (skipImageProcessing) {
                    if (!(yield doesLogoExist(primaryAddress))) {
                        throw new Error(`Local asset doesn't exist`);
                    }
                }
                else {
                    yield processLogo(primaryAddress, tokenConfig.derived);
                }
                logoURI = `https://buttonwood-protocol.github.io/buttonwood-token-list/assets/tokens/${primaryAddress}.png`;
            }
            catch (err) {
                console.error(`Failed to get logoURI for ${tokenConfig.name} [${tokenConfig.symbol}]: ${err}`);
            }
            for (const chainId of chainIds) {
                const { name, symbol, address, decimals } = Object.assign(Object.assign({}, tokenConfig), tokenConfig.chains[chainId]);
                const tokenData = { name, symbol, address, decimals, chainId };
                if (logoURI) {
                    Object.assign(tokenData, { logoURI });
                }
                tokens.push(tokenData);
            }
        }
        return tokens;
    });
}
exports.processTokens = processTokens;
//# sourceMappingURL=processTokens.js.map