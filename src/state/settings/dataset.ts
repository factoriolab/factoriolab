import { Game } from '~/data/game';
import { GameInfo } from '~/data/game-info';
import { IconType } from '~/data/icon-type';
import { Beacon } from '~/data/schema/beacon';
import { Belt } from '~/data/schema/belt';
import { CargoWagon } from '~/data/schema/cargo-wagon';
import { Category } from '~/data/schema/category';
import { FluidWagon } from '~/data/schema/fluid-wagon';
import { Fuel } from '~/data/schema/fuel';
import { Icon } from '~/data/schema/icon';
import { Item } from '~/data/schema/item';
import { Machine } from '~/data/schema/machine';
import { ModHash } from '~/data/schema/mod-hash';
import { Module } from '~/data/schema/module';
import { AdjustedRecipe, Recipe } from '~/data/schema/recipe';
import { Technology } from '~/data/schema/technology';
import { Flag } from '~/state/flags';

export interface Dataset {
  game: Game;
  modId: string;
  info: GameInfo;
  flags: Set<Flag>;
  version: Record<string, string>;
  categoryIds: string[];
  categoryRecord: Record<string, Category>;
  itemCategoryRows: Record<string, string[][]>;
  recipeCategoryRows: Record<string, string[][]>;
  iconIds: string[];
  iconRecord: Record<IconType, Record<string, Icon>>;
  itemIds: string[];
  itemQIds: Set<string>;
  itemRecord: Record<string, Item>;
  noRecipeItemIds: Set<string>;
  beaconIds: string[];
  beaconRecord: Record<string, Beacon>;
  beltIds: string[];
  pipeIds: string[];
  beltRecord: Record<string, Belt>;
  cargoWagonIds: string[];
  cargoWagonRecord: Record<string, CargoWagon>;
  fluidWagonIds: string[];
  fluidWagonRecord: Record<string, FluidWagon>;
  machineIds: string[];
  machineRecord: Record<string, Machine>;
  moduleIds: string[];
  moduleRecord: Record<string, Module>;
  fuelIds: string[];
  fuelRecord: Record<string, Fuel>;
  recipeIds: string[];
  recipeQIds: Set<string>;
  recipeRecord: Record<string, Recipe>;
  prodUpgradeTechs: string[];
  prodUpgrades: Record<string, string[]>;
  technologyIds: string[];
  technologyRecord: Record<string, Technology>;
  proliferatorModuleIds: string[];
  locationIds: string[];
  locationRecord: Record<string, Category>;
  limitations: Record<string, Record<string, boolean>>;
  hash?: ModHash;
}

export interface AdjustedDataset extends Dataset {
  adjustedRecipe: Record<string, AdjustedRecipe>;
  /** For each item, all recipe ids that produce the item */
  itemRecipeIds: Record<string, string[]>;
  /** For each item, all included recipe ids that produce the item */
  itemAvailableRecipeIds: Record<string, string[]>;
  /** For each item, all included recipe ids that consume/produce the item */
  itemAvailableIoRecipeIds: Record<string, string[]>;
}
