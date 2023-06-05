import buttonwoodTokenListUntyped from './buttonwood.tokenlist.json';
import buttonwoodBondsTokenListUntyped from './buttonwood-bonds.tokenlist.json';
import buttonwoodWrapperMapUntyped from './buttonwood.wrappermap.json';
import { TokenList, WrapperMap } from './types';

const buttonwoodTokenList = buttonwoodTokenListUntyped as TokenList;
const buttonwoodBondsTokenList = buttonwoodBondsTokenListUntyped as TokenList;
const buttonwoodWrapperMap = buttonwoodWrapperMapUntyped as WrapperMap;

export { CommonList, TokenList, WrapperMap } from './types';
export { buttonwoodTokenList, buttonwoodBondsTokenList, buttonwoodWrapperMap };
