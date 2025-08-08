import { Option } from '~/models/option';

export interface Options {
  categories: Option[];
  items: Option[];
  beacons: Option[];
  belts: Option[];
  pipes: Option[];
  cargoWagons: Option[];
  fluidWagons: Option[];
  fuels: Option[];
  modules: Option[];
  proliferatorModules: Option[];
  machines: Option[];
  recipes: Option[];
  locations: Option[];
}
