import fs from 'fs';

import { Locale } from '../factorio-build.models';

export function getJsonData(file: string): unknown {
  const str = fs.readFileSync(file).toString();
  return JSON.parse(str);
}

const appDataPath =
  process.env['AppData'] ||
  `${process.env['HOME'] ?? ''}/Library/Application Support`;
const scriptOutputPath = `${appDataPath}/Factorio/script-output`;
export function getLocale(file: string): Locale {
  const path = `${scriptOutputPath}/${file}`;
  return getJsonData(path) as Locale;
}
