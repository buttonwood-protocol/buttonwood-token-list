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
const tokens_json_1 = __importDefault(require("./tokens.json"));
const logoSize = 256;
function getLocalLogoPath(address) {
    return path_1.default.join('.', 'assets', 'tokens', `1_${address}.png`);
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
function processTokens() {
    return __awaiter(this, void 0, void 0, function* () {
        const tokens = [];
        for (const tokenConfig of tokens_json_1.default) {
            for (const chain of Object.keys(tokenConfig.chains)) {
                const address = tokenConfig.chains[chain].address;
                if (yield doesLogoExist(address)) {
                    yield promises_1.default.rename(getLocalLogoPath(address), `./assets/tokens/${tokenConfig.symbol}.png`);
                }
                else {
                    console.log('doesnt exist');
                }
            }
        }
        return tokens;
    });
}
exports.processTokens = processTokens;
void processTokens();
//# sourceMappingURL=updateLogos.js.map