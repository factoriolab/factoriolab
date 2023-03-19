import { Entities } from '~/models';

export interface Base {
  name: string;
  type: string;
  order?: string;
}

export interface Item {
  type: string;
}

export interface AssemblingMachine extends Base {
  fixed_recipe?: string;
}

export interface RocketSilo extends AssemblingMachine {
  rocket_parts_required: number;
}

export interface ItemProduct {
  type: 'item';
  name: string;
  amount: number;
  probability: number;
  amount_min: number;
  amount_max: number;
  catalyst_amount: number;
}

export interface FluidProduct {
  type: 'fluid';
  name: string;
  probability: number;
  amount: number;
  amount_min: number;
  amount_max: number;
  temperature: number;
  catalyst_amount: number;
}

export interface RecipeData {
  ingredients: Entities<number>;
  result?: string;
  result_count?: string;
  results?: (ItemProduct | FluidProduct)[];
  energy_required?: number;
  emissions_multiplier?: number;
  enabled?: boolean;
  hidden?: boolean;
}

export interface Recipe extends Base, RecipeData {
  category?: string;
  normal?: RecipeData | boolean;
  expensive?: RecipeData | boolean;
}

export interface Modifier {
  type: string;
}

export function isUnlockRecipeModifier(
  modifier: Modifier
): modifier is UnlockRecipeModifier {
  return modifier.type === 'unlock-recipe';
}

export interface UnlockRecipeModifier extends Modifier {
  type: 'unlock-recipe';
  recipe: string;
}

export interface TechnologyUnit {
  ingredients: [string, number][];
  time: number;
}

export interface Technology {
  type: 'technology';
  name: string;
  unit: TechnologyUnit;
  prerequisites: string[];
  effects?: Modifier[];
}

export interface DataRawDump {
  'assembling-machine': Entities<AssemblingMachine>;
  item: Entities<Item>;
  recipe: Entities<Recipe>;
  'rocket-silo': Entities<RocketSilo>;
  technology: Entities<Technology>;
}

export interface Locale {
  names: Entities<string>;
}
