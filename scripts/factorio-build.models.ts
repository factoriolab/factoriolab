import * as M from './factorio.models';

export interface ModList {
  mods: { name: string; enabled: boolean }[];
}

export interface PlayerData {
  'last-played-version': {
    game_version: string;
    build_version: number;
    build_mode: string;
    platform: string;
  };
}

export type EffectType =
  | 'speed'
  | 'productivity'
  | 'consumption'
  | 'pollution'
  | 'quality';

export const allEffects: EffectType[] = [
  'consumption',
  'speed',
  'productivity',
  'pollution',
  'quality',
];

export function isFluidIngredient(
  value: M.IngredientPrototype,
): value is M.FluidIngredientPrototype {
  return value.type === 'fluid';
}

export function isFluidProduct(
  value: M.ProductPrototype,
): value is M.FluidProductPrototype {
  return value.type === 'fluid';
}

export interface DataRawDump {
  'agricultural-tower'?: Record<string, M.AgriculturalTowerPrototype>;
  ammo: Record<string, M.AmmoItemPrototype>;
  armor: Record<string, M.ArmorPrototype>;
  'assembling-machine': Record<string, M.AssemblingMachinePrototype>;
  asteroid?: Record<string, M.AsteroidPrototype>;
  'asteroid-chunk': Record<string, M.AsteroidChunkPrototype>;
  'asteroid-collector'?: Record<string, M.AsteroidCollectorPrototype>;
  beacon: Record<string, M.BeaconPrototype>;
  boiler: Record<string, M.BoilerPrototype>;
  capsule: Record<string, M.CapsulePrototype>;
  'cargo-wagon': Record<string, M.CargoWagonPrototype>;
  fluid: Record<string, M.FluidPrototype>;
  'fluid-wagon': Record<string, M.FluidWagonPrototype>;
  furnace: Record<string, M.FurnacePrototype>;
  gun: Record<string, M.GunPrototype>;
  item: Record<string, M.ItemPrototype>;
  inserter: Record<string, M.InserterPrototype>;
  'item-group': Record<string, M.ItemGroup>;
  'item-subgroup': Record<string, M.ItemSubGroup>;
  'item-with-entity-data': Record<string, M.ItemWithEntityDataPrototype>;
  lab: Record<string, M.LabPrototype>;
  'mining-drill': Record<string, M.MiningDrillPrototype>;
  module: Record<string, M.ModulePrototype>;
  'offshore-pump': Record<string, M.OffshorePumpPrototype>;
  planet: Record<string, M.PlanetPrototype>;
  plant: Record<string, M.PlantPrototype>;
  pump: Record<string, M.PumpPrototype>;
  'rail-planner': Record<string, M.RailPlannerPrototype>;
  reactor: Record<string, M.ReactorPrototype>;
  recipe: Record<string, M.RecipePrototype>;
  'recipe-category': Record<string, M.RecipeCategory>;
  'repair-tool': Record<string, M.RepairToolPrototype>;
  resource: Record<string, M.ResourceEntityPrototype>;
  'rocket-silo': Record<string, M.RocketSiloPrototype>;
  'rocket-silo-rocket': Record<string, M.RocketSiloRocketPrototype>;
  'selection-tool': Record<string, M.SelectionToolPrototype>;
  'space-connection'?: Record<string, M.SpaceConnectionPrototype>;
  'space-location': Record<string, M.SpaceLocationPrototype>;
  'space-platform-starter-pack'?: Record<
    string,
    M.SpacePlatformStarterPackPrototype
  >;
  'spidertron-remote': Record<string, M.SpidertronRemotePrototype>;
  surface: Record<string, M.SurfacePrototype>;
  'surface-property': Record<string, M.SurfacePropertyPrototype>;
  technology: Record<string, M.TechnologyPrototype>;
  tile: Record<string, M.TilePrototype>;
  tool: Record<string, M.ToolPrototype>;
  'transport-belt': Record<string, M.TransportBeltPrototype>;
  'utility-constants': { default: M.UtilityConstants };
}

export interface Locale {
  names: Record<string, string>;
}

export type AnyItemPrototype =
  | M.AmmoItemPrototype
  | M.ArmorPrototype
  | M.CapsulePrototype
  | M.GunPrototype
  | M.ItemPrototype
  | M.ItemWithEntityDataPrototype
  | M.ItemWithTagsPrototype
  | M.ModulePrototype
  | M.RailPlannerPrototype
  | M.RepairToolPrototype
  | M.SelectionToolPrototype
  | M.SpacePlatformStarterPackPrototype
  | M.SpidertronRemotePrototype
  | M.ToolPrototype;

export function isAnyItemPrototype(proto: unknown): proto is AnyItemPrototype {
  return (
    M.isAmmoItemPrototype(proto) ||
    M.isArmorPrototype(proto) ||
    M.isCapsulePrototype(proto) ||
    M.isGunPrototype(proto) ||
    M.isItemPrototype(proto) ||
    M.isItemWithEntityDataPrototype(proto) ||
    M.isItemWithTagsPrototype(proto) ||
    M.isModulePrototype(proto) ||
    M.isRailPlannerPrototype(proto) ||
    M.isRepairToolPrototype(proto) ||
    M.isSelectionToolPrototype(proto) ||
    M.isSpacePlatformStarterPackPrototype(proto) ||
    M.isSpidertronRemotePrototype(proto) ||
    M.isToolPrototype(proto)
  );
}

export type AnyEntityPrototype =
  | M.BeaconPrototype
  | M.AssemblingMachinePrototype
  | M.BoilerPrototype
  | M.FurnacePrototype
  | M.LabPrototype
  | M.MiningDrillPrototype
  | M.OffshorePumpPrototype
  | M.ReactorPrototype
  | M.RocketSiloPrototype
  | M.TransportBeltPrototype
  | M.CargoWagonPrototype
  | M.FluidWagonPrototype
  | M.PumpPrototype
  | M.AsteroidCollectorPrototype
  | M.AgriculturalTowerPrototype
  | M.InserterPrototype;

export type AnyLocationPrototype = M.PlanetPrototype | M.SurfacePrototype;

export interface ModDataReport {
  machineSpeedZero: string[];
  noProducers: string[];
  resourceNoMinableProducts: string[];
  resourceDuplicate: string[];
  disabledRecipeDoesntExist: string[];
}

export type MachineProto =
  | M.BoilerPrototype
  | M.AssemblingMachinePrototype
  | M.RocketSiloPrototype
  | M.FurnacePrototype
  | M.LabPrototype
  | M.MiningDrillPrototype
  | M.OffshorePumpPrototype
  | M.ReactorPrototype
  | M.AsteroidCollectorPrototype
  | M.AgriculturalTowerPrototype;

export const anyEntityKeys = [
  'beacon',
  'assembling-machine',
  'boiler',
  'furnace',
  'lab',
  'mining-drill',
  'offshore-pump',
  'reactor',
  'rocket-silo',
  'transport-belt',
  'cargo-wagon',
  'fluid-wagon',
  'pump',
  'asteroid-collector',
  'agricultural-tower',
  'item',
] as const;

export const anyItemKeys = [
  'item',
  'ammo',
  'armor',
  'capsule',
  'gun',
  'item-with-entity-data',
  'module',
  'rail-planner',
  'repair-tool',
  'selection-tool',
  'spidertron-remote',
  'space-platform-starter-pack',
  'tool',
  'fluid',
] as const;

export const anyLocationKeys = ['surface', 'planet'] as const;
