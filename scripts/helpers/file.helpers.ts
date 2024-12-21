import fs from 'fs';

import { Locale } from '../factorio-build.models';

export function getJsonData(file: string): unknown {
  try {
    const str = fs.readFileSync(file).toString();
    return JSON.parse(str);
  } catch (err) {
    if ((err as any).code === 'ENOENT') {
      // space-connection-locale.json is not generated when spaceage mod is disabled
      return {};
    } else {
      throw err;
    }
  }
}

const appDataPath =
  process.env['AppData'] ||
  `${process.env['HOME'] ?? ''}/Library/Application Support`;
const scriptOutputPath = `${appDataPath}/Factorio/script-output`;
export function getLocale(file: string): Locale {
  const path = `${scriptOutputPath}/${file}`;
  return getJsonData(path) as Locale;
}
