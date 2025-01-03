import fs from 'fs';

import { Locale } from '../factorio-build.models';

export function getJsonData(file: string): unknown {
  const str = fs.readFileSync(file).toString();
  return JSON.parse(str);
}

const appDataPath =
  process.env['AppData'] ||
  `${process.env['HOME'] ?? ''}/Library/Application Support`;
const flatpakSteamPath = `${process.env['HOME'] ?? ''}/.var/app/com.valvesoftware.Steam`;
export const factorioPath = fs.existsSync(flatpakSteamPath)
  ? `${flatpakSteamPath}/.factorio`
  : `${appDataPath}/Factorio`;
export function getLocale(file: string): Locale {
  const path = `${factorioPath}/script-output/${file}`;
  return getJsonData(path) as Locale;
}

export function tryGetLocale(file: string): Locale {
  try {
    return getLocale(file);
  } catch (err) {
    if ((err as any).code === 'ENOENT') {
      return { names: {} };
    } else {
      throw err;
    }
  }
}
