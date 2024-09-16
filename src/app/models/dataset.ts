import { Beacon } from './data/beacon';
import { Belt } from './data/belt';
import { CargoWagon } from './data/cargo-wagon';
import { Category } from './data/category';
import { FluidWagon } from './data/fluid-wagon';
import { Fuel } from './data/fuel';
import { Icon } from './data/icon';
import { Item } from './data/item';
import { Machine } from './data/machine';
import { ModHash } from './data/mod-hash';
import { Module } from './data/module';
import { AdjustedRecipe, Recipe } from './data/recipe';
import { Technology } from './data/technology';
import { Defaults } from './defaults';
import { Entities } from './entities';
import { Game } from './enum/game';

export interface Dataset {
  game: Game;
  version: Entities;
  categoryIds: string[];
  categoryEntities: Entities<Category>;
  categoryItemRows: Entities<string[][]>;
  categoryRecipeRows: Entities<string[][]>;
  iconFile: string;
  iconIds: string[];
  iconEntities: Entities<Icon>;
  itemIds: string[];
  itemEntities: Entities<Item>;
  beaconIds: string[];
  beaconEntities: Entities<Beacon>;
  beltIds: string[];
  pipeIds: string[];
  beltEntities: Entities<Belt>;
  cargoWagonIds: string[];
  cargoWagonEntities: Entities<CargoWagon>;
  fluidWagonIds: string[];
  fluidWagonEntities: Entities<FluidWagon>;
  machineIds: string[];
  machineEntities: Entities<Machine>;
  moduleIds: string[];
  moduleEntities: Entities<Module>;
  fuelIds: string[];
  fuelEntities: Entities<Fuel>;
  recipeIds: string[];
  recipeEntities: Entities<Recipe>;
  technologyIds: string[];
  technologyEntities: Entities<Technology>;
  proliferatorModuleIds: string[];
  limitations: Entities<Entities<boolean>>;
  hash?: ModHash;
  defaults?: Defaults | null;
}

export interface AdjustedDataset extends Dataset {
  adjustedRecipe: Entities<AdjustedRecipe>;
  /** For each item, all recipe ids that produce the item */
  itemRecipeIds: Entities<string[]>;
  /** For each item, all included recipe ids that produce the item */
  itemIncludedRecipeIds: Entities<string[]>;
  /** For each item, all included recipe ids that consume/produce the item */
  itemIncludedIoRecipeIds: Entities<string[]>;
}
