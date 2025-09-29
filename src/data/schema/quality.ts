import { Option } from '~/models/option';

import { Item, ItemJson } from './item';
import { Recipe, RecipeJson } from './recipe';

export const LEGENDARY_QUALITY = 'legendary-quality';
export const EPIC_QUALITY = 'epic-quality';
export const QUALITY_MODULE_TECHNOLOGY = 'quality-module-technology';

export enum Quality {
  Any = -1,
  Normal = 0,
  Uncommon = 1,
  Rare = 2,
  Epic = 3,
  Legendary = 5,
}

export const qualityOptions: Option<Quality>[] = [
  {
    value: Quality.Any,
    label: 'options.quality.any',
    icon: 'q-1',
    iconType: 'system',
  },
  {
    value: Quality.Normal,
    label: 'options.quality.normal',
    icon: 'q0',
    iconType: 'system',
  },
  {
    value: Quality.Uncommon,
    label: 'options.quality.uncommon',
    icon: 'q1',
    iconType: 'system',
  },
  {
    value: Quality.Rare,
    label: 'options.quality.rare',
    icon: 'q2',
    iconType: 'system',
  },
  {
    value: Quality.Epic,
    label: 'options.quality.epic',
    icon: 'q3',
    iconType: 'system',
  },
  {
    value: Quality.Legendary,
    label: 'options.quality.legendary',
    icon: 'q5',
    iconType: 'system',
  },
];

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
  itemData: Record<string, ItemJson>,
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
