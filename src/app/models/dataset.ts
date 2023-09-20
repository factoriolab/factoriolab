import {
  BeaconRational,
  BeltRational,
  CargoWagonRational,
  Category,
  FluidWagonRational,
  FuelRational,
  Icon,
  ItemRational,
  MachineRational,
  ModHash,
  ModuleRational,
  Recipe,
  RecipeRational,
  Technology,
} from './data';
import { Defaults } from './defaults';
import { Entities } from './entities';
import { Game } from './enum';

export interface RawDataset {
  game: Game;
  version: Entities<string>;
  categoryIds: string[];
  categoryEntities: Entities<Category>;
  categoryItemRows: Entities<string[][]>;
  categoryRecipeRows: Entities<string[][]>;
  iconIds: string[];
  iconEntities: Entities<Icon>;
  itemIds: string[];
  itemEntities: Entities<ItemRational>;
  beaconIds: string[];
  beaconEntities: Entities<BeaconRational>;
  beltIds: string[];
  pipeIds: string[];
  beltEntities: Entities<BeltRational>;
  cargoWagonIds: string[];
  cargoWagonEntities: Entities<CargoWagonRational>;
  fluidWagonIds: string[];
  fluidWagonEntities: Entities<FluidWagonRational>;
  machineIds: string[];
  machineEntities: Entities<MachineRational>;
  moduleIds: string[];
  moduleEntities: Entities<ModuleRational>;
  fuelIds: string[];
  fuelEntities: Entities<FuelRational>;
  recipeIds: string[];
  recipeEntities: Entities<Recipe>;
  technologyIds: string[];
  technologyEntities: Entities<Technology>;
  proliferatorModuleIds: string[];
  limitations: Entities<Entities<boolean>>;
  hash?: ModHash;
  defaults?: Defaults | null;
}

export interface Dataset extends RawDataset {
  recipeR: Entities<RecipeRational>;
  /** For each item, all recipe ids that produce the item */
  itemRecipeIds: Entities<string[]>;
  /** For each item, all included recipe ids that produce the item */
  itemIncludedRecipeIds: Entities<string[]>;
  /** For each item, all included recipe ids that consume/produce the item */
  itemIncludedIoRecipeIds: Entities<string[]>;
}
