import { Entities } from '~/models';
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

export type EffectType = 'speed' | 'productivity' | 'consumption' | 'pollution';

export const allEffects: EffectType[] = [
  'consumption',
  'speed',
  'productivity',
  'pollution',
];

export function isSimpleIngredient(
  value: M.IngredientPrototype,
): value is [string, number] {
  return Array.isArray(value);
}

export function isFluidIngredient(
  value: M.IngredientPrototype,
): value is M.FluidIngredientPrototype {
  return !Array.isArray(value) && value.type === 'fluid';
}

export function isSimpleProduct(
  value: M.ProductPrototype,
): value is [string, number] {
  return Array.isArray(value);
}

export function isFluidProduct(
  value: M.ProductPrototype,
): value is M.FluidProductPrototype {
  return !Array.isArray(value) && value.type === 'fluid';
}

export interface DataRawDump {
  ammo: Entities<M.AmmoItemPrototype>;
  armor: Entities<M.ArmorPrototype>;
  'assembling-machine': Entities<M.AssemblingMachinePrototype>;
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
  'item-with-tags': Entities<M.ItemWithTagsPrototype>;
  lab: Entities<M.LabPrototype>;
  'mining-drill': Entities<M.MiningDrillPrototype>;
  module: Entities<M.ModulePrototype>;
  'offshore-pump': Entities<M.OffshorePumpPrototype>;
  'rail-planner': Entities<M.RailPlannerPrototype>;
  reactor: Entities<M.ReactorPrototype>;
  recipe: Entities<M.RecipePrototype>;
  'repair-tool': Entities<M.RepairToolPrototype>;
  resource: Entities<M.ResourceEntityPrototype>;
  'rocket-silo': Entities<M.RocketSiloPrototype>;
  'rocket-silo-rocket': Entities<M.RocketSiloRocketPrototype>;
  'selection-tool': Entities<M.SelectionToolPrototype>;
  'spidertron-remote': Entities<M.SpidertronRemotePrototype>;
  technology: Entities<M.TechnologyPrototype>;
  tool: Entities<M.ToolPrototype>;
  'transport-belt': Entities<M.TransportBeltPrototype>;
}

export interface Locale {
  names: Entities<string>;
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
  | M.FluidWagonPrototype;

export interface ModDataReport {
  noProducers: string[];
  noProducts: string[];
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
  | M.ReactorPrototype;

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
] as const;

export const anyItemKeys = [
  'item',
  'ammo',
  'armor',
  'capsule',
  'gun',
  'item-with-entity-data',
  'item-with-tags',
  'module',
  'rail-planner',
  'repair-tool',
  'selection-tool',
  'spidertron-remote',
  'tool',
  'fluid',
] as const;
