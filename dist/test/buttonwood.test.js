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
const package_json_1 = __importDefault(require("../package.json"));
const tokenlist_schema_json_1 = __importDefault(require("@uniswap/token-lists/src/tokenlist.schema.json"));
const chai_1 = require("chai");
const address_1 = require("@ethersproject/address");
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const buildList_1 = require("../src/buildList");
const ajv = new ajv_1.default({ allErrors: true, verbose: true });
(0, ajv_formats_1.default)(ajv);
const validator = ajv.compile(tokenlist_schema_json_1.default);
describe('buildList', () => {
    const tokenListPromise = (0, buildList_1.buildList)(true);
    it('validates', () => __awaiter(void 0, void 0, void 0, function* () {
        const tokenList = yield tokenListPromise;
        const validates = validator(tokenList);
        if (!validates) {
            console.error(validator.errors);
        }
        (0, chai_1.expect)(validates).to.equal(true);
    }));
    it('contains no duplicate addresses', () => __awaiter(void 0, void 0, void 0, function* () {
        const tokenList = yield tokenListPromise;
        const map = {};
        for (let token of tokenList.tokens) {
            const key = `${token.chainId}-${token.address}`;
            (0, chai_1.expect)(typeof map[key]).to.equal('undefined');
            map[key] = true;
        }
    }));
    it('contains no duplicate symbols', () => __awaiter(void 0, void 0, void 0, function* () {
        const tokenList = yield tokenListPromise;
        const map = {};
        for (let token of tokenList.tokens) {
            const key = `${token.chainId}-${token.symbol.toLowerCase()}`;
            (0, chai_1.expect)(typeof map[key]).to.equal('undefined');
            map[key] = true;
        }
    }));
    it('contains no duplicate names', () => __awaiter(void 0, void 0, void 0, function* () {
        const tokenList = yield tokenListPromise;
        const map = {};
        for (let token of tokenList.tokens) {
            const key = `${token.chainId}-${token.name.toLowerCase()}`;
            (0, chai_1.expect)(typeof map[key]).to.equal('undefined', `duplicate name: ${token.name}`);
            map[key] = true;
        }
    }));
    it('all addresses are valid and checksummed', () => __awaiter(void 0, void 0, void 0, function* () {
        const tokenList = yield tokenListPromise;
        for (let token of tokenList.tokens) {
            (0, chai_1.expect)((0, address_1.getAddress)(token.address)).to.eq(token.address);
        }
    }));
    it('version matches package.json', () => __awaiter(void 0, void 0, void 0, function* () {
        const tokenList = yield tokenListPromise;
        (0, chai_1.expect)(package_json_1.default.version).to.match(/^\d+\.\d+\.\d+$/);
        (0, chai_1.expect)(package_json_1.default.version).to.equal(`${tokenList.version.major}.${tokenList.version.minor}.${tokenList.version.patch}`);
    }));
});
//# sourceMappingURL=buttonwood.test.js.map