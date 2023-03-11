import {
  BeaconRtl,
  BeltRtl,
  CargoWagonRtl,
  Category,
  FluidWagonRtl,
  FuelRtl,
  Icon,
  ItemRtl,
  MachineRtl,
  ModHash,
  ModuleRtl,
  Recipe,
  RecipeRtl,
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
  itemEntities: Entities<ItemRtl>;
  beaconIds: string[];
  beaconEntities: Entities<BeaconRtl>;
  beltIds: string[];
  pipeIds: string[];
  beltEntities: Entities<BeltRtl>;
  cargoWagonIds: string[];
  cargoWagonEntities: Entities<CargoWagonRtl>;
  fluidWagonIds: string[];
  fluidWagonEntities: Entities<FluidWagonRtl>;
  machineIds: string[];
  machineEntities: Entities<MachineRtl>;
  moduleIds: string[];
  moduleEntities: Entities<ModuleRtl>;
  fuelIds: Entities<string[]>;
  fuelEntities: Entities<FuelRtl>;
  itemRecipeId: Entities<string>;
  recipeIds: string[];
  recipeEntities: Entities<Recipe>;
  recipeR: Entities<RecipeRtl>;
  proliferatorModuleIds: string[];
  limitations: Entities<Entities<boolean>>;
  hash?: ModHash;
  defaults?: Defaults | null;
}
