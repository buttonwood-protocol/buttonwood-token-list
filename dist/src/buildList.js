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
exports.buildList = void 0;
const processTokens_1 = require("./processTokens");
const package_json_1 = __importDefault(require("../package.json"));
function buildList(skipImageProcessing = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const [major, minor, patch] = package_json_1.default.version
            .split('.')
            .map((segment) => parseInt(segment, 10));
        const tokens = yield (0, processTokens_1.processTokens)(skipImageProcessing);
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
            tokens: tokens
                // sort them by symbol for easy readability
                .sort((t1, t2) => {
                if (t1.chainId === t2.chainId) {
                    return t1.symbol.toLowerCase() < t2.symbol.toLowerCase()
                        ? -1
                        : 1;
                }
                return t1.chainId < t2.chainId ? -1 : 1;
            }),
        };
    });
}
exports.buildList = buildList;
//# sourceMappingURL=buildList.js.map