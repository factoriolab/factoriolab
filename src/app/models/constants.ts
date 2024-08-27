import { Entities } from './entities';

export const APP = 'FactorioLab';
export const MIN_LINK_VALUE = 1e-10;
export const MIN_ZIP = 100;
export const ZNULL = '?'; // Encoded, previously 'n' (NEXT: !)
export const ZEMPTY = '='; // Encoded, previously 'e' (NEXT: ' or _)
// export const ZEMPTYOBJ = '_' // represents {}?
export const ZARRAYSEP = '~'; // Unreserved, previously '+'
export const ZFIELDSEP = '*'; // Reserved, unescaped by encoding
export const ZTRUE = '1';
export const ZFALSE = '0';
export const ZBASE64ABC =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-.';
export const ZMAX = ZBASE64ABC.length;
export const ZMAP = ZBASE64ABC.split('').reduce((e: Entities<number>, c, i) => {
  e[c] = i;
  return e;
}, {});
