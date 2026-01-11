import fs from 'fs';
import path from 'path';
import { getJsonData } from '../helpers/file.helpers';
import { normalizeObjectPath } from './utils';

export type DaInfo = {
  id: string;
  path: string;
  craftingRecipeCollectionPath?: string | null;
  craftingLoopDuration?: number | null;
  electricityValue?: number | null;
  electricityType?: string | null;
  coolingCapacity?: number | null;
  placementDataPath?: string | null;
  // Logistics line trait: presence indicates a rail/line; MoveSpeed may be null (trait present but no explicit speed)
  logisticsMoveSpeed?: number | null;
};

export function listDaFiles(srDataDir: string): string[] {
  const bDir = path.join(srDataDir, 'Buildings');
  if (!fs.existsSync(bDir)) return [];

  const results: string[] = [];

  function walk(dir: string) {
    const entries = fs.readdirSync(dir);
    for (const e of entries) {
      const full = path.join(dir, e);
      if (fs.statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (e.startsWith('DA_') && e.endsWith('.json')) results.push(full);
    }
  }

  walk(bDir);
  return results;
}

export function parseDaFile(filePath: string): DaInfo {
  const raw = getJsonData(filePath) as any[];
  const id = path.basename(filePath).replace('.json', '');
  const info: DaInfo = {
    id,
    path: filePath,
    craftingRecipeCollectionPath: null,
    craftingLoopDuration: null,
    electricityValue: null,
    electricityType: null,
    coolingCapacity: null,
    placementDataPath: null,
  };

  for (const obj of raw) {
    if (obj?.Type === 'CrBuildingCraftingTrait') {
      const cp = obj?.Properties?.CraftingParameters;
      if (cp?.RecipeCollection?.ObjectPath)
        info.craftingRecipeCollectionPath = normalizeObjectPath(cp.RecipeCollection.ObjectPath);
      if (cp?.CraftingLoopDuration != null)
        info.craftingLoopDuration = cp.CraftingLoopDuration;
    }

    if (obj?.Type === 'CrElectricityTrait') {
      const p = obj?.Properties?.Parameters;
      if (p?.ElectricityValue != null) info.electricityValue = p.ElectricityValue;
      if (p?.Type != null) info.electricityType = p.Type;
    }

    if (obj?.Type === 'CrMassTemperatureTrait') {
      const tp = obj?.Properties?.TemperatureParameters;
      if (tp?.CoolingCapacityUsing != null) info.coolingCapacity = tp.CoolingCapacityUsing;
    }

    if (obj?.Type === 'CrMassBuildingTrait') {
      const params = obj?.Properties?.Parameters;
      if (params?.PlacementData?.ObjectPath) info.placementDataPath = normalizeObjectPath(params.PlacementData.ObjectPath);
    }

    // Logistics line trait (drone rails / rails)
    if (obj?.Type === 'CrLogisticsLineTrait') {
      // MoveSpeed may be missing; set to null when the trait exists but speed not provided
      const p = obj?.Properties ?? {};
      const move = p?.Params?.MoveSpeed;
      info.logisticsMoveSpeed = move !== undefined ? move : null;
    }
  }

  return info;
}
