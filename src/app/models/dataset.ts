import { SelectItem } from 'primeng/api';

import {
  AdjustedRecipe,
  Beacon,
  Belt,
  CargoWagon,
  Category,
  FluidWagon,
  Fuel,
  Icon,
  Item,
  Machine,
  ModHash,
  Module,
  Recipe,
  Technology,
} from './data';
import { Defaults } from './defaults';
import { Entities } from './entities';
import { Game } from './enum';

export interface Dataset {
  game: Game;
  version: Entities<string>;
  categoryIds: string[];
  categoryEntities: Entities<Category>;
  categoryItemRows: Entities<string[][]>;
  categoryRecipeRows: Entities<string[][]>;
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
