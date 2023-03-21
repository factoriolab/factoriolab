import { Entities } from '~/models';

export interface Base {
  name: string;
  type: string;
  localised_description?: string;
  localised_name?: string;
  order?: string;
}

export interface Color {
  r: number;
  g: number;
  b: number;
}

export interface IconData {
  icon: string;
  icon_size: number;
  tint?: Color;
  shift?: [number, number];
  scale?: number;
  icon_mipmaps?: number;
}

export interface IconSpecification {
  icons?: IconData[];
  icon?: string;
  icon_size?: number;
  icon_mipmaps?: number;
}

export interface SoundAggregation {
  max_count: number;
  remove: boolean;
  progress_threshold?: number;
  count_already_playing?: boolean;
}

export interface SoundVariation {
  filename: string;
  volume?: number;
  preload?: boolean;
  speed?: number;
  min_speed?: number;
  max_speed?: number;
}

export interface Sound {
  aggregation?: SoundAggregation;
  allow_random_repeat?: boolean;
  audible_distance_modifier?: number;
  variations?: SoundVariation[];
  filename?: string;
  volume?: number;
  preload?: boolean;
  speed?: number;
  min_speed?: number;
  max_speed?: number;
}

export enum ItemFlag {
  DrawLogisticOverlay = 'draw-logistic-overlay',
  Hidden = 'hidden',
  AlwaysShow = 'always-show',
  HideFromBonusGui = 'hide-from-bonus-gui',
  HideFromFuelTooltip = 'hide-from-fuel-tooltip',
  NonStackable = 'non-stackable',
  CanExtendInventory = 'can-extend-inventory',
  PrimaryPlaceResult = 'primary-place-result',
  ModOpenable = 'mod-openable',
  OnlyInCursor = 'only-in-cursor',
  Spawnable = 'spawnable,',
}

export interface PlaceAsTile {
  result: string;
  condition: string[];
  condition_size: number;
}

export interface Item extends Base, IconSpecification {
  stack_size: number;
  burnt_result?: string;
  close_sound?: Sound;
  dark_background_icons?: IconSpecification[];
  dark_background_icon?: string;
  default_request_amount?: number;
  flags?: ItemFlag[];
  fuel_acceleration_multiplier?: number;
  fuel_category?: string;
  fuel_emissions_multiplier?: number;
  fuel_glow_color?: Color;
  fuel_top_speed_multiplier?: number;
  fuel_value?: string;
  open_sound?: Sound;
  pictures?: unknown[]; // Not mapped
  place_as_tile?: PlaceAsTile;
  place_result?: string;
  placed_as_equipment_result?: string;
  rocket_launch_product?: ItemProduct;
  rocket_launch_products?: ItemProduct[];
  subgroup?: string;
  wire_count?: number;
}

export interface AssemblingMachine extends Base {
  fixed_recipe?: string;
}

export interface RocketSilo extends AssemblingMachine {
  rocket_parts_required: number;
}

export type RecipeIngredient =
  | [string, number]
  | ItemIngredient
  | FluidIngredient;

export interface ItemIngredient {
  type: 'item';
  name: string;
  amount: number;
  catalyst_amount?: number;
}

export interface FluidIngredient {
  type: 'fluid';
  name: string;
  amount: number;
  temperature?: number;
  minimum_temperature?: number;
  maximum_temperature?: number;
  catalyst_amount?: number;
  fluidbox_index?: number;
}

export function isSimpleIngredient(
  value: RecipeIngredient
): value is [string, number] {
  return Array.isArray(value);
}

export function isItemIngredient(
  value: ItemIngredient | FluidIngredient
): value is ItemIngredient {
  return value.type === 'item';
}

export type RecipeProduct = [string, number] | ItemProduct | FluidProduct;

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

export function isSimpleProduct(
  value: RecipeProduct
): value is [string, number] {
  return Array.isArray(value);
}

export function isItemProduct(
  value: ItemProduct | FluidProduct
): value is ItemProduct {
  return value.type === 'item';
}

export interface RecipeData {
  ingredients: (ItemProduct | FluidProduct)[];
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
