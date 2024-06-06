import fs from 'fs';

import * as D from '../factorio-build.models';

export function getJsonData<T>(file: string): T {
  const str = fs.readFileSync(file).toString();
  return JSON.parse(str) as T;
}

const appDataPath =
  process.env['AppData'] ||
  `${process.env['HOME']}/Library/Application Support`;
const scriptOutputPath = `${appDataPath}/Factorio/script-output`;
export function getLocale(file: string): D.Locale {
  const path = `${scriptOutputPath}/${file}`;
  return getJsonData<D.Locale>(path);
}
