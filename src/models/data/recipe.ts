import { spread } from '~/utils/object';
import { Rational, rational } from '~/models/rational';
import { cloneRecord, toRationalRecord } from '~/utils/record';

import { ModuleEffect } from './module';
import { Quality } from './quality';

export type RecipeFlag =
  | 'mining'
  | 'technology'
  | 'burn'
  | 'grow'
  | 'recycling'
  | 'locked'
  | 'hideProducer';

export interface RecipeJson {
  id: string;
  name: string;
  category: string;
  row: number;
  time: number | string;
  producers: string[];
  in: Record<string, number | string>;
  out: Record<string, number | string>;
  /** Denotes amount of output that is not affected by productivity */
  catalyst?: Record<string, number | string>;
  cost?: number | string;
  /** If recipe is a rocket launch, indicates the rocket part recipe used */
  part?: string;
  /** Used to link the recipe to an alternate icon id */
  icon?: string;
  /** Used to add extra text to an already defined icon */
  iconText?: string;
  /** Used to override the machine's usage for this recipe */
  usage?: number | string;
  disallowedEffects?: ModuleEffect[];
  locations?: string[];
  flags?: RecipeFlag[];
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  row: number;
  time: Rational;
  producers: string[];
  in: Record<string, Rational>;
  out: Record<string, Rational>;
  /** Denotes amount of output that is not affected by productivity */
  catalyst?: Record<string, Rational>;
  cost?: Rational;
  /** If recipe is a rocket launch, indicates the rocket part recipe used */
  part?: string;
  /** Used to link the recipe to an alternate icon id */
  icon?: string;
  /** Used to add extra text to an already defined icon */
  iconText?: string;
  usage?: Rational;
  drain?: Rational;
  consumption?: Rational;
  pollution?: Rational;
  quality?: Quality;
  disallowedEffects?: ModuleEffect[];
  locations?: string[];
  flags: Set<RecipeFlag>;
}

export function parseRecipe(json: RecipeJson): Recipe {
  return {
    id: json.id,
    name: json.name,
    category: json.category,
    row: json.row,
    time: rational(json.time),
    producers: json.producers,
    in: toRationalRecord(json.in),
    out: toRationalRecord(json.out),
    catalyst: toRationalRecord(json.catalyst),
    cost: rational(json.cost),
    part: json.part,
    icon: json.icon,
    iconText: json.iconText,
    usage: rational(json.usage),
    disallowedEffects: json.disallowedEffects,
    locations: json.locations,
    flags: new Set(json.flags),
  };
}

export function cloneRecipe(recipe: Recipe): Recipe {
  return spread(recipe, {
    in: cloneRecord(recipe.in),
    out: cloneRecord(recipe.out),
    catalyst: cloneRecord(recipe.catalyst),
  });
}

export interface AdjustedRecipe extends Recipe {
  effects: Record<ModuleEffect, Rational>;
  produces: Set<string>;
  output: Record<string, Rational>;
}

export function finalizeRecipe(recipe: AdjustedRecipe): void {
  for (const outId of Object.keys(recipe.out)) {
    const output = recipe.out[outId];

    if (
      output.gt(rational.zero) &&
      (recipe.in[outId] == null || recipe.in[outId].lt(output))
    )
      recipe.produces.add(outId);

    recipe.output[outId] = output
      .sub(recipe.in[outId] ?? rational.zero)
      .div(recipe.time);
  }

  for (const inId of Object.keys(recipe.in).filter(
    (i) => recipe.out[i] == null,
  )) {
    const input = recipe.in[inId];
    recipe.output[inId] = input.inverse().div(recipe.time);
  }
}
