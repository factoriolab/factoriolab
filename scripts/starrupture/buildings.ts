import fs from 'fs';
import path from 'path';
import { getJsonData } from '../helpers/file.helpers';

export type DaInfo = {
  id: string;
  path: string;
  craftingRecipeCollectionPath?: string | null;
  craftingLoopDuration?: number | null;
  electricityValue?: number | null;
  electricityType?: string | null;
  coolingCapacity?: number | null;
  placementDataPath?: string | null;
};

export function listDaFiles(srDataDir: string): string[] {
  const bDir = path.join(srDataDir, 'Buildings');
  if (!fs.existsSync(bDir)) return [];

  const results: string[] = [];

  const subdirs = fs.readdirSync(bDir);
  for (const sd of subdirs) {
    const subPath = path.join(bDir, sd);
    if (!fs.statSync(subPath).isDirectory()) continue;
    const files = fs.readdirSync(subPath);
    for (const f of files) {
      if (f.startsWith('DA_') && f.endsWith('.json')) {
        results.push(path.join(subPath, f));
      }
    }
  }

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
        info.craftingRecipeCollectionPath = cp.RecipeCollection.ObjectPath;
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
      if (params?.PlacementData?.ObjectPath) info.placementDataPath = params.PlacementData.ObjectPath;
    }
  }

  return info;
}
