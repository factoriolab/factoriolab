import {
  Category,
  Icon,
  RationalItem,
  ModHash,
  Recipe,
  RationalRecipe,
  RationalBeacon,
  RationalBelt,
  RationalCargoWagon,
  RationalFactory,
  RationalFluidWagon,
  RationalModule,
  RationalFuel,
} from './data';
import { Entities } from './entities';
import { Game } from './enum';
import { Defaults } from './defaults';

export interface Dataset {
  game: Game;
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
  itemRecipeIds: Entities<string>;
  recipeIds: string[];
  complexRecipeIds: string[];
  recipeEntities: Entities<Recipe>;
  recipeR: Entities<RationalRecipe>;
  recipeModuleIds: Entities<string[]>;
  prodModuleIds: string[];
  hash: ModHash;
  defaults?: Defaults;
}
