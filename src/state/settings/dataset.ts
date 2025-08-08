import { Beacon } from '~/models/data/beacon';
import { Belt } from '~/models/data/belt';
import { CargoWagon } from '~/models/data/cargo-wagon';
import { Category } from '~/models/data/category';
import { FluidWagon } from '~/models/data/fluid-wagon';
import { Fuel } from '~/models/data/fuel';
import { Icon } from '~/models/data/icon';
import { Item } from '~/models/data/item';
import { Machine } from '~/models/data/machine';
import { ModHash } from '~/models/data/mod-hash';
import { Module } from '~/models/data/module';
import { AdjustedRecipe, Recipe } from '~/models/data/recipe';
import { Technology } from '~/models/data/technology';
import { Flag } from '~/models/flags';
import { Game } from '~/models/game';
import { GameInfo } from '~/models/game-info';
import { Defaults } from '~/state/settings/defaults';

export interface Dataset {
  game: Game;
  modId: string;
  info: GameInfo;
  flags: Set<Flag>;
  version: Record<string, string>;
  categoryIds: string[];
  categoryRecord: Record<string, Category>;
  categoryItemRows: Record<string, string[][]>;
  categoryRecipeRows: Record<string, string[][]>;
  iconFile: string;
  iconIds: string[];
  iconRecord: Record<string, Icon>;
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
  defaults?: Defaults | null;
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
