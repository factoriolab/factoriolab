import { Entities } from '~/models/utils';

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

export function isResearchProduct(
  value: M.ProductPrototype,
): value is M.ProductPrototype {
  return value.type === 'research-progress';
}

export interface DataRawDump {
  'agricultural-tower'?: Entities<M.AgriculturalTowerPrototype>;
  ammo: Entities<M.AmmoItemPrototype>;
  armor: Entities<M.ArmorPrototype>;
  'assembling-machine': Entities<M.AssemblingMachinePrototype>;
  asteroid?: Entities<M.AsteroidPrototype>;
  'asteroid-chunk': Entities<M.AsteroidChunkPrototype>;
  'asteroid-collector'?: Entities<M.AsteroidCollectorPrototype>;
  beacon: Entities<M.BeaconPrototype>;
  boiler: Entities<M.BoilerPrototype>;
  capsule: Entities<M.CapsulePrototype>;
  'cargo-wagon': Entities<M.CargoWagonPrototype>;
  fluid: Entities<M.FluidPrototype>;
  'fluid-wagon': Entities<M.FluidWagonPrototype>;
  furnace: Entities<M.FurnacePrototype>;
  gun: Entities<M.GunPrototype>;
  item: Entities<M.ItemPrototype>;
  'item-group': Entities<M.ItemGroup>;
  'item-subgroup': Entities<M.ItemSubGroup>;
  'item-with-entity-data': Entities<M.ItemWithEntityDataPrototype>;
  lab: Entities<M.LabPrototype>;
  'mining-drill': Entities<M.MiningDrillPrototype>;
  module: Entities<M.ModulePrototype>;
  'offshore-pump': Entities<M.OffshorePumpPrototype>;
  planet: Entities<M.PlanetPrototype>;
  plant: Entities<M.PlantPrototype>;
  pump: Entities<M.PumpPrototype>;
  'rail-planner': Entities<M.RailPlannerPrototype>;
  reactor: Entities<M.ReactorPrototype>;
  recipe: Entities<M.RecipePrototype>;
  'repair-tool': Entities<M.RepairToolPrototype>;
  resource: Entities<M.ResourceEntityPrototype>;
  'rocket-silo': Entities<M.RocketSiloPrototype>;
  'rocket-silo-rocket': Entities<M.RocketSiloRocketPrototype>;
  'selection-tool': Entities<M.SelectionToolPrototype>;
  'space-connection'?: Entities<M.SpaceConnectionPrototype>;
  'space-location': Entities<M.SpaceLocationPrototype>;
  'space-platform-starter-pack'?: Entities<M.SpacePlatformStarterPackPrototype>;
  'spidertron-remote': Entities<M.SpidertronRemotePrototype>;
  surface: Entities<M.SurfacePrototype>;
  'surface-property': Entities<M.SurfacePropertyPrototype>;
  technology: Entities<M.TechnologyPrototype>;
  tile: Entities<M.TilePrototype>;
  tool: Entities<M.ToolPrototype>;
  'transport-belt': Entities<M.TransportBeltPrototype>;
}

export interface Locale {
  names: Entities;
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
  | M.AgriculturalTowerPrototype;

export type AnyLocationPrototype = M.PlanetPrototype | M.SurfacePrototype;

export interface ModDataReport {
  machineSpeedZero: string[];
  noProducers: string[];
  resourceNoMinableProducts: string[];
  resourceDuplicate: string[];
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
