import fs from 'fs';
import path from 'path';

import { getJsonData } from '../helpers/file.helpers';
import { logWarn } from '../helpers/log.helpers';
import { normalizeObjectPath } from './utils';

export interface CrcInfo {
  id: string;
  path: string;
  recipes: string[]; // object paths to CR files
}

export interface CrInfo {
  id: string;
  objectPath: string; // the original /Game/... path used to find this file
  path: string;
  name: string | null;
  buildTime: number | null;
  level?: number | null;
  inputs: { itemObjectPath: string; count: number }[];
  output: { itemObjectPath: string; count: number } | null;
  iconObjectPath?: string | null;
}

export function listCrcFiles(srDataDir: string): string[] {
  const craftDir = path.join(srDataDir, 'Crafting');
  if (!fs.existsSync(craftDir)) return [];

  const results: string[] = [];

  function walk(dir: string) {
    const entries = fs.readdirSync(dir);
    for (const e of entries) {
      const full = path.join(dir, e);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full);
      else if (stat.isFile() && e.startsWith('CRC_') && e.endsWith('.json'))
        results.push(full);
    }
  }

  walk(craftDir);
  return results;
}

export function parseCrcFile(filePath: string): CrcInfo {
  const raw = getJsonData(filePath) as any[];
  const id = path.basename(filePath).replace('.json', '');
  const info: CrcInfo = { id, path: filePath, recipes: [] };

  for (const obj of raw) {
    if (obj?.Type === 'CrItemRecipeCollection') {
      const props = obj?.Properties ?? {};
      const recs = props?.Recipes ?? [];
      for (const r of recs) {
        if (r?.ObjectPath)
          info.recipes.push(normalizeObjectPath(r.ObjectPath) ?? r.ObjectPath);
      }
      break;
    }
  }

  return info;
}

function objPathToFilePath(srDataDir: string, objectPath: string): string {
  // Example objectPath: /Game/Chimera/Crafting/CR_TitaniumBar.0
  const rel = objectPath.replace('/Game/Chimera/', '').split('.')[0];
  const parts = rel.split('/');
  // If the CR file is nested in subfolder (Crafting/MechanicalDrill/CR_...), include path
  return path.join(srDataDir, rel + '.json');
}

export function parseCrFile(srDataDir: string, objectPath: string): CrInfo {
  const filePath = objPathToFilePath(srDataDir, objectPath);
  if (!fs.existsSync(filePath))
    throw new Error(`CR file not found: ${filePath}`);
  const raw = getJsonData(filePath) as any[];
  const id = path.basename(filePath).replace('.json', '');
  const info: CrInfo = {
    id,
    objectPath: objectPath,
    path: filePath,
    name: null,
    buildTime: null,
    inputs: [],
    output: null,
    iconObjectPath: null,
  };

  for (const obj of raw) {
    if (obj?.Type === 'CrItemRecipeData') {
      const props = obj?.Properties ?? {};

      const dt = props?.DisplayText ?? {};
      info.name = dt?.LocalizedString ?? dt?.SourceString ?? dt?.Key ?? null;

      if (props?.BuildTime != null) info.buildTime = props.BuildTime;
      if (props?.Level != null) info.level = Number(props.Level);

      if (props?.NeededResources) {
        for (const n of props.NeededResources) {
          let itemObjPath = n?.Item?.ObjectPath ?? n?.Item?.ObjectName ?? null;
          const count = n?.Count ?? 1;
          if (itemObjPath?.includes('/Game/'))
            itemObjPath = normalizeObjectPath(itemObjPath) ?? itemObjPath;
          if (itemObjPath)
            info.inputs.push({ itemObjectPath: itemObjPath, count });
        }
      }

      if (props?.OutputItem) {
        const o = props.OutputItem;
        let itemObjPath = o?.Item?.ObjectPath ?? o?.Item?.ObjectName ?? null;
        const count = o?.Count ?? 1;
        if (itemObjPath?.includes('/Game/'))
          itemObjPath = normalizeObjectPath(itemObjPath) ?? itemObjPath;
        if (itemObjPath) info.output = { itemObjectPath: itemObjPath, count };
        else {
          // fatal: output missing; mark null and warn
          logWarn(`CR ${id} has no OutputItem.Item.ObjectPath: ${filePath}`);
        }
      } else {
        logWarn(`CR ${id} missing OutputItem: ${filePath}`);
      }

      // Optional icon present on the recipe
      let icon = props?.Icon?.ResourceObject?.ObjectPath;
      if (icon) icon = normalizeObjectPath(icon) ?? icon;
      if (icon) info.iconObjectPath = icon;

      break;
    }
  }

  return info;
}
