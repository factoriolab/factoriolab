import { SelectItem } from 'primeng/api';

import { Item, ItemJson } from '../data/item';
import { Recipe, RecipeJson } from '../data/recipe';
import { Entities } from '../utils';

export enum Quality {
  Any = -1,
  Normal = 0,
  Uncommon = 1,
  Rare = 2,
  Epic = 3,
  Legendary = 5,
}

export const qualityFilterOptions: SelectItem<Quality>[] = [
  { value: Quality.Any, label: 'options.quality.any' },
  { value: Quality.Normal, label: 'options.quality.normal' },
  { value: Quality.Uncommon, label: 'options.quality.uncommon' },
  { value: Quality.Rare, label: 'options.quality.rare' },
  { value: Quality.Epic, label: 'options.quality.epic' },
  { value: Quality.Legendary, label: 'options.quality.legendary' },
];

export const qualityOptions = qualityFilterOptions.slice(3);

export const QUALITY_REGEX = /^(.*)\((\d)\)$/;

export function baseId(id: string): string {
  const match = QUALITY_REGEX.exec(id);
  if (match) return match[1];
  return id;
}

export function qualityId(id: string, quality: Quality): string {
  if (quality < Quality.Uncommon) return id;
  return `${id}(${quality.toString()})`;
}

export function itemHasQuality(item: Item | ItemJson): boolean {
  return item.technology == null && item.stack != null;
}

export function recipeHasQuality(
  recipe: Recipe | RecipeJson,
  itemData: Entities<ItemJson>,
): boolean {
  const flags = new Set(recipe.flags);
  return (
    recipe.part == null &&
    !flags.has('mining') &&
    (!flags.has('technology') || Object.keys(recipe.in).length > 0) &&
    !flags.has('burn') &&
    !flags.has('grow') &&
    Object.keys(recipe.in).some((k) => itemData[k].stack)
  );
}
