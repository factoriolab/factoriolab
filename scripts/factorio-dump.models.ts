import { Entities } from '~/models';

export interface ModList {
  mods: { name: string; enabled: boolean }[];
}

export interface PlayerData {
  'last-played-version': {
    game_version: string;
    build_version: number;
    build_mode: string;
    platform: string;
  };
}

export interface Base {
  name: string;
  type: string;
  localised_description?: string;
  localised_name?: string;
  order?: string;
}

export interface Color {
  r?: number;
  g?: number;
  b?: number;
  a?: number;
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
  dark_background_icons?: IconData[];
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
  rocket_launch_product?: Product;
  rocket_launch_products?: Product[];
  subgroup?: string;
  wire_count?: number;
}

export interface AmmoItem extends Item {
  ammo_type: unknown; // Not mapped
  magazine_size: number;
  reload_time: number;
}

export interface Capsule extends Item {
  capsule_action: unknown; // Not mapped
  radius_color?: Color;
}

export interface Gun extends Item {
  attack_parameters: unknown; // Not mapped
}

export interface ItemWithEntityData extends Item {
  icon_tintable_masks?: IconData[];
  icon_tintable_mask?: string;
  icon_tintables?: IconData[];
  icon_tintable?: string;
}

export interface EffectProperty {
  bonus?: number;
}

export const allEffects: (keyof Effect)[] = [
  'consumption',
  'speed',
  'productivity',
  'pollution',
];

export interface Effect {
  consumption?: EffectProperty;
  speed?: EffectProperty;
  productivity?: EffectProperty;
  pollution?: EffectProperty;
}

export interface TintTable {
  primary?: Color;
  secondary?: Color;
  tertiary?: Color;
  quaternary?: Color;
}

export interface Module extends Item {
  category: string;
  effect: Effect;
  tier: number;
  art_style?: string;
  beacon_tint?: TintTable;
  limitation?: string[];
  limitation_blacklist?: string[];
  limitation_message_key?: string;
  requires_beacon_alt_mode?: boolean;
}

export function isModule(proto: Base): proto is Module {
  return proto.type === 'module';
}

export interface RailPlanner extends Item {
  curved_rail: string;
  straight_rail: string;
}

export interface SpidertronRemote extends Item {
  icon_color_indicator_masks?: IconData[];
  icon_color_indicator_mask?: string;
}

export interface Tool extends Item {
  durability?: number;
  durability_description_key?: string;
  durability_description_value?: string;
  infinite?: boolean;
}

export interface Resistance {
  type: string;
  decrease?: number;
  percent?: number;
}

export interface Armor extends Tool {
  equipment_grid?: string;
  inventory_size_bonus?: number;
  resistances?: Resistance[];
}

export interface RepairTool extends Tool {
  speed: number;
  repair_result: unknown; // Not mapped
}

export interface Fluid extends Base, IconSpecification {
  type: 'fluid';
  base_color: Color;
  default_temperature: number;
  flow_color: Color;
  emissions_multiplier?: number;
  fuel_value?: string;
  gas_temperature?: number;
  heat_capacity?: string;
  hidden?: boolean;
  max_temperature?: boolean;
  subgroup?: string;
}

export function isFluid(proto: Base): proto is Fluid {
  return proto.type === 'fluid';
}

export interface ItemGroup extends Base, IconSpecification {
  order_in_recipe?: string;
}

export function isItemGroup(proto: Base): proto is ItemGroup {
  return proto.type === 'item-group';
}

export interface ItemSubGroup extends Base {
  group: string;
}

export type Ingredient = [string, number] | ItemIngredient | FluidIngredient;

export interface ItemIngredient {
  type?: 'item';
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
  proto: Ingredient
): proto is [string, number] {
  return Array.isArray(proto);
}

export function isItemIngredient(
  proto: ItemIngredient | FluidIngredient
): proto is ItemIngredient {
  return proto.type == null || proto.type === 'item';
}

export type Product = [string, number] | ItemProduct | FluidProduct;

export interface ItemProduct {
  type: 'item';
  name: string;
  amount?: number;
  probability?: number;
  amount_min?: number;
  amount_max?: number;
  catalyst_amount?: number;
}

export interface FluidProduct {
  type: 'fluid';
  name: string;
  probability?: number;
  amount?: number;
  amount_min?: number;
  amount_max?: number;
  temperature?: number;
  catalyst_amount?: number;
}

export function isSimpleProduct(proto: Product): proto is [string, number] {
  return Array.isArray(proto);
}

export function isItemProduct(
  proto: ItemProduct | FluidProduct
): proto is ItemProduct {
  return proto.type == null || proto.type === 'item';
}

export interface RecipeData {
  ingredients: Ingredient[];
  result?: string;
  result_count?: number;
  results?: (ItemProduct | FluidProduct)[];
  energy_required?: number;
  emissions_multiplier?: number;
  enabled?: boolean;
  hidden?: boolean;
}

export interface Recipe extends Base, IconSpecification, RecipeData {
  allow_as_intermediate?: boolean;
  allow_decomposition?: boolean;
  allow_inserter_overload?: boolean;
  allow_intermediates?: boolean;
  always_show_made_in?: boolean;
  always_show_products?: boolean;
  category?: string;
  crafting_machine_tint?: TintTable;
  expensive?: RecipeData | boolean;
  hide_from_player_crafting?: boolean;
  hide_from_stats?: boolean;
  main_product?: string;
  normal?: RecipeData | boolean;
  overload_multiplier?: number;
  requester_paste_multiplier?: number;
  show_amount_in_title?: boolean;
  subgroup?: string;
  unlock_results?: boolean;
}

export function isRecipe(proto: Base): proto is Recipe {
  return proto.type === 'recipe';
}

export interface Modifier {
  type: string;
}

export function isUnlockRecipeModifier(
  proto: Modifier
): proto is UnlockRecipeModifier {
  return proto.type === 'unlock-recipe';
}

export interface UnlockRecipeModifier extends Modifier {
  type: 'unlock-recipe';
  recipe: string;
}

export interface TechnologyUnit {
  ingredients: [string, number][];
  time: number;
}

export interface TechnologyData {
  unit: TechnologyUnit;
  effects?: Modifier[];
  enabled?: boolean;
  hidden?: boolean;
  ignore_tech_cost_multiplier?: boolean;
  max_level?: number | string;
  prerequisites: string[];
  upgrade?: boolean;
  visible_when_disabled?: boolean;
}

export interface Technology extends Base, TechnologyData, IconSpecification {
  type: 'technology';
  name: string;
  expensive?: TechnologyData;
  normal?: TechnologyData;
}

export function isTechnology(proto: Base): proto is Technology {
  return proto.type === 'technology';
}

export interface ElectricEnergySource {
  type: 'electric';
  emissions_per_minute?: number;
  drain?: string;
}

export interface BurnerEnergySource {
  type: 'burner';
  emissions_per_minute?: number;
  /** Default: 'chemical' */
  fuel_category?: string;
  fuel_categories?: string[];
}

export interface HeatEnergySource {
  type: 'heat';
  emissions_per_minute?: number;
}

export interface FluidEnergySource {
  type: 'fluid';
  emissions_per_minute?: number;
}

export interface VoidEnergySource {
  type: 'void';
  emissions_per_minute?: number;
}

export type EnergySource =
  | ElectricEnergySource
  | BurnerEnergySource
  | HeatEnergySource
  | FluidEnergySource
  | VoidEnergySource;

export interface ModuleSpecification {
  /** Default: 0 */
  module_slots?: number;
}

export interface Beacon extends Base {
  distribution_effectivity: number;
  energy_source: ElectricEnergySource | VoidEnergySource;
  energy_usage: string;
  module_specification: ModuleSpecification;
  supply_area_distance: number;
  allowed_effects?: (keyof Effect)[];
}

export interface Boiler extends Base {
  energy_consumption: string;
  energy_source: EnergySource;
  target_temperature: number;
}

export function isBoiler(proto: Base): proto is Boiler {
  return proto.type === 'boiler';
}

export interface CraftingMachine extends Base {
  crafting_categories: string[];
  crafting_speed: number;
  energy_source: EnergySource;
  energy_usage: string;
  allowed_effects?: (keyof Effect)[];
  module_specification?: ModuleSpecification;
}

export interface AssemblingMachine extends CraftingMachine {
  fixed_recipe?: string;
}

export function isAssemblingMachine(proto: Base): proto is AssemblingMachine {
  return proto.type === 'assembling-machine';
}

export interface RocketSilo extends AssemblingMachine {
  active_energy_usage: string;
  door_opening_speed: number;
  energy_usage: string;
  idle_energy_usage: string;
  lamp_energy_usage: string;
  light_blinking_speed: number;
  rocket_entity: string;
  rocket_parts_required: number;
  launch_wait_time?: number;
  rocket_rising_delay?: number;
}

export function isRocketSilo(proto: Base): proto is RocketSilo {
  return proto.type === 'rocket-silo';
}

export interface RocketSiloRocket extends Base {
  engine_starting_speed: number;
  flying_acceleration: number;
  flying_speed: number;
  rising_speed: number;
}

export interface Furnace extends CraftingMachine {
  result_inventory_size: number;
  source_inventory_size: number;
}

export function isFurnace(proto: Base): proto is Furnace {
  return proto.type === 'furnace';
}

export interface Lab extends Base {
  energy_source: EnergySource;
  energy_usage: string;
  allowed_effects?: (keyof Effect)[];
  module_specification?: ModuleSpecification;
  research_speed?: number;
}

export function isLab(proto: Base): proto is Lab {
  return proto.type === 'lab';
}

export interface MiningDrill extends Base {
  energy_source: EnergySource;
  energy_usage: string;
  mining_speed: number;
  resource_categories: string[];
  allowed_effects?: (keyof Effect)[];
  input_fluid_box?: object;
  module_specification?: ModuleSpecification;
}

export function isMiningDrill(proto: Base): proto is MiningDrill {
  return proto.type === 'mining-drill';
}

export interface OffshorePump extends Base {
  fluid: string;
  pumping_speed: number;
}

export function isOffshorePump(proto: Base): proto is OffshorePump {
  return proto.type === 'offshore-pump';
}

export interface Reactor extends Base {
  consumption: string;
  energy_source: EnergySource;
}

export function isReactor(proto: Base): proto is Reactor {
  return proto.type === 'reactor';
}

export interface TransportBelt extends Base {
  speed: number;
}

export interface CargoWagon extends Base {
  inventory_size: number;
}

export interface FluidWagon extends Base {
  capacity: number;
}

export interface MinableProperties {
  mining_time: number;
  results?: (ItemProduct | FluidProduct)[];
  result?: string;
  fluid_amount?: number;
  mining_particle?: string;
  required_fluid?: string;
  count?: number;
}

export interface ResourceEntity extends Base {
  category?: string;
  minable?: MinableProperties;
}

export interface DataRawDump {
  ammo: Entities<AmmoItem>;
  armor: Entities<Armor>;
  'assembling-machine': Entities<AssemblingMachine>;
  beacon: Entities<Beacon>;
  boiler: Entities<Boiler>;
  capsule: Entities<Capsule>;
  'cargo-wagon': Entities<CargoWagon>;
  fluid: Entities<Fluid>;
  'fluid-wagon': Entities<FluidWagon>;
  furnace: Entities<CraftingMachine>;
  gun: Entities<Gun>;
  item: Entities<Item>;
  'item-group': Entities<ItemGroup>;
  'item-subgroup': Entities<ItemSubGroup>;
  'item-with-entity-data': Entities<ItemWithEntityData>;
  lab: Entities<Lab>;
  'mining-drill': Entities<MiningDrill>;
  module: Entities<Module>;
  'offshore-pump': Entities<OffshorePump>;
  'rail-planner': Entities<RailPlanner>;
  reactor: Entities<Reactor>;
  recipe: Entities<Recipe>;
  'repair-tool': Entities<RepairTool>;
  resource: Entities<ResourceEntity>;
  'rocket-silo': Entities<RocketSilo>;
  'rocket-silo-rocket': Entities<RocketSiloRocket>;
  'spidertron-remote': Entities<SpidertronRemote>;
  technology: Entities<Technology>;
  tool: Entities<Tool>;
  'transport-belt': Entities<TransportBelt>;
}

export interface Locale {
  names: Entities<string>;
}
