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
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const buildList_1 = require("./buildList");
const buildWrapperMap_1 = require("./buildWrapperMap");
function build() {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenList = yield (0, buildList_1.buildList)();
        yield (0, promises_1.writeFile)('./buttonwood.tokenlist.json', JSON.stringify(tokenList, null, 2), 'utf8');
        const wrapperMap = (0, buildWrapperMap_1.buildWrapperMap)();
        yield (0, promises_1.writeFile)('./buttonwood.wrappermap.json', JSON.stringify(wrapperMap, null, 2), 'utf8');
    });
}
build().catch(console.error);
//# sourceMappingURL=build.js.map