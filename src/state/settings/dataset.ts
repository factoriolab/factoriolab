import { Game } from '~/data/game';
import { GameInfo } from '~/data/game-info';
import { IconType } from '~/data/icon-type';
import { Beacon } from '~/data/schema/beacon';
import { Belt } from '~/data/schema/belt';
import { Category } from '~/data/schema/category';
import { Fuel } from '~/data/schema/fuel';
import { IconData } from '~/data/schema/icon-data';
import { AdjustedInserter, Inserter } from '~/data/schema/inserter';
import { Item } from '~/data/schema/item';
import { Machine } from '~/data/schema/machine';
import { ModHash } from '~/data/schema/mod-hash';
import { Module } from '~/data/schema/module';
import { Quality } from '~/data/schema/quality';
import { AdjustedRecipe, Recipe } from '~/data/schema/recipe';
import { Technology } from '~/data/schema/technology';
import { Wagon } from '~/data/schema/wagon';
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
  iconRecord: Record<Exclude<IconType, 'img'>, Record<string, IconData>>;
  itemIds: string[];
  itemRecord: Record<string, Item>;
  noRecipeItemIds: Set<string>;
  beaconIds: string[];
  beaconRecord: Record<string, Beacon>;
  beltIds: string[];
  beltRecord: Record<string, Belt>;
  wagonIds: string[];
  wagonRecord: Record<string, Wagon>;
  machineIds: string[];
  machineRecord: Record<string, Machine>;
  moduleIds: string[];
  moduleRecord: Record<string, Module>;
  fuelIds: string[];
  fuelRecord: Record<string, Fuel>;
  recipeIds: string[];
  recipeQIds: Set<string>;
  recipeRecord: Record<string, Recipe>;
  prodUpgradeTechIds: string[];
  technologyIds: string[];
  technologyRecord: Record<string, Technology>;
  inserterIds: string[];
  inserterRecord: Record<string, Inserter>;
  proliferatorModuleIds: string[];
  locationIds: string[];
  locationRecord: Record<string, Category>;
  qualityIds: string[];
  qualityRecord: Record<string, Quality>;
  abnormalQualities: Quality[];
  limitations: Record<string, Record<string, boolean>>;
  hash?: ModHash;
}

export interface AdjustedDataset extends Dataset {
  adjustedInserter: Record<string, AdjustedInserter>;
  adjustedRecipe: Record<string, AdjustedRecipe>;
  /** For each item, all recipe ids that produce the item */
  itemRecipeIds: Record<string, string[]>;
  /** For each item, all included recipe ids that produce the item */
  itemAvailableRecipeIds: Record<string, string[]>;
  /** For each item, all included recipe ids that consume/produce the item */
  itemAvailableIoRecipeIds: Record<string, string[]>;
}
