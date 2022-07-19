import {
  Category,
  Icon,
  ModHash,
  RationalBeacon,
  RationalBelt,
  RationalCargoWagon,
  RationalFactory,
  RationalFluidWagon,
  RationalFuel,
  RationalItem,
  RationalModule,
  RationalRecipe,
  Recipe,
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
  iconIds: string[];
  iconEntities: Entities<Icon>;
  itemIds: string[];
  itemEntities: Entities<RationalItem>;
  beaconIds: string[];
  beaconEntities: Entities<RationalBeacon>;
  beltIds: string[];
  pipeIds: string[];
  beltEntities: Entities<RationalBelt>;
  cargoWagonIds: string[];
  cargoWagonEntities: Entities<RationalCargoWagon>;
  fluidWagonIds: string[];
  fluidWagonEntities: Entities<RationalFluidWagon>;
  factoryIds: string[];
  factoryEntities: Entities<RationalFactory>;
  moduleIds: string[];
  beaconModuleIds: string[];
  moduleEntities: Entities<RationalModule>;
  fuelIds: Entities<string[]>;
  fuelEntities: Entities<RationalFuel>;
  itemRecipeId: Entities<string>;
  recipeIds: string[];
  complexRecipeIds: string[];
  recipeEntities: Entities<Recipe>;
  recipeR: Entities<RationalRecipe>;
  recipeModuleIds: Entities<string[]>;
  prodModuleIds: string[];
  hash?: ModHash;
  defaults?: Defaults | null;
}
