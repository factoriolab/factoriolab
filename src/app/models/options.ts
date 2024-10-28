import { SelectItem } from 'primeng/api';
import { data } from 'src/data';

import { Game } from './enum/game';

export function modOptions(game: Game): SelectItem<string>[] {
  return data.mods
    .filter((m) => m.game === game)
    .map((m): SelectItem<string> => ({ label: m.name, value: m.id }));
}

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
  locations: SelectItem<string>[];
}
