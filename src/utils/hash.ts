import { itemHasQuality, ItemJson } from '~/data/schema/item';
import { ModData } from '~/data/schema/mod-data';
import { ModHash } from '~/data/schema/mod-hash';
import { qualityId } from '~/data/schema/quality';
import { recipeHasQuality } from '~/data/schema/recipe';

type ModHashSet = Record<keyof ModHash, Set<string>>;

export function emptyModHash(): ModHash {
  return {
    items: [],
    beacons: [],
    belts: [],
    fuels: [],
    wagons: [],
    machines: [],
    modules: [],
    recipes: [],
    technologies: [],
    locations: [],
  };
}

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
}

export function updateHashItem(hash: ModHash, i: ItemJson, id: string): void {
  addIfMissing(hash, 'items', id);
  if (i.beacon) addIfMissing(hash, 'beacons', id);
  if (i.belt) addIfMissing(hash, 'belts', id);
  if (i.fuel) addIfMissing(hash, 'fuels', id);
  if (i.wagon) addIfMissing(hash, 'wagons', id);
  if (i.machine) addIfMissing(hash, 'machines', id);
  if (i.module) addIfMissing(hash, 'modules', id);
  if (i.technology) addIfMissing(hash, 'technologies', id);
}

export function updateHashSetItem(
  hashSet: ModHashSet,
  i: ItemJson,
  id: string,
): void {
  hashSet.items.add(id);
  if (i.beacon) hashSet.beacons.add(id);
  if (i.belt) hashSet.belts.add(id);
  if (i.fuel) hashSet.fuels.add(id);
  if (i.wagon) hashSet.wagons.add(id);
  if (i.machine) hashSet.machines.add(id);
  if (i.module) hashSet.modules.add(id);
  if (i.technology) hashSet.technologies.add(id);
}

export function updateHash(data: ModData, hash: ModHash): void {
  const hashSet = emptyModHashSet();

  const abnormalQualities = data.qualities?.filter((q) => q.level);

  const itemData = data.items.reduce((e: Record<string, ItemJson>, i) => {
    e[i.id] = i;
    return e;
  }, {});

  // Set up hash set
  data.items.forEach((i) => {
    updateHashSetItem(hashSet, i, i.id);
    if (abnormalQualities?.length && itemHasQuality(i)) {
      abnormalQualities
        .filter((q) => q.level)
        .forEach((q) => {
          updateHashSetItem(hashSet, i, qualityId(i.id, q));
        });
    }
  });

  data.recipes.forEach((r) => {
    hashSet.recipes.add(r.id);
    if (abnormalQualities?.length && recipeHasQuality(r, itemData)) {
      abnormalQualities.forEach((q) => {
        hashSet.recipes.add(qualityId(r.id, q));
      });
    }
  });

  data.locations?.forEach((l) => {
    hashSet.locations.add(l.id);
  });

  // Clean up existing hash data
  const keys = Object.keys(hashSet) as (keyof ModHash)[];
  for (const key of keys) {
    // The continue block should be unreachable and exists to satisfy TypeScript
    // istanbul ignore if
    if (hash[key] == null) continue;
    hash[key] = hash[key].map((i) =>
      i != null && hashSet[key].has(i) ? i : null,
    );
  }

  // Add missing ids
  data.items.forEach((i) => {
    updateHashItem(hash, i, i.id);
    if (abnormalQualities?.length && itemHasQuality(i)) {
      abnormalQualities
        .filter((q) => q.level)
        .forEach((q) => {
          updateHashItem(hash, i, qualityId(i.id, q));
        });
    }
  });

  data.recipes.forEach((r) => {
    addIfMissing(hash, 'recipes', r.id);
    if (abnormalQualities?.length && recipeHasQuality(r, itemData)) {
      abnormalQualities.forEach((q) => {
        addIfMissing(hash, 'recipes', qualityId(r.id, q));
      });
    }
  });

  data.locations?.forEach((l) => {
    addIfMissing(hash, 'locations', l.id);
  });
}
