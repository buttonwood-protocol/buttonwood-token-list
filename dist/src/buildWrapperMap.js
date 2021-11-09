"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWrapperMap = void 0;
const package_json_1 = __importDefault(require("../package.json"));
const tokens_json_1 = __importDefault(require("./tokens.json"));
function getAddressKeyedTokenMap(tokenJson) {
    const keyedTokenMap = {};
    for (const token of tokenJson) {
        const key = token.chains[token.primaryChainId].address;
        keyedTokenMap[key] = token;
    }
    return keyedTokenMap;
}
function buildWrapperMap() {
    const [major, minor, patch] = package_json_1.default.version
        .split('.')
        .map((segment) => parseInt(segment, 10));
    const keyedTokenMap = getAddressKeyedTokenMap(tokens_json_1.default);
    const wrappers = {};
    for (const token of tokens_json_1.default) {
        if (token.derived) {
            let wrapper = wrappers[token.derived.wrapper];
            if (!wrapper) {
                wrapper = wrappers[token.derived.wrapper] = [];
            }
            const underlyingToken = keyedTokenMap[token.derived.underlying.address];
            for (const chainId of Object.keys(token.chains)) {
                if (underlyingToken.chains[chainId]) {
                    wrapper.push({
                        unwrapped: underlyingToken.chains[chainId].address,
                        wrapped: token.chains[chainId].address,
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
        keywords: ['buttonwood', 'defi'],
        wrappers,
    };
}
exports.buildWrapperMap = buildWrapperMap;
//# sourceMappingURL=buildWrapperMap.js.map