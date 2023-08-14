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
  itemEntities: Entities<ItemRational>;
  itemRecipeIds: Entities<string[]>;
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
  recipeProductIds: Entities<string[]>;
  technologyIds: string[];
  technologyEntities: Entities<Technology>;
  recipeR: Entities<RecipeRational>;
  proliferatorModuleIds: string[];
  limitations: Entities<Entities<boolean>>;
  hash?: ModHash;
  defaults?: Defaults | null;
}
