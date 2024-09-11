import { SelectItem } from 'primeng/api';

export interface Options {
  categories: SelectItem<string>[];
  items: SelectItem<string>[];
  beacons: SelectItem<string>[];
  belts: SelectItem<string>[];
  pipes: SelectItem<string>[];
  cargoWagons: SelectItem<string>[];
  fluidWagons: SelectItem<string>[];
  fuels: SelectItem<string>[];
  modules: SelectItem<string>[];
  proliferatorModules: SelectItem<string>[];
  machines: SelectItem<string>[];
  recipes: SelectItem<string>[];
}
