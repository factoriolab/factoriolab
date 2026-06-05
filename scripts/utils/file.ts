import fs from 'fs';

import { Locale } from '../factorio-build.models';

export function getJsonData(file: string): unknown {
  return JSON.parse(fs.readFileSync(file).toString());
}

export function writeJsonData(file: string, data: unknown): void {
  fs.writeFileSync(file, JSON.stringify(data));
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
    if ((err as { code: string }).code === 'ENOENT') {
      return { names: {} };
    } else {
      throw err;
    }
  }
}
