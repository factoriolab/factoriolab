import fs from 'fs';
import path from 'path';

import { getJsonData } from '../helpers/file.helpers';
import { normalizeObjectPath } from './utils';

export interface ItemInfo {
  id: string; // normalized id e.g. sulpur-ore
  fileBasename: string; // I_SulphurOre
  path: string;
  name: string | null;
  stack: number | null;
  iconObjectPath: string | null;
  uiItemType: string | null;
  objectPaths: string[]; // keys to map references: '/Game/Chimera/Items/I_SulphurOre', 'I_SulphurOre', 'I_SulphurOre_C'
}

function slugifyName(s: string): string {
  return s
    .replace(/^(I_|T_)/i, '')
    .replace(/([A-Z])/g, (m) => '-' + m.toLowerCase())
    .replace(/^-/, '')
    .replace(/_+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

export function listItemFiles(srDataDir: string): string[] {
  const results: string[] = [];

  function walk(dir: string) {
    const entries = fs.readdirSync(dir);
    for (const e of entries) {
      const full = path.join(dir, e);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full);
      else if (stat.isFile() && e.startsWith('I_') && e.endsWith('.json'))
        results.push(full);
    }
  }

  walk(srDataDir);
  return results;
}

export function parseItemFile(filePath: string): ItemInfo {
  const raw = getJsonData(filePath) as any[];
  const basename = path.basename(filePath).replace('.json', '');
  const id = slugifyName(basename);
  const info: ItemInfo = {
    id,
    fileBasename: basename,
    path: filePath,
    name: null,
    stack: null,
    iconObjectPath: null,
    uiItemType: null,
    objectPaths: [],
  };

  for (const obj of raw) {
    // Look for the CDO object (Default__I_..._C)
    if (
      obj?.Type &&
      typeof obj.Name === 'string' &&
      obj.Name.startsWith('Default__')
    ) {
      const props = obj?.Properties ?? {};
      if (props?.MaxStack != null) info.stack = props.MaxStack;
      if (props?.ItemIcon?.ResourceObject?.ObjectPath)
        info.iconObjectPath = normalizeObjectPath(
          props.ItemIcon.ResourceObject.ObjectPath,
        );

      const iname = props?.ItemName ?? {};
      info.name =
        iname?.LocalizedString ??
        iname?.SourceString ??
        iname?.Key ??
        info.name;

      info.uiItemType = props?.UIItemType ?? null;

      // Possible object path forms
      // /Game/Chimera/... derived from actual file path will be added by buildItemMap
      // Basename variants
      info.objectPaths.push(basename);
      info.objectPaths.push(`${basename}_C`);

      break;
    }
  }

  // Fallbacks
  if (info.stack == null) info.stack = 100;

  return info;
}

export function buildItemMap(srDataDir: string): Record<string, ItemInfo> {
  const files = listItemFiles(srDataDir);
  const items = files.map((f) => parseItemFile(f));
  const map: Record<string, ItemInfo> = {};
  for (const f of files) {
    const it = parseItemFile(f);
    // compute object path derived from the file relative path
    // e.g., sr-data/Weapons/AmmoTypes/I_PistolAmmoItem.json -> /Game/Chimera/Weapons/AmmoTypes/I_PistolAmmoItem
    const rel = path
      .relative(srDataDir, f)
      .replace(/\\/g, '/')
      .replace(/\.json$/i, '');
    const gamePath = `/Game/Chimera/${rel}`;

    // add entries
    for (const p of it.objectPaths) map[p] = it;
    map[it.fileBasename.toLowerCase()] = it;
    map[gamePath] = it;
  }
  return map;
}
