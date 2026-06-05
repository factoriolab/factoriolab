export interface ModHash {
  items: (string | null)[];
  beacons: (string | null)[];
  belts: (string | null)[];
  fuels: (string | null)[];
  wagons: (string | null)[];
  machines: (string | null)[];
  modules: (string | null)[];
  recipes: (string | null)[];
  technologies: (string | null)[];
  locations?: (string | null)[];
}
