import { ItemJson } from '~/data/schema/item';
import { ModData } from '~/data/schema/mod-data';
import { ModHash } from '~/data/schema/mod-hash';
import {
  itemHasQuality,
  Quality,
  qualityId,
  recipeHasQuality,
} from '~/data/schema/quality';

const QUALITIES = [
  Quality.Uncommon,
  Quality.Rare,
  Quality.Epic,
  Quality.Legendary,
];

export function emptyModHash(): ModHash {
  return {
    items: [],
    beacons: [],
    belts: [],
    fuels: [],
    wagons: [],
    machines: [],
    modules: [],
    technologies: [],
    recipes: [],
    locations: [],
  };
}

type ModHashSet = Record<keyof ModHash, Set<string>>;

export function emptyModHashSet(): ModHashSet {
  return {
    items: new Set(),
    beacons: new Set(),
    belts: new Set(),
    fuels: new Set(),
    wagons: new Set(),
    machines: new Set(),
    modules: new Set(),
    technologies: new Set(),
    recipes: new Set(),
    locations: new Set(),
  };
}

export function addIfMissing(
  hash: ModHash,
  hashSet: ModHashSet,
  key: keyof ModHash,
  id: string,
): void {
  hash[key] ??= [];
  const arr = hash[key];
  if (!arr.includes(id)) {
    const index = arr.indexOf(null);
    if (index !== -1) arr[index] = id;
    else arr.push(id);
  }
  hashSet[key].add(id);
}

export function updateHashItem(
  hash: ModHash,
  hashSet: ModHashSet,
  i: ItemJson,
  id: string,
): void {
  addIfMissing(hash, hashSet, 'items', id);
  if (i.beacon) addIfMissing(hash, hashSet, 'beacons', id);
  if (i.belt) addIfMissing(hash, hashSet, 'belts', id);
  if (i.fuel) addIfMissing(hash, hashSet, 'fuels', id);
  if (i.cargoWagon || i.fluidWagon) addIfMissing(hash, hashSet, 'wagons', id);
  if (i.machine) addIfMissing(hash, hashSet, 'machines', id);
  if (i.module) addIfMissing(hash, hashSet, 'modules', id);
  if (i.technology) addIfMissing(hash, hashSet, 'technologies', id);
}

export function updateHash(data: ModData, hash: ModHash): void {
  const hashSet = emptyModHashSet();
  const flags = new Set(data.flags);

  data.items.forEach((i) => {
    updateHashItem(hash, hashSet, i, i.id);
    if (flags.has('quality') && itemHasQuality(i)) {
      QUALITIES.forEach((q) => {
        updateHashItem(hash, hashSet, i, qualityId(i.id, q));
      });
    }
  });

  const itemData = data.items.reduce((e: Record<string, ItemJson>, i) => {
    e[i.id] = i;
    return e;
  }, {});

  data.recipes.forEach((r) => {
    addIfMissing(hash, hashSet, 'recipes', r.id);
    if (flags.has('quality') && recipeHasQuality(r, itemData)) {
      QUALITIES.forEach((q) => {
        addIfMissing(hash, hashSet, 'recipes', qualityId(r.id, q));
      });
    }
  });

  data.locations?.forEach((l) => {
    addIfMissing(hash, hashSet, 'locations', l.id);
  });

  // Clean up existing hash data
  const keys = Object.keys(hashSet) as (keyof ModHash)[];
  for (const key of keys) {
    if (hash[key] == null) continue;
    hash[key] = hash[key]?.map((i) =>
      i != null && hashSet[key].has(i) ? i : (null as unknown as string),
    );
  }
}
