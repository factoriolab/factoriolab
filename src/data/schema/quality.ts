import { BaseJson } from './base';
import { Item, ItemJson } from './item';
import { Recipe, RecipeJson } from './recipe';

export interface QualityJson extends BaseJson {
  level: number;
}
export type Quality = QualityJson;

export const QUALITY_REGEX = /^(.*)\((\d)\)$/;

export function baseId(id: string): string {
  const match = QUALITY_REGEX.exec(id);
  if (match) return match[1];
  return id;
}

export function qualityId(id: string, quality: QualityJson): string {
  if (quality.level <= 0) return id;
  return `${id}(${quality.level.toString()})`;
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
    !flags.has('hideProducer') &&
    Object.keys(recipe.in).some((k) => itemData[k].stack)
  );
}
