/** Generated file, do not edit. See scripts/factorio-api.ts for generator. */

/**
 * Application: factorio
 * Version: 2.0.10
 * API Version: 6
 */

/** Entity with energy source with specialised animation for charging/discharging. Used for the [accumulator](https://wiki.factorio.com/Accumulator) entity. */
interface _AccumulatorPrototype {
  type: 'accumulator';
  chargable_graphics?: ChargableGraphics;
  circuit_connector?: CircuitConnectorDefinition;
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  /** The name of the signal that is the default for when an accumulator is connected to the circuit network. */
  default_output_signal?: SignalIDConnector;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** The capacity of the energy source buffer specifies the capacity of the accumulator. */
  energy_source: ElectricEnergySource;
}

export type AccumulatorPrototype = _AccumulatorPrototype &
  Omit<EntityWithOwnerPrototype, keyof _AccumulatorPrototype>;

export function isAccumulatorPrototype(
  value: unknown,
): value is AccumulatorPrototype {
  return (value as { type: string }).type === 'accumulator';
}

/** This prototype definition is used for the in-game achievements. */
interface _AchievementPrototype {
  type: 'achievement';
  /** If this is set to `false`, it is not possible to complete the achievement on the peaceful difficulty setting or when the enemy base generation settings have been changed. */
  allowed_without_fight?: boolean;
  /** Path to the icon file.

Mandatory if `icons` is not defined. */
  icon?: FileName;
  /** The size of the square icon, in pixels. E.g. `32` for a 32px by 32px icon. Must be larger than `0`.

The base game uses 128px icons for achievements.

Only loaded if `icons` is not defined. */
  icon_size?: SpriteSizeType;
  /** Can't be an empty array. */
  icons?: IconData[];
  /** Unusable by mods, as this refers to unlocking the achievement through Steam. */
  steam_stats_name?: string;
}

export type AchievementPrototype = _AchievementPrototype &
  Omit<Prototype, keyof _AchievementPrototype>;

export function isAchievementPrototype(
  value: unknown,
): value is AchievementPrototype {
  return (value as { type: string }).type === 'achievement';
}

interface _AchievementPrototypeWithCondition {
  objective_condition: 'game-finished' | 'rocket-launched';
}

export type AchievementPrototypeWithCondition =
  _AchievementPrototypeWithCondition &
    Omit<AchievementPrototype, keyof _AchievementPrototypeWithCondition>;
/** Used by [discharge defense](https://wiki.factorio.com/Discharge_defense) and [personal laser defense](https://wiki.factorio.com/Personal_laser_defense). */
interface _ActiveDefenseEquipmentPrototype {
  type: 'active-defense-equipment';
  attack_parameters: AttackParameters;
  automatic: boolean;
}

export type ActiveDefenseEquipmentPrototype = _ActiveDefenseEquipmentPrototype &
  Omit<EquipmentPrototype, keyof _ActiveDefenseEquipmentPrototype>;

export function isActiveDefenseEquipmentPrototype(
  value: unknown,
): value is ActiveDefenseEquipmentPrototype {
  return (value as { type: string }).type === 'active-defense-equipment';
}

/** The abstract base of all active trigger prototypes. Active triggers are a special type of trigger delivery mechanism that function of a period of time and do not result in the creation or deletion of entities to function. They are intended to be short-lived objects associated with a surface and cannot be cancelled until they self-destruct. Active triggers support migrations and prototype changes, but require their own named prototype to function. */

interface _ActiveTriggerPrototype {}

export type ActiveTriggerPrototype = _ActiveTriggerPrototype &
  Omit<Prototype, keyof _ActiveTriggerPrototype>;
interface _AgriculturalTowerPrototype {
  type: 'agricultural-tower';
  arm_extending_sound?: InterruptibleSound;
  arm_extending_sound_source?: string;
  central_orienting_sound?: InterruptibleSound;
  central_orienting_sound_source?: string;
  circuit_connector?: CircuitConnectorDefinition;
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  crane: AgriculturalCraneProperties;
  crane_energy_usage: Energy;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  energy_source: EnergySource;
  energy_usage: Energy;
  graphics_set?: CraftingMachineGraphicsSet;
  grappler_extending_sound?: InterruptibleSound;
  grappler_extending_sound_source?: string;
  grappler_orienting_sound?: InterruptibleSound;
  grappler_orienting_sound_source?: string;
  /** Must be positive. */
  growth_grid_tile_size?: number;
  harvesting_procedure_points?: Vector3D[];
  harvesting_sound?: Sound;
  input_inventory_size: ItemStackIndex;
  output_inventory_size?: ItemStackIndex;
  planting_procedure_points?: Vector3D[];
  planting_sound?: Sound;
  /** Must be positive. */
  radius: number;
  radius_visualisation_picture?: Sprite;
  /** Must be >= 0 and < 1. */
  random_growth_offset?: number;
}

export type AgriculturalTowerPrototype = _AgriculturalTowerPrototype &
  Omit<EntityWithOwnerPrototype, keyof _AgriculturalTowerPrototype>;

export function isAgriculturalTowerPrototype(
  value: unknown,
): value is AgriculturalTowerPrototype {
  return (value as { type: string }).type === 'agricultural-tower';
}

interface _AirbornePollutantPrototype {
  type: 'airborne-pollutant';
  affects_evolution: boolean;
  /** If true, large amounts of this pollution will cause water tiles to turn a sickly green. */
  affects_water_tint: boolean;
  chart_color: Color;
  icon: Sprite;
}

export type AirbornePollutantPrototype = _AirbornePollutantPrototype &
  Omit<Prototype, keyof _AirbornePollutantPrototype>;

export function isAirbornePollutantPrototype(
  value: unknown,
): value is AirbornePollutantPrototype {
  return (value as { type: string }).type === 'airborne-pollutant';
}

/** This prototype is used to make sound while playing the game. This includes the game's [music](https://store.steampowered.com/app/436090/Factorio__Soundtrack/), composed by Daniel James Taylor. */
export interface AmbientSound {
  /** Unique textual identification of the prototype. */
  name: string;
  /** Track without a planet is bound to space platforms. */
  planet?: SpaceLocationID;
  /** Static music track.

One of `sound` or `variable_sound` must be defined. Both cannot be defined together. */
  sound?: Sound;
  track_type: AmbientSoundType;
  /** Specification of the type of the prototype. */
  type: 'ambient-sound';
  /** Variable music track.

One of `sound` or `variable_sound` must be defined. Both cannot be defined together. */
  variable_sound?: VariableAmbientSoundVariableSound;
  /** Cannot be less than zero.

Cannot be defined if `track_type` is `"hero-track"`. */
  weight?: number;
}

export function isAmbientSound(value: unknown): value is AmbientSound {
  return (value as { type: string }).type === 'ambient-sound';
}

/** An ammo category. Each weapon has an ammo category, and can use any ammo with the same ammo category. Ammo categories can also be upgraded by technologies. */
interface _AmmoCategory {
  type: 'ammo-category';
  bonus_gui_order?: Order;
  /** Path to the icon file.

Only loaded if `icons` is not defined. */
  icon?: FileName;
  /** The size of the square icon, in pixels. E.g. `32` for a 32px by 32px icon. Must be larger than `0`.

Only loaded if `icons` is not defined. */
  icon_size?: SpriteSizeType;
  /** Can't be an empty array. */
  icons?: IconData[];
}

export type AmmoCategory = _AmmoCategory & Omit<Prototype, keyof _AmmoCategory>;

export function isAmmoCategory(value: unknown): value is AmmoCategory {
  return (value as { type: string }).type === 'ammo-category';
}

/** Ammo used for a gun. */
interface _AmmoItemPrototype {
  type: 'ammo';
  ammo_category: AmmoCategoryID;
  /** When using a plain [AmmoType](prototype:AmmoType) (no array), the ammo type applies to everything (`"default"`).

When using an array of AmmoTypes, they have the additional [AmmoType::source_type](prototype:AmmoType::source_type) property. */
  ammo_type: AmmoType | AmmoType[];
  /** Number of shots before ammo item is consumed. Must be >= `1`. */
  magazine_size?: number;
  /** Amount of extra time (in ticks) it takes to reload the weapon after depleting the magazine. Must be >= `0`. */
  reload_time?: number;
  shoot_protected?: boolean;
}

export type AmmoItemPrototype = _AmmoItemPrototype &
  Omit<ItemPrototype, keyof _AmmoItemPrototype>;

export function isAmmoItemPrototype(
  value: unknown,
): value is AmmoItemPrototype {
  return (value as { type: string }).type === 'ammo';
}

/** A turret that consumes [ammo items](prototype:AmmoItemPrototype). */
interface _AmmoTurretPrototype {
  type: 'ammo-turret';
  /** Shift of the "alt-mode icon" relative to the turret's position. */
  automated_ammo_count: ItemCountType;
  energy_per_shot?: Energy;
  energy_source?: ElectricEnergySource;
  inventory_size: ItemStackIndex;
  prepare_with_no_ammo?: boolean;
}

export type AmmoTurretPrototype = _AmmoTurretPrototype &
  Omit<TurretPrototype, keyof _AmmoTurretPrototype>;

export function isAmmoTurretPrototype(
  value: unknown,
): value is AmmoTurretPrototype {
  return (value as { type: string }).type === 'ammo-turret';
}

/** Specifies an animation that can be used with [LuaRendering::draw_animation](runtime:LuaRendering::draw_animation) at runtime. */
export interface AnimationPrototype {
  /** Only loaded if `layers` is not defined.

Modifier of the animation playing speed, the default of `1` means one animation frame per tick (60 fps). The speed of playing can often vary depending on the usage (output of steam engine for example). Has to be greater than `0`.

If `layers` are used, the `animation_speed` only has to be defined in one layer. All layers will run at the same speed. */
  animation_speed?: number;
  /** Only loaded if `layers` is not defined. */
  apply_runtime_tint?: boolean;
  /** Only loaded if `layers` is not defined. */
  apply_special_effect?: boolean;
  /** Only loaded if `layers` is not defined. */
  blend_mode?: BlendMode;
  /** Only loaded if `layers` is not defined. */
  dice?: number;
  /** Only loaded if `layers` is not defined. */
  dice_x?: number;
  /** Only loaded if `layers` is not defined. */
  dice_y?: number;
  /** Only loaded if `layers` is not defined.

Only one of `draw_as_shadow`, `draw_as_glow` and `draw_as_light` can be true. This takes precedence over `draw_as_light`.

Draws first as a normal sprite, then again as a light layer. See [https://forums.factorio.com/91682](https://forums.factorio.com/91682). */
  draw_as_glow?: boolean;
  /** Only loaded if `layers` is not defined.

Only one of `draw_as_shadow`, `draw_as_glow` and `draw_as_light` can be true. */
  draw_as_light?: boolean;
  /** Only loaded if `layers` is not defined.

Only one of `draw_as_shadow`, `draw_as_glow` and `draw_as_light` can be true. This takes precedence over `draw_as_glow` and `draw_as_light`. */
  draw_as_shadow?: boolean;
  /** Only loaded if `layers` is not defined. Mandatory if neither `stripes` nor `filenames` are defined.

The path to the sprite file to use. */
  filename?: FileName;
  /** Only loaded if neither `layers` nor `stripes` are defined. */
  filenames?: FileName[];
  /** Only loaded if `layers` is not defined. */
  flags?: SpriteFlags;
  /** Only loaded if `layers` is not defined.

Can't be `0`. */
  frame_count?: number;
  /** Only loaded if `layers` is not defined. */
  frame_sequence?: AnimationFrameSequence;
  /** Only loaded if `layers` is not defined.

Unused. */
  generate_sdf?: boolean;
  /** Only loaded if `layers` is not defined. Mandatory if `size` is not defined.

Height of one frame in pixels, from 0-4096. */
  height?: SpriteSizeType;
  /** Only loaded if `layers` is not defined. */
  invert_colors?: boolean;
  /** If this property is present, all Animation definitions have to be placed as entries in the array, and they will all be loaded from there. `layers` may not be an empty table. Each definition in the array may also have the `layers` property.

`animation_speed` and `max_advance` of the first layer are used for all layers. All layers will run at the same speed.

If this property is present, all other properties besides `name` and `type` are ignored. */
  layers?: Animation[];
  /** Only loaded if `layers` is not defined.

Once the specified number of pictures is loaded, other pictures are loaded on other line. This is to allow having longer animations in matrix, to input files with too high width. The game engine limits the width of any input files to 8192px, so it is compatible with most graphics cards. `0` means that all the pictures are in one horizontal line. */
  line_length?: number;
  /** Only loaded if `layers` is not defined. Mandatory if `filenames` is defined. */
  lines_per_file?: number;
  /** Only loaded if `layers` is not defined.

Minimal mode is entered when mod loading fails. You are in it when you see the gray box after (part of) the loading screen that tells you a mod error. Modders can ignore this property. */
  load_in_minimal_mode?: boolean;
  /** Only loaded if `layers` is not defined.

If `layers` are used, `max_advance` of the first layer is used for all layers.

Maximum amount of frames the animation can move forward in one update. */
  max_advance?: number;
  /** Only loaded if `layers` is not defined.

Only loaded if this is an icon, that is it has the flag `"group=icon"` or `"group=gui"`.

Note that `mipmap_count` doesn't make sense in an animation, as it is not possible to layout mipmaps in a way that would load both the animation and the mipmaps correctly (besides animations with just one frame). See [here](https://forums.factorio.com/viewtopic.php?p=549058#p549058). */
  mipmap_count?: number;
  /** Name of the animation. Can be used with [LuaRendering::draw_animation](runtime:LuaRendering::draw_animation) at runtime. */
  name: string;
  /** Only loaded if `layers` is not defined.

Loaded only when `x` and `y` are both `0`. The first member of the tuple is `x` and the second is `y`. */
  position?: [SpriteSizeType, SpriteSizeType];
  /** Only loaded if `layers` is not defined.

Whether alpha should be pre-multiplied. */
  premul_alpha?: boolean;
  /** Only loaded if `layers` is not defined. */
  priority?: SpritePriority;
  /** Only loaded if `layers` is not defined.

How many times to repeat the animation to complete an animation cycle. E.g. if one layer is 10 frames, a second layer of 1 frame would need `repeat_count = 10` to match the complete cycle. */
  repeat_count?: number;
  /** Only loaded if `layers` is not defined. */
  rotate_shift?: boolean;
  /** Only loaded if `layers` is not defined. */
  run_mode?: AnimationRunMode;
  /** Only loaded if `layers` is not defined.

Values other than `1` specify the scale of the sprite on default zoom. A scale of `2` means that the picture will be two times bigger on screen (and thus more pixelated). */
  scale?: number;
  /** Only loaded if `layers` is not defined.

The shift in tiles. `util.by_pixel()` can be used to divide the shift by 32 which is the usual pixel height/width of 1 tile in normal resolution. Note that 32 pixel tile height/width is not enforced anywhere - any other tile height or width is also possible. */
  shift?: Vector;
  /** Only loaded if `layers` is not defined.

The width and height of one frame. If this is a tuple, the first member of the tuple is the width and the second is the height. Otherwise the size is both width and height. Width and height may only be in the range of 0-4096. */
  size?: SpriteSizeType | [SpriteSizeType, SpriteSizeType];
  /** Only loaded if `layers` is not defined and if `filenames` is defined. */
  slice?: number;
  /** Only loaded if `layers` is not defined. */
  stripes?: Stripe[];
  /** Only loaded if `layers` is not defined.

Provides hint to sprite atlas system, so it can try to put sprites that are intended to be used at the same locations to the same sprite atlas. */
  surface?: SpriteUsageSurfaceHint;
  /** Only loaded if `layers` is not defined. */
  tint?: Color;
  /** Only loaded if `layers` is not defined. */
  tint_as_overlay?: boolean;
  type: 'animation';
  /** Only loaded if `layers` is not defined.

Provides hint to sprite atlas system, so it can pack sprites that are related to each other to the same sprite atlas. */
  usage?: SpriteUsageHint;
  /** Only loaded if `layers` is not defined. Mandatory if `size` is not defined.

Width of one frame in pixels, from 0-4096. */
  width?: SpriteSizeType;
  /** Only loaded if `layers` is not defined.

Horizontal position of the animation in the source file in pixels. */
  x?: SpriteSizeType;
  /** Only loaded if `layers` is not defined.

Vertical position of the animation in the source file in pixels. */
  y?: SpriteSizeType;
}

export function isAnimationPrototype(
  value: unknown,
): value is AnimationPrototype {
  return (value as { type: string }).type === 'animation';
}

/** An [arithmetic combinator](https://wiki.factorio.com/Arithmetic_combinator). */
interface _ArithmeticCombinatorPrototype {
  type: 'arithmetic-combinator';
  and_symbol_sprites?: Sprite4Way;
  divide_symbol_sprites?: Sprite4Way;
  left_shift_symbol_sprites?: Sprite4Way;
  minus_symbol_sprites?: Sprite4Way;
  modulo_symbol_sprites?: Sprite4Way;
  multiply_symbol_sprites?: Sprite4Way;
  or_symbol_sprites?: Sprite4Way;
  plus_symbol_sprites?: Sprite4Way;
  power_symbol_sprites?: Sprite4Way;
  right_shift_symbol_sprites?: Sprite4Way;
  xor_symbol_sprites?: Sprite4Way;
}

export type ArithmeticCombinatorPrototype = _ArithmeticCombinatorPrototype &
  Omit<CombinatorPrototype, keyof _ArithmeticCombinatorPrototype>;

export function isArithmeticCombinatorPrototype(
  value: unknown,
): value is ArithmeticCombinatorPrototype {
  return (value as { type: string }).type === 'arithmetic-combinator';
}

/** Armor to wear on your in-game [character](prototype:CharacterPrototype) for defense and buffs. */
interface _ArmorPrototype {
  type: 'armor';
  collision_box?: BoundingBox;
  drawing_box?: BoundingBox;
  /** Name of the [EquipmentGridPrototype](prototype:EquipmentGridPrototype) that this armor has. */
  equipment_grid?: EquipmentGridID;
  /** Only loaded if `provides_flight` is `true`. */
  flight_sound?: InterruptibleSound;
  /** By how many slots the inventory of the player is expanded when the armor is worn. */
  inventory_size_bonus?: ItemStackIndex;
  /** Only loaded if `provides_flight` is `true`. */
  landing_sound?: Sound;
  moving_sound?: Sound;
  provides_flight?: boolean;
  /** What amount of damage the armor takes on what type of damage is incoming. */
  resistances?: Resistance[];
  steps_sound?: Sound;
  /** Only loaded if `provides_flight` is `true`. */
  takeoff_sound?: Sound;
}

export type ArmorPrototype = _ArmorPrototype &
  Omit<ToolPrototype, keyof _ArmorPrototype>;

export function isArmorPrototype(value: unknown): value is ArmorPrototype {
  return (value as { type: string }).type === 'armor';
}

/** The arrows used for example in the campaign, they are literally just arrows. */
interface _ArrowPrototype {
  type: 'arrow';
  arrow_picture: Sprite;
  blinking?: boolean;
  circle_picture?: Sprite;
}

export type ArrowPrototype = _ArrowPrototype &
  Omit<EntityPrototype, keyof _ArrowPrototype>;

export function isArrowPrototype(value: unknown): value is ArrowPrototype {
  return (value as { type: string }).type === 'arrow';
}

/** The entity spawned by the [artillery targeting remote](https://wiki.factorio.com/Artillery_targeting_remote). */
interface _ArtilleryFlarePrototype {
  type: 'artillery-flare';
  creation_shift?: Vector;
  /** How long this flare stays alive after `shots_per_flare` amount of shots have been shot at it. */
  early_death_ticks?: number;
  ended_in_water_trigger_effect?: TriggerEffect;
  initial_frame_speed?: number;
  initial_height?: number;
  initial_speed?: Vector;
  initial_vertical_speed?: number;
  life_time: number;
  map_color: Color;
  movement_modifier?: number;
  movement_modifier_when_on_ground?: number;
  /** Picture variation count and individual frame count must be equal to shadow variation count. */
  pictures?: AnimationVariations;
  regular_trigger_effect?: TriggerEffect;
  regular_trigger_effect_frequency?: number;
  render_layer?: RenderLayer;
  render_layer_when_on_ground?: RenderLayer;
  /** The entity with the higher number is selectable before the entity with the lower number. */
  selection_priority?: number;
  /** Shadow variation variation count and individual frame count must be equal to picture variation count. */
  shadows?: AnimationVariations;
  shot_category?: AmmoCategoryID;
  /** How many artillery shots should be fired at the position of this flare. */
  shots_per_flare?: number;
}

export type ArtilleryFlarePrototype = _ArtilleryFlarePrototype &
  Omit<EntityPrototype, keyof _ArtilleryFlarePrototype>;

export function isArtilleryFlarePrototype(
  value: unknown,
): value is ArtilleryFlarePrototype {
  return (value as { type: string }).type === 'artillery-flare';
}

/** The projectile shot by [artillery](https://wiki.factorio.com/Artillery). */
interface _ArtilleryProjectilePrototype {
  type: 'artillery-projectile';
  action?: Trigger;
  chart_picture?: Sprite;
  /** Must have a collision box size of zero. */
  collision_box?: BoundingBox;
  final_action?: Trigger;
  height_from_ground?: number;
  map_color: Color;
  picture?: Sprite;
  reveal_map: boolean;
  /** Whether the picture of the projectile is rotated to match the direction of travel. */
  rotatable?: boolean;
  shadow?: Sprite;
}

export type ArtilleryProjectilePrototype = _ArtilleryProjectilePrototype &
  Omit<EntityPrototype, keyof _ArtilleryProjectilePrototype>;

export function isArtilleryProjectilePrototype(
  value: unknown,
): value is ArtilleryProjectilePrototype {
  return (value as { type: string }).type === 'artillery-projectile';
}

/** An [artillery turret](https://wiki.factorio.com/Artillery_turret). */
interface _ArtilleryTurretPrototype {
  type: 'artillery-turret';
  alert_when_attacking?: boolean;
  /** Must be > 0. */
  ammo_stack_limit: ItemCountType;
  automated_ammo_count: ItemCountType;
  base_picture?: Animation4Way;
  base_picture_render_layer?: RenderLayer;
  base_picture_secondary_draw_order?: number;
  /** Only loaded if `cannon_barrel_recoil_shiftings` is loaded. */
  cannon_barrel_light_direction?: Vector3D;
  cannon_barrel_pictures?: RotatedSprite;
  cannon_barrel_recoil_shiftings?: Vector3D[];
  /** Only loaded if `cannon_barrel_recoil_shiftings` is loaded. */
  cannon_barrel_recoil_shiftings_load_correction_matrix?: Vector3D[];
  cannon_base_pictures?: RotatedSprite;
  cannon_base_shift: Vector3D;
  cannon_parking_frame_count?: number;
  /** Must be positive. */
  cannon_parking_speed?: number;
  circuit_connector?: CircuitConnectorDefinition;
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  disable_automatic_firing?: boolean;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** Name of a [GunPrototype](prototype:GunPrototype). */
  gun: ItemID;
  /** Must be > 0. */
  inventory_size: ItemStackIndex;
  /** Whether this prototype should be a high priority target for enemy forces. See [Military units and structures](https://wiki.factorio.com/Military_units_and_structures). */
  is_military_target?: boolean;
  /** Must be positive. */
  manual_range_modifier: number;
  rotating_sound?: InterruptibleSound;
  turn_after_shooting_cooldown?: number;
  turret_rotation_speed: number;
}

export type ArtilleryTurretPrototype = _ArtilleryTurretPrototype &
  Omit<EntityWithOwnerPrototype, keyof _ArtilleryTurretPrototype>;

export function isArtilleryTurretPrototype(
  value: unknown,
): value is ArtilleryTurretPrototype {
  return (value as { type: string }).type === 'artillery-turret';
}

/** An [artillery wagon](https://wiki.factorio.com/Artillery_wagon). */
interface _ArtilleryWagonPrototype {
  type: 'artillery-wagon';
  /** Must be > 0. */
  ammo_stack_limit: ItemCountType;
  /** Only loaded if `cannon_barrel_recoil_shiftings` is loaded. */
  cannon_barrel_light_direction?: Vector3D;
  cannon_barrel_pictures?: RollingStockRotatedSlopedGraphics;
  cannon_barrel_recoil_shiftings?: Vector3D[];
  /** Only loaded if `cannon_barrel_recoil_shiftings` is loaded. */
  cannon_barrel_recoil_shiftings_load_correction_matrix?: Vector3D[];
  cannon_base_height?: number;
  cannon_base_pictures?: RollingStockRotatedSlopedGraphics;
  cannon_base_shift_when_horizontal?: number;
  cannon_base_shift_when_vertical?: number;
  cannon_parking_frame_count?: number;
  /** Must be positive. */
  cannon_parking_speed?: number;
  disable_automatic_firing?: boolean;
  /** Name of a [GunPrototype](prototype:GunPrototype). */
  gun: ItemID;
  /** Must be > 0. */
  inventory_size: ItemStackIndex;
  /** Must be > 0. */
  manual_range_modifier: number;
  rotating_sound?: InterruptibleSound;
  turn_after_shooting_cooldown?: number;
  turret_rotation_speed: number;
}

export type ArtilleryWagonPrototype = _ArtilleryWagonPrototype &
  Omit<RollingStockPrototype, keyof _ArtilleryWagonPrototype>;

export function isArtilleryWagonPrototype(
  value: unknown,
): value is ArtilleryWagonPrototype {
  return (value as { type: string }).type === 'artillery-wagon';
}

/** An assembling machine - like the assembling machines 1/2/3 in the game, but you can use your own recipe categories. */
interface _AssemblingMachinePrototype {
  type: 'assembling-machine';
  circuit_connector?: [
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
  ];
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  default_recipe_finished_signal?: SignalIDConnector;
  default_working_signal?: SignalIDConnector;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  enable_logistic_control_behavior?: boolean;
  fixed_quality?: QualityID;
  /** The preset recipe of this machine. This machine does not show a recipe selection if this is set. The base game uses this for the [rocket silo](https://wiki.factorio.com/Rocket_silo). */
  fixed_recipe?: RecipeID;
  fluid_boxes_off_when_no_fluid_recipe?: boolean;
  /** The locale key of the title of the GUI that is shown when the player opens the assembling machine. May not be longer than 200 characters. */
  gui_title_key?: string;
  /** Sets the maximum number of ingredients this machine can craft with. Any recipe with more ingredients than this will be unavailable in this machine.

This only counts item ingredients, not fluid ingredients! This means if ingredient count is 2, and the recipe has 2 item ingredients and 1 fluid ingredient, it can still be crafted in the machine. */
  ingredient_count?: number;
}

export type AssemblingMachinePrototype = _AssemblingMachinePrototype &
  Omit<CraftingMachinePrototype, keyof _AssemblingMachinePrototype>;

export function isAssemblingMachinePrototype(
  value: unknown,
): value is AssemblingMachinePrototype {
  return (value as { type: string }).type === 'assembling-machine';
}

interface _AsteroidChunkPrototype {
  type: 'asteroid-chunk';
  collision_box?: SimpleBoundingBox;
  dying_trigger_effect?: TriggerEffect;
  graphics_set?: AsteroidGraphicsSet;
  hide_from_signal_gui?: boolean;
  /** Path to the icon file.

Mandatory if `icons` is not defined. */
  icon?: FileName;
  /** The size of the square icon, in pixels. E.g. `32` for a 32px by 32px icon. Must be larger than `0`.

Only loaded if `icons` is not defined. */
  icon_size?: SpriteSizeType;
  /** Can't be an empty array. */
  icons?: IconData[];
  minable?: MinableProperties;
}

export type AsteroidChunkPrototype = _AsteroidChunkPrototype &
  Omit<Prototype, keyof _AsteroidChunkPrototype>;

export function isAsteroidChunkPrototype(
  value: unknown,
): value is AsteroidChunkPrototype {
  return (value as { type: string }).type === 'asteroid-chunk';
}

interface _AsteroidCollectorPrototype {
  type: 'asteroid-collector';
  arm_angular_speed_cap_base?: number;
  arm_angular_speed_cap_quality_scaling?: number;
  arm_color_gradient?: Color[];
  arm_count_base?: number;
  arm_count_quality_scaling?: number;
  arm_energy_usage: Energy;
  arm_extend_sound?: Sound;
  arm_inventory_size?: ItemStackIndex;
  arm_inventory_size_quality_increase?: ItemStackIndex;
  arm_retract_sound?: Sound;
  /** If `arm_energy_usage` is not met, attempts to move slower at the cost of `arm_slow_energy_usage`. */
  arm_slow_energy_usage: Energy;
  arm_speed_base?: number;
  arm_speed_quality_scaling?: number;
  circuit_connector?: [
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
  ];
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  collection_box_offset?: number;
  /** Must be positive. */
  collection_radius: number;
  deposit_radius?: number;
  deposit_sound?: Sound;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  energy_source: ElectricEnergySource | VoidEnergySource;
  energy_usage_quality_scaling?: number;
  graphics_set: AsteroidCollectorGraphicsSet;
  head_collection_radius?: number;
  held_items_display_count?: number;
  held_items_offset?: number;
  held_items_spread?: number;
  inventory_size?: ItemStackIndex;
  inventory_size_quality_increase?: ItemStackIndex;
  minimal_arm_swing_segment_retraction?: number;
  munch_sound?: Sound;
  passive_energy_usage: Energy;
  radius_visualisation_picture?: Sprite;
  tether_size?: number;
  unpowered_arm_speed_scale?: number;
}

export type AsteroidCollectorPrototype = _AsteroidCollectorPrototype &
  Omit<EntityWithOwnerPrototype, keyof _AsteroidCollectorPrototype>;

export function isAsteroidCollectorPrototype(
  value: unknown,
): value is AsteroidCollectorPrototype {
  return (value as { type: string }).type === 'asteroid-collector';
}

interface _AsteroidPrototype {
  type: 'asteroid';
  /** Emissions cannot be larger than zero, asteroids cannot produce pollution. */
  emissions_per_second?: Record<AirbornePollutantID, number>;
  graphics_set?: AsteroidGraphicsSet;
  mass?: number;
}

export type AsteroidPrototype = _AsteroidPrototype &
  Omit<EntityWithOwnerPrototype, keyof _AsteroidPrototype>;

export function isAsteroidPrototype(
  value: unknown,
): value is AsteroidPrototype {
  return (value as { type: string }).type === 'asteroid';
}

/** A setting in the map creation GUI. Used by the [autoplace system](prototype:AutoplaceSpecification::control). */
interface _AutoplaceControl {
  type: 'autoplace-control';
  /** Whether there is an "enable" checkbox for the autoplace control in the map generator GUI. If this is false, the autoplace control cannot be disabled from the GUI. */
  can_be_disabled?: boolean;
  /** Controls in what tab the autoplace is shown in the map generator GUI. */
  category: 'resource' | 'terrain' | 'cliff' | 'enemy';
  /** Sets whether this control's richness can be changed. The map generator GUI will only show the richness slider when the `category` is `"resource"`.

If the autoplace control is used to generate ores, you probably want this to be true. */
  richness?: boolean;
}

export type AutoplaceControl = _AutoplaceControl &
  Omit<Prototype, keyof _AutoplaceControl>;

export function isAutoplaceControl(value: unknown): value is AutoplaceControl {
  return (value as { type: string }).type === 'autoplace-control';
}

/** Used by [personal battery](https://wiki.factorio.com/Personal_battery). */

interface _BatteryEquipmentPrototype {
  type: 'battery-equipment';
}

export type BatteryEquipmentPrototype = _BatteryEquipmentPrototype &
  Omit<EquipmentPrototype, keyof _BatteryEquipmentPrototype>;

export function isBatteryEquipmentPrototype(
  value: unknown,
): value is BatteryEquipmentPrototype {
  return (value as { type: string }).type === 'battery-equipment';
}

/** Entity with the ability to transfer [module](prototype:ModulePrototype) effects to its neighboring entities. */
interface _BeaconPrototype {
  type: 'beacon';
  /** The types of [modules](prototype:ModulePrototype) that a player can place inside of the beacon. */
  allowed_effects?: EffectTypeLimitation;
  /** Sets the [module categories](prototype:ModuleCategory) that are allowed to be inserted into this machine. */
  allowed_module_categories?: ModuleCategoryID[];
  /** Only loaded if `graphics_set` is not defined.

The animation for the beacon, when in use. */
  animation?: Animation;
  /** Only loaded if `graphics_set` is not defined.

The picture of the beacon when it is not on. */
  base_picture?: Animation;
  /** The beacon counter used by effect receiver when deciding which sample to take from `profile`. */
  beacon_counter?: 'total' | 'same_type';
  /** The multiplier of the module's effects, when shared between neighbors. */
  distribution_effectivity: number;
  /** Must be 0 or positive. */
  distribution_effectivity_bonus_per_quality_level?: number;
  energy_source: ElectricEnergySource | VoidEnergySource;
  /** The constant power usage of this beacon. */
  energy_usage: Energy;
  /** The graphics for the beacon. */
  graphics_set?: BeaconGraphicsSet;
  /** The number of module slots in this beacon. */
  module_slots: ItemStackIndex;
  /** Affects animation speed. */
  perceived_performance?: PerceivedPerformance;
  /** Extra multiplier applied to the effects received from beacon by the effect receiver based on amount of beacons that are in range of that effect receiver.

If there are more beacons that reach the effect receiver than there are entries in this array, then the last entry in the array is used for the multiplier.

If this is not defined, then an implicit profile of `{1}` will be used. */
  profile?: number[];
  radius_visualisation_picture?: Sprite;
  /** The maximum distance that this beacon can supply its neighbors with its module's effects. Max distance is 64. */
  supply_area_distance: number;
}

export type BeaconPrototype = _BeaconPrototype &
  Omit<EntityWithOwnerPrototype, keyof _BeaconPrototype>;

export function isBeaconPrototype(value: unknown): value is BeaconPrototype {
  return (value as { type: string }).type === 'beacon';
}

/** Used as a laser beam. */
interface _BeamPrototype {
  type: 'beam';
  action?: Trigger;
  /** Whether this beams should trigger its action every `damage_interval`. If false, the action is instead triggered when its owner triggers shooting. */
  action_triggered_automatically?: boolean;
  /** Damage interval can't be 0. A value of 1 will cause the attack to be applied each tick. */
  damage_interval: number;
  graphics_set: BeamGraphicsSet;
  random_target_offset?: boolean;
  target_offset?: Vector;
  width: number;
}

export type BeamPrototype = _BeamPrototype &
  Omit<EntityPrototype, keyof _BeamPrototype>;

export function isBeamPrototype(value: unknown): value is BeamPrototype {
  return (value as { type: string }).type === 'beam';
}

/** Used by [belt immunity equipment](https://wiki.factorio.com/Belt_immunity_equipment). */
interface _BeltImmunityEquipmentPrototype {
  type: 'belt-immunity-equipment';
  /** The continuous power consumption of the belt immunity equipment. */
  energy_consumption: Energy;
}

export type BeltImmunityEquipmentPrototype = _BeltImmunityEquipmentPrototype &
  Omit<EquipmentPrototype, keyof _BeltImmunityEquipmentPrototype>;

export function isBeltImmunityEquipmentPrototype(
  value: unknown,
): value is BeltImmunityEquipmentPrototype {
  return (value as { type: string }).type === 'belt-immunity-equipment';
}

/** A [blueprint book](https://wiki.factorio.com/Blueprint_book). */
interface _BlueprintBookPrototype {
  type: 'blueprint-book';
  /** If the item will draw its label when held in the cursor in place of the item count. */
  draw_label_for_cursor_render?: boolean;
  /** The inventory size of the item. */
  inventory_size: ItemStackIndex | 'dynamic';
  /** Count of items of the same name that can be stored in one inventory slot. Must be 1 when the `"not-stackable"` flag is set. */
  stack_size: 1;
}

export type BlueprintBookPrototype = _BlueprintBookPrototype &
  Omit<ItemWithInventoryPrototype, keyof _BlueprintBookPrototype>;

export function isBlueprintBookPrototype(
  value: unknown,
): value is BlueprintBookPrototype {
  return (value as { type: string }).type === 'blueprint-book';
}

/** A [blueprint](https://wiki.factorio.com/Blueprint). */
interface _BlueprintItemPrototype {
  type: 'blueprint';
  /** The [SelectionModeData::mode](prototype:SelectionModeData::mode) is hardcoded to `"blueprint"`.

The filters are parsed, but then ignored and forced to be empty. */
  alt_select: SelectionModeData;
  /** This property is hardcoded to `false`. */
  always_include_tiles?: boolean;
  /** Whether the item will draw its label when held in the cursor in place of the item count. */
  draw_label_for_cursor_render?: boolean;
  /** The [SelectionModeData::mode](prototype:SelectionModeData::mode) is hardcoded to `"blueprint"`.

The filters are parsed, but then ignored and forced to be empty. */
  select: SelectionModeData;
  /** Count of items of the same name that can be stored in one inventory slot. Must be 1 when the `"not-stackable"` flag is set. */
  stack_size: 1;
}

export type BlueprintItemPrototype = _BlueprintItemPrototype &
  Omit<SelectionToolPrototype, keyof _BlueprintItemPrototype>;

export function isBlueprintItemPrototype(
  value: unknown,
): value is BlueprintItemPrototype {
  return (value as { type: string }).type === 'blueprint';
}

/** A [boiler](https://wiki.factorio.com/Boiler). It heats fluid and optionally outputs it as a different fluid. */
interface _BoilerPrototype {
  type: 'boiler';
  /** Controls for how many ticks the boiler will show the fire and fire_glow after the energy source runs out of energy.

Note that `fire` and `fire_glow` alpha is set to the light intensity of the energy source, so 0 light intensity means the fire is invisible. For burner energy sources, the light intensity will reach zero rather quickly after the boiler runs out of fuel, effectively capping the time that `fire` and `fire_glow` will be shown after the boiler runs out of fuel. */
  burning_cooldown: number;
  energy_consumption: Energy;
  energy_source: EnergySource;
  /** If this is set to false, `fire` alpha is always 1 instead of being controlled by the light intensity of the energy source. */
  fire_flicker_enabled?: boolean;
  /** If this is set to false, `fire_glow` alpha is always 1 instead of being controlled by the light intensity of the energy source. */
  fire_glow_flicker_enabled?: boolean;
  /** The input fluid box.

If `mode` is `"heat-fluid-inside"`, the fluid is heated up directly in this fluidbox. */
  fluid_box: FluidBox;
  /** In the `"heat-fluid-inside"` mode, fluid in the `fluid_box` is continuously heated from the input temperature up to its [FluidPrototype::max_temperature](prototype:FluidPrototype::max_temperature).

In the `"output-to-separate-pipe"` mode, fluid is transferred from the `fluid_box` to the `output_fluid_box` when enough energy is available to [heat](prototype:FluidPrototype::heat_capacity) the input fluid to the `target_temperature`. Setting a filter on the `output_fluid_box` means that instead of the heated input fluid getting moved to the output, it is converted to the filtered fluid in a 1:1 ratio. */
  mode?: 'heat-fluid-inside' | 'output-to-separate-pipe';
  /** The output fluid box.

If `mode` is `"output-to-separate-pipe"` and this has a [filter](prototype:FluidBox::filter), the heated input fluid is converted to the output fluid that is set in the filter (in a 1:1 ratio).

If `mode` is `"heat-fluid-inside"`, this fluidbox is unused. */
  output_fluid_box: FluidBox;
  pictures?: BoilerPictureSet;
  /** Only loaded, and mandatory if `mode` is `"output-to-separate-pipe"`. This is the temperature that the input fluid must reach to be moved to the output fluid box. */
  target_temperature?: number;
}

export type BoilerPrototype = _BoilerPrototype &
  Omit<EntityWithOwnerPrototype, keyof _BoilerPrototype>;

export function isBoilerPrototype(value: unknown): value is BoilerPrototype {
  return (value as { type: string }).type === 'boiler';
}

/** This prototype is used for receiving an achievement when the player builds an entity. */
interface _BuildEntityAchievementPrototype {
  type: 'build-entity-achievement';
  /** How many entities need to be built. */
  amount?: number;
  /** If this is false, the player carries over their statistics from this achievement through all their saves. */
  limited_to_one_game?: boolean;
  /** This will trigger the achievement, if this entity is placed. */
  to_build: EntityID;
  /** The achievement must be completed within this time limit. */
  within?: MapTick;
}

export type BuildEntityAchievementPrototype = _BuildEntityAchievementPrototype &
  Omit<AchievementPrototype, keyof _BuildEntityAchievementPrototype>;

export function isBuildEntityAchievementPrototype(
  value: unknown,
): value is BuildEntityAchievementPrototype {
  return (value as { type: string }).type === 'build-entity-achievement';
}

/** An entity that produces power from a burner energy source. */
interface _BurnerGeneratorPrototype {
  type: 'burner-generator';
  /** Whether the `idle_animation` should also play when the generator is active. */
  always_draw_idle_animation?: boolean;
  /** Plays when the generator is active. `idle_animation` must have the same frame count as animation. */
  animation?: Animation4Way;
  /** The input energy source of the generator. */
  burner: BurnerEnergySource;
  /** The output energy source of the generator. Any emissions specified on this energy source are ignored, they must be specified on `burner`. */
  energy_source: ElectricEnergySource;
  /** Plays when the generator is inactive. Idle animation must have the same frame count as `animation`. */
  idle_animation?: Animation4Way;
  /** How much energy this generator can produce. */
  max_power_output: Energy;
  /** Affects animation speed. */
  perceived_performance?: PerceivedPerformance;
}

export type BurnerGeneratorPrototype = _BurnerGeneratorPrototype &
  Omit<EntityWithOwnerPrototype, keyof _BurnerGeneratorPrototype>;

export function isBurnerGeneratorPrototype(
  value: unknown,
): value is BurnerGeneratorPrototype {
  return (value as { type: string }).type === 'burner-generator';
}

/** Set of data affecting tooltips, looks of gui slots etc when [burner](prototype:BurnerEnergySource) is not supposed to be burning items but eating them. */
interface _BurnerUsagePrototype {
  type: 'burner-usage';
  accepted_fuel_key: string;
  burned_in_key: string;
  empty_slot_caption: LocalisedString;
  empty_slot_description?: LocalisedString;
  empty_slot_sprite: Sprite;
  icon: Sprite;
  no_fuel_status?: LocalisedString;
}

export type BurnerUsagePrototype = _BurnerUsagePrototype &
  Omit<Prototype, keyof _BurnerUsagePrototype>;

export function isBurnerUsagePrototype(
  value: unknown,
): value is BurnerUsagePrototype {
  return (value as { type: string }).type === 'burner-usage';
}

/** A capsule, for example a [combat robot capsule](https://wiki.factorio.com/Combat_robot_capsules) or the [raw fish](https://wiki.factorio.com/Raw_fish). */
interface _CapsulePrototype {
  type: 'capsule';
  capsule_action: CapsuleAction;
  /** Color of the range radius that is shown around the player when they hold the capsule. */
  radius_color?: Color;
}

export type CapsulePrototype = _CapsulePrototype &
  Omit<ItemPrototype, keyof _CapsulePrototype>;

export function isCapsulePrototype(value: unknown): value is CapsulePrototype {
  return (value as { type: string }).type === 'capsule';
}

interface _CaptureRobotPrototype {
  type: 'capture-robot';
  capture_animation?: Animation;
  /** Must be >= 0.001. */
  capture_speed?: number;
  destroy_action?: Trigger;
  /** Must be >= 0.0. */
  search_radius?: number;
}

export type CaptureRobotPrototype = _CaptureRobotPrototype &
  Omit<FlyingRobotPrototype, keyof _CaptureRobotPrototype>;

export function isCaptureRobotPrototype(
  value: unknown,
): value is CaptureRobotPrototype {
  return (value as { type: string }).type === 'capture-robot';
}

/** Entity with specialized properties for acceleration, braking, and turning. */
interface _CarPrototype {
  type: 'car';
  /** Animation speed 1 means 1 frame per tile. */
  animation?: RotatedAnimation;
  /** If this car prototype keeps the trunk inventory sorted. */
  auto_sort_inventory?: boolean;
  consumption: Energy;
  darkness_to_render_light_animation?: number;
  /** Modifies the efficiency of energy transfer from burner output to wheels. */
  effectivity: number;
  energy_source: BurnerEnergySource | VoidEnergySource;
  /** The names of the  [GunPrototype](prototype:GunPrototype)s this car prototype uses. */
  guns?: ItemID[];
  /** If this car is immune to movement by belts. */
  has_belt_immunity?: boolean;
  /** If this car gets damaged by driving against [cliffs](prototype:CliffPrototype). */
  immune_to_cliff_impacts?: boolean;
  /** If this car gets damaged by driving over/against [rocks](prototype:SimpleEntityPrototype::count_as_rock_for_filtered_deconstruction). */
  immune_to_rock_impacts?: boolean;
  /** If this car gets damaged by driving over/against [trees](prototype:TreePrototype). */
  immune_to_tree_impacts?: boolean;
  /** Size of the car inventory. */
  inventory_size: ItemStackIndex;
  light?: LightDefinition;
  /** Must have the same frame count as `animation`. */
  light_animation?: RotatedAnimation;
  render_layer?: RenderLayer;
  rotation_speed: number;
  sound_no_fuel?: Sound;
  /** If this car prototype uses tank controls to drive. */
  tank_driving?: boolean;
  track_particle_triggers?: FootstepTriggerEffectList;
  /** If set to 0 then the car will not have a Logistics tab. */
  trash_inventory_size?: ItemStackIndex;
  /** Animation speed 1 means 1 frame per tile. */
  turret_animation?: RotatedAnimation;
  /** Timeout in ticks specifying how long the turret must be inactive to return to the default position. */
  turret_return_timeout?: number;
  turret_rotation_speed?: number;
}

export type CarPrototype = _CarPrototype &
  Omit<VehiclePrototype, keyof _CarPrototype>;

export function isCarPrototype(value: unknown): value is CarPrototype {
  return (value as { type: string }).type === 'car';
}

interface _CargoBayPrototype {
  type: 'cargo-bay';
  /** Has to be 2 for 2x2 grid. */
  build_grid_size?: 2;
  graphics_set?: CargoBayConnectableGraphicsSet;
  hatch_definitions?: CargoHatchDefinition[];
  /** Cannot be 0. */
  inventory_size_bonus: ItemStackIndex;
  /** A special variant which renders on space platforms. If not specified, the game will fall back to the regular graphics set. */
  platform_graphics_set?: CargoBayConnectableGraphicsSet;
}

export type CargoBayPrototype = _CargoBayPrototype &
  Omit<EntityWithOwnerPrototype, keyof _CargoBayPrototype>;

export function isCargoBayPrototype(
  value: unknown,
): value is CargoBayPrototype {
  return (value as { type: string }).type === 'cargo-bay';
}

interface _CargoLandingPadPrototype {
  type: 'cargo-landing-pad';
  cargo_station_parameters: CargoStationParameters;
  circuit_connector?: CircuitConnectorDefinition;
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  graphics_set?: CargoBayConnectableGraphicsSet;
  inventory_size: ItemStackIndex;
  radar_range?: number;
  /** Drawn when a robot brings/takes items from this landing pad. */
  robot_animation?: Animation;
  /** Played when a robot brings/takes items from this landing pad. Ignored if `robot_animation` is not defined. */
  robot_animation_sound?: Sound;
  /** The offset from the center of this landing pad where a robot visually brings/takes items. */
  robot_landing_location_offset?: Vector;
  robot_opened_duration?: number;
  trash_inventory_size?: ItemStackIndex;
}

export type CargoLandingPadPrototype = _CargoLandingPadPrototype &
  Omit<EntityWithOwnerPrototype, keyof _CargoLandingPadPrototype>;

export function isCargoLandingPadPrototype(
  value: unknown,
): value is CargoLandingPadPrototype {
  return (value as { type: string }).type === 'cargo-landing-pad';
}

interface _CargoPodPrototype {
  type: 'cargo-pod';
  /** Has to be of type 'pod-catalogue'. */
  default_graphic?: ProcessionGraphic;
  /** Has to be of type 'pod-catalogue'. */
  default_shadow_graphic?: ProcessionGraphic;
  inventory_size: ItemStackIndex;
  procession_audio_catalogue?: ProcessionAudioCatalogue;
  procession_graphic_catalogue?: ProcessionGraphicCatalogue;
  shadow_slave_entity?: EntityID;
  spawned_container: EntityID;
}

export type CargoPodPrototype = _CargoPodPrototype &
  Omit<EntityWithOwnerPrototype, keyof _CargoPodPrototype>;

export function isCargoPodPrototype(
  value: unknown,
): value is CargoPodPrototype {
  return (value as { type: string }).type === 'cargo-pod';
}

/** A [cargo wagon](https://wiki.factorio.com/Cargo_wagon). */
interface _CargoWagonPrototype {
  type: 'cargo-wagon';
  /** Size of the inventory of the wagon. The inventory can be limited using the red bar and filtered. This functionality cannot be turned off. */
  inventory_size: ItemStackIndex;
}

export type CargoWagonPrototype = _CargoWagonPrototype &
  Omit<RollingStockPrototype, keyof _CargoWagonPrototype>;

export function isCargoWagonPrototype(
  value: unknown,
): value is CargoWagonPrototype {
  return (value as { type: string }).type === 'cargo-wagon';
}

/** Jumps between targets and applies a [Trigger](prototype:Trigger) to them. */
interface _ChainActiveTriggerPrototype {
  type: 'chain-active-trigger';
  /** The trigger to apply when jumping to a new target. */
  action?: Trigger;
  /** Chance that a new fork will spawn after each jump. `0` for 0% chance and `1` for 100% chance.

Must be between 0 and 1. */
  fork_chance?: number;
  fork_chance_increase_per_quality_level?: number;
  /** Tick delay between each jump. `0` means that all jumps are instantaneous. */
  jump_delay_ticks?: MapTick;
  /** Maximum number of forks allowed to spawn for the entire chain. */
  max_forks?: number;
  /** Maximum number of forks that can spawn from a single jump. */
  max_forks_per_jump?: number;
  /** Max number of jumps per trigger. */
  max_jumps?: number;
  /** Max distance jumps are allowed to travel away from the original target. */
  max_range?: number;
  /** Max length of jumps. */
  max_range_per_jump?: number;
}

export type ChainActiveTriggerPrototype = _ChainActiveTriggerPrototype &
  Omit<ActiveTriggerPrototype, keyof _ChainActiveTriggerPrototype>;

export function isChainActiveTriggerPrototype(
  value: unknown,
): value is ChainActiveTriggerPrototype {
  return (value as { type: string }).type === 'chain-active-trigger';
}

/** This prototype is used for receiving an achievement when the player changes to a surface. */
interface _ChangedSurfaceAchievementPrototype {
  type: 'change-surface-achievement';
  /** This will trigger the achievement, if the player changes to this surface. */
  surface?: string;
}

export type ChangedSurfaceAchievementPrototype =
  _ChangedSurfaceAchievementPrototype &
    Omit<AchievementPrototype, keyof _ChangedSurfaceAchievementPrototype>;

export function isChangedSurfaceAchievementPrototype(
  value: unknown,
): value is ChangedSurfaceAchievementPrototype {
  return (value as { type: string }).type === 'change-surface-achievement';
}

/** The corpse of a [CharacterPrototype](prototype:CharacterPrototype). */
interface _CharacterCorpsePrototype {
  type: 'character-corpse';
  /** Table of key value pairs, the keys are armor names and the values are numbers. The number is the Animation that is associated with the armor, e.g. using `1` will associate the armor with the first Animation in the pictures table. */
  armor_picture_mapping?: Record<ItemID, number>;
  /** Mandatory if `pictures` is not defined. */
  picture?: Animation;
  /** Mandatory if `picture` is not defined. */
  pictures?: AnimationVariations;
  render_layer?: RenderLayer;
  /** 0 for infinite. */
  time_to_live: number;
}

export type CharacterCorpsePrototype = _CharacterCorpsePrototype &
  Omit<EntityPrototype, keyof _CharacterCorpsePrototype>;

export function isCharacterCorpsePrototype(
  value: unknown,
): value is CharacterCorpsePrototype {
  return (value as { type: string }).type === 'character-corpse';
}

/** Entity that you move around on the screen during the campaign and freeplay. */
interface _CharacterPrototype {
  type: 'character';
  animations: CharacterArmorAnimation[];
  build_distance: number;
  /** Name of the character corpse that is spawned when this character dies. */
  character_corpse?: EntityID;
  /** Names of the crafting categories the character can craft recipes from. The built-in categories can be found [here](https://wiki.factorio.com/Data.raw#recipe-category). See also [RecipeCategory](prototype:RecipeCategory). */
  crafting_categories?: RecipeCategoryID[];
  damage_hit_tint: Color;
  distance_per_frame: number;
  drop_item_distance: number;
  /** The sound played when the character eats (fish for example). */
  eat: Sound;
  /** Must be >= 0. */
  enter_vehicle_distance?: number;
  flying_bob_speed?: number;
  /** This collision mask is used when the character is flying.

Defaults to the mask from [UtilityConstants::default_collision_masks](prototype:UtilityConstants::default_collision_masks) when indexed by `"character/flying"`. */
  flying_collision_mask?: CollisionMaskConnector;
  /** Triggered when the running animation (`animations`) rolls over the frames defined in `right_footprint_frames` and `left_footprint_frames`. */
  footprint_particles?: FootprintParticle[];
  /** Triggered every tick of the running animation. */
  footstep_particle_triggers?: FootstepTriggerEffectList;
  /** The search radius for a non-colliding position to move the player to if they are grounded mid-flight.  Must be >= 0. */
  grounded_landing_search_radius?: number;
  /** Must be between 1 and 15. */
  guns_inventory_size?: ItemStackIndex;
  /** Whether this character is moved by belts when standing on them. */
  has_belt_immunity?: boolean;
  /** The sound played when the character's health is low. */
  heartbeat: Sound;
  /** Number of slots in the main inventory. May be 0. */
  inventory_size: ItemStackIndex;
  /** Whether this prototype should be a high priority target for enemy forces. See [Military units and structures](https://wiki.factorio.com/Military_units_and_structures). */
  is_military_target?: boolean;
  item_pickup_distance: number;
  /** The frames in the running animation (`animations`) where the left foot touches the ground. */
  left_footprint_frames?: number[];
  /** Offset from the center of the entity for the left footprint. Used by `footprint_particles`. */
  left_footprint_offset?: Vector;
  light?: LightDefinition;
  loot_pickup_distance: number;
  maximum_corner_sliding_distance: number;
  /** Names of the resource categories the character can mine resources from. */
  mining_categories?: ResourceCategoryID[];
  mining_speed: number;
  /** List of positions in the mining with tool animation when the mining sound and mining particles are created. */
  mining_with_tool_particles_animation_positions: number[];
  moving_sound_animation_positions: number[];
  reach_distance: number;
  reach_resource_distance: number;
  /** Time in seconds. Must be positive */
  respawn_time?: number;
  /** The frames in the running animation (`animations`) where the right foot touches the ground. */
  right_footprint_frames?: number[];
  /** Offset from the center of the entity for the right footprint. Used by `footprint_particles`. */
  right_footprint_offset?: Vector;
  /** List of positions in the running animation when the walking sound is played. */
  running_sound_animation_positions: number[];
  running_speed: number;
  /** Triggered when the running animation (`animations`) rolls over the frames defined in `right_footprint_frames` and `left_footprint_frames`. */
  synced_footstep_particle_triggers?: FootstepTriggerEffectList;
  ticks_to_keep_aiming_direction: number;
  ticks_to_keep_gun: number;
  ticks_to_stay_in_combat: number;
  tool_attack_distance?: number;
  tool_attack_result?: Trigger;
}

export type CharacterPrototype = _CharacterPrototype &
  Omit<EntityWithOwnerPrototype, keyof _CharacterPrototype>;

export function isCharacterPrototype(
  value: unknown,
): value is CharacterPrototype {
  return (value as { type: string }).type === 'character';
}

/** A [cliff](https://wiki.factorio.com/Cliff). */
interface _CliffPrototype {
  type: 'cliff';
  /** Name of a capsule that has a robot_action to explode cliffs. */
  cliff_explosive?: ItemID;
  grid_offset: Vector;
  grid_size: Vector;
  orientations: OrientedCliffPrototypeSet;
  place_as_crater?: CraterPlacementDefinition;
}

export type CliffPrototype = _CliffPrototype &
  Omit<EntityPrototype, keyof _CliffPrototype>;

export function isCliffPrototype(value: unknown): value is CliffPrototype {
  return (value as { type: string }).type === 'cliff';
}

/** A collision layer. Used for [collision masks](prototype:CollisionMaskConnector).

It's recommend to use underscores instead of dashes in `name` so that the name can easily be used as a table key when defining collision masks. */

interface _CollisionLayerPrototype {
  type: 'collision-layer';
}

export type CollisionLayerPrototype = _CollisionLayerPrototype &
  Omit<Prototype, keyof _CollisionLayerPrototype>;

export function isCollisionLayerPrototype(
  value: unknown,
): value is CollisionLayerPrototype {
  return (value as { type: string }).type === 'collision-layer';
}

/** This prototype is used for receiving an achievement when the player has a certain robot follower count. */
interface _CombatRobotCountAchievementPrototype {
  type: 'combat-robot-count-achievement';
  /** This will trigger the achievement, if player's current robot count is over this amount. */
  count?: number;
}

export type CombatRobotCountAchievementPrototype =
  _CombatRobotCountAchievementPrototype &
    Omit<AchievementPrototype, keyof _CombatRobotCountAchievementPrototype>;

export function isCombatRobotCountAchievementPrototype(
  value: unknown,
): value is CombatRobotCountAchievementPrototype {
  return (value as { type: string }).type === 'combat-robot-count-achievement';
}

/** A combat robot. Can attack enemies. */
interface _CombatRobotPrototype {
  type: 'combat-robot';
  attack_parameters: AttackParameters;
  /** Applied when the combat robot expires (runs out of `time_to_live`). */
  destroy_action?: Trigger;
  follows_player?: boolean;
  friction?: number;
  idle?: RotatedAnimation;
  in_motion?: RotatedAnimation;
  light?: LightDefinition;
  range_from_player?: number;
  shadow_idle?: RotatedAnimation;
  shadow_in_motion?: RotatedAnimation;
  time_to_live: number;
}

export type CombatRobotPrototype = _CombatRobotPrototype &
  Omit<FlyingRobotPrototype, keyof _CombatRobotPrototype>;

export function isCombatRobotPrototype(
  value: unknown,
): value is CombatRobotPrototype {
  return (value as { type: string }).type === 'combat-robot';
}

/** Abstract base type for decider and arithmetic combinators. */
interface _CombinatorPrototype {
  active_energy_usage: Energy;
  activity_led_hold_time?: number;
  activity_led_light?: LightDefinition;
  activity_led_light_offsets: [Vector, Vector, Vector, Vector];
  activity_led_sprites?: Sprite4Way;
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** Emissions cannot be larger than zero, combinators cannot produce pollution. */
  emissions_per_second?: Record<AirbornePollutantID, number>;
  /** Defines how this combinator gets energy. The emissions set on the energy source are ignored so combinators cannot produce pollution. */
  energy_source: ElectricEnergySource | VoidEnergySource;
  frozen_patch?: Sprite4Way;
  input_connection_bounding_box: BoundingBox;
  input_connection_points: [
    WireConnectionPoint,
    WireConnectionPoint,
    WireConnectionPoint,
    WireConnectionPoint,
  ];
  output_connection_bounding_box: BoundingBox;
  output_connection_points: [
    WireConnectionPoint,
    WireConnectionPoint,
    WireConnectionPoint,
    WireConnectionPoint,
  ];
  screen_light?: LightDefinition;
  screen_light_offsets: [Vector, Vector, Vector, Vector];
  sprites?: Sprite4Way;
}

export type CombinatorPrototype = _CombinatorPrototype &
  Omit<EntityWithOwnerPrototype, keyof _CombinatorPrototype>;
interface _CompleteObjectiveAchievementPrototype {
  type: 'complete-objective-achievement';
  /** The achievement must be completed within this time limit. */
  within?: MapTick;
}

export type CompleteObjectiveAchievementPrototype =
  _CompleteObjectiveAchievementPrototype &
    Omit<
      AchievementPrototypeWithCondition,
      keyof _CompleteObjectiveAchievementPrototype
    >;

export function isCompleteObjectiveAchievementPrototype(
  value: unknown,
): value is CompleteObjectiveAchievementPrototype {
  return (value as { type: string }).type === 'complete-objective-achievement';
}

/** A [constant combinator](https://wiki.factorio.com/Constant_combinator). */
interface _ConstantCombinatorPrototype {
  type: 'constant-combinator';
  activity_led_light?: LightDefinition;
  activity_led_light_offsets: [Vector, Vector, Vector, Vector];
  activity_led_sprites?: Sprite4Way;
  circuit_wire_connection_points: [
    WireConnectionPoint,
    WireConnectionPoint,
    WireConnectionPoint,
    WireConnectionPoint,
  ];
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  sprites?: Sprite4Way;
}

export type ConstantCombinatorPrototype = _ConstantCombinatorPrototype &
  Omit<EntityWithOwnerPrototype, keyof _ConstantCombinatorPrototype>;

export function isConstantCombinatorPrototype(
  value: unknown,
): value is ConstantCombinatorPrototype {
  return (value as { type: string }).type === 'constant-combinator';
}

/** This prototype is used for receiving an achievement when the player constructs enough entities with construction robots. */
interface _ConstructWithRobotsAchievementPrototype {
  type: 'construct-with-robots-achievement';
  /** This will trigger the achievement, if enough entities were placed using construction robots. */
  amount?: number;
  /** If this is false, the player carries over their statistics from this achievement through all their saves. */
  limited_to_one_game: boolean;
  more_than_manually?: boolean;
}

export type ConstructWithRobotsAchievementPrototype =
  _ConstructWithRobotsAchievementPrototype &
    Omit<AchievementPrototype, keyof _ConstructWithRobotsAchievementPrototype>;

export function isConstructWithRobotsAchievementPrototype(
  value: unknown,
): value is ConstructWithRobotsAchievementPrototype {
  return (
    (value as { type: string }).type === 'construct-with-robots-achievement'
  );
}

/** A [construction robot](https://wiki.factorio.com/Construction_robot). */
interface _ConstructionRobotPrototype {
  type: 'construction-robot';
  /** Must have a collision box size of zero. */
  collision_box?: BoundingBox;
  construction_vector: Vector;
  mined_sound_volume_modifier?: number;
  repairing_sound?: Sound;
  shadow_working?: RotatedAnimation;
  smoke?: Animation;
  sparks?: AnimationVariations;
  working?: RotatedAnimation;
  working_light?: LightDefinition;
}

export type ConstructionRobotPrototype = _ConstructionRobotPrototype &
  Omit<RobotWithLogisticInterfacePrototype, keyof _ConstructionRobotPrototype>;

export function isConstructionRobotPrototype(
  value: unknown,
): value is ConstructionRobotPrototype {
  return (value as { type: string }).type === 'construction-robot';
}

/** A generic container, such as a chest. Cannot be rotated. */
interface _ContainerPrototype {
  type: 'container';
  circuit_connector?: CircuitConnectorDefinition;
  /** The maximum circuit wire distance for this container. */
  circuit_wire_max_distance?: number;
  default_status?: EntityStatus;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** The number of slots in this container. */
  inventory_size: ItemStackIndex;
  /** Whether the inventory of this container can be filtered (like cargo wagons) or not. */
  inventory_type?: 'normal' | 'with_bar' | 'with_filters_and_bar';
  /** The picture displayed for this entity. */
  picture?: Sprite;
}

export type ContainerPrototype = _ContainerPrototype &
  Omit<EntityWithOwnerPrototype, keyof _ContainerPrototype>;

export function isContainerPrototype(
  value: unknown,
): value is ContainerPrototype {
  return (value as { type: string }).type === 'container';
}

/** A copy-paste or cut-paste tool. */
interface _CopyPasteToolPrototype {
  type: 'copy-paste-tool';
  /** The filters are parsed, but then ignored and forced to be empty. */
  alt_select: SelectionModeData;
  /** This property is hardcoded to `false`. */
  always_include_tiles?: boolean;
  cuts?: boolean;
  /** The filters are parsed, but then ignored and forced to be empty. */
  select: SelectionModeData;
  /** Count of items of the same name that can be stored in one inventory slot. Must be 1 when the `"not-stackable"` flag is set. */
  stack_size: 1;
}

export type CopyPasteToolPrototype = _CopyPasteToolPrototype &
  Omit<SelectionToolPrototype, keyof _CopyPasteToolPrototype>;

export function isCopyPasteToolPrototype(
  value: unknown,
): value is CopyPasteToolPrototype {
  return (value as { type: string }).type === 'copy-paste-tool';
}

/** Used for corpses, for example the remnants when destroying buildings. */
interface _CorpsePrototype {
  type: 'corpse';
  /** The dying animation. */
  animation?: RotatedAnimationVariations;
  /** Variation count must be the same as `animation` variation count. Direction count must be the same as `animation` direction count. Frame count must be the same as `animation` frame count. */
  animation_overlay?: RotatedAnimationVariations;
  animation_overlay_final_render_layer?: RenderLayer;
  animation_overlay_render_layer?: RenderLayer;
  animation_render_layer?: RenderLayer;
  decay_animation?: RotatedAnimationVariations;
  decay_frame_transition_duration?: number;
  /** An array of arrays of integers. The inner arrays are called "groups" and must all have the same size. */
  direction_shuffle?: number[][];
  /** Multiplier for `time_before_shading_off` and `time_before_removed`. Must be positive.

Controls the speed of the animation: `1 ÷ dying_speed = duration of the animation` */
  dying_speed?: number;
  expires?: boolean;
  final_render_layer?: RenderLayer;
  ground_patch?: AnimationVariations;
  ground_patch_decay?: AnimationVariations;
  ground_patch_fade_in_delay?: number;
  ground_patch_fade_in_speed?: number;
  ground_patch_fade_out_duration?: number;
  ground_patch_fade_out_start?: number;
  ground_patch_higher?: AnimationVariations;
  ground_patch_render_layer?: RenderLayer;
  remove_on_entity_placement?: boolean;
  remove_on_tile_placement?: boolean;
  shuffle_directions_at_frame?: number;
  splash?: AnimationVariations;
  splash_render_layer?: RenderLayer;
  /** Controls the speed of the splash animation: `1 ÷ splash_speed = duration of the splash animation` */
  splash_speed?: number;
  /** Time in ticks this corpse lasts. May not be 0. */
  time_before_removed?: number;
  /** Controls how long the corpse takes to fade, as in how long it takes to get from no transparency to full transparency/removed. This time is *not* added to `time_before_removed`, it is instead subtracted from it. So by default, the corpse starts fading about 15 seconds before it gets removed. */
  time_before_shading_off?: number;
  underwater_layer_offset?: number;
  underwater_patch?: RotatedSprite;
  use_decay_layer?: boolean;
  use_tile_color_for_ground_patch_tint?: boolean;
}

export type CorpsePrototype = _CorpsePrototype &
  Omit<EntityPrototype, keyof _CorpsePrototype>;

export function isCorpsePrototype(value: unknown): value is CorpsePrototype {
  return (value as { type: string }).type === 'corpse';
}

/** The abstract basis of the assembling machines and furnaces. Contains the properties that both of them have.

Note that a crafting machine cannot be rotated unless it has at least one of the following: a fluid box, a heat energy source, a fluid energy source, or a non-square collision box. Crafting machines with non-square collision boxes can only be rotated before placement, not after. */
interface _CraftingMachinePrototype {
  type: 'crafting-machine';
  /** Sets the [modules](prototype:ModulePrototype) and [beacon](prototype:BeaconPrototype) effects that are allowed to be used on this machine. */
  allowed_effects?: EffectTypeLimitation;
  /** Sets the [module categories](prototype:ModuleCategory) that are allowed to be inserted into this machine. */
  allowed_module_categories?: ModuleCategoryID[];
  /** A list of [recipe categories](prototype:RecipeCategory) this crafting machine can use. */
  crafting_categories: RecipeCategoryID[];
  /** How fast this crafting machine can craft. 1 means that for example a 1 second long recipe take 1 second to craft. 0.5 means it takes 2 seconds, and 2 means it takes 0.5 seconds.

Crafting speed has to be positive. */
  crafting_speed: number;
  /** Whether the "alt-mode icon" should have a black background. */
  draw_entity_info_icon_background?: boolean;
  effect_receiver?: EffectReceiver;
  /** Defines how the crafting machine is powered.

When using an electric energy source and `drain` is not specified, it will be set to `energy_usage ÷ 30` automatically. */
  energy_source: EnergySource;
  /** Sets how much energy this machine uses while crafting. Energy usage has to be positive. */
  energy_usage: Energy;
  fast_transfer_modules_into_module_slots_only?: boolean;
  /** The crafting machine's fluid boxes. If an assembling machine has fluid boxes *and* [AssemblingMachinePrototype::fluid_boxes_off_when_no_fluid_recipe](prototype:AssemblingMachinePrototype::fluid_boxes_off_when_no_fluid_recipe) is true, the assembling machine can only be rotated when a recipe consuming or producing fluid is set, or if it has one of the other properties listed at the top of this page. */
  fluid_boxes?: FluidBox[];
  forced_symmetry?: Mirroring;
  graphics_set?: CraftingMachineGraphicsSet;
  graphics_set_flipped?: CraftingMachineGraphicsSet;
  ignore_output_full?: boolean;
  /** Whether the speed of the animation and working visualization should be based on the machine's speed (boosted or slowed by modules). */
  match_animation_speed_to_activity?: boolean;
  /** The number of module slots in this machine. */
  module_slots?: ItemStackIndex;
  /** Affects animation speed. */
  perceived_performance?: PerceivedPerformance;
  production_health_effect?: ProductionHealthEffect;
  /** Controls whether the ingredients of an in-progress recipe are destroyed when mining the machine/changing the recipe. If set to true, the ingredients do not get destroyed. This affects only the ingredients of the recipe that is currently in progress, so those that visually have already been consumed while their resulting product has not yet been produced. */
  return_ingredients_on_change?: boolean;
  /** Whether the "alt-mode icon" should be drawn at all. */
  show_recipe_icon?: boolean;
  /** Whether the recipe icon should be shown on the map. */
  show_recipe_icon_on_map?: boolean;
  trash_inventory_size?: ItemStackIndex;
  vector_to_place_result?: Vector;
}

export type CraftingMachinePrototype = _CraftingMachinePrototype &
  Omit<EntityWithOwnerPrototype, keyof _CraftingMachinePrototype>;

export function isCraftingMachinePrototype(
  value: unknown,
): value is CraftingMachinePrototype {
  return (value as { type: string }).type === 'crafting-machine';
}

/** This prototype is used for receiving an achievement when the player creates a space platform. */
interface _CreatePlatformAchievementPrototype {
  type: 'create-platform-achievement';
  /** How many space platforms need to be created. */
  amount?: number;
}

export type CreatePlatformAchievementPrototype =
  _CreatePlatformAchievementPrototype &
    Omit<AchievementPrototype, keyof _CreatePlatformAchievementPrototype>;

export function isCreatePlatformAchievementPrototype(
  value: unknown,
): value is CreatePlatformAchievementPrototype {
  return (value as { type: string }).type === 'create-platform-achievement';
}

/** A curved-A rail. */
interface _CurvedRailAPrototype {
  type: 'curved-rail-a';
  /** The [collision_box](prototype:EntityPrototype::collision_box) of straight rail is hardcoded to `{{-0.7, -2.516}, {0.7, 2.516}}`. */
  collision_box?: BoundingBox;
}

export type CurvedRailAPrototype = _CurvedRailAPrototype &
  Omit<RailPrototype, keyof _CurvedRailAPrototype>;

export function isCurvedRailAPrototype(
  value: unknown,
): value is CurvedRailAPrototype {
  return (value as { type: string }).type === 'curved-rail-a';
}

/** A curved-B rail. */
interface _CurvedRailBPrototype {
  type: 'curved-rail-b';
  /** The [collision_box](prototype:EntityPrototype::collision_box) of straight rail is hardcoded to `{{-0.7, -2.441}, {0.7, 2.441}}`. */
  collision_box?: BoundingBox;
}

export type CurvedRailBPrototype = _CurvedRailBPrototype &
  Omit<RailPrototype, keyof _CurvedRailBPrototype>;

export function isCurvedRailBPrototype(
  value: unknown,
): value is CurvedRailBPrototype {
  return (value as { type: string }).type === 'curved-rail-b';
}

/** Custom events share the same namespace as custom inputs and built-in events for subscribing to and raising them. */

interface _CustomEventPrototype {
  type: 'custom-event';
}

export type CustomEventPrototype = _CustomEventPrototype &
  Omit<Prototype, keyof _CustomEventPrototype>;

export function isCustomEventPrototype(
  value: unknown,
): value is CustomEventPrototype {
  return (value as { type: string }).type === 'custom-event';
}

/** Used for custom keyboard shortcuts/key bindings in mods. The key associated with the custom input can be changed in the options. This means that `key_sequence` is simply the default key binding. */
interface _CustomInputPrototype {
  type: 'custom-input';
  /** A [Lua event](runtime:CustomInputEvent) is only raised if the action is "lua". */
  action?:
    | 'lua'
    | 'spawn-item'
    | 'toggle-personal-roboport'
    | 'toggle-personal-logistic-requests'
    | 'toggle-equipment-movement-bonus';
  /** The alternative key binding for this control. See `key_sequence` for the format. */
  alternative_key_sequence?: string;
  /** If `true`, when the shortcut is activated, the modifiers used for this shortcut can't be re-used to press something else until unpressed. The example where this is useful is ALT+A to activate spidertron remote, where ALT is consumed, so pressing right mouse button before the ALT is unpressed will not trigger pin creation (ALT + right mouse button), but send the selected unit instead. */
  block_modifiers?: boolean;
  /** Sets whether internal game events associated with the same key sequence should be fired or blocked. If they are fired ("none"), then the custom input event will happen before the internal game event. */
  consuming?: ConsumingType;
  /** The alternative controller (game pad) keybinding for this control. See `controller_key_sequence` for the format. */
  controller_alternative_key_sequence?: string;
  /** The controller (game pad) keybinding for this control. Use "" (empty string) for unassigned.

" + " is used to separate modifier buttons from normal buttons: <code>"controller-righttrigger + controller-a"</code>.

For modifier buttons, the following names are used: "controller-righttrigger", "controller-lefttrigger".

A key binding can contain an unlimited amount of modifier buttons (listed above) but only one normal button (listed below). */
  controller_key_sequence?: string;
  /** If this custom input is enabled. Disabled custom inputs exist but are not used by the game. If disabled, no event is raised when the input is used. */
  enabled?: boolean;
  enabled_while_in_cutscene?: boolean;
  enabled_while_spectating?: boolean;
  /** If true, the type and name of the currently selected prototype will be provided as "selected_prototype" in the raised [Lua event](runtime:CustomInputEvent). [This also works in GUIs](https://forums.factorio.com/96125), not just the game world.

This will also return an item in the cursor such as copper-wire or rail-planner, if nothing is beneath the cursor. */
  include_selected_prototype?: boolean;
  /** The item will be created when this input is pressed and action is set to "spawn-item". The item must have the [spawnable](prototype:ItemPrototypeFlags::spawnable) flag set. */
  item_to_spawn?: ItemID;
  /** The default key sequence for this custom input. Use "" (empty string) for unassigned.

Use "mouse-button-2" etc for mouse buttons, mouse-button-3 for middle mouse button. Use "mouse-wheel-up", "mouse-wheel-down", "mouse-wheel-left", "mouse-wheel-right" for mouse wheel.

" + " is used to separate modifier keys from normal keys: <code>"ALT + G"</code>.

For modifier keys, the following names are used: "CONTROL", "SHIFT", "ALT", "COMMAND".

A key binding can contain an unlimited amount of modifier keys (listed above) but only one normal key (listed below). */
  key_sequence: string;
  /** When a custom-input is linked to a game control it won't show up in the control-settings GUI and will fire when the linked control is pressed. */
  linked_game_control?: LinkedGameControl;
  /** Unique textual identification of the prototype. May only contain alphanumeric characters, dashes and underscores. May not exceed a length of 200 characters.

For a list of all names used in vanilla, see [data.raw](https://wiki.factorio.com/Data.raw).

It is also the name for the event that is raised when they key (combination) is pressed and action is `"lua"`, see [Tutorial:Script interfaces](https://wiki.factorio.com/Tutorial:Script_interfaces#Custom_input). */
  name: string;
}

export type CustomInputPrototype = _CustomInputPrototype &
  Omit<Prototype, keyof _CustomInputPrototype>;

export function isCustomInputPrototype(
  value: unknown,
): value is CustomInputPrototype {
  return (value as { type: string }).type === 'custom-input';
}

/** A damage type. This is used in the [damage system](https://wiki.factorio.com/Damage). [A list of built-in damage types can be found here](https://wiki.factorio.com/Damage#Damage_types). */

interface _DamageType {
  type: 'damage-type';
}

export type DamageType = _DamageType & Omit<Prototype, keyof _DamageType>;

export function isDamageType(value: unknown): value is DamageType {
  return (value as { type: string }).type === 'damage-type';
}

/** A [decider combinator](https://wiki.factorio.com/Decider_combinator). */
interface _DeciderCombinatorPrototype {
  type: 'decider-combinator';
  equal_symbol_sprites?: Sprite4Way;
  greater_or_equal_symbol_sprites?: Sprite4Way;
  greater_symbol_sprites?: Sprite4Way;
  less_or_equal_symbol_sprites?: Sprite4Way;
  less_symbol_sprites?: Sprite4Way;
  not_equal_symbol_sprites?: Sprite4Way;
}

export type DeciderCombinatorPrototype = _DeciderCombinatorPrototype &
  Omit<CombinatorPrototype, keyof _DeciderCombinatorPrototype>;

export function isDeciderCombinatorPrototype(
  value: unknown,
): value is DeciderCombinatorPrototype {
  return (value as { type: string }).type === 'decider-combinator';
}

/** This prototype is used for receiving an achievement when the player deconstructs enough entities with construction robots. */
interface _DeconstructWithRobotsAchievementPrototype {
  type: 'deconstruct-with-robots-achievement';
  /** This will trigger the achievement, if enough entities were deconstructed using construction robots. */
  amount: number;
}

export type DeconstructWithRobotsAchievementPrototype =
  _DeconstructWithRobotsAchievementPrototype &
    Omit<
      AchievementPrototype,
      keyof _DeconstructWithRobotsAchievementPrototype
    >;

export function isDeconstructWithRobotsAchievementPrototype(
  value: unknown,
): value is DeconstructWithRobotsAchievementPrototype {
  return (
    (value as { type: string }).type === 'deconstruct-with-robots-achievement'
  );
}

/** Entity used to signify that the tile below it should be deconstructed. */

interface _DeconstructibleTileProxyPrototype {
  type: 'deconstructible-tile-proxy';
}

export type DeconstructibleTileProxyPrototype =
  _DeconstructibleTileProxyPrototype &
    Omit<EntityPrototype, keyof _DeconstructibleTileProxyPrototype>;

export function isDeconstructibleTileProxyPrototype(
  value: unknown,
): value is DeconstructibleTileProxyPrototype {
  return (value as { type: string }).type === 'deconstructible-tile-proxy';
}

/** A [deconstruction planner](https://wiki.factorio.com/Deconstruction_planner). */
interface _DeconstructionItemPrototype {
  type: 'deconstruction-item';
  /** The [SelectionModeData::mode](prototype:SelectionModeData::mode) is hardcoded to `"cancel-deconstruct"`.

The filters are parsed, but then ignored and forced to be empty. */
  alt_select: SelectionModeData;
  /** This property is hardcoded to `false`. */
  always_include_tiles?: boolean;
  /** Can't be > 255. */
  entity_filter_count?: ItemStackIndex;
  /** The [SelectionModeData::mode](prototype:SelectionModeData::mode) is hardcoded to `"deconstruct"`.

The filters are parsed, but then ignored and forced to be empty. */
  select: SelectionModeData;
  /** Count of items of the same name that can be stored in one inventory slot. Must be 1 when the `"not-stackable"` flag is set. */
  stack_size: 1;
  /** Can't be > 255. */
  tile_filter_count?: ItemStackIndex;
}

export type DeconstructionItemPrototype = _DeconstructionItemPrototype &
  Omit<SelectionToolPrototype, keyof _DeconstructionItemPrototype>;

export function isDeconstructionItemPrototype(
  value: unknown,
): value is DeconstructionItemPrototype {
  return (value as { type: string }).type === 'deconstruction-item';
}

/** Simple decorative purpose objects on the map, they have no health and some of them are removed when the player builds over. Usually used for grass patches, roots, small plants etc. */
interface _DecorativePrototype {
  type: 'optimized-decorative';
  autoplace?: AutoplaceSpecification;
  /** Must contain the [0,0] point. Max radius of the collision box is 8. */
  collision_box?: BoundingBox;
  /** Defaults to the mask from [UtilityConstants::default_collision_masks](prototype:UtilityConstants::default_collision_masks) when indexed by `"decorative"`. */
  collision_mask?: CollisionMaskConnector;
  /** Loaded only if `render_layer` = "decals". When decoratives are being spawned by [EnemySpawnerPrototype::spawn_decoration](prototype:EnemySpawnerPrototype::spawn_decoration) or [TurretPrototype::spawn_decoration](prototype:TurretPrototype::spawn_decoration), decals with `decal_overdraw_priority` greater than 0 will be filtered such that they don't overlap too much. If two or more decals would overlap, only the one with the largest value of `decal_overdraw_priority` is placed. */
  decal_overdraw_priority?: number;
  grows_through_rail_path?: boolean;
  minimal_separation?: number;
  /** Must contain at least 1 picture. */
  pictures: SpriteVariations;
  placed_effect?: TriggerEffect;
  /** When "decals" render layer is used, the decorative is treated as decal. That means it will be rendered within tile layers instead of normal sprite layers. */
  render_layer?: RenderLayer;
  /** Can be defined only when decorative is not "decal" (see `render_layer`). */
  stateless_visualisation?: StatelessVisualisations;
  /** Only loaded if `stateless_visualisation` is not defined. Can be defined only when decorative is not "decal" (see `render_layer`). */
  stateless_visualisation_variations?: StatelessVisualisations[];
  target_count?: number;
  /** Mandatory if `render_layer` = "decals". This int16 is converted to a [RenderLayer](prototype:RenderLayer) internally. */
  tile_layer?: number;
  /** Called by [DestroyDecorativesTriggerEffectItem](prototype:DestroyDecorativesTriggerEffectItem). */
  trigger_effect?: TriggerEffect;
  walking_sound?: Sound;
}

export type DecorativePrototype = _DecorativePrototype &
  Omit<Prototype, keyof _DecorativePrototype>;

export function isDecorativePrototype(
  value: unknown,
): value is DecorativePrototype {
  return (value as { type: string }).type === 'optimized-decorative';
}

/** Delays the delivery of triggered effect by some number of ticks. */
interface _DelayedActiveTriggerPrototype {
  type: 'delayed-active-trigger';
  /** The trigger to apply after `delay` has elapsed. */
  action: Trigger;
  /** If true, the delayed trigger is cancelled if the source entity is destroyed. */
  cancel_when_source_is_destroyed?: boolean;
  /** The number of ticks to delay the delivery of the triggered effect. Must be greater than 0. */
  delay: number;
  /** The number of times to repeat the delayed trigger. */
  repeat_count?: number;
  /** The number of ticks between repeat deliveries of the triggered effect. Must be greater than 0. */
  repeat_delay?: number;
}

export type DelayedActiveTriggerPrototype = _DelayedActiveTriggerPrototype &
  Omit<ActiveTriggerPrototype, keyof _DelayedActiveTriggerPrototype>;

export function isDelayedActiveTriggerPrototype(
  value: unknown,
): value is DelayedActiveTriggerPrototype {
  return (value as { type: string }).type === 'delayed-active-trigger';
}

/** This prototype is used for receiving an achievement, when the player requests and receives enough items using logistic robots. */
interface _DeliverByRobotsAchievementPrototype {
  type: 'deliver-by-robots-achievement';
  /** This will trigger the achievement, when the player receives enough items through logistic robots. */
  amount: number;
}

export type DeliverByRobotsAchievementPrototype =
  _DeliverByRobotsAchievementPrototype &
    Omit<AchievementPrototype, keyof _DeliverByRobotsAchievementPrototype>;

export function isDeliverByRobotsAchievementPrototype(
  value: unknown,
): value is DeliverByRobotsAchievementPrototype {
  return (value as { type: string }).type === 'deliver-by-robots-achievement';
}

export interface DeliverCategory {
  /** Name of the deliver category. */
  name: string;
  type: 'deliver-category';
}

export function isDeliverCategory(value: unknown): value is DeliverCategory {
  return (value as { type: string }).type === 'deliver-category';
}

export interface DeliverImpactCombination {
  deliver_category: string;
  impact_category: string;
  /** Name of the deliver impact combination. */
  name: string;
  trigger_effect_item: TriggerEffectItem;
  type: 'deliver-impact-combination';
}

export function isDeliverImpactCombination(
  value: unknown,
): value is DeliverImpactCombination {
  return (value as { type: string }).type === 'deliver-impact-combination';
}

/** This prototype is used for receiving an achievement when a resource entity is depleted. */
interface _DepleteResourceAchievementPrototype {
  type: 'deplete-resource-achievement';
  /** How many resource entities need to be depleted. */
  amount?: number;
  /** If this is false, the player carries over their statistics from this achievement through all their saves. */
  limited_to_one_game?: boolean;
}

export type DepleteResourceAchievementPrototype =
  _DepleteResourceAchievementPrototype &
    Omit<AchievementPrototype, keyof _DepleteResourceAchievementPrototype>;

export function isDepleteResourceAchievementPrototype(
  value: unknown,
): value is DepleteResourceAchievementPrototype {
  return (value as { type: string }).type === 'deplete-resource-achievement';
}

interface _DestroyCliffAchievementPrototype {
  type: 'destroy-cliff-achievement';
  amount?: number;
  /** If this is false, the player carries over their statistics from this achievement through all their saves. */
  limited_to_one_game?: boolean;
}

export type DestroyCliffAchievementPrototype =
  _DestroyCliffAchievementPrototype &
    Omit<AchievementPrototype, keyof _DestroyCliffAchievementPrototype>;

export function isDestroyCliffAchievementPrototype(
  value: unknown,
): value is DestroyCliffAchievementPrototype {
  return (value as { type: string }).type === 'destroy-cliff-achievement';
}

/** A display panel prototype to provide a prototype for display panels. */
interface _DisplayPanelPrototype {
  type: 'display-panel';
  /** The background color of the display panel text. */
  background_color?: Color;
  circuit_connector?: [
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
  ];
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** The maximum width of the text on the display panel. */
  max_text_width?: number;
  /** The display panel's graphics. */
  sprites?: Sprite4Way;
  /** The color of the text on the display panel. */
  text_color?: Color;
  /** The shift of the text on the display panel. */
  text_shift?: Vector;
}

export type DisplayPanelPrototype = _DisplayPanelPrototype &
  Omit<EntityWithOwnerPrototype, keyof _DisplayPanelPrototype>;

export function isDisplayPanelPrototype(
  value: unknown,
): value is DisplayPanelPrototype {
  return (value as { type: string }).type === 'display-panel';
}

/** This prototype is used for receiving an achievement when the player finishes the game without building a specific entity. */
interface _DontBuildEntityAchievementPrototype {
  type: 'dont-build-entity-achievement';
  amount?: number;
  /** This will disable the achievement, if this entity is placed. If you finish the game without building this entity, you receive the achievement. */
  dont_build: EntityID | EntityID[];
  /** If you research technology using one of specified items before building entity, you receive the achievement. */
  research_with?: ItemID | ItemID[];
}

export type DontBuildEntityAchievementPrototype =
  _DontBuildEntityAchievementPrototype &
    Omit<
      AchievementPrototypeWithCondition,
      keyof _DontBuildEntityAchievementPrototype
    >;

export function isDontBuildEntityAchievementPrototype(
  value: unknown,
): value is DontBuildEntityAchievementPrototype {
  return (value as { type: string }).type === 'dont-build-entity-achievement';
}

/** This prototype is used for receiving an achievement when the player finishes the game without crafting more than a set amount. */
interface _DontCraftManuallyAchievementPrototype {
  type: 'dont-craft-manually-achievement';
  /** This will disable the achievement, if the player crafts more than this. */
  amount: number;
}

export type DontCraftManuallyAchievementPrototype =
  _DontCraftManuallyAchievementPrototype &
    Omit<
      AchievementPrototypeWithCondition,
      keyof _DontCraftManuallyAchievementPrototype
    >;

export function isDontCraftManuallyAchievementPrototype(
  value: unknown,
): value is DontCraftManuallyAchievementPrototype {
  return (value as { type: string }).type === 'dont-craft-manually-achievement';
}

/** This prototype is used for receiving an achievement when the player kill first entity using artillery. */
interface _DontKillManuallyAchievementPrototype {
  type: 'dont-kill-manually-achievement';
  /** This will disable the achievement, if this entity is killed manually. If you kill this entity with artillery first, you receive the achievement. */
  to_kill?: EntityID;
  /** This will disable the achievement, if this entity type is killed manually. If you kill this entity type with artillery first, you receive the achievement. */
  type_not_to_kill?: string;
}

export type DontKillManuallyAchievementPrototype =
  _DontKillManuallyAchievementPrototype &
    Omit<
      AchievementPrototypeWithCondition,
      keyof _DontKillManuallyAchievementPrototype
    >;

export function isDontKillManuallyAchievementPrototype(
  value: unknown,
): value is DontKillManuallyAchievementPrototype {
  return (value as { type: string }).type === 'dont-kill-manually-achievement';
}

/** This prototype is used for receiving an achievement when the player researches with a specific science pack before unlocking another. */
interface _DontResearchBeforeResearchingAchievementPrototype {
  type: 'dont-research-before-researching-achievement';
  /** This will disable the achievement, if technology unlocking this item is researched before meeting requirements. */
  dont_research: ItemID | ItemID[];
  /** If you research technology using one of specified items, you receive the achievement. */
  research_with: ItemID | ItemID[];
}

export type DontResearchBeforeResearchingAchievementPrototype =
  _DontResearchBeforeResearchingAchievementPrototype &
    Omit<
      AchievementPrototypeWithCondition,
      keyof _DontResearchBeforeResearchingAchievementPrototype
    >;

export function isDontResearchBeforeResearchingAchievementPrototype(
  value: unknown,
): value is DontResearchBeforeResearchingAchievementPrototype {
  return (
    (value as { type: string }).type ===
    'dont-research-before-researching-achievement'
  );
}

/** This prototype is used for receiving an achievement when the player finishes the game without receiving energy from a specific energy source. */
interface _DontUseEntityInEnergyProductionAchievementPrototype {
  type: 'dont-use-entity-in-energy-production-achievement';
  /** This will **not** disable the achievement, if this entity is placed, and you have received any amount of power from it. */
  excluded: EntityID | EntityID[];
  /** This will disable the achievement, if this entity is placed, and you have received any amount of power from it. If you finish the game without receiving power from this entity, you receive the achievement. */
  included?: EntityID | EntityID[];
  last_hour_only?: boolean;
  minimum_energy_produced?: Energy;
}

export type DontUseEntityInEnergyProductionAchievementPrototype =
  _DontUseEntityInEnergyProductionAchievementPrototype &
    Omit<
      AchievementPrototypeWithCondition,
      keyof _DontUseEntityInEnergyProductionAchievementPrototype
    >;

export function isDontUseEntityInEnergyProductionAchievementPrototype(
  value: unknown,
): value is DontUseEntityInEnergyProductionAchievementPrototype {
  return (
    (value as { type: string }).type ===
    'dont-use-entity-in-energy-production-achievement'
  );
}

/** Properties of the editor controller. */
export interface EditorControllerPrototype {
  adjust_speed_based_off_zoom: boolean;
  enable_flash_light: boolean;
  fill_built_entity_energy_buffers: boolean;
  generate_neighbor_chunks: boolean;
  gun_inventory_size: ItemStackIndex;
  ignore_surface_conditions: boolean;
  instant_blueprint_building: boolean;
  instant_deconstruction: boolean;
  instant_rail_planner: boolean;
  instant_upgrading: boolean;
  inventory_size: ItemStackIndex;
  item_pickup_distance: number;
  loot_pickup_distance: number;
  mining_speed: number;
  /** Must be >= 0.34375. */
  movement_speed: number;
  /** Name of the editor controller. Base game uses "default". */
  name: string;
  placed_corpses_never_expire: boolean;
  render_as_day: boolean;
  show_additional_entity_info_gui: boolean;
  show_character_tab_in_controller_gui: boolean;
  show_entity_health_bars: boolean;
  show_entity_tags: boolean;
  show_hidden_entities: boolean;
  show_infinity_filters_in_controller_gui: boolean;
  show_status_icons: boolean;
  type: 'editor-controller';
}

export function isEditorControllerPrototype(
  value: unknown,
): value is EditorControllerPrototype {
  return (value as { type: string }).type === 'editor-controller';
}

/** Entity with electric energy source with that can have some of its values changed runtime. Useful for modding in energy consumers/producers. */
interface _ElectricEnergyInterfacePrototype {
  type: 'electric-energy-interface';
  allow_copy_paste?: boolean;
  /** Only loaded if both `picture` and `pictures` are not defined. */
  animation?: Animation;
  /** Only loaded if `picture`, `pictures`, and `animation` are not defined. */
  animations?: Animation4Way;
  /** Whether the electric energy interface animation always runs instead of being scaled to activity. */
  continuous_animation?: boolean;
  energy_production?: Energy;
  energy_source: ElectricEnergySource;
  energy_usage?: Energy;
  gui_mode?: 'all' | 'none' | 'admins';
  /** The light that this electric energy interface emits. */
  light?: LightDefinition;
  picture?: Sprite;
  /** Only loaded if `picture` is not defined. */
  pictures?: Sprite4Way;
  render_layer?: RenderLayer;
}

export type ElectricEnergyInterfacePrototype =
  _ElectricEnergyInterfacePrototype &
    Omit<EntityWithOwnerPrototype, keyof _ElectricEnergyInterfacePrototype>;

export function isElectricEnergyInterfacePrototype(
  value: unknown,
): value is ElectricEnergyInterfacePrototype {
  return (value as { type: string }).type === 'electric-energy-interface';
}

/** An electric pole - part of the [electric system](https://wiki.factorio.com/Electric_system). */
interface _ElectricPolePrototype {
  type: 'electric-pole';
  /** Drawn above the `pictures` when the electric pole is connected to an electric network. */
  active_picture?: Sprite;
  /** `0` means disable auto-connect. */
  auto_connect_up_to_n_wires?: number;
  connection_points: WireConnectionPoint[];
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** Drawn when the electric pole is connected to an electric network. */
  light?: LightDefinition;
  /** The maximum distance between this pole and any other connected pole - if two poles are farther apart than this, they cannot be connected together directly. Corresponds to "wire reach" in the item tooltip.

Max value is 64. */
  maximum_wire_distance?: number;
  pictures?: RotatedSprite;
  radius_visualisation_picture?: Sprite;
  /** The "radius" of this pole's supply area. Corresponds to *half* of the "supply area" in the item tooltip. If this is 3.5, the pole will have a 7x7 supply area.

Max value is 64. */
  supply_area_distance: number;
  track_coverage_during_build_by_moving?: boolean;
}

export type ElectricPolePrototype = _ElectricPolePrototype &
  Omit<EntityWithOwnerPrototype, keyof _ElectricPolePrototype>;

export function isElectricPolePrototype(
  value: unknown,
): value is ElectricPolePrototype {
  return (value as { type: string }).type === 'electric-pole';
}

/** A turret that uses electricity as ammunition. */
interface _ElectricTurretPrototype {
  type: 'electric-turret';
  energy_source: ElectricEnergySource | VoidEnergySource;
}

export type ElectricTurretPrototype = _ElectricTurretPrototype &
  Omit<TurretPrototype, keyof _ElectricTurretPrototype>;

export function isElectricTurretPrototype(
  value: unknown,
): value is ElectricTurretPrototype {
  return (value as { type: string }).type === 'electric-turret';
}

/** An elevated curved-A rail. */

interface _ElevatedCurvedRailAPrototype {
  type: 'elevated-curved-rail-a';
}

export type ElevatedCurvedRailAPrototype = _ElevatedCurvedRailAPrototype &
  Omit<CurvedRailAPrototype, keyof _ElevatedCurvedRailAPrototype>;

export function isElevatedCurvedRailAPrototype(
  value: unknown,
): value is ElevatedCurvedRailAPrototype {
  return (value as { type: string }).type === 'elevated-curved-rail-a';
}

/** An elevated curved-B rail. */

interface _ElevatedCurvedRailBPrototype {
  type: 'elevated-curved-rail-b';
}

export type ElevatedCurvedRailBPrototype = _ElevatedCurvedRailBPrototype &
  Omit<CurvedRailBPrototype, keyof _ElevatedCurvedRailBPrototype>;

export function isElevatedCurvedRailBPrototype(
  value: unknown,
): value is ElevatedCurvedRailBPrototype {
  return (value as { type: string }).type === 'elevated-curved-rail-b';
}

/** An elevated half diagonal rail. */

interface _ElevatedHalfDiagonalRailPrototype {
  type: 'elevated-half-diagonal-rail';
}

export type ElevatedHalfDiagonalRailPrototype =
  _ElevatedHalfDiagonalRailPrototype &
    Omit<HalfDiagonalRailPrototype, keyof _ElevatedHalfDiagonalRailPrototype>;

export function isElevatedHalfDiagonalRailPrototype(
  value: unknown,
): value is ElevatedHalfDiagonalRailPrototype {
  return (value as { type: string }).type === 'elevated-half-diagonal-rail';
}

/** An elevated straight rail. */

interface _ElevatedStraightRailPrototype {
  type: 'elevated-straight-rail';
}

export type ElevatedStraightRailPrototype = _ElevatedStraightRailPrototype &
  Omit<StraightRailPrototype, keyof _ElevatedStraightRailPrototype>;

export function isElevatedStraightRailPrototype(
  value: unknown,
): value is ElevatedStraightRailPrototype {
  return (value as { type: string }).type === 'elevated-straight-rail';
}

/** Can spawn entities. Used for biter/spitter nests. */
interface _EnemySpawnerPrototype {
  type: 'unit-spawner';
  absorptions_per_second?: Record<AirbornePollutantID, EnemySpawnerAbsorption>;
  /** If this is true, this entities `is_military_target property` can be changed runtime (on the entity, not on the prototype itself). */
  allow_run_time_change_of_is_military_target?: false;
  call_for_help_radius: number;
  captured_spawner_entity?: EntityID;
  dying_sound?: Sound;
  graphics_set: EnemySpawnerGraphicsSet;
  /** Whether this prototype should be a high priority target for enemy forces. See [Military units and structures](https://wiki.factorio.com/Military_units_and_structures). */
  is_military_target?: true;
  /** Count of enemies this spawner can sustain. */
  max_count_of_owned_units: number;
  max_darkness_to_spawn?: number;
  /** How many friendly units are required within the [EnemySpawnerPrototype::spawning_radius](prototype:EnemySpawnerPrototype::spawning_radius) of this spawner for it to stop producing more units. */
  max_friends_around_to_spawn: number;
  /** Max richness to determine spawn shift. Spawn shift is linear interpolation between 0 and max_spawn_shift. */
  max_richness_for_spawn_shift: number;
  /** Caps how much richness can be added on top of evolution when spawning units. [See also](https://www.reddit.com/r/factorio/comments/8pjscm/friday_facts_246_the_gui_update_part_3/e0bttnp/) */
  max_spawn_shift: number;
  min_darkness_to_spawn?: number;
  /** Array of the [entities](prototype:EntityPrototype) that this spawner can spawn and their spawn probabilities. The sum of probabilities is expected to be 1.0. The array must not be empty. */
  result_units: UnitSpawnDefinition[];
  /** Decoratives to be created when the spawner is created by the [map generator](https://wiki.factorio.com/Map_generator). Placed when enemies expand if `spawn_decorations_on_expansion` is set to true. */
  spawn_decoration?: CreateDecorativesTriggerEffectItem[];
  /** Whether `spawn_decoration` should be spawned when enemies [expand](https://wiki.factorio.com/Enemies#Expansions). */
  spawn_decorations_on_expansion?: boolean;
  /** Ticks for cooldown after unit is spawned. The first member of the tuple is min, the second member of the tuple is max. */
  spawning_cooldown: [number, number];
  /** How far from the spawner can the units be spawned. */
  spawning_radius: number;
  /** What spaces should be between the spawned units. */
  spawning_spacing: number;
  time_to_capture?: number;
}

export type EnemySpawnerPrototype = _EnemySpawnerPrototype &
  Omit<EntityWithOwnerPrototype, keyof _EnemySpawnerPrototype>;

export function isEnemySpawnerPrototype(
  value: unknown,
): value is EnemySpawnerPrototype {
  return (value as { type: string }).type === 'unit-spawner';
}

/** Used by [energy shield](https://wiki.factorio.com/Energy_shield). */
interface _EnergyShieldEquipmentPrototype {
  type: 'energy-shield-equipment';
  energy_per_shield: Energy;
  max_shield_value: number;
}

export type EnergyShieldEquipmentPrototype = _EnergyShieldEquipmentPrototype &
  Omit<EquipmentPrototype, keyof _EnergyShieldEquipmentPrototype>;

export function isEnergyShieldEquipmentPrototype(
  value: unknown,
): value is EnergyShieldEquipmentPrototype {
  return (value as { type: string }).type === 'energy-shield-equipment';
}

/** The entity used for ghosts of entities. In-game, the inner entity (the entity this is a ghost of) is rendered with a [UtilityConstants::ghost_tint](prototype:UtilityConstants::ghost_tint). */
interface _EntityGhostPrototype {
  type: 'entity-ghost';
  huge_build_animated_sound?: Sound;
  huge_build_sound?: Sound;
  large_build_animated_sound?: Sound;
  large_build_sound?: Sound;
  medium_build_animated_sound?: Sound;
  medium_build_sound?: Sound;
  small_build_animated_sound?: Sound;
}

export type EntityGhostPrototype = _EntityGhostPrototype &
  Omit<EntityPrototype, keyof _EntityGhostPrototype>;

export function isEntityGhostPrototype(
  value: unknown,
): value is EntityGhostPrototype {
  return (value as { type: string }).type === 'entity-ghost';
}

/** Abstract base of all entities in the game. Entity is nearly everything that can be on the map (except tiles).

For in game script access to entity, take a look at [LuaEntity](runtime:LuaEntity). */
interface _EntityPrototype {
  /** Names of the entity prototypes this entity prototype can be pasted on to in addition to the standard supported types.

This is used to allow copying between types that aren't compatible on the C++ code side, by allowing mods to receive the [on_entity_settings_pasted](runtime:on_entity_settings_pasted) event for the given entity and do the setting pasting via script. */
  additional_pastable_entities?: EntityID[];
  alert_icon_scale?: number;
  alert_icon_shift?: Vector;
  allow_copy_paste?: boolean;
  ambient_sounds?: WorldAmbientSoundDefinition | WorldAmbientSoundDefinition[];
  ambient_sounds_group?: EntityID;
  /** Used to specify the rules for placing this entity during map generation. */
  autoplace?: AutoplaceSpecification;
  build_base_evolution_requirement?: number;
  /** Supported values are 1 (for 1x1 grid) and 2 (for 2x2 grid, like rails).

Internally forced to be `2` for [RailPrototype](prototype:RailPrototype), [RailRemnantsPrototype](prototype:RailRemnantsPrototype) and [TrainStopPrototype](prototype:TrainStopPrototype). */
  build_grid_size?: number;
  build_sound?: Sound;
  close_sound?: Sound;
  /** Specification of the entity collision boundaries. Empty collision box means no collision and is used for smoke, projectiles, particles, explosions etc.

The `{0,0}` coordinate in the collision box will match the entity position. It should be near the center of the collision box, to keep correct entity drawing order. The bounding box must include the `{0,0}` coordinate.

Note, that for buildings, it is customary to leave 0.1 wide border between the edge of the tile and the edge of the building, this lets the player move between the building and electric poles/inserters etc. */
  collision_box?: BoundingBox;
  /** Defaults to the mask from [UtilityConstants::default_collision_masks](prototype:UtilityConstants::default_collision_masks) when indexed by the entity type. */
  collision_mask?: CollisionMaskConnector;
  /** The effect/trigger that happens when the entity is placed. */
  created_effect?: Trigger;
  /** The smoke that is shown when the entity is placed. */
  created_smoke?: CreateTrivialSmokeEffectItem;
  /** Used to merge multiple entities into one entry in the deconstruction planner. */
  deconstruction_alternative?: EntityID;
  diagonal_tile_grid_size?: TilePosition;
  /** Specification of extra vertical space needed to see the whole entity in GUIs. This is used to calculate the correct zoom and positioning in the entity info gui, for example in the entity tooltip. */
  drawing_box_vertical_extension?: number;
  /** Amount of emissions created (positive number) or cleaned (negative number) every second by the entity. This is passive and currently used just for trees and fires. This is independent of the [emissions of energy sources](prototype:BaseEnergySource::emissions_per_minute) used by machines, which are created actively depending on the power consumption. */
  emissions_per_second?: Record<AirbornePollutantID, number>;
  enemy_map_color?: Color;
  /** This allows you to replace an entity that's already placed, with a different one in your inventory. For example, replacing a burner inserter with a fast inserter. The replacement entity can be a different rotation to the replaced entity and you can replace an entity with the same type.

This is simply a string, so any string can be used here. The entity that should be replaced simply has to use the same string here. */
  fast_replaceable_group?: string;
  flags?: EntityPrototypeFlags;
  friendly_map_color?: Color;
  heating_energy?: Energy;
  /** Where beams should hit the entity. Useful if the bounding box only covers part of the entity (e.g. feet of the character) and beams only hitting there would look weird. */
  hit_visualization_box?: BoundingBox;
  /** Path to the icon file.

Either this or `icons` is mandatory for entities that have at least one of these flags active: `"placeable-neutral"`, `"placeable-player`", `"placeable-enemy"`.

Only loaded if `icons` is not defined. */
  icon?: FileName;
  /** Used to specify where and how should be the alt-mode icons of entities should be drawn. */
  icon_draw_specification?: IconDrawSpecification;
  /** The size of the square icon, in pixels. E.g. `32` for a 32px by 32px icon. Must be larger than `0`.

Only loaded if `icons` is not defined. */
  icon_size?: SpriteSizeType;
  /** This will be used in the electric network statistics, editor building selection, and the bonus gui. Can't be an empty array.

Either this or `icon` is mandatory for entities that have at least one of these flags active: `"placeable-neutral"`, `"placeable-player`", `"placeable-enemy"`. */
  icons?: IconData[];
  icons_positioning?: IconSequencePositioning[];
  /** Name of a [ImpactCategory](prototype:ImpactCategory). */
  impact_category?: string;
  map_color?: Color;
  /** Used instead of the collision box during map generation. Allows space entities differently during map generation, for example if the box is bigger, the entities will be placed farther apart. */
  map_generator_bounding_box?: BoundingBox;
  /** The item given to the player when they mine the entity and other properties relevant to mining this entity. */
  minable?: MinableProperties;
  mined_sound?: Sound;
  mining_sound?: Sound;
  /** Name of the entity that will be automatically selected as the upgrade of this entity when using the [upgrade planner](https://wiki.factorio.com/Upgrade_planner) without configuration.

This entity may not have "not-upgradable" flag set and must be minable. This entity mining result must not contain item product with "hidden" flag set. Mining results with no item products are allowed. This entity may not be a [RollingStockPrototype](prototype:RollingStockPrototype).

The upgrade target entity needs to have the same bounding box, collision mask, and fast replaceable group as this entity. The upgrade target entity must have least 1 item that builds it that isn't hidden. */
  next_upgrade?: EntityID;
  open_sound?: Sound;
  /** Used to order prototypes in inventory, recipes and GUIs. May not exceed a length of 200 characters.

The order string is taken from the items in `placeable_by` if they exist, or from an item that has its [place_result](prototype:ItemPrototype::place_result) set to this entity. */
  order?: Order;
  /** Item that when placed creates this entity. Determines which item is picked when "Q" (smart pipette) is used on this entity. Determines which item and item amount is needed in a blueprint of this entity and to revive a ghost of this entity.

The item count specified here can't be larger than the stack size of that item. */
  placeable_by?: ItemToPlace | ItemToPlace[];
  placeable_position_visualization?: Sprite;
  /** When this is true, this entity prototype should be included during tile collision checks with tiles that have [TilePrototype::check_collision_with_entities](prototype:TilePrototype::check_collision_with_entities) set to true. */
  protected_from_tile_building?: boolean;
  radius_visualisation_specification?: RadiusVisualisationSpecification;
  /** The entity that remains when this one is mined, deconstructed or fast-replaced. The entity wont actually be spawned if it would collide with the entity that is in the process of being mined. */
  remains_when_mined?: EntityID | EntityID[];
  /** Whether this entity should remove decoratives that collide with it when this entity is built. When set to "automatic", if the entity type is considered [a building](runtime:LuaEntityPrototype::is_building) (e.g. an assembling machine or a wall) it will remove decoratives. */
  remove_decoratives?: 'automatic' | 'true' | 'false';
  rotated_sound?: Sound;
  selectable_in_game?: boolean;
  /** Specification of the entity selection area. When empty the entity will have no selection area (and thus is not selectable).

The selection box is usually a little bit bigger than the collision box. For tileable entities (like buildings) it should match the tile size of the building. */
  selection_box?: BoundingBox;
  /** The entity with the higher number is selectable before the entity with the lower number. */
  selection_priority?: number;
  /** The cursor size used when shooting at this entity. */
  shooting_cursor_size?: number;
  stateless_visualisation?: StatelessVisualisations;
  /** Used to set the area of the entity that can have stickers on it, currently only used for units to specify the area where the green slow down stickers can appear. */
  sticker_box?: BoundingBox;
  surface_conditions?: SurfaceCondition[];
  tile_buildability_rules?: TileBuildabilityRule[];
  tile_height?: number;
  /** Used to determine how the center of the entity should be positioned when building (unless the off-grid [flag](prototype:EntityPrototypeFlags) is specified).

When the tile width is odd, the center will be in the center of the tile, when it is even, the center is on the tile transition. */
  tile_width?: number;
  /** Defaults to the mask from [UtilityConstants::default_trigger_target_mask_by_type](prototype:UtilityConstants::default_trigger_target_mask_by_type). */
  trigger_target_mask?: TriggerTargetMask;
  /** May also be defined inside `graphics_set` instead of directly in the entity prototype. This is useful for entities that use a `graphics_set` property to define their graphics, because then all graphics can be defined in one place.

[Currently only renders](https://forums.factorio.com/100703) for [EntityWithHealthPrototype](prototype:EntityWithHealthPrototype). */
  water_reflection?: WaterReflectionDefinition;
  /** Will also work on entities that don't actually do work. */
  working_sound?: WorkingSound;
}

export type EntityPrototype = _EntityPrototype &
  Omit<Prototype, keyof _EntityPrototype>;
/** Abstract base of all entities with health in the game. */
interface _EntityWithHealthPrototype {
  alert_when_damaged?: boolean;
  attack_reaction?: AttackReactionItem | AttackReactionItem[];
  /** Specifies the names of the [CorpsePrototype](prototype:CorpsePrototype) to be used when this entity dies. */
  corpse?: EntityID | EntityID[];
  create_ghost_on_death?: boolean;
  damaged_trigger_effect?: TriggerEffect;
  /** The entities that are spawned in place of this one when it dies. */
  dying_explosion?: ExplosionDefinition | ExplosionDefinition[];
  dying_trigger_effect?: TriggerEffect;
  /** The amount of health automatically regenerated per tick. The entity must be active for this to work. */
  healing_per_tick?: number;
  /** Whether the resistances of this entity should be hidden in the entity tooltip. */
  hide_resistances?: boolean;
  /** May also be defined inside `graphics_set` instead of directly in the entity prototype. This is useful for entities that use a `graphics_set` property to define their graphics, because then all graphics can be defined in one place.

Sprite drawn on ground under the entity to make it feel more integrated into the ground. */
  integration_patch?: Sprite4Way;
  /** May also be defined inside `graphics_set` instead of directly in the entity prototype. This is useful for entities that use a `graphics_set` property to define their graphics, because then all graphics can be defined in one place. */
  integration_patch_render_layer?: RenderLayer;
  /** The loot is dropped on the ground when the entity is killed. */
  loot?: LootItem[];
  /** The unit health can never go over the maximum. Default health of units on creation is set to max. Must be greater than 0. */
  max_health?: number;
  /** Fraction of health by which predicted damage must be exceeded before entity is considered as "predicted to die" causing turrets (and others) to stop shooting more projectiles. If entity is healing it is better to keep larger margin to avoid cases where not enough projectiles goes towards a target and it heals causing it to survive all the incoming projectiles. If entity does not heal, margin may be reduced. Must be >= 0. */
  overkill_fraction?: number;
  random_corpse_variation?: boolean;
  /** Played when this entity is repaired with a [RepairToolPrototype](prototype:RepairToolPrototype). */
  repair_sound?: Sound;
  /** Multiplier of [RepairToolPrototype::speed](prototype:RepairToolPrototype::speed) for this entity prototype. */
  repair_speed_modifier?: number;
  /** See [damage](https://wiki.factorio.com/Damage). */
  resistances?: Resistance[];
}

export type EntityWithHealthPrototype = _EntityWithHealthPrototype &
  Omit<EntityPrototype, keyof _EntityWithHealthPrototype>;
/** Abstract base of all entities with a force in the game. These entities have a [LuaEntity::unit_number](runtime:LuaEntity::unit_number) during runtime. Can be high priority [military targets](https://wiki.factorio.com/Military_units_and_structures). */
interface _EntityWithOwnerPrototype {
  /** If this is true, this entity's `is_military_target` property can be changed during runtime (on the entity, not on the prototype itself). */
  allow_run_time_change_of_is_military_target?: boolean;
  /** Whether this prototype should be a high priority target for enemy forces. See [Military units and structures](https://wiki.factorio.com/Military_units_and_structures). */
  is_military_target?: boolean;
  /** The default scale is based on the tile distance of the shorter dimension. Where size 3 results into scale 1. The default minimum is 0.5 and maximum 1.0. */
  quality_indicator_scale?: number;
}

export type EntityWithOwnerPrototype = _EntityWithOwnerPrototype &
  Omit<EntityWithHealthPrototype, keyof _EntityWithOwnerPrototype>;
/** This prototype is used for receiving an achievement when the player equips armor. */
interface _EquipArmorAchievementPrototype {
  type: 'equip-armor-achievement';
  /** The achievement will trigger if this armor or the other armor is equipped. */
  alternative_armor: ItemID;
  /** How many armors need to be equipped. */
  amount?: number;
  /** The achievement will trigger if this armor or the alternative armor is equipped. */
  armor: ItemID;
  limit_quality: QualityID;
  /** If this is false, the player carries over their statistics from this achievement through all their saves. */
  limited_to_one_game?: boolean;
}

export type EquipArmorAchievementPrototype = _EquipArmorAchievementPrototype &
  Omit<AchievementPrototype, keyof _EquipArmorAchievementPrototype>;

export function isEquipArmorAchievementPrototype(
  value: unknown,
): value is EquipArmorAchievementPrototype {
  return (value as { type: string }).type === 'equip-armor-achievement';
}

/** Defines a category to be available to [equipment](prototype:EquipmentPrototype) and [equipment grids](prototype:EquipmentGridPrototype). */

interface _EquipmentCategory {
  type: 'equipment-category';
}

export type EquipmentCategory = _EquipmentCategory &
  Omit<Prototype, keyof _EquipmentCategory>;

export function isEquipmentCategory(
  value: unknown,
): value is EquipmentCategory {
  return (value as { type: string }).type === 'equipment-category';
}

/** The equipment used for ghosts of equipment. */
interface _EquipmentGhostPrototype {
  type: 'equipment-ghost';
  /** Not loaded for equipment ghosts. */
  categories?: EquipmentCategoryID[];
  /** Not loaded for equipment ghosts. */
  energy_source?: ElectricEnergySource;
  /** Not loaded for equipment ghosts. */
  shape?: EquipmentShape;
  /** Not loaded for equipment ghosts. */
  take_result?: ItemID;
}

export type EquipmentGhostPrototype = _EquipmentGhostPrototype &
  Omit<EquipmentPrototype, keyof _EquipmentGhostPrototype>;

export function isEquipmentGhostPrototype(
  value: unknown,
): value is EquipmentGhostPrototype {
  return (value as { type: string }).type === 'equipment-ghost';
}

/** The prototype of an equipment grid, for example the one used in a [power armor](https://wiki.factorio.com/Power_armor). */
interface _EquipmentGridPrototype {
  type: 'equipment-grid';
  /** Only [equipment](prototype:EquipmentPrototype) with at least one of these [categories](prototype:EquipmentCategory) can be inserted into the grid. */
  equipment_categories: EquipmentCategoryID[];
  height: number;
  /** Whether this locked from user interaction which means that the user cannot put equipment into or take equipment from this equipment grid. */
  locked?: boolean;
  width: number;
}

export type EquipmentGridPrototype = _EquipmentGridPrototype &
  Omit<Prototype, keyof _EquipmentGridPrototype>;

export function isEquipmentGridPrototype(
  value: unknown,
): value is EquipmentGridPrototype {
  return (value as { type: string }).type === 'equipment-grid';
}

/** Abstract base of all equipment modules. Equipment modules can be inserted into [equipment grids](prototype:EquipmentGridPrototype). */
interface _EquipmentPrototype {
  /** The color that the border of the background of this equipment should have when shown inside an equipment grid. */
  background_border_color?: Color;
  /** The color that the background of this equipment should have when shown inside an equipment grid. */
  background_color?: Color;
  /** Sets the categories of the equipment. It can only be inserted into [grids](prototype:EquipmentGridPrototype::equipment_categories) with at least one matching category. */
  categories: EquipmentCategoryID[];
  energy_source: ElectricEnergySource;
  /** The color that the background of this equipment should have when held in the players hand and hovering over an equipment grid. */
  grabbed_background_color?: Color;
  /** How big this equipment should be in the grid and whether it should be one solid rectangle or of a custom shape. */
  shape: EquipmentShape;
  /** The graphics to use when this equipment is shown inside an equipment grid. */
  sprite: Sprite;
  /** Name of the item prototype that should be returned to the player when they remove this equipment from an equipment grid. */
  take_result?: ItemID;
}

export type EquipmentPrototype = _EquipmentPrototype &
  Omit<Prototype, keyof _EquipmentPrototype>;
/** Used to play an animation and a sound. */
interface _ExplosionPrototype {
  type: 'explosion';
  animations: AnimationVariations;
  beam?: boolean;
  correct_rotation?: boolean;
  fade_in_duration?: number;
  fade_out_duration?: number;
  height?: number;
  light?: LightDefinition;
  /** Silently clamped to be between 0 and 1. */
  light_intensity_factor_final?: number;
  /** Silently clamped to be between 0 and 1. */
  light_intensity_factor_initial?: number;
  light_intensity_peak_end_progress?: number;
  light_intensity_peak_start_progress?: number;
  /** Silently clamped to be between 0 and 1. */
  light_size_factor_final?: number;
  /** Silently clamped to be between 0 and 1. */
  light_size_factor_initial?: number;
  light_size_peak_end_progress?: number;
  light_size_peak_start_progress?: number;
  render_layer?: RenderLayer;
  rotate?: boolean;
  scale?: number;
  scale_animation_speed?: boolean;
  scale_deviation?: number;
  scale_end?: number;
  scale_in_duration?: number;
  scale_increment_per_tick?: number;
  scale_initial?: number;
  scale_initial_deviation?: number;
  scale_out_duration?: number;
  /** Mandatory if `smoke_count` > 0. */
  smoke?: TrivialSmokeID;
  smoke_count?: number;
  smoke_slow_down_factor?: number;
  sound?: Sound;
}

export type ExplosionPrototype = _ExplosionPrototype &
  Omit<EntityPrototype, keyof _ExplosionPrototype>;

export function isExplosionPrototype(
  value: unknown,
): value is ExplosionPrototype {
  return (value as { type: string }).type === 'explosion';
}

/** A fire. */
interface _FireFlamePrototype {
  type: 'fire';
  add_fuel_cooldown?: number;
  burnt_patch_alpha_default?: number;
  burnt_patch_alpha_variations?: TileAndAlpha[];
  burnt_patch_lifetime?: number;
  burnt_patch_pictures?: SpriteVariations;
  damage_multiplier_decrease_per_tick?: number;
  damage_multiplier_increase_per_added_fuel?: number;
  damage_per_tick: DamageParameters;
  delay_between_initial_flames?: number;
  fade_in_duration?: number;
  fade_out_duration?: number;
  /** Only loaded if `uses_alternative_behavior` is false. */
  flame_alpha?: number;
  /** Only loaded if `uses_alternative_behavior` is false. */
  flame_alpha_deviation?: number;
  /** Spawns this many `secondary_pictures` around the entity when it first spawns. It waits `delay_between_initial_flames` between each spawned `secondary_pictures`. This can be used to make fires look less repetitive.

For example, spitters use this to make several smaller splashes around the main one. */
  initial_flame_count?: number;
  initial_lifetime?: number;
  initial_render_layer?: RenderLayer;
  lifetime_increase_by?: number;
  lifetime_increase_cooldown?: number;
  light?: LightDefinition;
  light_size_modifier_maximum?: number;
  light_size_modifier_per_flame?: number;
  limit_overlapping_particles?: boolean;
  maximum_damage_multiplier?: number;
  maximum_lifetime?: number;
  maximum_spread_count?: number;
  on_damage_tick_effect?: Trigger;
  on_fuel_added_action?: Trigger;
  /** Only loaded if `uses_alternative_behavior` is true. */
  particle_alpha?: number;
  particle_alpha_blend_duration?: number;
  /** Only loaded if `uses_alternative_behavior` is true. */
  particle_alpha_deviation?: number;
  pictures?: AnimationVariations;
  render_layer?: RenderLayer;
  secondary_picture_fade_out_duration?: number;
  secondary_picture_fade_out_start?: number;
  secondary_pictures?: AnimationVariations;
  secondary_render_layer?: RenderLayer;
  small_tree_fire_pictures?: AnimationVariations;
  smoke?: SmokeSource[];
  smoke_fade_in_duration?: number;
  smoke_fade_out_duration?: number;
  smoke_source_pictures?: AnimationVariations;
  spawn_entity?: EntityID;
  spread_delay: number;
  spread_delay_deviation: number;
  tree_dying_factor?: number;
  /** If `false`, then all animations loop. If `true`, they run once and stay on the final frame. Also changes the behavior of several other fire properties as mentioned in their descriptions.

For example, spitters use alternate behavior, flamethrower flames don't. */
  uses_alternative_behavior?: boolean;
}

export type FireFlamePrototype = _FireFlamePrototype &
  Omit<EntityPrototype, keyof _FireFlamePrototype>;

export function isFireFlamePrototype(
  value: unknown,
): value is FireFlamePrototype {
  return (value as { type: string }).type === 'fire';
}

/** Entity that spawns in water tiles, which can be mined. Moves around unless deactivated with [LuaEntity::active](runtime:LuaEntity::active) = false. */
interface _FishPrototype {
  type: 'fish';
  pictures?: SpriteVariations;
}

export type FishPrototype = _FishPrototype &
  Omit<EntityWithHealthPrototype, keyof _FishPrototype>;

export function isFishPrototype(value: unknown): value is FishPrototype {
  return (value as { type: string }).type === 'fish';
}

/** A fluid. */
interface _FluidPrototype {
  type: 'fluid';
  /** Whether the fluid should be included in the barrel recipes automatically generated by the base mod.

This property is not read by the game engine itself, but the base mod's data-updates.lua file. This means it is discarded by the game engine after loading finishes. */
  auto_barrel?: boolean;
  /** Used by bars that show the fluid color, like the flamethrower turret fill bar in the tooltip, or the fill bar for the fluid wagon tooltip; and for the pipe windows and storage tank fill gauges. */
  base_color: Color;
  /** Also the minimum temperature of the fluid. Has to be lower than `max_temperature`. */
  default_temperature: number;
  /** Scales pollution generated when the fluid is consumed. */
  emissions_multiplier?: number;
  /** Used only for pipe windows or storage tank fill gauges. */
  flow_color: Color;
  fuel_value?: Energy;
  /** Above this temperature the `gas_flow` animation is used to display the fluid inside storage tanks and pipes. */
  gas_temperature?: number;
  /** Joule needed to heat 1 Unit by 1 °C. */
  heat_capacity?: Energy;
  /** Path to the icon file.

Mandatory if `icons` is not defined. */
  icon?: FileName;
  /** The size of the square icon, in pixels. E.g. `32` for a 32px by 32px icon. Must be larger than `0`.

Only loaded if `icons` is not defined. */
  icon_size?: SpriteSizeType;
  /** Can't be an empty array. */
  icons?: IconData[];
  max_temperature?: number;
  /** Color to use for visualization. This color should be vibrant and easily distinguished.

If not specified, this will be auto-generated from `base_color` by converting to HSV, decreasing saturation by 10% and setting value to 80%. */
  visualization_color?: Color;
}

export type FluidPrototype = _FluidPrototype &
  Omit<Prototype, keyof _FluidPrototype>;

export function isFluidPrototype(value: unknown): value is FluidPrototype {
  return (value as { type: string }).type === 'fluid';
}

/** Used for example for the handheld flamethrower. */
interface _FluidStreamPrototype {
  type: 'stream';
  /** Action that is triggered every time a particle lands. Not triggered for the first particle if `initial_action` is non-empty. */
  action?: Trigger;
  ground_light?: LightDefinition;
  /** Action that is triggered when the first particle lands. */
  initial_action?: Trigger;
  oriented_particle?: boolean;
  particle?: Animation;
  particle_alpha_per_part?: number;
  /** Number of spawned child particles of the stream. Must be greater than 0 and less than 256. */
  particle_buffer_size?: number;
  particle_end_alpha?: number;
  /** Will be set to 1 by the game if less than 1. */
  particle_fade_out_duration?: number;
  /** Value between 0 and 1. */
  particle_fade_out_threshold?: number;
  /** Must be larger than 0. `particle_horizontal_speed` has to be greater than `particle_horizontal_speed_deviation`. */
  particle_horizontal_speed: number;
  particle_horizontal_speed_deviation: number;
  /** Value between 0 and 1. */
  particle_loop_exit_threshold?: number;
  /** Will be set to 1 by the game if less than 1. */
  particle_loop_frame_count?: number;
  particle_scale_per_part?: number;
  /** The stream will spawn one particle every `particle_spawn_interval` ticks until the `particle_spawn_timeout` is reached. The first particle will trigger an `initial_action` upon landing. Each particle triggers an `action` upon landing. Particles spawned within a single `particle_spawn_timeout` interval will be connected by a stretched `spine_animation`. */
  particle_spawn_interval: number;
  particle_spawn_timeout?: number;
  particle_start_alpha?: number;
  particle_start_scale?: number;
  particle_vertical_acceleration: number;
  /** The point in the particles projectile arc to start spawning smoke. 0.5 (the default) starts spawning smoke at the halfway point between the source and target. */
  progress_to_create_smoke?: number;
  shadow?: Animation;
  shadow_scale_enabled?: boolean;
  /** Smoke spawning is controlled by `progress_to_create_smoke`. */
  smoke_sources?: SmokeSource[];
  special_neutral_target_damage?: DamageParameters;
  spine_animation?: Animation;
  stream_light?: LightDefinition;
  target_position_deviation?: number;
  width?: number;
}

export type FluidStreamPrototype = _FluidStreamPrototype &
  Omit<EntityPrototype, keyof _FluidStreamPrototype>;

export function isFluidStreamPrototype(
  value: unknown,
): value is FluidStreamPrototype {
  return (value as { type: string }).type === 'stream';
}

/** A turret that uses [fluid](prototype:FluidPrototype) as ammunition. */
interface _FluidTurretPrototype {
  type: 'fluid-turret';
  /** Before an turret that was out of fluid ammunition is able to fire again, the `fluid_buffer_size` must fill to this proportion. */
  activation_buffer_ratio: FluidAmount;
  /** Requires ammo_type in attack_parameters. */
  attack_parameters: StreamAttackParameters;
  attacking_muzzle_animation_shift?: AnimatedVector;
  ending_attack_muzzle_animation_shift?: AnimatedVector;
  enough_fuel_indicator_light?: LightDefinition;
  enough_fuel_indicator_picture?: Sprite4Way;
  fluid_box: FluidBox;
  fluid_buffer_input_flow: FluidAmount;
  fluid_buffer_size: FluidAmount;
  folded_muzzle_animation_shift?: AnimatedVector;
  folding_muzzle_animation_shift?: AnimatedVector;
  muzzle_animation?: Animation;
  muzzle_light?: LightDefinition;
  not_enough_fuel_indicator_light?: LightDefinition;
  not_enough_fuel_indicator_picture?: Sprite4Way;
  /** The sprite will be drawn on top of fluid turrets that are out of fluid ammunition. If the `out_of_ammo_alert_icon` is not set, [UtilitySprites::fluid_icon](prototype:UtilitySprites::fluid_icon) will be used instead. */
  out_of_ammo_alert_icon?: Sprite;
  prepared_muzzle_animation_shift?: AnimatedVector;
  preparing_muzzle_animation_shift?: AnimatedVector;
  starting_attack_muzzle_animation_shift?: AnimatedVector;
  turret_base_has_direction: true;
}

export type FluidTurretPrototype = _FluidTurretPrototype &
  Omit<TurretPrototype, keyof _FluidTurretPrototype>;

export function isFluidTurretPrototype(
  value: unknown,
): value is FluidTurretPrototype {
  return (value as { type: string }).type === 'fluid-turret';
}

/** A [fluid wagon](https://wiki.factorio.com/Fluid_wagon). */
interface _FluidWagonPrototype {
  type: 'fluid-wagon';
  capacity: FluidAmount;
  /** Must be 1, 2 or 3. */
  tank_count?: number;
}

export type FluidWagonPrototype = _FluidWagonPrototype &
  Omit<RollingStockPrototype, keyof _FluidWagonPrototype>;

export function isFluidWagonPrototype(
  value: unknown,
): value is FluidWagonPrototype {
  return (value as { type: string }).type === 'fluid-wagon';
}

/** Abstract base for construction/logistics and combat robots. */
interface _FlyingRobotPrototype {
  /** How much energy does it cost to move 1 tile.

Used only by [robots with logistic interface](prototype:RobotWithLogisticInterfacePrototype). */
  energy_per_move?: Energy;
  /** How much energy does it cost to fly for 1 tick.

Used only by [robots with logistic interface](prototype:RobotWithLogisticInterfacePrototype). */
  energy_per_tick?: Energy;
  /** Whether this prototype should be a high priority target for enemy forces. See [Military units and structures](https://wiki.factorio.com/Military_units_and_structures). */
  is_military_target?: boolean;
  /** How much energy can be stored in the batteries.

Used only by [robots with logistic interface](prototype:RobotWithLogisticInterfacePrototype). */
  max_energy?: Energy;
  /** The maximum flying speed of the robot, including bonuses, in tiles/tick. Useful to limit the impact of [worker robot speed research](prototype:WorkerRobotSpeedModifier). */
  max_speed?: number;
  /** If the robot's battery fill ratio is more than this, it does not need to charge before stationing.

Used only by [robots with logistic interface](prototype:RobotWithLogisticInterfacePrototype). */
  max_to_charge?: number;
  /** The robot will go to charge when its battery fill ratio is less than this.

Used only by [robots with logistic interface](prototype:RobotWithLogisticInterfacePrototype). */
  min_to_charge?: number;
  /** The flying speed of the robot, in tiles/tick. */
  speed: number;
  /** Some robots simply crash, some slowdown but keep going. 0 means crash.

Used only by [robots with logistic interface](prototype:RobotWithLogisticInterfacePrototype). */
  speed_multiplier_when_out_of_energy?: number;
}

export type FlyingRobotPrototype = _FlyingRobotPrototype &
  Omit<EntityWithOwnerPrototype, keyof _FlyingRobotPrototype>;
/** Fonts are used in all GUIs in the game. */
export interface FontPrototype {
  /** Whether the font has a border. */
  border?: boolean;
  /** The color of the border, if enabled. */
  border_color?: Color;
  filtered?: boolean;
  /** The name of the fonts .ttf descriptor. This descriptor must be defined in the locale info.json. Refer to `data/core/locale/_language_/info.json` for examples. */
  from: string;
  /** Name of the font. */
  name: string;
  /** Size of the font. */
  size: number;
  spacing?: number;
  type: 'font';
}

export function isFontPrototype(value: unknown): value is FontPrototype {
  return (value as { type: string }).type === 'font';
}

/** Each item which has a fuel_value must have a fuel category. The fuel categories are used to allow only certain fuels to be used in [EnergySource](prototype:EnergySource). */
interface _FuelCategory {
  type: 'fuel-category';
  fuel_value_type?: LocalisedString;
}

export type FuelCategory = _FuelCategory & Omit<Prototype, keyof _FuelCategory>;

export function isFuelCategory(value: unknown): value is FuelCategory {
  return (value as { type: string }).type === 'fuel-category';
}

/** A furnace. Normal furnaces only process "smelting" category recipes, but you can make furnaces that process other [recipe categories](prototype:RecipeCategory). The difference to assembling machines is that furnaces automatically choose their recipe based on input. */
interface _FurnacePrototype {
  type: 'furnace';
  /** The locale key of the message shown when the player attempts to insert an item into the furnace that cannot be processed by that furnace. In-game, the locale is provided the `__1__` parameter, which is the localised name of the item.

The locale key is also used with an `_until` suffix for items that cannot be processed until they recipe is unlocked by a technology. */
  cant_insert_at_source_message_key?: string;
  /** The locale key of the tooltip to be shown in the input slot instead of the automatically generated list of items that fit there */
  custom_input_slot_tooltip_key?: string;
  /** The number of output slots. */
  result_inventory_size: ItemStackIndex;
  /** The number of input slots, but not more than 1. */
  source_inventory_size: ItemStackIndex;
}

export type FurnacePrototype = _FurnacePrototype &
  Omit<CraftingMachinePrototype, keyof _FurnacePrototype>;

export function isFurnacePrototype(value: unknown): value is FurnacePrototype {
  return (value as { type: string }).type === 'furnace';
}

interface _FusionGeneratorPrototype {
  type: 'fusion-generator';
  /** `output_flow_limit` is mandatory and must be positive. */
  energy_source: ElectricEnergySource;
  graphics_set?: FusionGeneratorGraphicsSet;
  /** [filter](prototype:FluidBox::filter) is mandatory. */
  input_fluid_box: FluidBox;
  /** Must be positive. */
  max_fluid_usage: FluidAmount;
  /** [filter](prototype:FluidBox::filter) is mandatory. */
  output_fluid_box: FluidBox;
  /** Affects animation speed. */
  perceived_performance?: PerceivedPerformance;
}

export type FusionGeneratorPrototype = _FusionGeneratorPrototype &
  Omit<EntityWithOwnerPrototype, keyof _FusionGeneratorPrototype>;

export function isFusionGeneratorPrototype(
  value: unknown,
): value is FusionGeneratorPrototype {
  return (value as { type: string }).type === 'fusion-generator';
}

/** Fusion reactor. Consumes fluid, fuel and additional energy to produce other fluid. Kind of advanced boiler. Can also have neighbour bonus. */
interface _FusionReactorPrototype {
  type: 'fusion-reactor';
  /** Second energy source for the process: provides fuel */
  burner: BurnerEnergySource;
  /** First energy source for the process: provides energy */
  energy_source: ElectricEnergySource;
  graphics_set: FusionReactorGraphicsSet;
  /** The input fluid box.

[filter](prototype:FluidBox::filter) is mandatory. */
  input_fluid_box: FluidBox;
  /** Maximum amount of fluid converted from `input_fluid_box` to `output_fluid_box` within a single tick.

Must be positive. */
  max_fluid_usage: FluidAmount;
  neighbour_bonus?: number;
  /** Defines connection points to neighbours used to compute neighbour bonus. */
  neighbour_connectable?: NeighbourConnectable;
  /** The output fluid box.

[filter](prototype:FluidBox::filter) is mandatory. */
  output_fluid_box: FluidBox;
  /** Affects animation speed. */
  perceived_performance?: PerceivedPerformance;
  /** Power input consumed from first energy source at full performance.

Cannot be negative. */
  power_input: Energy;
  /** If set to true, only North and East direction will be buildable. */
  two_direction_only?: boolean;
}

export type FusionReactorPrototype = _FusionReactorPrototype &
  Omit<EntityWithOwnerPrototype, keyof _FusionReactorPrototype>;

export function isFusionReactorPrototype(
  value: unknown,
): value is FusionReactorPrototype {
  return (value as { type: string }).type === 'fusion-reactor';
}

/** A [gate](https://wiki.factorio.com/Gate). */
interface _GatePrototype {
  type: 'gate';
  activation_distance: number;
  /** Played when the gate closes. */
  closing_sound?: Sound;
  fadeout_interval?: number;
  horizontal_animation?: Animation;
  horizontal_rail_animation_left?: Animation;
  horizontal_rail_animation_right?: Animation;
  horizontal_rail_base?: Animation;
  /** This collision mask is used when the gate is open.

Defaults to the mask from [UtilityConstants::default_collision_masks](prototype:UtilityConstants::default_collision_masks) when indexed by `"gate/opened"`. */
  opened_collision_mask?: CollisionMaskConnector;
  /** Played when the gate opens. */
  opening_sound?: Sound;
  opening_speed: number;
  timeout_to_close: number;
  vertical_animation?: Animation;
  vertical_rail_animation_left?: Animation;
  vertical_rail_animation_right?: Animation;
  vertical_rail_base?: Animation;
  wall_patch?: Animation;
}

export type GatePrototype = _GatePrototype &
  Omit<EntityWithOwnerPrototype, keyof _GatePrototype>;

export function isGatePrototype(value: unknown): value is GatePrototype {
  return (value as { type: string }).type === 'gate';
}

/** Used by [portable fusion reactor](https://wiki.factorio.com/Portable_fusion_reactor). Provides power in equipment grids. Can produce power for free or use a burner energy source. */
interface _GeneratorEquipmentPrototype {
  type: 'generator-equipment';
  /** If not defined, this equipment produces power for free. */
  burner?: BurnerEnergySource;
  /** The power output of this equipment. */
  power: Energy;
}

export type GeneratorEquipmentPrototype = _GeneratorEquipmentPrototype &
  Omit<EquipmentPrototype, keyof _GeneratorEquipmentPrototype>;

export function isGeneratorEquipmentPrototype(
  value: unknown,
): value is GeneratorEquipmentPrototype {
  return (value as { type: string }).type === 'generator-equipment';
}

/** An entity that produces power from fluids, for example a [steam engine](https://wiki.factorio.com/Steam_engine). */
interface _GeneratorPrototype {
  type: 'generator';
  /** If set to true, the available power output is based on the [FluidPrototype::fuel_value](prototype:FluidPrototype::fuel_value). Otherwise, the available power output will be based on the fluid temperature. */
  burns_fluid?: boolean;
  /** This property is used when `burns_fluid` is true and the fluid has a [fuel_value](prototype:FluidPrototype::fuel_value) of 0.

This property is also used when `burns_fluid` is false and the fluid is at default temperature.

In these cases, this property determines whether the fluid should be destroyed, meaning that the fluid is consumed at the rate of `fluid_usage_per_tick`, without producing any power. */
  destroy_non_fuel_fluid?: boolean;
  /** How much energy the generator produces compared to how much energy it consumes. For example, an effectivity of 0.5 means that half of the consumed energy is output as power. */
  effectivity?: number;
  energy_source: ElectricEnergySource;
  /** This must have a filter if `max_power_output` is not defined. */
  fluid_box: FluidBox;
  /** The number of fluid units the generator uses per tick. */
  fluid_usage_per_tick: FluidAmount;
  horizontal_animation?: Animation;
  horizontal_frozen_patch?: Sprite;
  /** The power production of the generator is capped to this value. This is also the value that is shown as the maximum power output in the tooltip of the generator.

`fluid_box` must have a filter if this is not defined. */
  max_power_output?: Energy;
  /** The maximum temperature to which the efficiency can increase. At this temperature the generator will run at 100% efficiency. Note: Higher temperature fluid can still be consumed.

Used to calculate the `max_power_output` if it is not defined and `burns_fluid` is false. Then, the max power output is `(min(fluid_max_temp, maximum_temperature) - fluid_default_temp) × fluid_usage_per_tick × fluid_heat_capacity × effectivity`, the fluid is the filter specified on the `fluid_box`. */
  maximum_temperature: number;
  /** Affects animation speed. */
  perceived_performance?: PerceivedPerformance;
  /** Scales the generator's fluid usage to its maximum power output.

Setting this to true prevents the generator from overconsuming fluid, for example when higher than`maximum_temperature` fluid is fed to the generator.

If scale_fluid_usage is false, the generator consumes the full `fluid_usage_per_tick` and any of the extra energy in the fluid (in the form of higher temperature) is wasted. The [steam engine](https://wiki.factorio.com/Steam_engine) exhibits this behavior when fed steam from [heat exchangers](https://wiki.factorio.com/Heat_exchanger). */
  scale_fluid_usage?: boolean;
  smoke?: SmokeSource[];
  vertical_animation?: Animation;
  vertical_frozen_patch?: Sprite;
}

export type GeneratorPrototype = _GeneratorPrototype &
  Omit<EntityWithOwnerPrototype, keyof _GeneratorPrototype>;

export function isGeneratorPrototype(
  value: unknown,
): value is GeneratorPrototype {
  return (value as { type: string }).type === 'generator';
}

/** Properties of the god controller. */
export interface GodControllerPrototype {
  /** Names of the crafting categories the player can craft recipes from. */
  crafting_categories?: RecipeCategoryID[];
  inventory_size: ItemStackIndex;
  item_pickup_distance: number;
  loot_pickup_distance: number;
  /** Names of the resource categories the player can mine resources from. */
  mining_categories?: ResourceCategoryID[];
  mining_speed: number;
  /** Must be >= 0.34375. */
  movement_speed: number;
  /** Name of the god-controller. Base game uses "default". */
  name: string;
  type: 'god-controller';
}

export function isGodControllerPrototype(
  value: unknown,
): value is GodControllerPrototype {
  return (value as { type: string }).type === 'god-controller';
}

/** This prototype is used for receiving an achievement when the player gets attacked due to pollution. */
interface _GroupAttackAchievementPrototype {
  type: 'group-attack-achievement';
  /** This will trigger the achievement, if the player receives this amount of attacks. **Note**: The default achievement "it stinks and they don't like it" uses the amount of 1. (As in getting attacked once.) */
  amount?: number;
  /** The achievement is only triggered if the attacking group of enemies contains at least one of the entities listed here. */
  entities?: EntityID[];
}

export type GroupAttackAchievementPrototype = _GroupAttackAchievementPrototype &
  Omit<AchievementPrototype, keyof _GroupAttackAchievementPrototype>;

export function isGroupAttackAchievementPrototype(
  value: unknown,
): value is GroupAttackAchievementPrototype {
  return (value as { type: string }).type === 'group-attack-achievement';
}

/** The available GUI styles. */
interface _GuiStyle {
  type: 'gui-style';
  default_sprite_priority?: SpritePriority;
  default_sprite_scale?: number;
  default_tileset?: FileName;
}

export type GuiStyle = _GuiStyle & Omit<PrototypeBase, keyof _GuiStyle>;

export function isGuiStyle(value: unknown): value is GuiStyle {
  return (value as { type: string }).type === 'gui-style';
}

/** A gun. A weapon to deal damage to entities. */
interface _GunPrototype {
  type: 'gun';
  /** The information the item needs to know in order to know what ammo it requires, the sounds, and range. */
  attack_parameters: AttackParameters;
}

export type GunPrototype = _GunPrototype &
  Omit<ItemPrototype, keyof _GunPrototype>;

export function isGunPrototype(value: unknown): value is GunPrototype {
  return (value as { type: string }).type === 'gun';
}

/** A half diagonal rail. */
interface _HalfDiagonalRailPrototype {
  type: 'half-diagonal-rail';
  /** The [collision_box](prototype:EntityPrototype::collision_box) of straight rail is hardcoded to `{{-0.75, -1.9}, {0.75, 1.9}}`. */
  collision_box?: BoundingBox;
}

export type HalfDiagonalRailPrototype = _HalfDiagonalRailPrototype &
  Omit<RailPrototype, keyof _HalfDiagonalRailPrototype>;

export function isHalfDiagonalRailPrototype(
  value: unknown,
): value is HalfDiagonalRailPrototype {
  return (value as { type: string }).type === 'half-diagonal-rail';
}

/** This entity produces or consumes heat. Its heat settings can be changed runtime. */
interface _HeatInterfacePrototype {
  type: 'heat-interface';
  gui_mode?: 'all' | 'none' | 'admins';
  heat_buffer: HeatBuffer;
  picture?: Sprite;
}

export type HeatInterfacePrototype = _HeatInterfacePrototype &
  Omit<EntityWithOwnerPrototype, keyof _HeatInterfacePrototype>;

export function isHeatInterfacePrototype(
  value: unknown,
): value is HeatInterfacePrototype {
  return (value as { type: string }).type === 'heat-interface';
}

/** A [heat pipe](https://wiki.factorio.com/Heat_pipe). */
interface _HeatPipePrototype {
  type: 'heat-pipe';
  connection_sprites?: ConnectableEntityGraphics;
  heat_buffer: HeatBuffer;
  heat_glow_sprites?: ConnectableEntityGraphics;
}

export type HeatPipePrototype = _HeatPipePrototype &
  Omit<EntityWithOwnerPrototype, keyof _HeatPipePrototype>;

export function isHeatPipePrototype(
  value: unknown,
): value is HeatPipePrototype {
  return (value as { type: string }).type === 'heat-pipe';
}

/** Used to attach graphics for [cursor boxes](prototype:CursorBoxType) to entities during runtime. HighlightBoxEntity can also be independent from entities so it is simply drawn somewhere in the world. See [LuaSurface::create_entity](runtime:LuaSurface::create_entity) for the available options for type "highlight-box".

The [collision_box](prototype:EntityPrototype::collision_box) of the highlight box prototype is ignored during runtime, instead the "bounding_box" given in create_entity() or the selection box of the target entity is used. */

interface _HighlightBoxEntityPrototype {
  type: 'highlight-box';
}

export type HighlightBoxEntityPrototype = _HighlightBoxEntityPrototype &
  Omit<EntityPrototype, keyof _HighlightBoxEntityPrototype>;

export function isHighlightBoxEntityPrototype(
  value: unknown,
): value is HighlightBoxEntityPrototype {
  return (value as { type: string }).type === 'highlight-box';
}

export interface ImpactCategory {
  /** Name of the impact category. */
  name: string;
  type: 'impact-category';
}

export function isImpactCategory(value: unknown): value is ImpactCategory {
  return (value as { type: string }).type === 'impact-category';
}

/** A generic container, such as a chest, that can spawn or void items and interact with the logistics network. */
interface _InfinityContainerPrototype {
  type: 'infinity-container';
  erase_contents_when_mined: boolean;
  /** Controls which players can control what the chest spawns. */
  gui_mode?: 'all' | 'none' | 'admins';
  /** The number of slots in this container. May not be zero. */
  inventory_size: ItemStackIndex;
  /** The way this chest interacts with the logistic network. */
  logistic_mode?:
    | 'active-provider'
    | 'passive-provider'
    | 'requester'
    | 'storage'
    | 'buffer';
  /** Whether the "no network" icon should be rendered on this entity if the entity is not within a logistics network. */
  render_not_in_network_icon?: boolean;
}

export type InfinityContainerPrototype = _InfinityContainerPrototype &
  Omit<LogisticContainerPrototype, keyof _InfinityContainerPrototype>;

export function isInfinityContainerPrototype(
  value: unknown,
): value is InfinityContainerPrototype {
  return (value as { type: string }).type === 'infinity-container';
}

/** This entity produces or consumes fluids. Its fluid settings can be changed runtime. */
interface _InfinityPipePrototype {
  type: 'infinity-pipe';
  gui_mode?: 'all' | 'none' | 'admins';
}

export type InfinityPipePrototype = _InfinityPipePrototype &
  Omit<PipePrototype, keyof _InfinityPipePrototype>;

export function isInfinityPipePrototype(
  value: unknown,
): value is InfinityPipePrototype {
  return (value as { type: string }).type === 'infinity-pipe';
}

/** An [inserter](https://wiki.factorio.com/Inserter). */
interface _InserterPrototype {
  type: 'inserter';
  /** Whether this burner inserter can fuel itself from the fuel inventory of the entity it is picking up items from. */
  allow_burner_leech?: boolean;
  /** Whether pickup and insert position can be set run-time. */
  allow_custom_vectors?: boolean;
  /** Whether this inserter is considered a bulk inserter. Relevant for determining how [inserter capacity bonus (research)](https://wiki.factorio.com/Inserter_capacity_bonus_(research)) applies to the inserter. */
  bulk?: boolean;
  /** Whether the inserter hand should move to the items it picks up from belts, leading to item chasing behaviour. If this is off, the inserter hand will stay in the center of the belt and any items picked up from the edges of the belt "teleport" to the inserter hand. */
  chases_belt_items?: boolean;
  circuit_connector?: [
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
  ];
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  default_stack_control_input_signal?: SignalIDConnector;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** Whether the item that the inserter is holding should be drawn. */
  draw_held_item?: boolean;
  /** Whether the yellow arrow that indicates the drop point of the inserter and the line that indicates the pickup position should be drawn. */
  draw_inserter_arrow?: boolean;
  energy_per_movement?: Energy;
  energy_per_rotation?: Energy;
  /** Defines how this inserter gets energy. The emissions set on the energy source are ignored so inserters cannot produce pollution. */
  energy_source: EnergySource;
  /** If inserter waits for full hand it could become stuck when item in hand changed because of spoiling. If this flag is set then inserter will start dropping held stack even if it was waiting for full hand. */
  enter_drop_mode_if_held_stack_spoiled?: boolean;
  extension_speed: number;
  /** How many filters this inserter has. Maximum count of filtered items in inserter is 5. */
  filter_count?: number;
  /** If drop target is belt, inserter may grab less so that it does not drop partial stacks unless it is forced to drop partial. */
  grab_less_to_match_belt_stack?: boolean;
  hand_base_frozen?: Sprite;
  hand_base_picture?: Sprite;
  hand_base_shadow?: Sprite;
  hand_closed_frozen?: Sprite;
  hand_closed_picture?: Sprite;
  hand_closed_shadow?: Sprite;
  hand_open_frozen?: Sprite;
  hand_open_picture?: Sprite;
  hand_open_shadow?: Sprite;
  /** Used to determine how long the arm of the inserter is when drawing it. Does not affect gameplay. The lower the value, the straighter the arm. Increasing the value will give the inserter a bigger bend due to its longer parts. */
  hand_size?: number;
  insert_position: Vector;
  /** This inserter will not create stacks on belt with more than this amount of items. Must be >= 1. */
  max_belt_stack_size?: number;
  pickup_position: Vector;
  platform_frozen?: Sprite4Way;
  platform_picture?: Sprite4Way;
  rotation_speed: number;
  /** Stack size bonus that is inherent to the prototype without having to be researched. */
  stack_size_bonus?: number;
  /** Whether the inserter should be able to fish [fish](https://wiki.factorio.com/Raw_fish). */
  use_easter_egg?: boolean;
  /** Inserter will wait until its hand is full. */
  wait_for_full_hand?: boolean;
}

export type InserterPrototype = _InserterPrototype &
  Omit<EntityWithOwnerPrototype, keyof _InserterPrototype>;

export function isInserterPrototype(
  value: unknown,
): value is InserterPrototype {
  return (value as { type: string }).type === 'inserter';
}

interface _InventoryBonusEquipmentPrototype {
  type: 'inventory-bonus-equipment';
  energy_source?: ElectricEnergySource;
  inventory_size_bonus: ItemStackIndex;
}

export type InventoryBonusEquipmentPrototype =
  _InventoryBonusEquipmentPrototype &
    Omit<EquipmentPrototype, keyof _InventoryBonusEquipmentPrototype>;

export function isInventoryBonusEquipmentPrototype(
  value: unknown,
): value is InventoryBonusEquipmentPrototype {
  return (value as { type: string }).type === 'inventory-bonus-equipment';
}

/** The entity used for items on the ground. */
interface _ItemEntityPrototype {
  type: 'item-entity';
  /** Item entity collision box has to have same width as height.

Specification of the entity collision boundaries. Empty collision box means no collision and is used for smoke, projectiles, particles, explosions etc.

The `{0,0}` coordinate in the collision box will match the entity position. It should be near the center of the collision box, to keep correct entity drawing order. The bounding box must include the `{0,0}` coordinate.

Note, that for buildings, it is customary to leave 0.1 wide border between the edge of the tile and the edge of the building, this lets the player move between the building and electric poles/inserters etc. */
  collision_box?: BoundingBox;
}

export type ItemEntityPrototype = _ItemEntityPrototype &
  Omit<EntityPrototype, keyof _ItemEntityPrototype>;

export function isItemEntityPrototype(
  value: unknown,
): value is ItemEntityPrototype {
  return (value as { type: string }).type === 'item-entity';
}

/** An item group. Item groups are the tabs shown above the list of craftable items in the player's inventory GUI. The built-in groups are "logistics", "production", "intermediate-products" and "combat" but mods can define their own.

Items are sorted into item groups by sorting them into a [subgroup](prototype:ItemPrototype::subgroup) which then belongs to an [item group](prototype:ItemSubGroup::group). */
interface _ItemGroup {
  type: 'item-group';
  /** Path to the icon that is shown to represent this item group.

Mandatory if `icons` is not defined. */
  icon?: FileName;
  /** The size of the square icon, in pixels. E.g. `32` for a 32px by 32px icon. Must be larger than `0`.

The base game uses 128px icons for item groups.

Only loaded if `icons` is not defined. */
  icon_size?: SpriteSizeType;
  /** The icon that is shown to represent this item group. Can't be an empty array. */
  icons?: IconData[];
  /** Item ingredients in recipes are ordered by item group. The `order_in_recipe` property can be used to specify the ordering in recipes without affecting the inventory order. */
  order_in_recipe?: Order;
}

export type ItemGroup = _ItemGroup & Omit<Prototype, keyof _ItemGroup>;

export function isItemGroup(value: unknown): value is ItemGroup {
  return (value as { type: string }).type === 'item-group';
}

/** Possible configuration for all items. */
interface _ItemPrototype {
  type: 'item';
  /** The item that is the result when this item gets burned as fuel. */
  burnt_result?: ItemID;
  close_sound?: Sound;
  /** Only used by hidden setting, support may be limited. */
  color_hint?: ColorHintSpecification;
  /** If this is set, it is used to show items in alt-mode instead of the normal item icon. This can be useful to increase the contrast of the icon with the dark alt-mode [icon outline](prototype:UtilityConstants::item_outline_color).

Path to the icon file.

Only loaded if `dark_background_icons` is not defined. */
  dark_background_icon?: FileName;
  /** The size of the square icon, in pixels. E.g. `32` for a 32px by 32px icon. Must be larger than `0`.

Only loaded if `dark_background_icons` is not defined. */
  dark_background_icon_size?: SpriteSizeType;
  /** Can't be an empty array. */
  dark_background_icons?: IconData[];
  default_import_location?: SpaceLocationID;
  /** The effect/trigger that happens when an item is destroyed by being dropped on a [TilePrototype](prototype:TilePrototype) marked as destroying dropped items.

This overrides the [TilePrototype::default_destroyed_dropped_item_trigger](prototype:TilePrototype::default_destroyed_dropped_item_trigger) from the tile. */
  destroyed_by_dropping_trigger?: Trigger;
  drop_sound?: Sound;
  /** Specifies some properties of the item. */
  flags?: ItemPrototypeFlags;
  /** Must be 0 or positive. */
  fuel_acceleration_multiplier?: number;
  /** Additional fuel acceleration multiplier per quality level. Defaults to 30% of `fuel_acceleration_multiplier - 1` if `fuel_acceleration_multiplier` is larger than 1. Otherwise defaults to 0.

Must be 0 or positive. */
  fuel_acceleration_multiplier_quality_bonus?: number;
  /** Must exist when a nonzero fuel_value is defined. */
  fuel_category?: FuelCategoryID;
  fuel_emissions_multiplier?: number;
  /** Colors the glow of the burner energy source when this fuel is burned. Can also be used to color the glow of reactors burning the fuel, see [ReactorPrototype::use_fuel_glow_color](prototype:ReactorPrototype::use_fuel_glow_color). */
  fuel_glow_color?: Color;
  /** Must be 0 or positive. */
  fuel_top_speed_multiplier?: number;
  /** Additional fuel top speed multiplier per quality level. Defaults to 30% of `fuel_top_speed_multiplier - 1` if `fuel_top_speed_multiplier` is larger than 1. Otherwise defaults to 0.

Must be 0 or positive. */
  fuel_top_speed_multiplier_quality_bonus?: number;
  /** Amount of energy the item gives when used as fuel.

Mandatory if `fuel_acceleration_multiplier`, `fuel_top_speed_multiplier` or `fuel_emissions_multiplier` or `fuel_glow_color` are used. */
  fuel_value?: Energy;
  has_random_tint?: boolean;
  /** Path to the icon file.

Mandatory if `icons` is not defined. */
  icon?: FileName;
  /** The size of the square icon, in pixels. E.g. `32` for a 32px by 32px icon. Must be larger than `0`.

Only loaded if `icons` is not defined. */
  icon_size?: SpriteSizeType;
  /** Can't be an empty array. */
  icons?: IconData[];
  ingredient_to_weight_coefficient?: number;
  inventory_move_sound?: Sound;
  open_sound?: Sound;
  pick_sound?: Sound;
  /** Used to give the item multiple different icons so that they look less uniform on belts. For inventory icons and similar, `icon/icons` will be used. Maximum number of variations is 16.

When using sprites of size `64` (same as base game icons), the `scale` should be set to 0.5. */
  pictures?: SpriteVariations;
  place_as_equipment_result?: EquipmentID;
  place_as_tile?: PlaceAsTile;
  /** Name of the [EntityPrototype](prototype:EntityPrototype) that can be built using this item. If this item should be the one that construction bots use to build the specified `place_result`, set the `"primary-place-result"` [item flag](prototype:ItemPrototypeFlags).

The localised name of the entity will be used as the in-game item name. This behavior can be overwritten by specifying `localised_name` on this item, it will be used instead. */
  place_result?: EntityID;
  plant_result?: EntityID;
  /** Randomly tints item instances on belts and in the world. 0 no tinting. 1 full tint. */
  random_tint_color?: Color;
  rocket_launch_products?: ItemProductPrototype[];
  /** The way this item works when we try to send it to the orbit on its own.

When "manual" is set, it can only be launched by pressing the launch button in the rocket silo.

When "automated" is set, it will force the existence of "launch to orbit automatically" checkBox in the rocket silo which will then force the silo to automatically send the item to orbit when present. */
  send_to_orbit_mode?: SendToOrbitMode;
  spoil_result?: ItemID;
  spoil_ticks?: number;
  /** Only loaded if `spoil_result` is not defined. */
  spoil_to_trigger_result?: SpoilToTriggerResult;
  /** Count of items of the same name that can be stored in one inventory slot. Must be 1 when the `"not-stackable"` flag is set. */
  stack_size: ItemCountType;
  /** The default weight is calculated automatically from recipes and falls back to [UtilityConstants::default_item_weight](prototype:UtilityConstants::default_item_weight). */
  weight?: Weight;
}

export type ItemPrototype = _ItemPrototype &
  Omit<Prototype, keyof _ItemPrototype>;

export function isItemPrototype(value: unknown): value is ItemPrototype {
  return (value as { type: string }).type === 'item';
}

/** Entity used to signify that an entity is requesting items, for example modules for an assembling machine after it was blueprinted with modules inside. */
interface _ItemRequestProxyPrototype {
  type: 'item-request-proxy';
  use_target_entity_alert_icon_shift?: boolean;
}

export type ItemRequestProxyPrototype = _ItemRequestProxyPrototype &
  Omit<EntityPrototype, keyof _ItemRequestProxyPrototype>;

export function isItemRequestProxyPrototype(
  value: unknown,
): value is ItemRequestProxyPrototype {
  return (value as { type: string }).type === 'item-request-proxy';
}

/** An item subgroup. Item subgroups are the rows in the recipe list in the player's inventory GUI. The subgroup of a prototype also determines its item [group](prototype:ItemGroup::group) (tab in the recipe list).

The built-in subgroups can be found [here](https://wiki.factorio.com/Data.raw#item-subgroup). See [ItemPrototype::subgroup](prototype:ItemPrototype::subgroup) for setting the subgroup of an item. */
interface _ItemSubGroup {
  type: 'item-subgroup';
  /** The item group this subgroup is located in. */
  group: ItemGroupID;
}

export type ItemSubGroup = _ItemSubGroup & Omit<Prototype, keyof _ItemSubGroup>;

export function isItemSubGroup(value: unknown): value is ItemSubGroup {
  return (value as { type: string }).type === 'item-subgroup';
}

/** ItemWithEntityData saves data associated with the entity that it represents, for example the content of the equipment grid of a car. */
interface _ItemWithEntityDataPrototype {
  type: 'item-with-entity-data';
  /** Path to the icon file.

Only loaded if `icon_tintables` is not defined. */
  icon_tintable?: FileName;
  /** Path to the icon file.

Only loaded if `icon_tintable_masks` is not defined and `icon_tintable` is defined. */
  icon_tintable_mask?: FileName;
  /** The size of the square icon, in pixels. E.g. `32` for a 32px by 32px icon. Must be larger than `0`.

Only loaded if `icon_tintable_masks` is not defined and `icon_tintable` is defined. */
  icon_tintable_mask_size?: SpriteSizeType;
  /** Can't be an empty array.

Only loaded if `icon_tintable` is defined. */
  icon_tintable_masks?: IconData[];
  /** The size of the square icon, in pixels. E.g. `32` for a 32px by 32px icon. Must be larger than `0`.

Only loaded if `icon_tintables` is not defined and `icon_tintable` is defined. */
  icon_tintable_size?: SpriteSizeType;
  /** Can't be an empty array.

Only loaded if `icon_tintable` is defined (`icon_tintables` takes precedence over `icon_tintable`). */
  icon_tintables?: IconData[];
}

export type ItemWithEntityDataPrototype = _ItemWithEntityDataPrototype &
  Omit<ItemPrototype, keyof _ItemWithEntityDataPrototype>;

export function isItemWithEntityDataPrototype(
  value: unknown,
): value is ItemWithEntityDataPrototype {
  return (value as { type: string }).type === 'item-with-entity-data';
}

/** The inventory allows setting player defined filters similar to cargo wagon inventories. */
interface _ItemWithInventoryPrototype {
  type: 'item-with-inventory';
  /** The locale key used when the player attempts to put an item that doesn't match the filter rules into the item-with-inventory. */
  filter_message_key?: string;
  /** This determines how filters are applied. If no filters are defined this is automatically set to "none". */
  filter_mode?: 'blacklist' | 'whitelist';
  /** The inventory size of the item. */
  inventory_size: ItemStackIndex;
  /** A list of explicit item names to be used as filters. */
  item_filters?: ItemID[];
  /** A list of explicit item group names to be used as filters. */
  item_group_filters?: ItemGroupID[];
  /** A list of explicit [item subgroup](prototype:ItemSubGroup) names to be used as filters. */
  item_subgroup_filters?: ItemSubGroupID[];
  /** Count of items of the same name that can be stored in one inventory slot. Must be 1 when the `"not-stackable"` flag is set. */
  stack_size: 1;
}

export type ItemWithInventoryPrototype = _ItemWithInventoryPrototype &
  Omit<ItemWithLabelPrototype, keyof _ItemWithInventoryPrototype>;

export function isItemWithInventoryPrototype(
  value: unknown,
): value is ItemWithInventoryPrototype {
  return (value as { type: string }).type === 'item-with-inventory';
}

/** Like a normal item but with the ability to have a colored label. */
interface _ItemWithLabelPrototype {
  type: 'item-with-label';
  /** The default label color the item will use. */
  default_label_color?: Color;
  /** If the item will draw its label when held in the cursor in place of the item count. */
  draw_label_for_cursor_render?: boolean;
}

export type ItemWithLabelPrototype = _ItemWithLabelPrototype &
  Omit<ItemPrototype, keyof _ItemWithLabelPrototype>;

export function isItemWithLabelPrototype(
  value: unknown,
): value is ItemWithLabelPrototype {
  return (value as { type: string }).type === 'item-with-label';
}

/** Item type that can store any basic arbitrary Lua data, see [LuaItemStack::tags](runtime:LuaItemStack::tags). */

interface _ItemWithTagsPrototype {
  type: 'item-with-tags';
}

export type ItemWithTagsPrototype = _ItemWithTagsPrototype &
  Omit<ItemWithLabelPrototype, keyof _ItemWithTagsPrototype>;

export function isItemWithTagsPrototype(
  value: unknown,
): value is ItemWithTagsPrototype {
  return (value as { type: string }).type === 'item-with-tags';
}

/** This prototype is used for receiving an achievement when the player destroys a certain amount of an entity, with a specific damage type. */
interface _KillAchievementPrototype {
  type: 'kill-achievement';
  /** This is the amount of entity of the specified type the player needs to destroy to receive the achievement. */
  amount?: number;
  /** The killer of the entity must be one of these entities. */
  damage_dealer?: EntityID | EntityID[];
  /** This defines how the player needs to destroy the specific entity. */
  damage_type?: DamageTypeID;
  /** This defines if the player needs to be in a vehicle. */
  in_vehicle?: boolean;
  /** This defines to make sure you are the one driving, for instance, in a tank rather than an automated train. */
  personally?: boolean;
  /** This defines which entity needs to be destroyed in order to receive the achievement. */
  to_kill?: EntityID | EntityID[];
  /** This defines what entity type needs to be destroyed in order to receive the achievement. */
  type_to_kill?: string;
}

export type KillAchievementPrototype = _KillAchievementPrototype &
  Omit<AchievementPrototype, keyof _KillAchievementPrototype>;

export function isKillAchievementPrototype(
  value: unknown,
): value is KillAchievementPrototype {
  return (value as { type: string }).type === 'kill-achievement';
}

/** A [lab](https://wiki.factorio.com/Lab). It consumes [science packs](prototype:ToolPrototype) to research [technologies](prototype:TechnologyPrototype). */
interface _LabPrototype {
  type: 'lab';
  /** Sets the [modules](prototype:ModulePrototype) and [beacon](prototype:BeaconPrototype) effects that are allowed to be used on this lab. */
  allowed_effects?: EffectTypeLimitation;
  /** Sets the [module categories](prototype:ModuleCategory) that are allowed to be inserted into this machine. */
  allowed_module_categories?: ModuleCategoryID[];
  effect_receiver?: EffectReceiver;
  /** Defines how this lab gets energy. */
  energy_source: EnergySource;
  /** The amount of energy this lab uses. */
  energy_usage: Energy;
  frozen_patch?: Sprite;
  /** A list of the names of science packs that can be used in this lab.

If a technology requires other types of science packs, it cannot be researched in this lab. */
  inputs: ItemID[];
  light?: LightDefinition;
  /** The number of module slots in this lab. */
  module_slots?: ItemStackIndex;
  /** The animation that plays when the lab is idle. */
  off_animation?: Animation;
  /** The animation that plays when the lab is active. */
  on_animation?: Animation;
  researching_speed?: number;
  /** May not be 0. May not be larger than 100. */
  science_pack_drain_rate_percent?: number;
  trash_inventory_size?: ItemStackIndex;
  /** Whether the [QualityPrototype::science_pack_drain_multiplier](prototype:QualityPrototype::science_pack_drain_multiplier) of the quality of the science pack should be considered by the lab. */
  uses_quality_drain_modifier?: boolean;
}

export type LabPrototype = _LabPrototype &
  Omit<EntityWithOwnerPrototype, keyof _LabPrototype>;

export function isLabPrototype(value: unknown): value is LabPrototype {
  return (value as { type: string }).type === 'lab';
}

/** A [lamp](https://wiki.factorio.com/Lamp) to provide light, using energy. */
interface _LampPrototype {
  type: 'lamp';
  /** Whether the lamp should always be on. */
  always_on?: boolean;
  circuit_connector?: CircuitConnectorDefinition;
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  /** darkness_for_all_lamps_on must be > darkness_for_all_lamps_off. Values must be between 0 and 1. */
  darkness_for_all_lamps_off?: number;
  /** darkness_for_all_lamps_on must be > darkness_for_all_lamps_off. Values must be between 0 and 1. */
  darkness_for_all_lamps_on?: number;
  default_blue_signal?: SignalIDConnector;
  default_green_signal?: SignalIDConnector;
  default_red_signal?: SignalIDConnector;
  default_rgb_signal?: SignalIDConnector;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** The emissions set on the energy source are ignored so lamps cannot produce pollution. */
  energy_source: ElectricEnergySource | VoidEnergySource;
  /** The amount of energy the lamp uses. Must be greater than > 0. */
  energy_usage_per_tick: Energy;
  glow_color_intensity?: number;
  glow_render_mode?: 'additive' | 'multiplicative';
  glow_size?: number;
  /** What color the lamp will be when it is on, and receiving power. */
  light?: LightDefinition;
  /** This refers to when the light is in a circuit network, and is lit a certain color based on a signal value. */
  light_when_colored?: LightDefinition;
  /** The lamps graphics when it's off. */
  picture_off?: Sprite;
  /** The lamps graphics when it's on. */
  picture_on?: Sprite;
  signal_to_color_mapping?: SignalColorMapping[];
}

export type LampPrototype = _LampPrototype &
  Omit<EntityWithOwnerPrototype, keyof _LampPrototype>;

export function isLampPrototype(value: unknown): value is LampPrototype {
  return (value as { type: string }).type === 'lamp';
}

/** A [land mine](https://wiki.factorio.com/Land_mine). */
interface _LandMinePrototype {
  type: 'land-mine';
  action?: Trigger;
  ammo_category?: AmmoCategoryID;
  /** Force the landmine to kill itself when exploding. */
  force_die_on_attack?: boolean;
  /** Whether this prototype should be a high priority target for enemy forces. See [Military units and structures](https://wiki.factorio.com/Military_units_and_structures). */
  is_military_target?: boolean;
  /** The sprite of the landmine before it is armed (just after placing). */
  picture_safe?: Sprite;
  /** The sprite of the landmine of a friendly force when it is armed. */
  picture_set?: Sprite;
  /** The sprite of the landmine of an enemy force when it is armed. */
  picture_set_enemy?: Sprite;
  /** Time between placing and the landmine being armed, in ticks. */
  timeout?: number;
  /** Collision mask that another entity must collide with to make this landmine blow up. */
  trigger_collision_mask?: CollisionMaskConnector;
  trigger_force?: ForceCondition;
  trigger_radius: number;
}

export type LandMinePrototype = _LandMinePrototype &
  Omit<EntityWithOwnerPrototype, keyof _LandMinePrototype>;

export function isLandMinePrototype(
  value: unknown,
): value is LandMinePrototype {
  return (value as { type: string }).type === 'land-mine';
}

interface _LaneSplitterPrototype {
  type: 'lane-splitter';
  structure: Animation4Way;
  structure_animation_movement_cooldown?: number;
  structure_animation_speed_coefficient?: number;
  structure_patch?: Animation4Way;
}

export type LaneSplitterPrototype = _LaneSplitterPrototype &
  Omit<TransportBeltConnectablePrototype, keyof _LaneSplitterPrototype>;

export function isLaneSplitterPrototype(
  value: unknown,
): value is LaneSplitterPrototype {
  return (value as { type: string }).type === 'lane-splitter';
}

/** A legacy curved rail. */
interface _LegacyCurvedRailPrototype {
  type: 'legacy-curved-rail';
  /** The [collision_box](prototype:EntityPrototype::collision_box) of legacy curved rail is hardcoded to `{{-0.75, -0.55}, {0.75, 1.6}}`.

The secondary collision box of legacy curved rail is hardcoded to `{{-0.68, -2.7}, {0.68, 2.7}}`. */
  collision_box?: BoundingBox;
}

export type LegacyCurvedRailPrototype = _LegacyCurvedRailPrototype &
  Omit<RailPrototype, keyof _LegacyCurvedRailPrototype>;

export function isLegacyCurvedRailPrototype(
  value: unknown,
): value is LegacyCurvedRailPrototype {
  return (value as { type: string }).type === 'legacy-curved-rail';
}

/** A legacy straight rail. */
interface _LegacyStraightRailPrototype {
  type: 'legacy-straight-rail';
  /** The [collision_box](prototype:EntityPrototype::collision_box) of legacy straight rail is hardcoded to `{{-0.7, -0.99}, {0.7, 0.99}}`. */
  collision_box?: BoundingBox;
}

export type LegacyStraightRailPrototype = _LegacyStraightRailPrototype &
  Omit<RailPrototype, keyof _LegacyStraightRailPrototype>;

export function isLegacyStraightRailPrototype(
  value: unknown,
): value is LegacyStraightRailPrototype {
  return (value as { type: string }).type === 'legacy-straight-rail';
}

interface _LightningAttractorPrototype {
  type: 'lightning-attractor';
  chargable_graphics?: ChargableGraphics;
  /** Cannot be less than 0. */
  efficiency?: number;
  /** Mandatory if `efficiency` is larger than 0. May not be defined if `efficiency` is 0. */
  energy_source?: ElectricEnergySource;
  lightning_strike_offset?: MapPosition;
  range_elongation?: number;
}

export type LightningAttractorPrototype = _LightningAttractorPrototype &
  Omit<EntityWithOwnerPrototype, keyof _LightningAttractorPrototype>;

export function isLightningAttractorPrototype(
  value: unknown,
): value is LightningAttractorPrototype {
  return (value as { type: string }).type === 'lightning-attractor';
}

interface _LightningPrototype {
  type: 'lightning';
  attracted_volume_modifier?: number;
  damage?: number;
  effect_duration: number;
  energy?: Energy;
  graphics_set?: LightningGraphicsSet;
  sound?: Sound;
  source_offset?: Vector;
  source_variance?: Vector;
  strike_effect?: Trigger;
  /** Must be less than or equal to `effect_duration`. */
  time_to_damage?: number;
}

export type LightningPrototype = _LightningPrototype &
  Omit<EntityPrototype, keyof _LightningPrototype>;

export function isLightningPrototype(
  value: unknown,
): value is LightningPrototype {
  return (value as { type: string }).type === 'lightning';
}

/** A belt that can be connected to a belt anywhere else, including on a different surface. The linked belts have to be [connected with console commands](https://wiki.factorio.com/Console#Connect_linked_belts) or runtime scripting in mods or scenarios. [LuaEntity::connect_linked_belts](runtime:LuaEntity::connect_linked_belts) and other runtime functions. */
interface _LinkedBeltPrototype {
  type: 'linked-belt';
  allow_blueprint_connection?: boolean;
  allow_clone_connection?: boolean;
  allow_side_loading?: boolean;
  structure?: LinkedBeltStructure;
  structure_render_layer?: RenderLayer;
}

export type LinkedBeltPrototype = _LinkedBeltPrototype &
  Omit<TransportBeltConnectablePrototype, keyof _LinkedBeltPrototype>;

export function isLinkedBeltPrototype(
  value: unknown,
): value is LinkedBeltPrototype {
  return (value as { type: string }).type === 'linked-belt';
}

/** A container that shares its inventory with containers with the same [link_id](runtime:LuaEntity::link_id), which can be set via the GUI. The link IDs are per prototype and force, so only containers with the **same ID**, **same prototype name** and **same force** will share inventories. */
interface _LinkedContainerPrototype {
  type: 'linked-container';
  circuit_connector?: CircuitConnectorDefinition;
  /** The maximum circuit wire distance for this linked container. */
  circuit_wire_max_distance?: number;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** Players that can access the GUI to change the link ID. */
  gui_mode?: 'all' | 'none' | 'admins';
  /** Must be > 0. */
  inventory_size: ItemStackIndex;
  /** Whether the inventory of this container can be filtered (like cargo wagons) or not. */
  inventory_type?: 'normal' | 'with_bar' | 'with_filters_and_bar';
  picture?: Sprite;
}

export type LinkedContainerPrototype = _LinkedContainerPrototype &
  Omit<EntityWithOwnerPrototype, keyof _LinkedContainerPrototype>;

export function isLinkedContainerPrototype(
  value: unknown,
): value is LinkedContainerPrototype {
  return (value as { type: string }).type === 'linked-container';
}

/** Continuously loads and unloads machines, as an alternative to inserters.

This loader type is identical to [Loader1x2Prototype](prototype:Loader1x2Prototype) with the exception of its hardcoded belt_distance. The belt_distance of the loader determines the distance between the position of this loader and the tile of the loader's belt target.

This loader type always has a belt_distance of 0, meaning by default it is 1 tile long in total. For a loader type with a belt_distance of 0.5, see [Loader1x2Prototype](prototype:Loader1x2Prototype). */

interface _Loader1x1Prototype {
  type: 'loader-1x1';
}

export type Loader1x1Prototype = _Loader1x1Prototype &
  Omit<LoaderPrototype, keyof _Loader1x1Prototype>;

export function isLoader1x1Prototype(
  value: unknown,
): value is Loader1x1Prototype {
  return (value as { type: string }).type === 'loader-1x1';
}

/** Continuously loads and unloads machines, as an alternative to inserters.

This loader type is identical to [Loader1x1Prototype](prototype:Loader1x1Prototype) with the exception of its hardcoded belt_distance. The belt_distance of the loader determines the distance between the position of this loader and the tile of the loader's belt target.

This loader type always has a belt_distance of 0.5, meaning by default it is 2 tiles long in total. For a loader type with a belt_distance of 0, see [Loader1x1Prototype](prototype:Loader1x1Prototype). */

interface _Loader1x2Prototype {
  type: 'loader';
}

export type Loader1x2Prototype = _Loader1x2Prototype &
  Omit<LoaderPrototype, keyof _Loader1x2Prototype>;

export function isLoader1x2Prototype(
  value: unknown,
): value is Loader1x2Prototype {
  return (value as { type: string }).type === 'loader';
}

/** Continuously loads and unloads machines, as an alternative to inserters. */
interface _LoaderPrototype {
  type: 'loader';
  /** Whether this loader can load and unload stationary inventories such as containers and crafting machines. */
  allow_container_interaction?: boolean;
  /** Whether this loader can load and unload [RollingStockPrototype](prototype:RollingStockPrototype). */
  allow_rail_interaction?: boolean;
  /** How long this loader's belt is. Should be the same as belt_distance, which is hardcoded to `0.5` for [Loader1x2Prototype](prototype:Loader1x2Prototype) and to 0 for [Loader1x1Prototype](prototype:Loader1x1Prototype). See the linked prototypes for an explanation of belt_distance. */
  belt_length?: number;
  /** First the four cardinal directions for `direction_out`, followed by the four directions for `direction_in`. */
  circuit_connector?: CircuitConnectorDefinition[];
  /** Render layer for all directions of the circuit connectors. */
  circuit_connector_layer?: RenderLayer;
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  /** The distance between the position of this loader and the tile of the loader's container target. */
  container_distance?: number;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** Energy in Joules. Can't be negative. */
  energy_per_item?: Energy;
  energy_source?:
    | ElectricEnergySource
    | HeatEnergySource
    | FluidEnergySource
    | VoidEnergySource;
  /** How many item filters this loader has. Maximum count of filtered items in loader is 5. */
  filter_count: number;
  /** Loader will not create stacks on belt that are larger than this value. Must be >= 1. */
  max_belt_stack_size?: number;
  structure?: LoaderStructure;
  structure_render_layer?: RenderLayer;
}

export type LoaderPrototype = _LoaderPrototype &
  Omit<TransportBeltConnectablePrototype, keyof _LoaderPrototype>;

export function isLoaderPrototype(value: unknown): value is LoaderPrototype {
  return (value as { type: string }).type === 'loader';
}

/** A [locomotive](https://wiki.factorio.com/Locomotive). */
interface _LocomotivePrototype {
  type: 'locomotive';
  darkness_to_render_light_animation?: number;
  energy_source: BurnerEnergySource | VoidEnergySource;
  front_light?: LightDefinition;
  front_light_pictures?: RollingStockRotatedSlopedGraphics;
  max_power: Energy;
  /** In tiles. A locomotive will snap to a nearby train stop when the player places it within this distance to the stop. */
  max_snap_to_train_stop_distance?: number;
  reversing_power_modifier: number;
}

export type LocomotivePrototype = _LocomotivePrototype &
  Omit<RollingStockPrototype, keyof _LocomotivePrototype>;

export function isLocomotivePrototype(
  value: unknown,
): value is LocomotivePrototype {
  return (value as { type: string }).type === 'locomotive';
}

/** A generic container, such as a chest, that interacts with the logistics network. */
interface _LogisticContainerPrototype {
  type: 'logistic-container';
  /** Drawn when a robot brings/takes items from this container. */
  animation?: Animation;
  /** Played when a robot brings/takes items from this container. Ignored if `animation` is not defined. */
  animation_sound?: Sound;
  /** The offset from the center of this container where a robot visually brings/takes items. */
  landing_location_offset?: Vector;
  /** The way this chest interacts with the logistic network. */
  logistic_mode:
    | 'active-provider'
    | 'passive-provider'
    | 'requester'
    | 'storage'
    | 'buffer';
  /** The number of request slots this logistics container has. Requester-type containers must have > 0 slots and can have a maximum of [UtilityConstants::max_logistic_filter_count](prototype:UtilityConstants::max_logistic_filter_count) slots. Storage-type containers must have <= 1 slot. */
  max_logistic_slots?: number;
  opened_duration?: number;
  /** Whether the "no network" icon should be rendered on this entity if the entity is not within a logistics network. */
  render_not_in_network_icon?: boolean;
  trash_inventory_size?: ItemStackIndex;
  /** Whether logistic robots have to deliver the exact amount of items requested to this logistic container instead of over-delivering (within their cargo size). */
  use_exact_mode?: boolean;
}

export type LogisticContainerPrototype = _LogisticContainerPrototype &
  Omit<ContainerPrototype, keyof _LogisticContainerPrototype>;

export function isLogisticContainerPrototype(
  value: unknown,
): value is LogisticContainerPrototype {
  return (value as { type: string }).type === 'logistic-container';
}

/** A [logistic robot](https://wiki.factorio.com/Logistic_robot). */
interface _LogisticRobotPrototype {
  type: 'logistic-robot';
  /** Must have a collision box size of zero. */
  collision_box?: BoundingBox;
  /** Only the first frame of the animation is drawn. This means that the graphics for the idle state cannot be animated. */
  idle_with_cargo?: RotatedAnimation;
  /** Only the first frame of the animation is drawn. This means that the graphics for the in_motion state cannot be animated. */
  in_motion_with_cargo?: RotatedAnimation;
  /** Only the first frame of the animation is drawn. This means that the graphics for the idle state cannot be animated. */
  shadow_idle_with_cargo?: RotatedAnimation;
  /** Only the first frame of the animation is drawn. This means that the graphics for the in_motion state cannot be animated. */
  shadow_in_motion_with_cargo?: RotatedAnimation;
}

export type LogisticRobotPrototype = _LogisticRobotPrototype &
  Omit<RobotWithLogisticInterfacePrototype, keyof _LogisticRobotPrototype>;

export function isLogisticRobotPrototype(
  value: unknown,
): value is LogisticRobotPrototype {
  return (value as { type: string }).type === 'logistic-robot';
}

/** The available map gen presets. */
export interface MapGenPresets {
  /** Name of the map gen presets. Base game uses "default". */
  name: string;
  type: 'map-gen-presets';
}

export function isMapGenPresets(value: unknown): value is MapGenPresets {
  return (value as { type: string }).type === 'map-gen-presets';
}

/** The default map settings. */
export interface MapSettings {
  asteroids: AsteroidSettings;
  difficulty_settings: DifficultySettings;
  enemy_evolution: EnemyEvolutionSettings;
  enemy_expansion: EnemyExpansionSettings;
  /** If a behavior fails this many times, the enemy (or enemy group) is destroyed. This solves biters stuck within their own base. */
  max_failed_behavior_count: number;
  /** Name of the map-settings. Base game uses "map-settings". */
  name: string;
  path_finder: PathFinderSettings;
  pollution: PollutionSettings;
  steering: SteeringSettings;
  type: 'map-settings';
  unit_group: UnitGroupSettings;
}

export function isMapSettings(value: unknown): value is MapSettings {
  return (value as { type: string }).type === 'map-settings';
}

/** Offers can be added to a market and they are shown when opening the entity. Offers allow to spend items to get research bonuses or items. */
interface _MarketPrototype {
  type: 'market';
  /** Whether all forces are allowed to open this market. */
  allow_access_to_all_forces?: boolean;
  picture?: Sprite;
}

export type MarketPrototype = _MarketPrototype &
  Omit<EntityWithOwnerPrototype, keyof _MarketPrototype>;

export function isMarketPrototype(value: unknown): value is MarketPrototype {
  return (value as { type: string }).type === 'market';
}

/** A mining drill for automatically extracting resources from [resource entities](prototype:ResourceEntityPrototype). This prototype type is used by [burner mining drill](https://wiki.factorio.com/Burner_mining_drill), [electric mining drill](https://wiki.factorio.com/Electric_mining_drill) and [pumpjack](https://wiki.factorio.com/Pumpjack) in vanilla. */
interface _MiningDrillPrototype {
  type: 'mining-drill';
  /** Sets the [modules](prototype:ModulePrototype) and [beacon](prototype:BeaconPrototype) effects that are allowed to be used on this mining drill. */
  allowed_effects?: EffectTypeLimitation;
  /** Sets the [module categories](prototype:ModuleCategory) that are allowed to be inserted into this machine. */
  allowed_module_categories?: ModuleCategoryID[];
  /** Used by the [pumpjack](https://wiki.factorio.com/Pumpjack) to have a static 4 way sprite. */
  base_picture?: Sprite4Way;
  base_render_layer?: RenderLayer;
  circuit_connector?: [
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
  ];
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  drilling_sound?: InterruptibleSound;
  drilling_sound_animation_end_frame?: number;
  drilling_sound_animation_start_frame?: number;
  drops_full_belt_stacks?: boolean;
  effect_receiver?: EffectReceiver;
  /** The energy source of this mining drill. */
  energy_source: EnergySource;
  /** The amount of energy used by the drill while mining. Can't be less than or equal to 0. */
  energy_usage: Energy;
  /** How many filters this mining drill has. Maximum count of filtered resources in a mining drill is 5. */
  filter_count?: number;
  graphics_set?: MiningDrillGraphicsSet;
  input_fluid_box?: FluidBox;
  /** The speed of this drill. */
  mining_speed: number;
  /** The number of module slots in this machine. */
  module_slots?: ItemStackIndex;
  /** When this mining drill is connected to the circuit network, the resource that it is reading (either the entire resource patch, or the resource in the mining area of the drill, depending on circuit network setting), is tinted in this color when mousing over the mining drill. */
  monitor_visualization_tint?: Color;
  moving_sound?: InterruptibleSound;
  output_fluid_box?: FluidBox;
  /** Affects animation speed. */
  perceived_performance?: PerceivedPerformance;
  /** The sprite used to show the range of the mining drill. */
  radius_visualisation_picture?: Sprite;
  /** The names of the [ResourceCategory](prototype:ResourceCategory) that can be mined by this drill. For a list of built-in categories, see [here](https://wiki.factorio.com/Data.raw#resource-category).

Note: Categories containing resources which produce items, fluids, or items+fluids may be combined on the same entity, but may not work as expected. Examples: Miner does not rotate fluid-resulting resources until depletion. Fluid isn't output (fluid resource change and fluidbox matches previous fluid). Miner with no `vector_to_place_result` can't output an item result and halts. */
  resource_categories: ResourceCategoryID[];
  resource_drain_rate_percent?: number;
  /** The distance from the centre of the mining drill to search for resources in.

This is 2.49 for electric mining drills (a 5x5 area) and 0.99 for burner mining drills (a 2x2 area). The drill searches resource outside its natural boundary box, which is 0.01 (the middle of the entity); making it 2.5 and 1.0 gives it another block radius. */
  resource_searching_radius: number;
  shuffle_resources_to_mine?: boolean;
  /** The position where any item results are placed, when the mining drill is facing north (default direction). If the drill does not produce any solid items but uses a fluidbox output instead (e.g. pumpjacks), a vector of `{0,0}` disables the yellow arrow alt-mode indicator for the placed item location. */
  vector_to_place_result: Vector;
  wet_mining_graphics_set?: MiningDrillGraphicsSet;
}

export type MiningDrillPrototype = _MiningDrillPrototype &
  Omit<EntityWithOwnerPrototype, keyof _MiningDrillPrototype>;

export function isMiningDrillPrototype(
  value: unknown,
): value is MiningDrillPrototype {
  return (value as { type: string }).type === 'mining-drill';
}

/** A module category. The built-in categories can be found [here](https://wiki.factorio.com/Data.raw#module-category). See [ModulePrototype::category](prototype:ModulePrototype::category). */

interface _ModuleCategory {
  type: 'module-category';
}

export type ModuleCategory = _ModuleCategory &
  Omit<Prototype, keyof _ModuleCategory>;

export function isModuleCategory(value: unknown): value is ModuleCategory {
  return (value as { type: string }).type === 'module-category';
}

/** A [module](https://wiki.factorio.com/Module). They are used to affect the capabilities of existing machines, for example by increasing the crafting speed of a [crafting machine](prototype:CraftingMachinePrototype). */
interface _ModulePrototype {
  type: 'module';
  /** Chooses with what art style the module is shown inside [beacons](prototype:BeaconPrototype). See [BeaconModuleVisualizations::art_style](prototype:BeaconModuleVisualizations::art_style). Vanilla uses `"vanilla"` here. */
  art_style?: string;
  beacon_tint?: BeaconVisualizationTints;
  /** Used when upgrading modules: Ctrl + click modules into an entity and it will replace lower tier modules of the same category with higher tier modules. */
  category: ModuleCategoryID;
  /** The effect of the module on the machine it's inserted in, such as increased pollution. */
  effect: Effect;
  requires_beacon_alt_mode?: boolean;
  /** Tier of the module inside its category. Used when upgrading modules: Ctrl + click modules into an entity and it will replace lower tier modules with higher tier modules if they have the same category. */
  tier: number;
}

export type ModulePrototype = _ModulePrototype &
  Omit<ItemPrototype, keyof _ModulePrototype>;

export function isModulePrototype(value: unknown): value is ModulePrototype {
  return (value as { type: string }).type === 'module';
}

/** This prototype is used for receiving an achievement when the player moves a module with the cursor. */
interface _ModuleTransferAchievementPrototype {
  type: 'module-transfer-achievement';
  /** How many modules need to be transferred. */
  amount?: number;
  /** If this is false, the player carries over their statistics from this achievement through all their saves. */
  limited_to_one_game?: boolean;
  /** This will trigger the achievement, if this module is transferred. */
  module: ItemID;
}

export type ModuleTransferAchievementPrototype =
  _ModuleTransferAchievementPrototype &
    Omit<AchievementPrototype, keyof _ModuleTransferAchievementPrototype>;

export function isModuleTransferAchievementPrototype(
  value: unknown,
): value is ModuleTransferAchievementPrototype {
  return (value as { type: string }).type === 'module-transfer-achievement';
}

/** Used by [SelectionToolPrototype::mouse_cursor](prototype:SelectionToolPrototype::mouse_cursor). */
export interface MouseCursor {
  /** Mandatory if `system_cursor` is not defined. */
  filename?: FileName;
  /** Mandatory if `system_cursor` is not defined. */
  hot_pixel_x?: number;
  /** Mandatory if `system_cursor` is not defined. */
  hot_pixel_y?: number;
  /** Name of the prototype. */
  name: string;
  /** Either this or the other three properties have to be present. */
  system_cursor?:
    | 'arrow'
    | 'i-beam'
    | 'crosshair'
    | 'wait-arrow'
    | 'size-all'
    | 'no'
    | 'hand';
  type: 'mouse-cursor';
}

export function isMouseCursor(value: unknown): value is MouseCursor {
  return (value as { type: string }).type === 'mouse-cursor';
}

/** Used by [exoskeleton](https://wiki.factorio.com/Exoskeleton). Increases max speed of characters or acceleration of vehicles if they have this equipment in their grid. */
interface _MovementBonusEquipmentPrototype {
  type: 'movement-bonus-equipment';
  energy_consumption: Energy;
  /** Multiplier of the character speed/vehicle acceleration. */
  movement_bonus: number;
}

export type MovementBonusEquipmentPrototype = _MovementBonusEquipmentPrototype &
  Omit<EquipmentPrototype, keyof _MovementBonusEquipmentPrototype>;

export function isMovementBonusEquipmentPrototype(
  value: unknown,
): value is MovementBonusEquipmentPrototype {
  return (value as { type: string }).type === 'movement-bonus-equipment';
}

/** A [NoiseExpression](prototype:NoiseExpression) with a name. The base game uses named noise expressions to specify functions for many map properties to be used in map generation; e.g. the "elevation" expression is used to calculate elevation for every point on a map. For a list of the built-in named noise expressions, see [data.raw](https://wiki.factorio.com/Data.raw#noise-expression).

Named noise expressions can be used by [MapGenSettings](prototype:MapGenSettings) and [MapGenPreset](prototype:MapGenPreset) to override which named expression is used to calculate a given property by having an entry in `property_expression_names`, e.g. `elevation = "elevation_island"`.

Alternate expressions can be made available in the map generator GUI by setting their `intended_property` to the name of the property they should override.

Named noise expressions can also be used as [noise variables](runtime:noise-expressions) e.g. `var("my-noise-expression")`. */
interface _NamedNoiseExpression {
  type: 'noise-expression';
  /** The noise expression itself. This is where most of the noise magic happens. */
  expression: NoiseExpression;
  /** Names the property that this expression is intended to provide a value for, if any. This will make the expression show up as an option in the map generator GUI, unless it is the only expression with that intended property, in which case it will be hidden and selected by default.

For example if a noise expression is intended to be used as an alternative temperature generator, `intended_property` should be "temperature". */
  intended_property?: string;
  /** A map of expression name to expression.

Local expressions are meant to store data locally similar to local variables in Lua. Their purpose is to hold noise expressions used multiple times in the named noise expression, or just to tell the reader that the local expression has a specific purpose. Local expressions can access other local definitions, but recursive definitions aren't supported. */
  local_expressions?: Record<string, NoiseExpression>;
  /** A map of function name to function.

Local functions serve the same purpose as local expressions - they aren't visible outside of the specific prototype and they have access to other local definitions. */
  local_functions?: Record<string, NoiseFunction>;
  /** Used to order alternative expressions in the map generator GUI. For a given property (e.g. 'temperature'), the NamedNoiseExpression with that property's name as its `intended_property` with the lowest order will be chosen as the default in the GUI.

If no order is specified, it defaults to "2000" if the property name matches the expression name (making it the 'technical default' generator for the property if none is specified in MapGenSettings), or "3000" otherwise. A generator defined with an order less than "2000" but with a unique name can thereby override the default generator used when creating a new map through the GUI without automatically overriding the 'technical default' generator, which is probably used by existing maps. */
  order?: Order;
}

export type NamedNoiseExpression = _NamedNoiseExpression &
  Omit<Prototype, keyof _NamedNoiseExpression>;

export function isNamedNoiseExpression(
  value: unknown,
): value is NamedNoiseExpression {
  return (value as { type: string }).type === 'noise-expression';
}

/** Named noise functions are defined in the same way as [NamedNoiseExpression](prototype:NamedNoiseExpression) except that they also have parameters.

Named noise functions are available to be used in [NoiseExpressions](prototype:NoiseExpression). */
interface _NamedNoiseFunction {
  type: 'noise-function';
  expression: NoiseExpression;
  /** A map of expression name to expression.

Local expressions are meant to store data locally similar to local variables in Lua. Their purpose is to hold noise expressions used multiple times in the named noise expression, or just to tell the reader that the local expression has a specific purpose. Local expressions can access other local definitions and also function parameters, but recursive definitions aren't supported. */
  local_expressions?: Record<string, NoiseExpression>;
  /** A map of function name to function.

Local functions serve the same purpose as local expressions - they aren't visible outside of the specific prototype and they have access to other local definitions. */
  local_functions?: Record<string, NoiseFunction>;
  /** The order of the parameters matters because functions can also be called with positional arguments.

A function can't have more than 255 parameters. */
  parameters: string[];
}

export type NamedNoiseFunction = _NamedNoiseFunction &
  Omit<Prototype, keyof _NamedNoiseFunction>;

export function isNamedNoiseFunction(
  value: unknown,
): value is NamedNoiseFunction {
  return (value as { type: string }).type === 'noise-function';
}

/** Used by [nightvision](https://wiki.factorio.com/Nightvision). */
interface _NightVisionEquipmentPrototype {
  type: 'night-vision-equipment';
  activate_sound?: Sound;
  color_lookup: DaytimeColorLookupTable;
  /** Must be >= 0 and <= 1. */
  darkness_to_turn_on?: number;
  deactivate_sound?: Sound;
  energy_input: Energy;
}

export type NightVisionEquipmentPrototype = _NightVisionEquipmentPrototype &
  Omit<EquipmentPrototype, keyof _NightVisionEquipmentPrototype>;

export function isNightVisionEquipmentPrototype(
  value: unknown,
): value is NightVisionEquipmentPrototype {
  return (value as { type: string }).type === 'night-vision-equipment';
}

/** An [offshore pump](https://wiki.factorio.com/Offshore_pump). */
interface _OffshorePumpPrototype {
  type: 'offshore-pump';
  /** If false, the offshore pump will not show fluid present (visually) before there is an output connected. The pump will also animate yet not show fluid when the fluid is 100% extracted (e.g. such as with a pump). */
  always_draw_fluid?: boolean;
  circuit_connector?: [
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
  ];
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** Defines how the offshore pump is powered.

When using an electric energy source and `drain` is not specified, it will be set to `energy_usage ÷ 30` automatically. */
  energy_source: EnergySource;
  /** Sets how much energy this offshore pump consumes. Energy usage has to be positive. */
  energy_usage: Energy;
  fluid_box: FluidBox;
  fluid_source_offset: Vector;
  graphics_set?: OffshorePumpGraphicsSet;
  /** Affects animation speed. */
  perceived_performance?: PerceivedPerformance;
  /** How many units of fluid are produced per tick. Must be > 0. */
  pumping_speed: FluidAmount;
  remove_on_tile_collision?: boolean;
}

export type OffshorePumpPrototype = _OffshorePumpPrototype &
  Omit<EntityWithOwnerPrototype, keyof _OffshorePumpPrototype>;

export function isOffshorePumpPrototype(
  value: unknown,
): value is OffshorePumpPrototype {
  return (value as { type: string }).type === 'offshore-pump';
}

/** An entity with a limited lifetime that can use trigger effects. */
interface _ParticlePrototype {
  type: 'optimized-particle';
  draw_shadow_when_on_ground?: boolean;
  ended_in_water_trigger_effect?: TriggerEffect;
  ended_on_ground_trigger_effect?: TriggerEffect;
  /** Defaults to `life_time` / 5, but at most 60. If this is 0, it is silently changed to 1. */
  fade_away_duration?: number;
  /** Can't be 1. */
  life_time: number;
  mining_particle_frame_speed?: number;
  movement_modifier?: number;
  movement_modifier_when_on_ground?: number;
  /** Picture variation count and individual frame count must be equal to shadow variation count. */
  pictures?: AnimationVariations;
  regular_trigger_effect?: TriggerEffect;
  /** Can't be 1. */
  regular_trigger_effect_frequency?: number;
  render_layer?: RenderLayer;
  render_layer_when_on_ground?: RenderLayer;
  /** Shadow variation variation count and individual frame count must be equal to picture variation count. */
  shadows?: AnimationVariations;
  /** Has to be >= -0.01 and <= 0.01. */
  vertical_acceleration?: number;
}

export type ParticlePrototype = _ParticlePrototype &
  Omit<Prototype, keyof _ParticlePrototype>;

export function isParticlePrototype(
  value: unknown,
): value is ParticlePrototype {
  return (value as { type: string }).type === 'optimized-particle';
}

/** Creates particles. */
interface _ParticleSourcePrototype {
  type: 'particle-source';
  height: number;
  height_deviation?: number;
  horizontal_speed: number;
  horizontal_speed_deviation?: number;
  /** Mandatory if `smoke` is not defined. */
  particle?: ParticleID;
  /** Mandatory if `particle` is not defined. */
  smoke?: SmokeSource[];
  time_before_start: number;
  time_before_start_deviation?: number;
  time_to_live: number;
  time_to_live_deviation?: number;
  vertical_speed: number;
  vertical_speed_deviation?: number;
}

export type ParticleSourcePrototype = _ParticleSourcePrototype &
  Omit<EntityPrototype, keyof _ParticleSourcePrototype>;

export function isParticleSourcePrototype(
  value: unknown,
): value is ParticleSourcePrototype {
  return (value as { type: string }).type === 'particle-source';
}

/** An entity to transport fluids over a distance and between machines. */
interface _PipePrototype {
  type: 'pipe';
  /** The area of the entity where fluid/gas inputs, and outputs. */
  fluid_box: FluidBox;
  horizontal_window_bounding_box: BoundingBox;
  /** All graphics for this pipe. */
  pictures?: PipePictures;
  vertical_window_bounding_box: BoundingBox;
}

export type PipePrototype = _PipePrototype &
  Omit<EntityWithOwnerPrototype, keyof _PipePrototype>;

export function isPipePrototype(value: unknown): value is PipePrototype {
  return (value as { type: string }).type === 'pipe';
}

/** A [pipe to ground](https://wiki.factorio.com/Pipe_to_ground). */
interface _PipeToGroundPrototype {
  type: 'pipe-to-ground';
  disabled_visualization?: Sprite4Way;
  /** Causes fluid icon to always be drawn, ignoring the usual pair requirement. */
  draw_fluid_icon_override?: boolean;
  fluid_box: FluidBox;
  frozen_patch?: Sprite4Way;
  pictures?: Sprite4Way;
  visualization?: Sprite4Way;
}

export type PipeToGroundPrototype = _PipeToGroundPrototype &
  Omit<EntityWithOwnerPrototype, keyof _PipeToGroundPrototype>;

export function isPipeToGroundPrototype(
  value: unknown,
): value is PipeToGroundPrototype {
  return (value as { type: string }).type === 'pipe-to-ground';
}

interface _PlaceEquipmentAchievementPrototype {
  type: 'place-equipment-achievement';
  amount?: number;
  armor: ItemID;
  limit_equip_quality: QualityID;
  limit_quality: QualityID;
  /** If this is false, the player carries over their statistics from this achievement through all their saves. */
  limited_to_one_game?: boolean;
}

export type PlaceEquipmentAchievementPrototype =
  _PlaceEquipmentAchievementPrototype &
    Omit<AchievementPrototype, keyof _PlaceEquipmentAchievementPrototype>;

export function isPlaceEquipmentAchievementPrototype(
  value: unknown,
): value is PlaceEquipmentAchievementPrototype {
  return (value as { type: string }).type === 'place-equipment-achievement';
}

interface _PlanetPrototype {
  type: 'planet';
  entities_require_heating?: boolean;
  lightning_properties?: LightningProperties;
  map_gen_settings?: PlanetPrototypeMapGenSettings;
  map_seed_offset?: number;
  persistent_ambient_sounds?: PersistentWorldAmbientSoundsDefinition;
  player_effects?: Trigger;
  pollutant_type?: AirbornePollutantID;
  surface_properties?: Record<SurfacePropertyID, number>;
  surface_render_parameters?: SurfaceRenderParameters;
  ticks_between_player_effects?: MapTick;
}

export type PlanetPrototype = _PlanetPrototype &
  Omit<SpaceLocationPrototype, keyof _PlanetPrototype>;

export function isPlanetPrototype(value: unknown): value is PlanetPrototype {
  return (value as { type: string }).type === 'planet';
}

interface _PlantPrototype {
  type: 'plant';
  agricultural_tower_tint?: RecipeTints;
  /** Must be positive. */
  growth_ticks: MapTick;
  /** The burst of pollution to emit when the plant is harvested. */
  harvest_emissions?: Record<AirbornePollutantID, number>;
}

export type PlantPrototype = _PlantPrototype &
  Omit<TreePrototype, keyof _PlantPrototype>;

export function isPlantPrototype(value: unknown): value is PlantPrototype {
  return (value as { type: string }).type === 'plant';
}

/** This prototype is used for receiving an achievement when the player receives damage. */
interface _PlayerDamagedAchievementPrototype {
  type: 'player-damaged-achievement';
  /** This will trigger the achievement, if the amount of damage taken by the dealer, is more than this. */
  minimum_damage: number;
  /** This sets the achievement to only trigger, if you survive the minimum amount of damage. If you don't need to survive, false. */
  should_survive: boolean;
  /** This will trigger the achievement, if the player takes damage from this specific entity type. */
  type_of_dealer?: string;
}

export type PlayerDamagedAchievementPrototype =
  _PlayerDamagedAchievementPrototype &
    Omit<AchievementPrototype, keyof _PlayerDamagedAchievementPrototype>;

export function isPlayerDamagedAchievementPrototype(
  value: unknown,
): value is PlayerDamagedAchievementPrototype {
  return (value as { type: string }).type === 'player-damaged-achievement';
}

/** Deprecated in 2.0. */

interface _PlayerPortPrototype {
  type: 'player-port';
}

export type PlayerPortPrototype = _PlayerPortPrototype &
  Omit<EntityWithOwnerPrototype, keyof _PlayerPortPrototype>;

export function isPlayerPortPrototype(
  value: unknown,
): value is PlayerPortPrototype {
  return (value as { type: string }).type === 'player-port';
}

/** A [power switch](https://wiki.factorio.com/Power_switch). */
interface _PowerSwitchPrototype {
  type: 'power-switch';
  circuit_wire_connection_point: WireConnectionPoint;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  frozen_patch?: Sprite;
  led_off?: Sprite;
  led_on?: Sprite;
  left_wire_connection_point: WireConnectionPoint;
  overlay_loop?: Animation;
  overlay_start?: Animation;
  overlay_start_delay: number;
  power_on_animation?: Animation;
  right_wire_connection_point: WireConnectionPoint;
  wire_max_distance?: number;
}

export type PowerSwitchPrototype = _PowerSwitchPrototype &
  Omit<EntityWithOwnerPrototype, keyof _PowerSwitchPrototype>;

export function isPowerSwitchPrototype(
  value: unknown,
): value is PowerSwitchPrototype {
  return (value as { type: string }).type === 'power-switch';
}

/** Helps [ProcessionLayers](prototype:ProcessionLayer) pass properties between subsequent transitions if they belong to the same group. */
interface _ProcessionLayerInheritanceGroup {
  type: 'procession-layer-inheritance-group';
  arrival_application?: TransitionApplication;
  intermezzo_application?: TransitionApplication;
}

export type ProcessionLayerInheritanceGroup = _ProcessionLayerInheritanceGroup &
  Omit<Prototype, keyof _ProcessionLayerInheritanceGroup>;

export function isProcessionLayerInheritanceGroup(
  value: unknown,
): value is ProcessionLayerInheritanceGroup {
  return (
    (value as { type: string }).type === 'procession-layer-inheritance-group'
  );
}

/** Describes the duration and visuals of a departure, arrival or an intermezzo while traveling between surfaces. Usually provided inside of a [ProcessionSet](prototype:ProcessionSet). */
interface _ProcessionPrototype {
  type: 'procession';
  /** Used alternatively when landing to ground. */
  ground_timeline?: ProcessionTimeline;
  /** Indexes used to match transitions from different surfaces together. Only a single intermezzo of a given procession_style may exist. */
  procession_style: number | number[];
  /** Used when leaving or arriving to a station. */
  timeline: ProcessionTimeline;
  /** Arrival and Departure are to be referenced by name. All intermezzos are collected during loading and filled in by `procession_style`. */
  usage: 'departure' | 'arrival' | 'intermezzo';
}

export type ProcessionPrototype = _ProcessionPrototype &
  Omit<Prototype, keyof _ProcessionPrototype>;

export function isProcessionPrototype(
  value: unknown,
): value is ProcessionPrototype {
  return (value as { type: string }).type === 'procession';
}

/** This prototype is used for receiving an achievement when the player produces more than the specified amount of items. */
interface _ProduceAchievementPrototype {
  type: 'produce-achievement';
  /** This will set the amount of items or fluids needed to craft, for the player to complete the achievement. */
  amount: MaterialAmountType;
  /** Mandatory if `item_product` is not defined.

This will tell the achievement what fluid the player needs to craft, to get the achievement. */
  fluid_product?: FluidID;
  /** Mandatory if `fluid_product` is not defined.

This will tell the achievement what item the player needs to craft, to get the achievement. */
  item_product?: ItemID;
  /** If this is false, the player carries over their statistics from this achievement through all their saves. */
  limited_to_one_game: boolean;
  quality?: QualityID;
}

export type ProduceAchievementPrototype = _ProduceAchievementPrototype &
  Omit<AchievementPrototype, keyof _ProduceAchievementPrototype>;

export function isProduceAchievementPrototype(
  value: unknown,
): value is ProduceAchievementPrototype {
  return (value as { type: string }).type === 'produce-achievement';
}

/** This prototype is used for receiving an achievement when the player crafts a specified item a certain amount, in an hour. */
interface _ProducePerHourAchievementPrototype {
  type: 'produce-per-hour-achievement';
  /** This is how much the player has to craft in an hour, to receive the achievement. */
  amount: MaterialAmountType;
  /** Mandatory if `item_product` is not defined.

This will tell the achievement what fluid the player needs to craft, to get the achievement. */
  fluid_product?: FluidID;
  /** Mandatory if `fluid_product` is not defined.

This will tell the achievement what item the player needs to craft, to get the achievement. */
  item_product?: ItemID;
}

export type ProducePerHourAchievementPrototype =
  _ProducePerHourAchievementPrototype &
    Omit<AchievementPrototype, keyof _ProducePerHourAchievementPrototype>;

export function isProducePerHourAchievementPrototype(
  value: unknown,
): value is ProducePerHourAchievementPrototype {
  return (value as { type: string }).type === 'produce-per-hour-achievement';
}

/** A [programmable speaker](https://wiki.factorio.com/Programmable_speaker). */
interface _ProgrammableSpeakerPrototype {
  type: 'programmable-speaker';
  audible_distance_modifier?: number;
  circuit_connector?: CircuitConnectorDefinition;
  circuit_wire_max_distance?: number;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  energy_source: ElectricEnergySource | VoidEnergySource;
  energy_usage_per_tick: Energy;
  instruments: ProgrammableSpeakerInstrument[];
  maximum_polyphony: number;
  sprite?: Sprite;
}

export type ProgrammableSpeakerPrototype = _ProgrammableSpeakerPrototype &
  Omit<EntityWithOwnerPrototype, keyof _ProgrammableSpeakerPrototype>;

export function isProgrammableSpeakerPrototype(
  value: unknown,
): value is ProgrammableSpeakerPrototype {
  return (value as { type: string }).type === 'programmable-speaker';
}

/** Entity with limited lifetime that can hit other entities and has triggers when this happens. */
interface _ProjectilePrototype {
  type: 'projectile';
  /** Must be != 0 if `turning_speed_increases_exponentially_with_projectile_speed` is true. */
  acceleration: number;
  /** Executed when the projectile hits something. */
  action?: Trigger;
  animation?: RotatedAnimationVariations;
  /** Setting this to true can be used to disable projectile homing behaviour. */
  direction_only?: boolean;
  enable_drawing_with_mask?: boolean;
  /** Executed when the projectile hits something, after `action` and only if the entity that was hit was destroyed. The projectile is destroyed right after the final_action. */
  final_action?: Trigger;
  force_condition?: ForceCondition;
  height?: number;
  /** When true the entity is hit at the position on its collision box the projectile first collides with. When false the entity is hit at its own position. */
  hit_at_collision_position?: boolean;
  /** Defaults to the mask from [UtilityConstants::default_collision_masks](prototype:UtilityConstants::default_collision_masks) when indexed by `"projectile/hit"`. */
  hit_collision_mask?: CollisionMaskConnector;
  light?: LightDefinition;
  /** Must be greater than or equal to 0. */
  max_speed?: number;
  /** Whenever an entity is hit by the projectile, this number gets reduced by the health of the entity. If the number is then below 0, the `final_action` is applied and the projectile destroyed. Otherwise, the projectile simply continues to its destination. */
  piercing_damage?: number;
  /** Whether the animation of the projectile is rotated to match the direction of travel. */
  rotatable?: boolean;
  shadow?: RotatedAnimationVariations;
  smoke?: SmokeSource[];
  speed_modifier?: Vector;
  /** Must be greater than or equal to 0. */
  turn_speed?: number;
  turning_speed_increases_exponentially_with_projectile_speed?: boolean;
}

export type ProjectilePrototype = _ProjectilePrototype &
  Omit<EntityPrototype, keyof _ProjectilePrototype>;

export function isProjectilePrototype(
  value: unknown,
): value is ProjectilePrototype {
  return (value as { type: string }).type === 'projectile';
}

interface _Prototype {
  /** The ID type corresponding to the prototype that inherits from this.

For example, if this is an [EntityPrototype](prototype:EntityPrototype), this property's type is [EntityID](prototype:EntityID). */
  factoriopedia_alternative?: string;
}

export type Prototype = _Prototype & Omit<PrototypeBase, keyof _Prototype>;
/** The abstract base for prototypes. PrototypeBase defines the common features of prototypes, such as localization and order. */
export interface PrototypeBase {
  /** Provides additional description used in factoriopedia. */
  factoriopedia_description?: LocalisedString;
  /** The simulation shown when looking at this prototype in the Factoriopedia GUI. */
  factoriopedia_simulation?: SimulationDefinition;
  hidden?: boolean;
  hidden_in_factoriopedia?: boolean;
  /** Overwrites the description set in the [locale file](https://wiki.factorio.com/Tutorial:Localisation). The description is usually shown in the tooltip of the prototype. */
  localised_description?: LocalisedString;
  /** Overwrites the name set in the [locale file](https://wiki.factorio.com/Tutorial:Localisation). Can be used to easily set a procedurally-generated name because the LocalisedString format allows to insert parameters into the name directly from the Lua script. */
  localised_name?: LocalisedString;
  /** Unique textual identification of the prototype. May only contain alphanumeric characters, dashes and underscores. May not exceed a length of 200 characters.

For a list of all names used in vanilla, see [data.raw](https://wiki.factorio.com/Data.raw). */
  name: string;
  /** Used to order prototypes in inventory, recipes and GUIs. May not exceed a length of 200 characters. */
  order?: Order;
  /** Whether the prototype is a special type which can be used to parametrize blueprints and doesn't have other function. */
  parameter?: boolean;
  /** The name of an [ItemSubGroup](prototype:ItemSubGroup). */
  subgroup?: ItemSubGroupID;
  /** Specifies the kind of prototype this is.

For a list of all possible types, see the [prototype overview](prototype:prototypes). */
  type: string;
}
/** The pump is used to transfer fluids between tanks, fluid wagons and pipes. */
interface _PumpPrototype {
  type: 'pump';
  /** The animation for the pump. */
  animations?: Animation4Way;
  circuit_connector?: [
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
  ];
  circuit_wire_max_distance?: number;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** The type of energy the pump uses. */
  energy_source: EnergySource;
  /** The amount of energy the pump uses. */
  energy_usage: Energy;
  fluid_animation?: Animation4Way;
  /** The area of the entity where fluid travels. */
  fluid_box: FluidBox;
  fluid_wagon_connector_alignment_tolerance?: number;
  fluid_wagon_connector_frame_count?: number;
  fluid_wagon_connector_graphics?: FluidWagonConnectorGraphics;
  fluid_wagon_connector_speed?: number;
  frozen_patch?: Sprite4Way;
  glass_pictures?: Sprite4Way;
  /** The amount of fluid this pump transfers per tick. */
  pumping_speed: FluidAmount;
}

export type PumpPrototype = _PumpPrototype &
  Omit<EntityWithOwnerPrototype, keyof _PumpPrototype>;

export function isPumpPrototype(value: unknown): value is PumpPrototype {
  return (value as { type: string }).type === 'pump';
}

interface _QualityPrototype {
  type: 'quality';
  /** Must be >= 0. */
  beacon_power_usage_multiplier?: number;
  color: Color;
  draw_sprite_by_default?: boolean;
  /** Path to the icon file.

Mandatory if `icons` is not defined. */
  icon?: FileName;
  /** The size of the square icon, in pixels. E.g. `32` for a 32px by 32px icon. Must be larger than `0`.

Only loaded if `icons` is not defined. */
  icon_size?: SpriteSizeType;
  /** Can't be an empty array. */
  icons?: IconData[];
  /** Requires Space Age to use level greater than `0`. */
  level: number;
  /** Must be in range `[0, 1]`. */
  mining_drill_resource_drain_multiplier?: number;
  /** Unique textual identification of the prototype. May only contain alphanumeric characters, dashes and underscores. May not exceed a length of 200 characters.

Requires Space Age to create prototypes with name other than `normal` or `quality-unknown`. */
  name: string;
  next?: QualityID;
  /** Must be in range [0, 1.0]. */
  next_probability?: number;
  /** Must be in range `[0, 1]`. */
  science_pack_drain_multiplier?: number;
}

export type QualityPrototype = _QualityPrototype &
  Omit<Prototype, keyof _QualityPrototype>;

export function isQualityPrototype(value: unknown): value is QualityPrototype {
  return (value as { type: string }).type === 'quality';
}

/** A [radar](https://wiki.factorio.com/Radar). */
interface _RadarPrototype {
  type: 'radar';
  circuit_connector?: CircuitConnectorDefinition;
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  /** If set to true, radars on the same surface will connect to other radars on the same surface using hidden wires with [radar](runtime:defines.wire_origin.radars) origin. */
  connects_to_other_radars?: boolean;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** Must be between 0 and 1. Must be larger than or equal to `energy_fraction_to_disconnect`. */
  energy_fraction_to_connect?: number;
  /** Must be between 0 and 1. Must be less than or equal to `energy_fraction_to_connect`. */
  energy_fraction_to_disconnect?: number;
  /** The amount of energy the radar has to consume for nearby scan to be performed. This value doesn't have any effect on sector scanning.

Performance warning: nearby scan causes re-charting of many chunks, which is expensive operation. If you want to make a radar that updates map more in real time, you should keep its range low. If you are making radar with high range, you should set this value such that nearby scan is performed once a second or so. For example if you set `energy_usage` to 100kW, setting `energy_per_nearby_scan` to 100kJ will cause nearby scan to happen once per second. */
  energy_per_nearby_scan: Energy;
  /** The amount of energy it takes to scan a sector. This value doesn't have any effect on nearby scanning. */
  energy_per_sector: Energy;
  /** The energy source for this radar. */
  energy_source: EnergySource;
  /** The amount of energy this radar uses. */
  energy_usage: Energy;
  frozen_patch?: Sprite;
  /** Whether this prototype should be a high priority target for enemy forces. See [Military units and structures](https://wiki.factorio.com/Military_units_and_structures). */
  is_military_target?: boolean;
  /** The radius of the area constantly revealed by this radar, in chunks. */
  max_distance_of_nearby_sector_revealed: number;
  /** The radius of the area this radar can chart, in chunks. */
  max_distance_of_sector_revealed: number;
  pictures?: RotatedSprite;
  radius_minimap_visualisation_color?: Color;
  reset_orientation_when_frozen?: boolean;
  rotation_speed?: number;
}

export type RadarPrototype = _RadarPrototype &
  Omit<EntityWithOwnerPrototype, keyof _RadarPrototype>;

export function isRadarPrototype(value: unknown): value is RadarPrototype {
  return (value as { type: string }).type === 'radar';
}

/** A [rail chain signal](https://wiki.factorio.com/Rail_chain_signal). */

interface _RailChainSignalPrototype {
  type: 'rail-chain-signal';
}

export type RailChainSignalPrototype = _RailChainSignalPrototype &
  Omit<RailSignalBasePrototype, keyof _RailChainSignalPrototype>;

export function isRailChainSignalPrototype(
  value: unknown,
): value is RailChainSignalPrototype {
  return (value as { type: string }).type === 'rail-chain-signal';
}

/** A [rail planner](https://wiki.factorio.com/Rail_planner). */
interface _RailPlannerPrototype {
  type: 'rail-planner';
  manual_length_limit?: number;
  /** May not be an empty array. Entities must be rails and their first item-to-place must be this item. */
  rails: EntityID[];
  /** Name of a rail support. */
  support?: EntityID;
}

export type RailPlannerPrototype = _RailPlannerPrototype &
  Omit<ItemPrototype, keyof _RailPlannerPrototype>;

export function isRailPlannerPrototype(
  value: unknown,
): value is RailPlannerPrototype {
  return (value as { type: string }).type === 'rail-planner';
}

/** The abstract base of all rail prototypes. */
interface _RailPrototype {
  type: 'rail';
  /** Has to be 2 for 2x2 grid. */
  build_grid_size?: 2;
  deconstruction_marker_positions?: Vector[];
  ending_shifts?: Vector[];
  extra_planner_goal_penalty?: number;
  extra_planner_penalty?: number;
  fence_pictures?: RailFenceGraphicsSet;
  /** Must be 0, 2 or 4. Can't be non-zero if `fence_pictures` is defined. */
  forced_fence_segment_count?: number;
  pictures: RailPictureSet;
  removes_soft_decoratives?: boolean;
  /** The rail [selection_boxes](prototype:EntityPrototype::selection_box) are automatically calculated from the collision boxes, which are hardcoded. So effectively the selection boxes also hardcoded. */
  selection_box?: BoundingBox;
  /** Sound played when a character walks over this rail. */
  walking_sound?: Sound;
}

export type RailPrototype = _RailPrototype &
  Omit<EntityWithOwnerPrototype, keyof _RailPrototype>;

export function isRailPrototype(value: unknown): value is RailPrototype {
  return (value as { type: string }).type === 'rail';
}

/** A rail ramp. */
interface _RailRampPrototype {
  type: 'rail-ramp';
  /** The [collision_box](prototype:EntityPrototype::collision_box) of straight rail is hardcoded to `{{-1.6, -7.6}, {1.6, 7.6}}`. */
  collision_box?: BoundingBox;
  /** Defaults to the mask from [UtilityConstants::default_collision_masks](prototype:UtilityConstants::default_collision_masks) when indexed by `"allow_on_deep_oil_ocean"`. */
  collision_mask_allow_on_deep_oil_ocean?: CollisionMaskConnector;
  /** Must be lower than 500 and at least 1. */
  support_range?: number;
}

export type RailRampPrototype = _RailRampPrototype &
  Omit<RailPrototype, keyof _RailRampPrototype>;

export function isRailRampPrototype(
  value: unknown,
): value is RailRampPrototype {
  return (value as { type: string }).type === 'rail-ramp';
}

/** Used for rail corpses. */
interface _RailRemnantsPrototype {
  type: 'rail-remnants';
  /** Has to be 2 for 2x2 grid. */
  build_grid_size?: 2;
  /** "Rail remnant entities must have a non-zero [collision_box](prototype:EntityPrototype::collision_box) defined. */
  collision_box?: BoundingBox;
  pictures: RailPictureSet;
  related_rail: EntityID;
  secondary_collision_box?: BoundingBox;
}

export type RailRemnantsPrototype = _RailRemnantsPrototype &
  Omit<CorpsePrototype, keyof _RailRemnantsPrototype>;

export function isRailRemnantsPrototype(
  value: unknown,
): value is RailRemnantsPrototype {
  return (value as { type: string }).type === 'rail-remnants';
}

/** The abstract base entity for both rail signals. */
interface _RailSignalBasePrototype {
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  /** The [collision_box](prototype:EntityPrototype::collision_box) of rail signals is hardcoded to `{{-0.2, -0.2}, {0.2, 0.2}}`. */
  collision_box?: BoundingBox;
  default_blue_output_signal?: SignalIDConnector;
  default_green_output_signal?: SignalIDConnector;
  default_orange_output_signal?: SignalIDConnector;
  default_red_output_signal?: SignalIDConnector;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** Defaults to the mask from [UtilityConstants::default_collision_masks](prototype:UtilityConstants::default_collision_masks) when indexed by  `type .. "/elevated"`. */
  elevated_collision_mask?: CollisionMaskConnector;
  elevated_picture_set: RailSignalPictureSet;
  elevated_selection_priority?: number;
  /** The "placeable-off-grid" flag will be ignored for rail signals. */
  flags?: EntityPrototypeFlags;
  ground_picture_set: RailSignalPictureSet;
}

export type RailSignalBasePrototype = _RailSignalBasePrototype &
  Omit<EntityWithOwnerPrototype, keyof _RailSignalBasePrototype>;
/** A [rail signal](https://wiki.factorio.com/Rail_signal). */

interface _RailSignalPrototype {
  type: 'rail-signal';
}

export type RailSignalPrototype = _RailSignalPrototype &
  Omit<RailSignalBasePrototype, keyof _RailSignalPrototype>;

export function isRailSignalPrototype(
  value: unknown,
): value is RailSignalPrototype {
  return (value as { type: string }).type === 'rail-signal';
}

interface _RailSupportPrototype {
  type: 'rail-support';
  /** Has to be 2 for 2x2 grid. */
  build_grid_size?: 2;
  /** Defaults to the mask from [UtilityConstants::default_collision_masks](prototype:UtilityConstants::default_collision_masks) when indexed by `"allow_on_deep_oil_ocean"`. */
  collision_mask_allow_on_deep_oil_ocean?: CollisionMaskConnector;
  /** Array must contain 8 items. */
  elevated_selection_boxes?: BoundingBox[];
  graphics_set: RailSupportGraphicsSet;
  not_buildable_if_no_rails?: boolean;
  snap_to_spots_distance?: number;
  /** Must be lower than 500 and at least 1. */
  support_range?: number;
}

export type RailSupportPrototype = _RailSupportPrototype &
  Omit<EntityWithOwnerPrototype, keyof _RailSupportPrototype>;

export function isRailSupportPrototype(
  value: unknown,
): value is RailSupportPrototype {
  return (value as { type: string }).type === 'rail-support';
}

/** A [reactor](https://wiki.factorio.com/Reactor). */
interface _ReactorPrototype {
  type: 'reactor';
  circuit_connector?: CircuitConnectorDefinition;
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  /** If defined, number of variations must be at least equal to count of [connections](prototype:HeatBuffer::connections) defined in `heat_buffer`. Each variation represents connected heat buffer connection of corresponding index. */
  connection_patches_connected?: SpriteVariations;
  /** If defined, number of variations must be at least equal to count of [connections](prototype:HeatBuffer::connections) defined in `heat_buffer`. Each variation represents unconnected heat buffer connection of corresponding index. */
  connection_patches_disconnected?: SpriteVariations;
  /** How much energy this reactor can consume (from the input energy source) and then output as heat. */
  consumption: Energy;
  /** When `use_fuel_glow_color` is true, this is the color used as `working_light_picture` tint for fuels that don't have glow color defined. */
  default_fuel_glow_color?: Color;
  default_temperature_signal?: SignalIDConnector;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** May not be a heat energy source.

The input energy source, in vanilla it is a burner energy source. */
  energy_source: EnergySource;
  /** The energy output as heat. */
  heat_buffer: HeatBuffer;
  /** If defined, number of variations must be at least equal to count of [connections](prototype:HeatBuffer::connections) defined in `heat_buffer`. When reactor is heated, corresponding variations are drawn over `connection_patches_connected`. */
  heat_connection_patches_connected?: SpriteVariations;
  /** If defined, number of variations must be at least equal to count of [connections](prototype:HeatBuffer::connections) defined in `heat_buffer`. When reactor is heated, corresponding variations are drawn over `connection_patches_disconnected`. */
  heat_connection_patches_disconnected?: SpriteVariations;
  heat_lower_layer_picture?: Sprite;
  light?: LightDefinition;
  lower_layer_picture?: Sprite;
  /** The action is triggered when the reactor dies (is destroyed) at over 90% of max temperature. */
  meltdown_action?: Trigger;
  neighbour_bonus?: number;
  picture?: Sprite;
  /** When this is true, the reactor will stop consuming fuel/energy when the temperature has reached the maximum. */
  scale_energy_usage?: boolean;
  /** Whether the reactor should use [fuel_glow_color](prototype:ItemPrototype::fuel_glow_color) from the fuel item prototype as light color and tint for `working_light_picture`. [Forum post.](https://forums.factorio.com/71121) */
  use_fuel_glow_color?: boolean;
  working_light_picture?: Animation;
}

export type ReactorPrototype = _ReactorPrototype &
  Omit<EntityWithOwnerPrototype, keyof _ReactorPrototype>;

export function isReactorPrototype(value: unknown): value is ReactorPrototype {
  return (value as { type: string }).type === 'reactor';
}

/** A recipe category. The built-in categories can be found [here](https://wiki.factorio.com/Data.raw#recipe-category). See [RecipePrototype::category](prototype:RecipePrototype::category). Recipe categories can be used to specify which [machine](prototype:CraftingMachinePrototype::crafting_categories) can craft which [recipes](prototype:RecipePrototype).

The recipe category with the name "crafting" cannot contain recipes with fluid ingredients or products. */

interface _RecipeCategory {
  type: 'recipe-category';
}

export type RecipeCategory = _RecipeCategory &
  Omit<Prototype, keyof _RecipeCategory>;

export function isRecipeCategory(value: unknown): value is RecipeCategory {
  return (value as { type: string }).type === 'recipe-category';
}

/** A recipe. It can be a crafting recipe, a smelting recipe, or a custom type of recipe, see [RecipeCategory](prototype:RecipeCategory). */
interface _RecipePrototype {
  type: 'recipe';
  /** Whether the recipe can be used as an intermediate recipe in hand-crafting. */
  allow_as_intermediate?: boolean;
  allow_consumption?: boolean;
  allow_consumption_message?: LocalisedString;
  /** Whether this recipe is allowed to be broken down for the recipe tooltip "Total raw" calculations. */
  allow_decomposition?: boolean;
  /** Whether the recipe is allowed to have the extra inserter overload bonus applied (4 * stack inserter stack size). */
  allow_inserter_overload?: boolean;
  /** Whether the recipe is allowed to use intermediate recipes when hand-crafting. */
  allow_intermediates?: boolean;
  allow_pollution?: boolean;
  allow_pollution_message?: LocalisedString;
  allow_productivity?: boolean;
  allow_productivity_message?: LocalisedString;
  allow_quality?: boolean;
  allow_quality_message?: LocalisedString;
  allow_speed?: boolean;
  allow_speed_message?: LocalisedString;
  /** Sets the [module categories](prototype:ModuleCategory) that are allowed to be used with this recipe. */
  allowed_module_categories?: ModuleCategoryID[];
  alternative_unlock_methods?: TechnologyID[];
  /** Whether the "Made in: <Machine>" part of the tool-tip should always be present, and not only when the recipe can't be hand-crafted. */
  always_show_made_in?: boolean;
  /** Whether the products are always shown in the recipe tooltip. */
  always_show_products?: boolean;
  /** The [category](prototype:RecipeCategory) of this recipe. Controls which machines can craft this recipe.

The built-in categories can be found [here](https://wiki.factorio.com/Data.raw#recipe-category). The base `"crafting"` category can not contain recipes with fluid ingredients or products. */
  category?: RecipeCategoryID;
  /** Used by [WorkingVisualisations::working_visualisations](prototype:WorkingVisualisations::working_visualisations) to tint certain layers with the recipe color. [WorkingVisualisation::apply_recipe_tint](prototype:WorkingVisualisation::apply_recipe_tint) determines which of the four colors is used for that layer, if any. */
  crafting_machine_tint?: RecipeTints;
  emissions_multiplier?: number;
  /** This can be `false` to disable the recipe at the start of the game, or `true` to leave it enabled.

If a recipe is unlocked via technology, this should be set to `false`. */
  enabled?: boolean;
  /** The amount of time it takes to make this recipe. Must be `> 0.001`. Equals the number of seconds it takes to craft at crafting speed `1`. */
  energy_required?: number;
  /** Hides the recipe from the player's crafting screen. The recipe will still show up for selection in machines. */
  hide_from_player_crafting?: boolean;
  hide_from_signal_gui?: boolean;
  /** Hides the recipe from item/fluid production statistics. */
  hide_from_stats?: boolean;
  /** If given, this determines the recipe's icon. Otherwise, the icon of `main_product` or the singular product is used.

Mandatory if `icons` is not defined for a recipe with more than one product and no `main_product`, or no product. */
  icon?: FileName;
  /** The size of the square icon, in pixels. E.g. `32` for a 32px by 32px icon. Must be larger than `0`.

Only loaded if `icons` is not defined. */
  icon_size?: SpriteSizeType;
  /** Can't be an empty array. */
  icons?: IconData[];
  /** A table containing ingredient names and amounts. Can also contain information about fluid temperature and whether some of the amount is ignored by production statistics.

The maximum ingredient amount is 65 535. Can be set to an empty table to create a recipe that needs no ingredients.

Duplicate ingredients, e.g. two entries with the same name, are *not* allowed. In-game, the item ingredients are ordered by [ItemGroup::order_in_recipe](prototype:ItemGroup::order_in_recipe). */
  ingredients?: IngredientPrototype[];
  /** For recipes with one or more products: Subgroup, localised_name and icon default to the values of the singular/main product, but can be overwritten by the recipe. Setting the main_product to an empty string (`""`) forces the title in the recipe tooltip to use the recipe's name (not that of the product) and shows the products in the tooltip.

If 1) there are multiple products and this property is nil, 2) this property is set to an empty string (`""`), or 3) there are no products, the recipe will use the localised_name, icon, and subgroup of the recipe. icon and subgroup become non-optional. */
  main_product?: string;
  maximum_productivity?: number;
  /** Used to determine how many extra items are put into an assembling machine before it's considered "full enough". See [insertion limits](https://wiki.factorio.com/Inserters#Insertion_limits).

If set to `0`, it instead uses the following formula: `1.166 / (energy_required / the assembler's crafting_speed)`, rounded up, and clamped to be between`2` and `100`. The numbers used in this formula can be changed by the [UtilityConstants](prototype:UtilityConstants) properties `dynamic_recipe_overload_factor`, `minimum_recipe_overload_multiplier`, and `maximum_recipe_overload_multiplier`. */
  overload_multiplier?: number;
  preserve_products_in_machine_output?: boolean;
  requester_paste_multiplier?: number;
  /** When set to true, the recipe will always produce fresh (non-spoiled) item even when the ingredients are spoiled. */
  result_is_always_fresh?: boolean;
  /** A table containing result names and amounts. Products also contain information such as fluid temperature, probability of results and whether some of the amount is ignored by productivity.

Can be set to an empty table to create a recipe that produces nothing. Duplicate results, e.g. two entries with the same name, are allowed. */
  results?: ProductPrototype[];
  /** Whether the recipe name should have the product amount in front of it. E.g. "2x Transport belt". */
  show_amount_in_title?: boolean;
  surface_conditions?: SurfaceCondition[];
  /** Whether enabling this recipe unlocks its item products to show in selection lists (item filters, logistic requests, etc.). */
  unlock_results?: boolean;
}

export type RecipePrototype = _RecipePrototype &
  Omit<Prototype, keyof _RecipePrototype>;

export function isRecipePrototype(value: unknown): value is RecipePrototype {
  return (value as { type: string }).type === 'recipe';
}

/** Properties of the remote controller. */
export interface RemoteControllerPrototype {
  /** Must be >= 0.34375. */
  movement_speed: number;
  /** Name of the remote controller. Base game uses "default". */
  name: string;
  type: 'remote-controller';
}

export function isRemoteControllerPrototype(
  value: unknown,
): value is RemoteControllerPrototype {
  return (value as { type: string }).type === 'remote-controller';
}

/** A [repair pack](https://wiki.factorio.com/Repair_pack). Using the tool decreases durability to restore entity health. */
interface _RepairToolPrototype {
  type: 'repair-tool';
  /** Entity health repaired per used [ToolPrototype::durability](prototype:ToolPrototype::durability). E.g. a repair tool with 5 durability and a repair speed of 2 will restore 10 health.

This is then multiplied by the [EntityWithHealthPrototype::repair_speed_modifier](prototype:EntityWithHealthPrototype::repair_speed_modifier) of the entity. */
  speed: number;
}

export type RepairToolPrototype = _RepairToolPrototype &
  Omit<ToolPrototype, keyof _RepairToolPrototype>;

export function isRepairToolPrototype(
  value: unknown,
): value is RepairToolPrototype {
  return (value as { type: string }).type === 'repair-tool';
}

/** This prototype is used for receiving an achievement when the player completes a specific research. */
interface _ResearchAchievementPrototype {
  type: 'research-achievement';
  /** Mandatory if `technology` is not defined.

This will only trigger if the player has learned every research in the game. */
  research_all?: boolean;
  /** Mandatory if `research_all` is not defined.

Researching this technology will trigger the achievement. */
  technology?: TechnologyID;
}

export type ResearchAchievementPrototype = _ResearchAchievementPrototype &
  Omit<AchievementPrototype, keyof _ResearchAchievementPrototype>;

export function isResearchAchievementPrototype(
  value: unknown,
): value is ResearchAchievementPrototype {
  return (value as { type: string }).type === 'research-achievement';
}

interface _ResearchWithSciencePackAchievementPrototype {
  type: 'research-with-science-pack-achievement';
  amount?: number;
  science_pack: ItemID;
}

export type ResearchWithSciencePackAchievementPrototype =
  _ResearchWithSciencePackAchievementPrototype &
    Omit<
      AchievementPrototype,
      keyof _ResearchWithSciencePackAchievementPrototype
    >;

export function isResearchWithSciencePackAchievementPrototype(
  value: unknown,
): value is ResearchWithSciencePackAchievementPrototype {
  return (
    (value as { type: string }).type ===
    'research-with-science-pack-achievement'
  );
}

/** A resource category. The built-in categories can be found [here](https://wiki.factorio.com/Data.raw#resource-category). See [ResourceEntityPrototype::category](prototype:ResourceEntityPrototype::category). */

interface _ResourceCategory {
  type: 'resource-category';
}

export type ResourceCategory = _ResourceCategory &
  Omit<Prototype, keyof _ResourceCategory>;

export function isResourceCategory(value: unknown): value is ResourceCategory {
  return (value as { type: string }).type === 'resource-category';
}

/** A mineable/gatherable entity. Its [collision_mask](prototype:EntityPrototype::collision_mask) must contain "resource-layer" if it should be minable with a [MiningDrillPrototype](prototype:MiningDrillPrototype). */
interface _ResourceEntityPrototype {
  type: 'resource';
  /** The category for the resource. Available categories in vanilla can be found [here](https://wiki.factorio.com/Data.raw#resource-category). */
  category?: ResourceCategoryID;
  /** Must be greater than or equal to `0`. */
  cliff_removal_probability?: number;
  draw_stateless_visualisation_under_building?: boolean;
  /** Sound played when a [CarPrototype](prototype:CarPrototype) drives over this resource. */
  driving_sound?: InterruptibleSound;
  /** How long it takes `stages_effect` to go from `min_effect_alpha` to `max_effect_alpha`. */
  effect_animation_period?: number;
  /** How much `effect_animation_period` can deviate from its original value. Used to make the stages effect alpha change look less uniform. */
  effect_animation_period_deviation?: number;
  /** How much the surface darkness should affect the alpha of `stages_effect`. */
  effect_darkness_multiplier?: number;
  /** If the resource should be highlighted when holding a mining drill that can mine it (holding a pumpjack highlights crude-oil in the base game). */
  highlight?: boolean;
  /** If the ore is infinitely minable, or if it will eventually run out of resource. */
  infinite?: boolean;
  /** Every time an infinite-type resource "ticks" lower it's lowered by that amount. -- [Rseding91](https://forums.factorio.com/viewtopic.php?p=271115#p271115) */
  infinite_depletion_amount?: number;
  /** Whether the resource should have a grid pattern on the map instead of a solid map color. */
  map_grid?: boolean;
  /** Maximal alpha value of `stages_effect`. */
  max_effect_alpha?: number;
  /** Minimal alpha value of `stages_effect`. */
  min_effect_alpha?: number;
  /** Must be not 0 when `infinite = true`. */
  minimum?: number;
  /** Defaults to the resources map color if left unset and map color is set, otherwise defaults to white if left unset. */
  mining_visualisation_tint?: Color;
  /** Must be not 0 when `infinite = true`. */
  normal?: number;
  /** Whether there should be a slight offset to graphics of the resource. Used to make patches a little less uniform in appearance. */
  randomize_visual_position?: boolean;
  /** When hovering over this resource in the map view: How far to search for other resource patches of this type to display as one (summing amount, white outline). */
  resource_patch_search_radius?: number;
  /** Number of stages the animation has. */
  stage_counts: number[];
  /** Entity's graphics, using a graphic sheet, with variation and depletion. At least one stage must be defined.

When using [AnimationVariations::sheet](prototype:AnimationVariations::sheet), `frame_count` is the amount of frames per row in the spritesheet. `variation_count` is the amount of rows in the spritesheet. Each row in the spritesheet is one stage of the animation. */
  stages?: AnimationVariations;
  /** An effect that can be overlaid above the normal ore graphics. Used in the base game to make [uranium ore](https://wiki.factorio.com/Uranium_ore) glow. */
  stages_effect?: AnimationVariations;
  /** Must be positive when `tree_removal_probability` is set. */
  tree_removal_max_distance?: number;
  /** Must be greater than or equal to `0`. */
  tree_removal_probability?: number;
  /** Sound played when the player walks over this resource. */
  walking_sound?: Sound;
}

export type ResourceEntityPrototype = _ResourceEntityPrototype &
  Omit<EntityPrototype, keyof _ResourceEntityPrototype>;

export function isResourceEntityPrototype(
  value: unknown,
): value is ResourceEntityPrototype {
  return (value as { type: string }).type === 'resource';
}

/** Used by [personal roboport](https://wiki.factorio.com/Personal_roboport). */
interface _RoboportEquipmentPrototype {
  type: 'roboport-equipment';
  /** Add this is if the roboport should be fueled directly instead of using power from the equipment grid. */
  burner?: BurnerEnergySource;
  /** Presumably, the distance from the roboport at which robots will wait to charge. */
  charge_approach_distance: number;
  charging_distance?: number;
  charging_energy: Energy;
  /** The offsets from the center of the roboport at which robots will charge. Only used if `charging_station_count` is equal to 0. */
  charging_offsets?: Vector[];
  /** How many charging points this roboport has. If this is 0, the length of the charging_offsets table is used to calculate the charging station count. */
  charging_station_count?: number;
  charging_station_count_affected_by_quality?: boolean;
  charging_station_shift?: Vector;
  /** Distance in tiles. This defines how far away a robot can be from the charging spot and still be charged, however the bot is still required to reach a charging spot in the first place. */
  charging_threshold_distance?: number;
  /** Can't be negative. */
  construction_radius: number;
  draw_construction_radius_visualization?: boolean;
  /** Unused, as roboport equipment does not have a logistic radius that could be drawn. */
  draw_logistic_radius_visualization?: boolean;
  /** Mandatory if `burner` is defined.

The size of the buffer of the burner energy source, so effectively the amount of power that the energy source can produce per tick. */
  power?: Energy;
  /** The animation played at each charging point when a robot is charging there. */
  recharging_animation?: Animation;
  /** The light emitted when charging a robot. */
  recharging_light?: LightDefinition;
  /** How many robots can exist in the network (cumulative). */
  robot_limit?: ItemCountType;
  robot_vertical_acceleration?: number;
  robots_shrink_when_entering_and_exiting?: boolean;
  /** Presumably states the height of the charging stations and thus an additive offset for the charging_offsets. */
  spawn_and_station_height: number;
  spawn_and_station_shadow_height_offset?: number;
  /** Minimum amount of energy that needs to available inside the roboport's buffer so that robots can be spawned. */
  spawn_minimum?: Energy;
  /** The offset from the center of the roboport at which robots will enter and exit. */
  stationing_offset?: Vector;
  /** When robot ascends or descends to this roboport, at which height is should switch between `"air-object"` and `"object"` [render layer](prototype:RenderLayer). */
  stationing_render_layer_swap_height?: number;
}

export type RoboportEquipmentPrototype = _RoboportEquipmentPrototype &
  Omit<EquipmentPrototype, keyof _RoboportEquipmentPrototype>;

export function isRoboportEquipmentPrototype(
  value: unknown,
): value is RoboportEquipmentPrototype {
  return (value as { type: string }).type === 'roboport-equipment';
}

/** A [roboport](https://wiki.factorio.com/Roboport). */
interface _RoboportPrototype {
  type: 'roboport';
  base?: Sprite;
  /** The animation played when the roboport is idle. */
  base_animation?: Animation;
  base_patch?: Sprite;
  /** The distance (in tiles) from the roboport at which robots will wait to charge. Notably, if the robot is already in range, then it will simply wait at its current position. */
  charge_approach_distance: number;
  charging_distance?: number;
  /** The maximum power provided to each charging station. */
  charging_energy: Energy;
  /** The offsets from the center of the roboport at which robots will charge. Only used if `charging_station_count` is equal to 0. */
  charging_offsets?: Vector[];
  /** How many charging points this roboport has. If this is 0, the length of the charging_offsets table is used to calculate the charging station count. */
  charging_station_count?: number;
  charging_station_count_affected_by_quality?: boolean;
  charging_station_shift?: Vector;
  /** Unused. */
  charging_threshold_distance?: number;
  circuit_connector?: CircuitConnectorDefinition;
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  close_door_trigger_effect?: TriggerEffect;
  /** Can't be negative. */
  construction_radius: number;
  default_available_construction_output_signal?: SignalIDConnector;
  default_available_logistic_output_signal?: SignalIDConnector;
  default_roboports_output_signal?: SignalIDConnector;
  default_total_construction_output_signal?: SignalIDConnector;
  default_total_logistic_output_signal?: SignalIDConnector;
  door_animation_down?: Animation;
  door_animation_up?: Animation;
  draw_circuit_wires?: boolean;
  draw_construction_radius_visualization?: boolean;
  draw_copper_wires?: boolean;
  draw_logistic_radius_visualization?: boolean;
  /** The roboport's energy source. */
  energy_source: ElectricEnergySource | VoidEnergySource;
  /** The amount of energy the roboport uses when idle. */
  energy_usage: Energy;
  frozen_patch?: Sprite;
  /** Must be >= `logistics_radius`. */
  logistics_connection_distance?: number;
  /** Can't be negative. */
  logistics_radius: number;
  /** The number of repair pack slots in the roboport. */
  material_slots_count: ItemStackIndex;
  max_logistic_slots?: LogisticFilterIndex;
  open_door_trigger_effect?: TriggerEffect;
  /** Defaults to the max of logistic range or construction range rounded up to chunks. */
  radar_range?: number;
  /** Minimum charge that the roboport has to have after a blackout (0 charge/buffered energy) to begin working again. Additionally, freshly placed roboports will have their energy buffer filled with `0.25 × recharge_minimum` energy.

Must be larger than or equal to `energy_usage` otherwise during low power the roboport will toggle on and off every tick. */
  recharge_minimum: Energy;
  /** The animation played at each charging point when a robot is charging there. */
  recharging_animation?: Animation;
  /** The light emitted when charging a robot. */
  recharging_light?: LightDefinition;
  request_to_open_door_timeout: number;
  /** Unused. */
  robot_limit?: ItemCountType;
  /** The number of robot slots in the roboport. */
  robot_slots_count: ItemStackIndex;
  robot_vertical_acceleration?: number;
  robots_shrink_when_entering_and_exiting?: boolean;
  /** Presumably states the height of the charging stations and thus an additive offset for the charging_offsets. */
  spawn_and_station_height: number;
  spawn_and_station_shadow_height_offset?: number;
  /** The offset from the center of the roboport at which robots will enter and exit. */
  stationing_offset?: Vector;
  /** When robot ascends or descends to this roboport, at which height is should switch between `"air-object"` and `"object"` [render layer](prototype:RenderLayer). */
  stationing_render_layer_swap_height?: number;
}

export type RoboportPrototype = _RoboportPrototype &
  Omit<EntityWithOwnerPrototype, keyof _RoboportPrototype>;

export function isRoboportPrototype(
  value: unknown,
): value is RoboportPrototype {
  return (value as { type: string }).type === 'roboport';
}

/** The common properties of logistic and construction robots represented by an abstract prototype. */
interface _RobotWithLogisticInterfacePrototype {
  charging_sound?: InterruptibleSound;
  /** Applied when the robot expires (runs out of energy and [FlyingRobotPrototype::speed_multiplier_when_out_of_energy](prototype:FlyingRobotPrototype::speed_multiplier_when_out_of_energy) is 0). */
  destroy_action?: Trigger;
  draw_cargo?: boolean;
  /** Only the first frame of the animation is drawn. This means that the graphics for the idle state cannot be animated. */
  idle?: RotatedAnimation;
  /** Only the first frame of the animation is drawn. This means that the graphics for the in_motion state cannot be animated. */
  in_motion?: RotatedAnimation;
  /** The robot's cargo carrying capacity. Can be increased by [worker robot cargo size research](prototype:WorkerRobotStorageModifier). */
  max_payload_size: ItemCountType;
  /** Only the first frame of the animation is drawn. This means that the graphics for the idle state cannot be animated. */
  shadow_idle?: RotatedAnimation;
  /** Only the first frame of the animation is drawn. This means that the graphics for the in_motion state cannot be animated. */
  shadow_in_motion?: RotatedAnimation;
}

export type RobotWithLogisticInterfacePrototype =
  _RobotWithLogisticInterfacePrototype &
    Omit<FlyingRobotPrototype, keyof _RobotWithLogisticInterfacePrototype>;
/** A [rocket silo](https://wiki.factorio.com/Rocket_silo). */
interface _RocketSiloPrototype {
  type: 'rocket-silo';
  /** Additional energy used during the following parts of the [launch sequence](runtime:defines.rocket_silo_status): doors_opening, rocket_rising, arms_advance, engine_starting, arms_retract, doors_closing. */
  active_energy_usage: Energy;
  /** Played when switching into the [lights_blinking_open](runtime:defines.rocket_silo_status.lights_blinking_open) state. */
  alarm_sound?: Sound;
  /** Applied when switching into the [lights_blinking_open](runtime:defines.rocket_silo_status.lights_blinking_open) state. */
  alarm_trigger?: TriggerEffect;
  arm_01_back_animation?: Animation;
  arm_02_right_animation?: Animation;
  arm_03_front_animation?: Animation;
  base_day_sprite?: Sprite;
  base_engine_light?: LightDefinition;
  base_front_frozen?: Sprite;
  base_front_sprite?: Sprite;
  base_frozen?: Sprite;
  base_light?: LightDefinition;
  /** Drawn instead of `base_day_sprite` during the night, that is when [LuaSurface::darkness](runtime:LuaSurface::darkness) is larger than 0.3. */
  base_night_sprite?: Sprite;
  /** Must have exactly one entry in [CargoStationParameters::hatch_definitions](prototype:CargoStationParameters::hatch_definitions). */
  cargo_station_parameters: CargoStationParameters;
  /** Played when switching into the [arms_retract](runtime:defines.rocket_silo_status.arms_retract) state. */
  clamps_off_sound?: Sound;
  /** Applied when switching into the [arms_retract](runtime:defines.rocket_silo_status.arms_retract) state. */
  clamps_off_trigger?: TriggerEffect;
  /** Played when switching into the [arms_advance](runtime:defines.rocket_silo_status.arms_advance) state. */
  clamps_on_sound?: Sound;
  /** Applied when switching into the [arms_advance](runtime:defines.rocket_silo_status.arms_advance) state. */
  clamps_on_trigger?: TriggerEffect;
  door_back_frozen?: Sprite;
  door_back_open_offset: Vector;
  door_back_sprite?: Sprite;
  door_front_frozen?: Sprite;
  door_front_open_offset: Vector;
  door_front_sprite?: Sprite;
  /** The inverse of the duration in ticks of [doors_opening](runtime:defines.rocket_silo_status.doors_opening) and [closing](runtime:defines.rocket_silo_status.doors_closing). */
  door_opening_speed: number;
  /** Played when switching into the [doors_opening](runtime:defines.rocket_silo_status.doors_opening) and [doors_closing](runtime:defines.rocket_silo_status.doors_closing) states. */
  doors_sound?: Sound;
  /** Applied when switching into the [doors_opening](runtime:defines.rocket_silo_status.doors_opening) and [doors_closing](runtime:defines.rocket_silo_status.doors_closing) states. */
  doors_trigger?: TriggerEffect;
  hole_clipping_box: BoundingBox;
  hole_frozen?: Sprite;
  hole_light_sprite?: Sprite;
  hole_sprite?: Sprite;
  /** May be 0.

Additional energy used during the night, that is when [LuaSurface::darkness](runtime:LuaSurface::darkness) is larger than 0.3. */
  lamp_energy_usage: Energy;
  /** Enables 'Space Age' functionality for this rocket silo, allowing it to supply space platforms. */
  launch_to_space_platforms?: boolean;
  /** The time to wait in the [launch_started](runtime:defines.rocket_silo_status.launch_started) state before switching to [engine_starting](runtime:defines.rocket_silo_status.engine_starting). */
  launch_wait_time?: number;
  /** The inverse of the duration in ticks of [lights_blinking_open](runtime:defines.rocket_silo_status.lights_blinking_open) and [lights_blinking_close](runtime:defines.rocket_silo_status.lights_blinking_close). */
  light_blinking_speed: number;
  logistic_trash_inventory_size?: ItemStackIndex;
  /** Played when switching from [rocket_flying](runtime:defines.rocket_silo_status.rocket_flying) into the [doors_opened](runtime:defines.rocket_silo_status.doors_opened) state when a quick follow-up rocket is ready. */
  quick_alarm_sound?: Sound;
  /** Played when switching into the [rocket_rising](runtime:defines.rocket_silo_status.rocket_rising) state. */
  raise_rocket_sound?: Sound;
  /** Applied when switching into the [rocket_rising](runtime:defines.rocket_silo_status.rocket_rising) state. */
  raise_rocket_trigger?: TriggerEffect;
  /** Drawn from the start of the [lights_blinking_open](runtime:defines.rocket_silo_status.lights_blinking_open) state until the end of the [lights_blinking_close](runtime:defines.rocket_silo_status.lights_blinking_close) state. */
  red_lights_back_sprites?: Sprite;
  /** Drawn from the start of the [lights_blinking_open](runtime:defines.rocket_silo_status.lights_blinking_open) state until the end of the [lights_blinking_close](runtime:defines.rocket_silo_status.lights_blinking_close) state. */
  red_lights_front_sprites?: Sprite;
  /** Whether the "no network" icon should be rendered on this entity if the entity is not within a logistics network. */
  render_not_in_network_icon?: boolean;
  /** Name of a [RocketSiloRocketPrototype](prototype:RocketSiloRocketPrototype). */
  rocket_entity: EntityID;
  rocket_glow_overlay_sprite?: Sprite;
  /** The number of crafts that must complete to produce a rocket. This includes bonus crafts from productivity. Recipe products are ignored. */
  rocket_parts_required: number;
  /** Must be at least `rocket_parts_required`. */
  rocket_parts_storage_cap?: number;
  rocket_quick_relaunch_start_offset: number;
  /** The time to wait in the [doors_opened](runtime:defines.rocket_silo_status.doors_opened) state before switching to [rocket_rising](runtime:defines.rocket_silo_status.rocket_rising). */
  rocket_rising_delay?: number;
  rocket_shadow_overlay_sprite?: Sprite;
  rocket_supply_inventory_size?: ItemStackIndex;
  satellite_animation?: Animation;
  satellite_shadow_animation?: Animation;
  shadow_sprite?: Sprite;
  silo_fade_out_end_distance: number;
  silo_fade_out_start_distance: number;
  /** How many times the `red_lights_back_sprites` and `red_lights_front_sprites` should blink during [lights_blinking_open](runtime:defines.rocket_silo_status.lights_blinking_open) and [lights_blinking_close](runtime:defines.rocket_silo_status.lights_blinking_close).

Does not affect the duration of the launch sequence. */
  times_to_blink: number;
  to_be_inserted_to_rocket_inventory_size?: ItemStackIndex;
}

export type RocketSiloPrototype = _RocketSiloPrototype &
  Omit<AssemblingMachinePrototype, keyof _RocketSiloPrototype>;

export function isRocketSiloPrototype(
  value: unknown,
): value is RocketSiloPrototype {
  return (value as { type: string }).type === 'rocket-silo';
}

/** The rocket inside the rocket silo. */
interface _RocketSiloRocketPrototype {
  type: 'rocket-silo-rocket';
  cargo_attachment_offset?: Vector;
  /** Name of a [CargoPodPrototype](prototype:CargoPodPrototype). */
  cargo_pod_entity: EntityID;
  dying_explosion?: EntityID;
  effects_fade_in_end_distance: number;
  effects_fade_in_start_distance: number;
  engine_starting_speed: number;
  flying_acceleration: number;
  flying_sound?: Sound;
  flying_speed: number;
  flying_trigger?: TriggerEffect;
  full_render_layer_switch_distance: number;
  glow_light?: LightDefinition;
  inventory_size: ItemStackIndex;
  rising_speed: number;
  rocket_above_wires_slice_offset_from_center?: number;
  rocket_air_object_slice_offset_from_center?: number;
  rocket_flame_animation?: Animation;
  rocket_flame_left_animation?: Animation;
  rocket_flame_left_rotation: number;
  rocket_flame_right_animation?: Animation;
  rocket_flame_right_rotation: number;
  rocket_fog_mask?: FogMaskShapeDefinition;
  rocket_glare_overlay_sprite?: Sprite;
  rocket_initial_offset?: Vector;
  rocket_launch_offset: Vector;
  rocket_render_layer_switch_distance: number;
  rocket_rise_offset: Vector;
  rocket_shadow_sprite?: Sprite;
  rocket_smoke_bottom1_animation?: Animation;
  rocket_smoke_bottom2_animation?: Animation;
  rocket_smoke_top1_animation?: Animation;
  rocket_smoke_top2_animation?: Animation;
  rocket_smoke_top3_animation?: Animation;
  rocket_sprite?: Sprite;
  rocket_visible_distance_from_center: number;
  shadow_fade_out_end_ratio: number;
  shadow_fade_out_start_ratio: number;
  shadow_slave_entity?: EntityID;
}

export type RocketSiloRocketPrototype = _RocketSiloRocketPrototype &
  Omit<EntityPrototype, keyof _RocketSiloRocketPrototype>;

export function isRocketSiloRocketPrototype(
  value: unknown,
): value is RocketSiloRocketPrototype {
  return (value as { type: string }).type === 'rocket-silo-rocket';
}

/** The shadow of the rocket inside the rocket silo. */

interface _RocketSiloRocketShadowPrototype {
  type: 'rocket-silo-rocket-shadow';
}

export type RocketSiloRocketShadowPrototype = _RocketSiloRocketShadowPrototype &
  Omit<EntityPrototype, keyof _RocketSiloRocketShadowPrototype>;

export function isRocketSiloRocketShadowPrototype(
  value: unknown,
): value is RocketSiloRocketShadowPrototype {
  return (value as { type: string }).type === 'rocket-silo-rocket-shadow';
}

/** The abstract base of all rolling stock. */
interface _RollingStockPrototype {
  type: 'rolling-stock';
  air_resistance: number;
  allow_manual_color?: boolean;
  allow_robot_dispatch_in_automatic_mode?: boolean;
  back_light?: LightDefinition;
  color?: Color;
  /** The distance between the joint of this rolling stock and its connected rolling stocks joint.

Maximum connection distance is 15. */
  connection_distance: number;
  default_copy_color_from_train_stop?: boolean;
  /** Cannot use `fade_ticks`. */
  door_closing_sound?: InterruptibleSound;
  /** Cannot use `fade_ticks`. */
  door_opening_sound?: InterruptibleSound;
  drive_over_elevated_tie_trigger?: TriggerEffect;
  /** Usually a sound to play when the rolling stock drives over a tie. The rolling stock is considered to be driving over a tie every `tie_distance` tiles. */
  drive_over_tie_trigger?: TriggerEffect;
  drive_over_tie_trigger_minimal_speed?: number;
  /** Defaults to the mask from [UtilityConstants::default_collision_masks](prototype:UtilityConstants::default_collision_masks) when indexed by  `type .. "/elevated"`. */
  elevated_collision_mask?: CollisionMaskConnector;
  elevated_rail_sound?: MainSound;
  elevated_selection_priority?: number;
  horizontal_doors?: Animation;
  /** The length between this rolling stocks front and rear joints. Joints are the point where connection_distance is measured from when rolling stock are connected to one another. Wheels sprite are placed based on the joint position.

Maximum joint distance is 15.

Note: There needs to be border at least 0.2 between the [bounding box](prototype:EntityPrototype::collision_box) edge and joint. This means that the collision_box must be at least `{{-0,-0.2},{0,0.2}}`. */
  joint_distance: number;
  /** Maximum speed of the rolling stock in tiles/tick.

In-game, the max speed of a train is `min(all_rolling_stock_max_speeds) × average(all_fuel_modifiers_in_all_locomotives)`. This calculated train speed is then silently capped to 7386.3km/h. */
  max_speed: number;
  pictures?: RollingStockRotatedSlopedGraphics;
  stand_by_light?: LightDefinition;
  /** In tiles. Used to determine how often `drive_over_tie_trigger` is triggered. */
  tie_distance?: number;
  /** Defaults to the mask from [UtilityConstants::default_collision_masks](prototype:UtilityConstants::default_collision_masks) when indexed by  `type .. "/transition"`. */
  transition_collision_mask?: CollisionMaskConnector;
  vertical_doors?: Animation;
  vertical_selection_shift: number;
  wheels?: RollingStockRotatedSlopedGraphics;
}

export type RollingStockPrototype = _RollingStockPrototype &
  Omit<VehiclePrototype, keyof _RollingStockPrototype>;

export function isRollingStockPrototype(
  value: unknown,
): value is RollingStockPrototype {
  return (value as { type: string }).type === 'rolling-stock';
}

/** Entity representing an individual segment in a [SegmentedUnitPrototype](prototype:SegmentedUnitPrototype) */
interface _SegmentPrototype {
  type: 'segment';
  /** The animation to use of the entity. */
  animation: RotatedAnimation;
  /** The number of segments behind this one that should always be rendered atop this one, giving the illusion that at all orientations, those following segments overlap this current segment.

Must be 0 or greater, and the sum of `forward_overlap` and `backward_overlap` must be less than or equal to 4. */
  backward_overlap?: number;
  /** The number of tiles of spacing to add behind this segment. Can be negative. Scales with the segment scale when used in a [SegmentEngineSpecification](prototype:SegmentEngineSpecification). */
  backward_padding?: number;
  /** The sound to play when the entity dies.

If not specified, [UtilitySounds::segment_dying_sound](prototype:UtilitySounds::segment_dying_sound) is used. */
  dying_sound?: Sound;
  dying_sound_volume_modifier?: number;
  /** The number of segments ahead of this one that should always be rendered atop this one, giving the illusion that at all orientations, those preceding segments overlap this current segment.

Must be 0 or greater, and the sum of `forward_overlap` and `backward_overlap` must be less than or equal to 4. */
  forward_overlap?: number;
  /** The number of tiles of spacing to add in front of this segment. Can be negative. Scales with the segment scale when used in a [SegmentEngineSpecification](prototype:SegmentEngineSpecification). */
  forward_padding?: number;
  /** The layer to render the entity in. */
  render_layer?: RenderLayer;
  /** The effects to trigger every tick. */
  update_effects?: TriggerEffectWithCooldown[];
  /** The effects to trigger every tick while enraged, in addition to `update_effects`. */
  update_effects_while_enraged?: TriggerEffectWithCooldown[];
}

export type SegmentPrototype = _SegmentPrototype &
  Omit<EntityWithOwnerPrototype, keyof _SegmentPrototype>;

export function isSegmentPrototype(value: unknown): value is SegmentPrototype {
  return (value as { type: string }).type === 'segment';
}

/** Entity composed of multiple segment entities that trail behind the head. */
interface _SegmentedUnitPrototype {
  type: 'segmented-unit';
  /** The acceleration rate when moving from one state to another. Cannot be negative. */
  acceleration_rate: number;
  /** Attack parameters for when a segmented unit is attacking something. */
  attack_parameters?: AttackParameters;
  /** The movement speed while attacking, in tiles per tick. Cannot be negative. */
  attacking_speed: number;
  /** The number of ticks to remain enraged after last taking damage. */
  enraged_duration: number;
  /** The movement speed while enraged, in tiles per tick. Cannot be negative. */
  enraged_speed: number;
  /** Sound which plays when health ratio drops below any of `hurt_thresholds`. */
  hurt_roar?: Sound;
  /** Only loaded, and mandatory if `hurt_roar` is defined. */
  hurt_thresholds?: number[];
  /** The movement speed while investigating, in tiles per tick. Cannot be negative. */
  investigating_speed: number;
  /** The movement speed while patrolling, in tiles per tick. Cannot be negative. */
  patrolling_speed: number;
  /** Cannot be negative. */
  patrolling_turn_radius?: number;
  /** Attack parameters for when a segmented unit is attacking something in retaliation because the target first attacked it. */
  revenge_attack_parameters?: AttackParameters;
  roar?: Sound;
  /** The default is 1.0f / (6.0f * 60.0f), average pause between roars is 6 seconds. */
  roar_probability?: number;
  /** Specification of the segment engine, which should contain a list of the segments that compose the entity's body. */
  segment_engine: SegmentEngineSpecification;
  /** The territory radius in chunks. The chunk in which the entity spawned is included. */
  territory_radius: number;
  /** The number of ticks between territory scans. Greater values means longer time between scans, which means a slower reaction time. Cannot be `0`. */
  ticks_per_scan?: number;
  /** Turn radius, in tiles. Cannot be negative. */
  turn_radius: number;
  /** Attempts to smooth out tight turns by limiting how quickly the unit can change turning directions. 0 means no turn smoothing, 1 means no turning whatsoever. Must be between 0 and 1. */
  turn_smoothing?: number;
  /** Vision distance, affects scanning radius for enemies to attack. Must be non-negative. Max 100. */
  vision_distance: number;
}

export type SegmentedUnitPrototype = _SegmentedUnitPrototype &
  Omit<SegmentPrototype, keyof _SegmentedUnitPrototype>;

export function isSegmentedUnitPrototype(
  value: unknown,
): value is SegmentedUnitPrototype {
  return (value as { type: string }).type === 'segmented-unit';
}

/** Used in the base game as a base for the blueprint item and the deconstruction item. */
interface _SelectionToolPrototype {
  type: 'selection-tool';
  /** Settings for how the selection tool alt-reverse-selects things in-game (using SHIFT + Right mouse button). */
  alt_reverse_select?: SelectionModeData;
  alt_select: SelectionModeData;
  /** If tiles should be included in the selection regardless of entities also being in the selection. This is a visual only setting. */
  always_include_tiles?: boolean;
  mouse_cursor?: MouseCursorID;
  reverse_select?: SelectionModeData;
  select: SelectionModeData;
  skip_fog_of_war?: boolean;
  super_forced_select?: SelectionModeData;
}

export type SelectionToolPrototype = _SelectionToolPrototype &
  Omit<ItemWithLabelPrototype, keyof _SelectionToolPrototype>;

export function isSelectionToolPrototype(
  value: unknown,
): value is SelectionToolPrototype {
  return (value as { type: string }).type === 'selection-tool';
}

interface _SelectorCombinatorPrototype {
  type: 'selector-combinator';
  count_symbol_sprites?: Sprite4Way;
  max_symbol_sprites?: Sprite4Way;
  min_symbol_sprites?: Sprite4Way;
  quality_symbol_sprites?: Sprite4Way;
  random_symbol_sprites?: Sprite4Way;
  rocket_capacity_sprites?: Sprite4Way;
  stack_size_sprites?: Sprite4Way;
}

export type SelectorCombinatorPrototype = _SelectorCombinatorPrototype &
  Omit<CombinatorPrototype, keyof _SelectorCombinatorPrototype>;

export function isSelectorCombinatorPrototype(
  value: unknown,
): value is SelectorCombinatorPrototype {
  return (value as { type: string }).type === 'selector-combinator';
}

/** This prototype is used for receiving an achievement when the player shoots certain ammo. */
interface _ShootAchievementPrototype {
  type: 'shoot-achievement';
  /** This will trigger the achievement, if this ammo is shot. */
  ammo_type?: ItemID;
  /** How much of the ammo needs to be shot. */
  amount?: number;
}

export type ShootAchievementPrototype = _ShootAchievementPrototype &
  Omit<AchievementPrototype, keyof _ShootAchievementPrototype>;

export function isShootAchievementPrototype(
  value: unknown,
): value is ShootAchievementPrototype {
  return (value as { type: string }).type === 'shoot-achievement';
}

/** Definition for a shortcut button in the [shortcut bar](https://wiki.factorio.com/Shortcut_bar).

This is **not** a custom keybinding (keyboard shortcut), for that see [CustomInputPrototype](prototype:CustomInputPrototype). */
interface _ShortcutPrototype {
  type: 'shortcut';
  /** If this is `"lua"`, [on_lua_shortcut](runtime:on_lua_shortcut) is raised when the shortcut is clicked. */
  action:
    | 'toggle-alt-mode'
    | 'undo'
    | 'copy'
    | 'cut'
    | 'paste'
    | 'import-string'
    | 'toggle-personal-roboport'
    | 'toggle-equipment-movement-bonus'
    | 'spawn-item'
    | 'lua';
  /** Name of a custom input or vanilla control. This is **only** used to show the keybind in the tooltip of the shortcut. */
  associated_control_input?: string;
  /** Path to the icon file.

Mandatory if `icons` is not defined. */
  icon?: FileName;
  /** The size of the square icon, in pixels. E.g. `32` for a 32px by 32px icon. Must be larger than `0`.

The base game uses 32px icons for shortcuts.

Only loaded if `icons` is not defined. */
  icon_size?: SpriteSizeType;
  /** Can't be an empty array. */
  icons?: IconData[];
  /** The item to create when clicking on a shortcut with the action set to `"spawn-item"`. The item must have the [spawnable](prototype:ItemPrototypeFlags::spawnable) flag set. */
  item_to_spawn?: ItemID;
  /** Used to order the shortcuts in the [quick panel](https://wiki.factorio.com/Quick_panel), which replaces the shortcut bar when using a controller (game pad). It [is recommended](https://forums.factorio.com/106661) to order modded shortcuts after the vanilla shortcuts. */
  order?: Order;
  /** Path to the icon file. Used in the shortcut selection popup.

Mandatory if `small_icons` is not defined. */
  small_icon?: FileName;
  /** The size of the small icon, in pixels. E.g. `32` for a 32px by 32px icon. Must be larger than `0`.

The base game uses 24px small icons for shortcuts.

Only loaded if `small_icons` is not defined. */
  small_icon_size?: SpriteSizeType;
  /** Can't be an empty array. */
  small_icons?: IconData[];
  style?: 'default' | 'blue' | 'red' | 'green';
  /** The technology that must be researched before this shortcut can be used. Once a shortcut is unlocked in one save file, it is unlocked for all future save files. */
  technology_to_unlock?: TechnologyID;
  /** Must be enabled for the Factorio API to be able to set the toggled state on the shortcut button, see [LuaPlayer::set_shortcut_toggled](runtime:LuaPlayer::set_shortcut_toggled). */
  toggleable?: boolean;
  /** If `true`, the shortcut will not be available until its `technology_to_unlock` is researched, even if it was already researched in a different game. */
  unavailable_until_unlocked?: boolean;
}

export type ShortcutPrototype = _ShortcutPrototype &
  Omit<Prototype, keyof _ShortcutPrototype>;

export function isShortcutPrototype(
  value: unknown,
): value is ShortcutPrototype {
  return (value as { type: string }).type === 'shortcut';
}

/** An extremely basic entity with no special functionality. Used for minable rocks. Cannot be rotated. */
interface _SimpleEntityPrototype {
  type: 'simple-entity';
  animations?: AnimationVariations;
  /** Whether this entity should be treated as a rock for the purpose of deconstruction and for [CarPrototype::immune_to_rock_impacts](prototype:CarPrototype::immune_to_rock_impacts). */
  count_as_rock_for_filtered_deconstruction?: boolean;
  lower_pictures?: SpriteVariations;
  lower_render_layer?: RenderLayer;
  /** Takes priority over `animations`. Only the `north` sprite is used because this entity cannot be rotated. */
  picture?: Sprite4Way;
  /** Takes priority over `picture` and `animations`. */
  pictures?: SpriteVariations;
  random_animation_offset?: boolean;
  /** Whether a random graphics variation is chosen when placing the entity/creating it via script/creating it via map generation. If this is `false`, the entity will use the first variation instead of a random one. */
  random_variation_on_create?: boolean;
  render_layer?: RenderLayer;
  /** Used to determine render order for entities with the same `render_layer` in the same position. Entities with a higher `secondary_draw_order` are drawn on top. */
  secondary_draw_order?: number;
  /** Loaded and drawn with all `pictures`, `picture` and `animations`. If graphics variation is larger than number of `lower_pictures` variations this layer is not drawn. */
  stateless_visualisation_variations?: StatelessVisualisations[];
}

export type SimpleEntityPrototype = _SimpleEntityPrototype &
  Omit<EntityWithHealthPrototype, keyof _SimpleEntityPrototype>;

export function isSimpleEntityPrototype(
  value: unknown,
): value is SimpleEntityPrototype {
  return (value as { type: string }).type === 'simple-entity';
}

/** By default, this entity will be a priority target for units/turrets, who will choose to attack it even if it does not block their path. Setting [EntityWithOwnerPrototype::is_military_target](prototype:EntityWithOwnerPrototype::is_military_target) to `false` will turn this off, which then makes this type equivalent to [SimpleEntityWithOwnerPrototype](prototype:SimpleEntityWithOwnerPrototype). */
interface _SimpleEntityWithForcePrototype {
  type: 'simple-entity-with-force';
  /** Whether this prototype should be a high priority target for enemy forces. See [Military units and structures](https://wiki.factorio.com/Military_units_and_structures). */
  is_military_target?: boolean;
}

export type SimpleEntityWithForcePrototype = _SimpleEntityWithForcePrototype &
  Omit<SimpleEntityWithOwnerPrototype, keyof _SimpleEntityWithForcePrototype>;

export function isSimpleEntityWithForcePrototype(
  value: unknown,
): value is SimpleEntityWithForcePrototype {
  return (value as { type: string }).type === 'simple-entity-with-force';
}

/** Has a force, but unlike [SimpleEntityWithForcePrototype](prototype:SimpleEntityWithForcePrototype) it is only attacked if the biters get stuck on it (or if [EntityWithOwnerPrototype::is_military_target](prototype:EntityWithOwnerPrototype::is_military_target) set to true to make the two entity types equivalent).

Can be rotated in 4 directions. `picture` can be used to specify different graphics per direction. */
interface _SimpleEntityWithOwnerPrototype {
  type: 'simple-entity-with-owner';
  animations?: AnimationVariations;
  /** If the entity is not visible to a player, the player cannot select it. */
  force_visibility?: ForceCondition;
  /** Loaded and drawn with all `pictures`, `picture` and `animations`. If graphics variation is larger than number of `lower_pictures` variations this layer is not drawn. */
  lower_pictures?: SpriteVariations;
  lower_render_layer?: RenderLayer;
  /** Takes priority over `animations`. */
  picture?: Sprite4Way;
  /** Takes priority over `picture` and `animations`. */
  pictures?: SpriteVariations;
  random_animation_offset?: boolean;
  /** Whether a random graphics variation is chosen when placing the entity/creating it via script/creating it via map generation. If this is false, the entity will use the first variation instead of a random one. */
  random_variation_on_create?: boolean;
  render_layer?: RenderLayer;
  /** Used to determine render order for entities with the same `render_layer` in the same position. Entities with a higher `secondary_draw_order` are drawn on top. */
  secondary_draw_order?: number;
  stateless_visualisation_variations?: StatelessVisualisations[];
}

export type SimpleEntityWithOwnerPrototype = _SimpleEntityWithOwnerPrototype &
  Omit<EntityWithOwnerPrototype, keyof _SimpleEntityWithOwnerPrototype>;

export function isSimpleEntityWithOwnerPrototype(
  value: unknown,
): value is SimpleEntityWithOwnerPrototype {
  return (value as { type: string }).type === 'simple-entity-with-owner';
}

/** Abstract entity that has an animation. */
interface _SmokePrototype {
  /** Smoke always moves randomly unless `movement_slow_down_factor` is 0. If `affected_by_wind` is true, the smoke will also be moved by wind. */
  affected_by_wind?: boolean;
  animation?: Animation;
  /** Must have a collision box size of zero. */
  collision_box?: BoundingBox;
  color?: Color;
  /** If this is false then the smoke expires when the animation has played once. */
  cyclic?: boolean;
  /** May not be 0 if `cyclic` is true. If `cyclic` is false then the smoke will be expire when the animation has played once, even if there would still be duration left. */
  duration?: number;
  end_scale?: number;
  /** `fade_in_duration` + `fade_away_duration` must be <= `duration`. */
  fade_away_duration?: number;
  /** `fade_in_duration` + `fade_away_duration` must be <= `duration`. */
  fade_in_duration?: number;
  glow_animation?: Animation;
  glow_fade_away_duration?: number;
  /** Value between 0 and 1, with 0 being no movement. */
  movement_slow_down_factor?: number;
  render_layer?: RenderLayer;
  show_when_smoke_off?: boolean;
  spread_duration?: number;
  start_scale?: number;
}

export type SmokePrototype = _SmokePrototype &
  Omit<EntityPrototype, keyof _SmokePrototype>;
/** An entity with animation and a trigger. */
interface _SmokeWithTriggerPrototype {
  type: 'smoke-with-trigger';
  action?: Trigger;
  /** 0 means never apply. */
  action_cooldown?: number;
  /** If true, causes the smoke to move with the target entity if one is specified. */
  attach_to_target?: boolean;
  /** If true, the smoke will immediately start fading away when the entity it is attached to is destroyed. If it was never attached to an entity in the first place, then the smoke will fade away immediately after being created. */
  fade_when_attachment_is_destroyed?: boolean;
  particle_count?: number;
  particle_distance_scale_factor?: number;
  particle_duration_variation?: number;
  particle_scale_factor?: Vector;
  particle_spread?: Vector;
  spread_duration_variation?: number;
  wave_distance?: Vector;
  wave_speed?: Vector;
}

export type SmokeWithTriggerPrototype = _SmokeWithTriggerPrototype &
  Omit<SmokePrototype, keyof _SmokeWithTriggerPrototype>;

export function isSmokeWithTriggerPrototype(
  value: unknown,
): value is SmokeWithTriggerPrototype {
  return (value as { type: string }).type === 'smoke-with-trigger';
}

/** A [portable solar panel](https://wiki.factorio.com/Portable_solar_panel). */
interface _SolarPanelEquipmentPrototype {
  type: 'solar-panel-equipment';
  /** How much power should be provided. */
  power: Energy;
}

export type SolarPanelEquipmentPrototype = _SolarPanelEquipmentPrototype &
  Omit<EquipmentPrototype, keyof _SolarPanelEquipmentPrototype>;

export function isSolarPanelEquipmentPrototype(
  value: unknown,
): value is SolarPanelEquipmentPrototype {
  return (value as { type: string }).type === 'solar-panel-equipment';
}

/** A [solar panel](https://wiki.factorio.com/Solar_panel). */
interface _SolarPanelPrototype {
  type: 'solar-panel';
  /** Sets how this solar panel connects to the energy network. The most relevant property seems to be the output_priority. */
  energy_source: ElectricEnergySource;
  /** Overlay has to be empty or have same number of variations as `picture`. */
  overlay?: SpriteVariations;
  /** The picture displayed for this solar panel. */
  picture?: SpriteVariations;
  /** The maximum amount of power this solar panel can produce. */
  production: Energy;
}

export type SolarPanelPrototype = _SolarPanelPrototype &
  Omit<EntityWithOwnerPrototype, keyof _SolarPanelPrototype>;

export function isSolarPanelPrototype(
  value: unknown,
): value is SolarPanelPrototype {
  return (value as { type: string }).type === 'solar-panel';
}

/** Specifies a sound that can be used with [SoundPath](runtime:SoundPath) at runtime. */
export interface SoundPrototype {
  advanced_volume_control?: AdvancedVolumeControl;
  aggregation?: AggregationSpecification;
  allow_random_repeat?: boolean;
  /** Modifies how far a sound can be heard. Must be between `0` and `1` inclusive. */
  audible_distance_modifier?: number;
  category?: SoundType;
  /** Supported sound file formats are `.ogg` (Vorbis) and `.wav`.

Only loaded, and mandatory if `variations` is not defined. */
  filename?: FileName;
  game_controller_vibration_data?: GameControllerVibrationData;
  /** Must be `>= min_speed`.

Only loaded if `variations` is not defined. Only loaded, and mandatory if `min_speed` is defined. */
  max_speed?: number;
  /** Only loaded if `variations` is not defined.

Only loaded if `min_volume` is defined.

Must be `>= min_volume`. */
  max_volume?: number;
  /** Must be `>= 1 / 64`.

Only loaded if both `variations` and `speed` are not defined. */
  min_speed?: number;
  /** Only loaded if `variations` and `volume` are not defined.

Must be `>= 0`. */
  min_volume?: number;
  /** Only loaded if `variations` is not defined. */
  modifiers?: SoundModifier | SoundModifier[];
  /** Name of the sound. Can be used as a [SoundPath](runtime:SoundPath) at runtime. */
  name: string;
  /** Only loaded if `variations` is not defined. */
  preload?: boolean;
  /** Sounds with higher priority will replace a sound with lower priority if the maximum sounds limit is reached.

0 is the highest priority, 255 is the lowest priority. */
  priority?: number;
  /** Speed must be `>= 1 / 64`. This sets both min and max speeds.

Only loaded if `variations` is not defined. */
  speed?: number;
  speed_smoothing_window_size?: number;
  type: 'sound';
  variations?: SoundDefinition | SoundDefinition[];
  /** Only loaded if `variations` is not defined.

This sets both min and max volumes.

Must be `>= 0`. */
  volume?: number;
}

export function isSoundPrototype(value: unknown): value is SoundPrototype {
  return (value as { type: string }).type === 'sound';
}

interface _SpaceConnectionDistanceTraveledAchievementPrototype {
  type: 'space-connection-distance-traveled-achievement';
  /** How far a platform must travel to gain this achievement. Repeated trips over a shorter distance do not count. */
  distance: number;
  /** The achievement is unidirectional, this property controls the direction (using space connection definition).

When false, a platform must go through [from](prototype:SpaceConnectionPrototype::from) location and travel in [to](prototype:SpaceConnectionPrototype::to) direction. When true, a platform must go through `to` location and travel in `from` direction. */
  reversed: boolean;
  tracked_connection: SpaceConnectionID;
}

export type SpaceConnectionDistanceTraveledAchievementPrototype =
  _SpaceConnectionDistanceTraveledAchievementPrototype &
    Omit<
      AchievementPrototype,
      keyof _SpaceConnectionDistanceTraveledAchievementPrototype
    >;

export function isSpaceConnectionDistanceTraveledAchievementPrototype(
  value: unknown,
): value is SpaceConnectionDistanceTraveledAchievementPrototype {
  return (
    (value as { type: string }).type ===
    'space-connection-distance-traveled-achievement'
  );
}

interface _SpaceConnectionPrototype {
  type: 'space-connection';
  asteroid_spawn_definitions?: SpaceConnectionAsteroidSpawnDefinition[];
  from: SpaceLocationID;
  /** Path to the icon file.

Mandatory if `icons` is not defined. */
  icon?: FileName;
  /** The size of the square icon, in pixels. E.g. `32` for a 32px by 32px icon. Must be larger than `0`.

Only loaded if `icons` is not defined. */
  icon_size?: SpriteSizeType;
  /** Can't be an empty array. */
  icons?: IconData[];
  /** Cannot be 0. */
  length?: number;
  to: SpaceLocationID;
}

export type SpaceConnectionPrototype = _SpaceConnectionPrototype &
  Omit<Prototype, keyof _SpaceConnectionPrototype>;

export function isSpaceConnectionPrototype(
  value: unknown,
): value is SpaceConnectionPrototype {
  return (value as { type: string }).type === 'space-connection';
}

/** A space location, such as a planet. */
interface _SpaceLocationPrototype {
  type: 'space-location';
  asteroid_spawn_definitions?: SpaceLocationAsteroidSpawnDefinition[];
  /** If greater than 0, `asteroid_spawn_definitions` will be used on space connections of this location, interpolated based on distance. The number specifies the percentage of the route where the location stops spawning its asteroids. */
  asteroid_spawn_influence?: number;
  auto_save_on_first_trip?: boolean;
  /** Distance from the location's parent body in map coordinates. */
  distance: number;
  /** If `false`, an orbital ring will not be drawn for this location. */
  draw_orbit?: boolean;
  /** When set to true, it means that this connection offers fly condition rather than wait condition at the destination */
  fly_condition?: boolean;
  /** A value which modifies platform speed; is subtracted when traveling from this location and added when traveling to this location. */
  gravity_pull: number;
  /** Path to the icon file.

Mandatory if `icons` is not defined. */
  icon?: FileName;
  /** The size of the square icon, in pixels. E.g. `32` for a 32px by 32px icon. Must be larger than `0`.

Only loaded if `icons` is not defined. */
  icon_size?: SpriteSizeType;
  /** Can't be an empty array. */
  icons?: IconData[];
  /** The orientation where the location's name will be drawn. */
  label_orientation?: RealOrientation;
  /** The apparent size of the space location in map coordinates. */
  magnitude?: number;
  /** Angle in relation to the parent body. */
  orientation: RealOrientation;
  /** The orientation where parked space platforms will be drawn. */
  parked_platforms_orientation?: RealOrientation;
  /** These transitions are used for anything traveling from the surface associated with this location. */
  planet_procession_set?: ProcessionSet;
  /** These transitions are used for any platform stopped at this location. */
  platform_procession_set?: ProcessionSet;
  procession_audio_catalogue?: ProcessionAudioCatalogue;
  procession_graphic_catalogue?: ProcessionGraphicCatalogue;
  solar_power_in_space?: number;
  /** Path to the icon file.

Only loaded if `starmap_icons` is not defined. */
  starmap_icon?: FileName;
  /** The size of the starmap icon, in pixels. E.g. `32` for a 32px by 32px icon. Must be larger than `0`.

Only loaded if `starmap_icons` is not defined. */
  starmap_icon_size?: SpriteSizeType;
  /** Can't be an empty array. */
  starmap_icons?: IconData[];
}

export type SpaceLocationPrototype = _SpaceLocationPrototype &
  Omit<Prototype, keyof _SpaceLocationPrototype>;

export function isSpaceLocationPrototype(
  value: unknown,
): value is SpaceLocationPrototype {
  return (value as { type: string }).type === 'space-location';
}

interface _SpacePlatformHubPrototype {
  type: 'space-platform-hub';
  /** Has to be 256 to make blueprints snap to (0, 0) most of the time. */
  build_grid_size?: 256;
  cargo_station_parameters: CargoStationParameters;
  circuit_connector?: CircuitConnectorDefinition;
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  default_damage_taken_signal?: SignalIDConnector;
  default_speed_signal?: SignalIDConnector;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** Name of a [ContainerPrototype](prototype:ContainerPrototype). */
  dump_container: EntityID;
  graphics_set?: CargoBayConnectableGraphicsSet;
  inventory_size: ItemStackIndex;
  persistent_ambient_sounds?: PersistentWorldAmbientSoundsDefinition;
  platform_repair_speed_modifier?: number;
  surface_render_parameters?: SurfaceRenderParameters;
  weight?: Weight;
}

export type SpacePlatformHubPrototype = _SpacePlatformHubPrototype &
  Omit<EntityWithOwnerPrototype, keyof _SpacePlatformHubPrototype>;

export function isSpacePlatformHubPrototype(
  value: unknown,
): value is SpacePlatformHubPrototype {
  return (value as { type: string }).type === 'space-platform-hub';
}

interface _SpacePlatformStarterPackPrototype {
  type: 'space-platform-starter-pack';
  create_electric_network?: boolean;
  /** The quality of the items will match the quality of the starter pack. */
  initial_items?: ItemProductPrototype[];
  surface?: SurfaceID;
  tiles?: SpacePlatformTileDefinition[];
  trigger?: Trigger;
}

export type SpacePlatformStarterPackPrototype =
  _SpacePlatformStarterPackPrototype &
    Omit<ItemPrototype, keyof _SpacePlatformStarterPackPrototype>;

export function isSpacePlatformStarterPackPrototype(
  value: unknown,
): value is SpacePlatformStarterPackPrototype {
  return (value as { type: string }).type === 'space-platform-starter-pack';
}

/** Properties of the spectator controller. */
export interface SpectatorControllerPrototype {
  /** Must be >= 0.34375. */
  movement_speed: number;
  /** Name of the spectator controller. Base game uses "default". */
  name: string;
  type: 'spectator-controller';
}

export function isSpectatorControllerPrototype(
  value: unknown,
): value is SpectatorControllerPrototype {
  return (value as { type: string }).type === 'spectator-controller';
}

/** A speech bubble. It floats in the world and can display text. */
interface _SpeechBubblePrototype {
  type: 'speech-bubble';
  fade_in_out_ticks?: number;
  /** Needs a style of the type "speech_bubble_style", defined inside the gui styles. */
  style: string;
  /** Needs a style of the type "flow_style", defined inside the gui styles. */
  wrapper_flow_style?: string;
  y_offset?: number;
}

export type SpeechBubblePrototype = _SpeechBubblePrototype &
  Omit<EntityPrototype, keyof _SpeechBubblePrototype>;

export function isSpeechBubblePrototype(
  value: unknown,
): value is SpeechBubblePrototype {
  return (value as { type: string }).type === 'speech-bubble';
}

/** Used by [SpiderLegSpecification](prototype:SpiderLegSpecification) for [SpiderVehiclePrototype](prototype:SpiderVehiclePrototype), also known as [spidertron](https://wiki.factorio.com/Spidertron). */
interface _SpiderLegPrototype {
  type: 'spider-leg';
  /** The height of the foot from the ground when at rest. */
  ankle_height?: number;
  base_position_selection_distance: number;
  graphics_set?: SpiderLegGraphicsSet;
  /** The flexibility of hip. Must be between 0 and 1 inclusive. 0 means the hip doesn't flex at all, and 1 means the hip can bend the entire range, from straight up to straight down. Values less than one will dampen the hip flexibility and cause the upper and lower leg parts to stretch and squish more to compensate. Does not affect movement, only graphics. */
  hip_flexibility?: number;
  initial_movement_speed: number;
  /** The placement of the knee relative to the torso of the spider and the end of the foot when at rest. Used to calculate the shape of the leg and the length of the individual parts. Values between 0 and 1 place the knee between the torso and the leg. Values closer to 0 will place the knee closer to the torso. */
  knee_distance_factor: number;
  /** The resting height of the knee from the ground. Used to derive leg part length and size. If set too low, this could cause the knee to invert, bending inwards underneath the spider. */
  knee_height: number;
  lower_leg_dying_trigger_effects?: SpiderLegTriggerEffect[];
  minimal_step_size: number;
  movement_acceleration: number;
  movement_based_position_selection_distance: number;
  /** A scalar that controls the amount of influence this leg has over the position of the torso. Must be greater than 0. */
  stretch_force_scalar?: number;
  target_position_randomisation_distance: number;
  upper_leg_dying_trigger_effects?: SpiderLegTriggerEffect[];
  walking_sound_speed_modifier?: number;
  walking_sound_volume_modifier?: number;
}

export type SpiderLegPrototype = _SpiderLegPrototype &
  Omit<EntityWithOwnerPrototype, keyof _SpiderLegPrototype>;

export function isSpiderLegPrototype(
  value: unknown,
): value is SpiderLegPrototype {
  return (value as { type: string }).type === 'spider-leg';
}

interface _SpiderUnitPrototype {
  type: 'spider-unit';
  absorptions_to_join_attack?: Record<AirbornePollutantID, number>;
  ai_settings?: UnitAISettings;
  attack_parameters: AttackParameters;
  distraction_cooldown: number;
  dying_sound?: Sound;
  graphics_set?: SpiderTorsoGraphicsSet;
  /** The height of the spider affects the shooting height and the drawing of the graphics and lights. */
  height: number;
  max_pursue_distance?: number;
  min_pursue_time?: number;
  radar_range?: number;
  spawning_time_modifier?: number;
  spider_engine: SpiderEngineSpecification;
  /** Cannot be negative. */
  torso_bob_speed?: number;
  /** The orientation of the torso of the spider affects the shooting direction and the drawing of the graphics and lights. */
  torso_rotation_speed?: number;
  /** Must be less than or equal to 100. */
  vision_distance: number;
  /** A sound the spider unit makes when it sets out to attack. */
  warcry?: Sound;
}

export type SpiderUnitPrototype = _SpiderUnitPrototype &
  Omit<EntityWithOwnerPrototype, keyof _SpiderUnitPrototype>;

export function isSpiderUnitPrototype(
  value: unknown,
): value is SpiderUnitPrototype {
  return (value as { type: string }).type === 'spider-unit';
}

/** A [spidertron](https://wiki.factorio.com/Spidertron). */
interface _SpiderVehiclePrototype {
  type: 'spider-vehicle';
  automatic_weapon_cycling: boolean;
  /** This is applied whenever the spider shoots (manual and automatic targeting), `automatic_weapon_cycling` is true and the next gun in line (which is then selected) has ammo. When all of the above is the case, the chain_shooting_cooldown_modifier is a multiplier on the remaining shooting cooldown: `cooldown = (remaining_cooldown × chain_shooting_cooldown_modifier)`.

chain_shooting_cooldown_modifier is intended to be in the range of 0 to 1. This means that setting chain_shooting_cooldown_modifier to 0 reduces the remaining shooting cooldown to 0 while a chain_shooting_cooldown_modifier of 1 does not affect the remaining shooting cooldown at all. */
  chain_shooting_cooldown_modifier: number;
  chunk_exploration_radius: number;
  energy_source: BurnerEnergySource | VoidEnergySource;
  graphics_set?: SpiderVehicleGraphicsSet;
  /** The guns this spider vehicle uses. */
  guns?: ItemID[];
  /** The height of the spider affects the shooting height and the drawing of the graphics and lights. */
  height: number;
  inventory_size: ItemStackIndex;
  movement_energy_consumption: Energy;
  spider_engine: SpiderEngineSpecification;
  /** Cannot be negative. */
  torso_bob_speed?: number;
  /** The orientation of the torso of the spider affects the shooting direction and the drawing of the graphics and lights. */
  torso_rotation_speed?: number;
  /** If set to 0 then the spider will not have a Logistics tab. */
  trash_inventory_size?: ItemStackIndex;
}

export type SpiderVehiclePrototype = _SpiderVehiclePrototype &
  Omit<VehiclePrototype, keyof _SpiderVehiclePrototype>;

export function isSpiderVehiclePrototype(
  value: unknown,
): value is SpiderVehiclePrototype {
  return (value as { type: string }).type === 'spider-vehicle';
}

/** The [spidertron remote](https://wiki.factorio.com/Spidertron_remote). This remote can only be used for entities of type [SpiderVehiclePrototype](prototype:SpiderVehiclePrototype). */
interface _SpidertronRemotePrototype {
  type: 'spidertron-remote';
  /** Count of items of the same name that can be stored in one inventory slot. Must be 1 when the `"not-stackable"` flag is set. */
  stack_size: 1;
}

export type SpidertronRemotePrototype = _SpidertronRemotePrototype &
  Omit<SelectionToolPrototype, keyof _SpidertronRemotePrototype>;

export function isSpidertronRemotePrototype(
  value: unknown,
): value is SpidertronRemotePrototype {
  return (value as { type: string }).type === 'spidertron-remote';
}

/** A [splitter](https://wiki.factorio.com/Splitter). */
interface _SplitterPrototype {
  type: 'splitter';
  frozen_patch?: Sprite4Way;
  /** The name of the [TransportBeltPrototype](prototype:TransportBeltPrototype) which is used for the sound of the underlying belt. */
  related_transport_belt?: EntityID;
  structure?: Animation4Way;
  structure_animation_movement_cooldown?: number;
  structure_animation_speed_coefficient?: number;
  /** Drawn 1 tile north of `structure` when the splitter is facing east or west. */
  structure_patch?: Animation4Way;
}

export type SplitterPrototype = _SplitterPrototype &
  Omit<TransportBeltConnectablePrototype, keyof _SplitterPrototype>;

export function isSplitterPrototype(
  value: unknown,
): value is SplitterPrototype {
  return (value as { type: string }).type === 'splitter';
}

/** Specifies an image that can be used with [SpritePath](runtime:SpritePath) at runtime. */
export interface SpritePrototype {
  /** Only loaded if `layers` is not defined. */
  apply_runtime_tint?: boolean;
  /** Only loaded if `layers` is not defined. */
  apply_special_effect?: boolean;
  /** Only loaded if `layers` is not defined. */
  blend_mode?: BlendMode;
  /** Only loaded if `layers` is not defined.

Number of slices this is sliced into when using the "optimized atlas packing" option. If you are a modder, you can just ignore this property. Example: If this is 4, the sprite will be sliced into a 4x4 grid. */
  dice?: SpriteSizeType;
  /** Only loaded if `layers` is not defined.

Same as `dice` above, but this specifies only how many slices there are on the x axis. */
  dice_x?: SpriteSizeType;
  /** Only loaded if `layers` is not defined.

Same as `dice` above, but this specifies only how many slices there are on the y axis. */
  dice_y?: SpriteSizeType;
  /** Only loaded if `layers` is not defined.

Only one of `draw_as_shadow`, `draw_as_glow` and `draw_as_light` can be true. This takes precedence over `draw_as_light`.

Draws first as a normal sprite, then again as a light layer. See [https://forums.factorio.com/91682](https://forums.factorio.com/91682). */
  draw_as_glow?: boolean;
  /** Only loaded if `layers` is not defined.

Only one of `draw_as_shadow`, `draw_as_glow` and `draw_as_light` can be true. */
  draw_as_light?: boolean;
  /** Only loaded if `layers` is not defined.

Only one of `draw_as_shadow`, `draw_as_glow` and `draw_as_light` can be true. This takes precedence over `draw_as_glow` and `draw_as_light`. */
  draw_as_shadow?: boolean;
  /** Only loaded, and mandatory if `layers` is not defined.

The path to the sprite file to use. */
  filename?: FileName;
  /** Only loaded if `layers` is not defined. */
  flags?: SpriteFlags;
  /** Only loaded if `layers` is not defined.

Unused. */
  generate_sdf?: boolean;
  /** Only loaded if `layers` is not defined. Mandatory if `size` is not defined.

Height of the picture in pixels, from 0-4096. */
  height?: SpriteSizeType;
  /** Only loaded if `layers` is not defined. */
  invert_colors?: boolean;
  /** If this property is present, all Sprite definitions have to be placed as entries in the array, and they will all be loaded from there. `layers` may not be an empty table. Each definition in the array may also have the `layers` property.

If this property is present, all other properties besides `name` and `type` are ignored. */
  layers?: Sprite[];
  /** Only loaded if `layers` is not defined.

Minimal mode is entered when mod loading fails. You are in it when you see the gray box after (part of) the loading screen that tells you a mod error. Modders can ignore this property. */
  load_in_minimal_mode?: boolean;
  /** Only loaded if `layers` is not defined.

Only loaded if this is an icon, that is it has the flag `"group=icon"` or `"group=gui"`. */
  mipmap_count?: number;
  /** Name of the sprite. Can be used as a [SpritePath](runtime:SpritePath) at runtime. */
  name: string;
  /** Only loaded if `layers` is not defined.

Loaded only when `x` and `y` are both `0`. The first member of the tuple is `x` and the second is `y`. */
  position?: [SpriteSizeType, SpriteSizeType];
  /** Only loaded if `layers` is not defined.

Whether alpha should be pre-multiplied. */
  premul_alpha?: boolean;
  /** Only loaded if `layers` is not defined. */
  priority?: SpritePriority;
  /** Only loaded if `layers` is not defined. */
  rotate_shift?: boolean;
  /** Only loaded if `layers` is not defined.

Values other than `1` specify the scale of the sprite on default zoom. A scale of `2` means that the picture will be two times bigger on screen (and thus more pixelated). */
  scale?: number;
  /** Only loaded if `layers` is not defined.

The shift in tiles. `util.by_pixel()` can be used to divide the shift by 32 which is the usual pixel height/width of 1 tile in normal resolution. Note that 32 pixel tile height/width is not enforced anywhere - any other tile height or width is also possible. */
  shift?: Vector;
  /** Only loaded if `layers` is not defined.

The width and height of the sprite. If this is a tuple, the first member of the tuple is the width and the second is the height. Otherwise the size is both width and height. Width and height may only be in the range of 0-4096. */
  size?: SpriteSizeType | [SpriteSizeType, SpriteSizeType];
  /** Only loaded if `layers` is not defined.

Provides hint to sprite atlas system, so it can try to put sprites that are intended to be used at the same locations to the same sprite atlas. */
  surface?: SpriteUsageSurfaceHint;
  /** Only loaded if `layers` is not defined. */
  tint?: Color;
  /** Only loaded if `layers` is not defined. */
  tint_as_overlay?: boolean;
  type: 'sprite';
  /** Only loaded if `layers` is not defined.

Provides hint to sprite atlas system, so it can pack sprites that are related to each other to the same sprite atlas. */
  usage?: SpriteUsageHint;
  /** Only loaded if `layers` is not defined. Mandatory if `size` is not defined.

Width of the picture in pixels, from 0-4096. */
  width?: SpriteSizeType;
  /** Only loaded if `layers` is not defined.

Horizontal position of the sprite in the source file in pixels. */
  x?: SpriteSizeType;
  /** Only loaded if `layers` is not defined.

Vertical position of the sprite in the source file in pixels. */
  y?: SpriteSizeType;
}

export function isSpritePrototype(value: unknown): value is SpritePrototype {
  return (value as { type: string }).type === 'sprite';
}

/** Entity that sticks to another entity, and damages/slows it. Stickers can only be attached to [UnitPrototype](prototype:UnitPrototype), [CharacterPrototype](prototype:CharacterPrototype), [CarPrototype](prototype:CarPrototype) and [SpiderVehiclePrototype](prototype:SpiderVehiclePrototype). */
interface _StickerPrototype {
  type: 'sticker';
  animation?: Animation;
  /** Interval between application of `damage_per_tick`, in ticks. */
  damage_interval?: number;
  /** Applied every `damage_interval` ticks, so may not necessarily be "per tick". */
  damage_per_tick?: DamageParameters;
  /** Must be > 0. */
  duration_in_ticks: number;
  fire_spread_cooldown?: number;
  fire_spread_radius?: number;
  force_visibility?: ForceCondition;
  /** If true, causes the target entity to become "grounded", disabling flight. This only applies to Character entities wearing mech armor. */
  ground_target?: boolean;
  /** The `hidden` property of stickers is hardcoded to `true`. */
  hidden?: boolean;
  /** The `hidden_in_factoriopedia` property of stickers is hardcoded to `true`. */
  hidden_in_factoriopedia?: boolean;
  render_layer?: RenderLayer;
  /** Using this property marks the sticker as a "selection sticker", meaning that the selection box will be rendered around the entity when the sticker is on it. */
  selection_box_type?: CursorBoxType;
  single_particle?: boolean;
  /** If this is given, this sticker is considered a "fire sticker" for some functions, such as [BaseAttackParameters::fire_penalty](prototype:BaseAttackParameters::fire_penalty) and [EntityPrototypeFlags::not-flammable](prototype:EntityPrototypeFlags::not_flammable). */
  spread_fire_entity?: EntityID;
  stickers_per_square_meter?: number;
  /** The maximum movement speed for the target.

Negative values are ignored. */
  target_movement_max?: number;
  /** The maximum movement speed for the target when the sticker is attached. It linearly changes over time to reach `target_movement_max_to`.

Negative values are ignored. */
  target_movement_max_from?: number;
  /** The maximum movement speed for the target when the sticker expires. It linearly changes over time starting from `target_movement_max_from`.

Negative values are ignored. */
  target_movement_max_to?: number;
  /** Less than 1 to reduce movement speed, more than 1 to increase it. */
  target_movement_modifier?: number;
  /** The modifier value when the sticker is attached. It linearly changes over time to reach `target_movement_modifier_to`. */
  target_movement_modifier_from?: number;
  /** The modifier value when the sticker expires. It linearly changes over time starting from `target_movement_modifier_from`. */
  target_movement_modifier_to?: number;
  /** Effects (with cooldowns) to trigger every tick. */
  update_effects?: TriggerEffectWithCooldown[];
  vehicle_friction_modifier?: number;
  /** Works similarly to `target_movement_modifier_from`. */
  vehicle_friction_modifier_from?: number;
  /** Works similarly to `target_movement_modifier_to`. */
  vehicle_friction_modifier_to?: number;
  /** The maximum movement speed for vehicles.

Negative values are ignored. */
  vehicle_speed_max?: number;
  /** The maximum movement speed for vehicles when the sticker is attached. It linearly changes over time to reach `vehicle_speed_max_to`.

Negative values are ignored. */
  vehicle_speed_max_from?: number;
  /** The maximum movement speed for vehicles when the sticker expires. It linearly changes over time starting from `vehicle_speed_max_from`.

Negative values are ignored. */
  vehicle_speed_max_to?: number;
  /** Less than 1 to reduce vehicle speed, more than 1 to increase it. */
  vehicle_speed_modifier?: number;
  /** Works similarly to `target_movement_modifier_from`. */
  vehicle_speed_modifier_from?: number;
  /** Works similarly to `target_movement_modifier_to`. */
  vehicle_speed_modifier_to?: number;
}

export type StickerPrototype = _StickerPrototype &
  Omit<EntityPrototype, keyof _StickerPrototype>;

export function isStickerPrototype(value: unknown): value is StickerPrototype {
  return (value as { type: string }).type === 'sticker';
}

/** A [storage tank](https://wiki.factorio.com/Storage_tank). */
interface _StorageTankPrototype {
  type: 'storage-tank';
  circuit_connector?: [
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
  ];
  circuit_wire_max_distance?: number;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** Must be positive.

Used for determining the x position inside the `flow_sprite` when drawing the storage tank. Does not affect gameplay.

The x position of the sprite will be `((game.tick % flow_length_in_ticks) ÷ flow_length_in_ticks) × (flow_sprite.width - 32)`. This means, that over `flow_length_in_ticks` ticks, the part of the `flow_sprite` that is drawn in-game is incrementally moved from most-left to most-right inside the actual sprite, that part always has a width of 32px. After `flow_length_in_ticks`, the part of the `flow_sprite` that is drawn will start from the left again. */
  flow_length_in_ticks: number;
  fluid_box: FluidBox;
  pictures?: StorageTankPictures;
  /** Whether the "alt-mode icon" should be drawn at all. */
  show_fluid_icon?: boolean;
  two_direction_only?: boolean;
  /** The location of the window showing the contents. Note that for `window_background` the width and height are determined by the sprite and window_bounding_box only determines the drawing location. For `fluid_background` the width is determined by the sprite and the height and drawing location are determined by window_bounding_box. */
  window_bounding_box: BoundingBox;
}

export type StorageTankPrototype = _StorageTankPrototype &
  Omit<EntityWithOwnerPrototype, keyof _StorageTankPrototype>;

export function isStorageTankPrototype(
  value: unknown,
): value is StorageTankPrototype {
  return (value as { type: string }).type === 'storage-tank';
}

/** A straight rail. */
interface _StraightRailPrototype {
  type: 'straight-rail';
  /** The [collision_box](prototype:EntityPrototype::collision_box) of straight rail is hardcoded to `{{-0.7, -0.99}, {0.7, 0.99}}`. */
  collision_box?: BoundingBox;
}

export type StraightRailPrototype = _StraightRailPrototype &
  Omit<RailPrototype, keyof _StraightRailPrototype>;

export function isStraightRailPrototype(
  value: unknown,
): value is StraightRailPrototype {
  return (value as { type: string }).type === 'straight-rail';
}

interface _SurfacePropertyPrototype {
  type: 'surface-property';
  default_value: number;
  is_time?: boolean;
  /** The locale key of the unit of the property. In-game, the locale is provided the `__1__` parameter, which is the value of the property. */
  localised_unit_key?: string;
}

export type SurfacePropertyPrototype = _SurfacePropertyPrototype &
  Omit<Prototype, keyof _SurfacePropertyPrototype>;

export function isSurfacePropertyPrototype(
  value: unknown,
): value is SurfacePropertyPrototype {
  return (value as { type: string }).type === 'surface-property';
}

interface _SurfacePrototype {
  type: 'surface';
  /** Path to the icon file.

Mandatory if `icons` is not defined. */
  icon?: FileName;
  /** The size of the square icon, in pixels. E.g. `32` for a 32px by 32px icon. Must be larger than `0`.

Only loaded if `icons` is not defined. */
  icon_size?: SpriteSizeType;
  surface_properties?: Record<SurfacePropertyID, number>;
}

export type SurfacePrototype = _SurfacePrototype &
  Omit<Prototype, keyof _SurfacePrototype>;

export function isSurfacePrototype(value: unknown): value is SurfacePrototype {
  return (value as { type: string }).type === 'surface';
}

/** A [technology](https://wiki.factorio.com/Technologies). */
interface _TechnologyPrototype {
  type: 'technology';
  allows_productivity?: boolean;
  /** List of effects of the technology (applied when the technology is researched). */
  effects?: Modifier[];
  enabled?: boolean;
  /** Whether the technology should be shown in the technology tree GUI when "Show only essential technologies" is enabled. */
  essential?: boolean;
  /** Path to the icon file.

Mandatory if `icons` is not defined. */
  icon?: FileName;
  /** The size of the square icon, in pixels. E.g. `32` for a 32px by 32px icon. Must be larger than `0`.

The base game uses 256px icons for technologies.

Only loaded if `icons` is not defined. */
  icon_size?: SpriteSizeType;
  /** Can't be an empty array. */
  icons?: IconData[];
  /** Controls whether the technology cost ignores the tech cost multiplier set in the [DifficultySettings](runtime:DifficultySettings). E.g. `4` for the default expensive difficulty. */
  ignore_tech_cost_multiplier?: boolean;
  /** `"infinite"` for infinite technologies, otherwise `uint32`.

Defaults to the same level as the technology, which is `0` for non-upgrades, and the level of the upgrade for upgrades. */
  max_level?: number | 'infinite';
  /** If this name ends with `-<number>`, that number is ignored for localization purposes. E.g. if the name is `technology-3`, the game looks for the `technology-name.technology` localization. The technology tree will also show the number on the technology icon. */
  name: string;
  /** List of technologies needed to be researched before this one can be researched. */
  prerequisites?: TechnologyID[];
  /** Mandatory if `unit` is not defined. */
  research_trigger?: TechnologyTrigger;
  /** Determines the cost in items and time of the technology.

Mandatory if `research_trigger` is not defined. */
  unit?: TechnologyUnit;
  /** When set to true, and the technology contains several levels, only the relevant one is displayed in the technology screen. */
  upgrade?: boolean;
  /** Controls whether the technology is shown in the tech GUI when it is not `enabled`. */
  visible_when_disabled?: boolean;
}

export type TechnologyPrototype = _TechnologyPrototype &
  Omit<Prototype, keyof _TechnologyPrototype>;

export function isTechnologyPrototype(
  value: unknown,
): value is TechnologyPrototype {
  return (value as { type: string }).type === 'technology';
}

interface _TemporaryContainerPrototype {
  type: 'temporary-container';
  alert_after_time?: number;
  destroy_on_empty?: boolean;
  time_to_live?: number;
}

export type TemporaryContainerPrototype = _TemporaryContainerPrototype &
  Omit<ContainerPrototype, keyof _TemporaryContainerPrototype>;

export function isTemporaryContainerPrototype(
  value: unknown,
): value is TemporaryContainerPrototype {
  return (value as { type: string }).type === 'temporary-container';
}

interface _ThrusterPrototype {
  type: 'thruster';
  fuel_fluid_box: FluidBox;
  graphics_set?: ThrusterGraphicsSet;
  /** `max_performance.fluid_volume` must not be smaller than `min_performance.fluid_volume`. */
  max_performance: ThrusterPerformancePoint;
  min_performance: ThrusterPerformancePoint;
  oxidizer_fluid_box: FluidBox;
  plumes?: PlumesSpecification;
}

export type ThrusterPrototype = _ThrusterPrototype &
  Omit<EntityWithOwnerPrototype, keyof _ThrusterPrototype>;

export function isThrusterPrototype(
  value: unknown,
): value is ThrusterPrototype {
  return (value as { type: string }).type === 'thruster';
}

/** Used to define the parameters for tile shaders. */
export interface TileEffectDefinition {
  /** Name of the tile-effect. */
  name: string;
  /** Only loaded, and mandatory if `shader` is `"puddle"`. */
  puddle?: PuddleTileEffectParameters;
  shader: 'water' | 'space' | 'puddle';
  /** Only loaded, and mandatory if `shader` is `"space"`. */
  space?: SpaceTileEffectParameters;
  type: 'tile-effect';
  /** Only loaded, and mandatory if `shader` is `"water"`. */
  water?: WaterTileEffectParameters;
}

export function isTileEffectDefinition(
  value: unknown,
): value is TileEffectDefinition {
  return (value as { type: string }).type === 'tile-effect';
}

/** The entity used for tile ghosts. */

interface _TileGhostPrototype {
  type: 'tile-ghost';
}

export type TileGhostPrototype = _TileGhostPrototype &
  Omit<EntityPrototype, keyof _TileGhostPrototype>;

export function isTileGhostPrototype(
  value: unknown,
): value is TileGhostPrototype {
  return (value as { type: string }).type === 'tile-ghost';
}

/** A [tile](https://wiki.factorio.com/Tile). */
interface _TilePrototype {
  type: 'tile';
  absorptions_per_second?: Record<AirbornePollutantID, number>;
  /** Array of tile names that are allowed next to this one. */
  allowed_neighbors?: TileID[];
  allows_being_covered?: boolean;
  ambient_sounds?: WorldAmbientSoundDefinition | WorldAmbientSoundDefinition[];
  ambient_sounds_group?: TileID;
  autoplace?: AutoplaceSpecification;
  bound_decoratives?: DecorativeID | DecorativeID[];
  /** The build animation used when this tile is built on a space platform. */
  build_animations?: Animation4Way;
  build_animations_background?: Animation4Way;
  /** If this is loaded as one Sound, it is loaded as the "small" build sound. */
  build_sound?: Sound | TileBuildSound;
  /** When the build_animations frame reaches this point the tile is built.

Mandatory if `build_animations` is defined. */
  built_animation_frame?: number;
  can_be_part_of_blueprint?: boolean;
  /** If set to true, the game will check for collisions with entities before building or mining the tile. If entities are in the way it is not possible to mine/build the tile. */
  check_collision_with_entities?: boolean;
  collision_mask: CollisionMaskConnector;
  decorative_removal_probability?: number;
  default_cover_tile?: TileID;
  /** The effect/trigger that runs when an item is destroyed by being dropped on this tile.

If the item defines [its own trigger](prototype:ItemPrototype::destroyed_by_dropping_trigger) it will override this.

If this is defined, `destroys_dropped_items` must be `true`. */
  default_destroyed_dropped_item_trigger?: Trigger;
  /** If items dropped on this tile are destroyed. */
  destroys_dropped_items?: boolean;
  driving_sound?: Sound;
  /** Triggers when a foundation tile is destroyed by an asteroid. */
  dying_explosion?: ExplosionDefinition | ExplosionDefinition[];
  effect?: TileEffectDefinitionID;
  effect_color?: Color;
  /** Used by the [pollution](https://wiki.factorio.com/Pollution) shader. */
  effect_color_secondary?: Color;
  effect_is_opaque?: boolean;
  fluid?: FluidID;
  frozen_variant?: TileID;
  /** Path to the icon file. If this and `icons` is not set, the `material_background` in `variants` is used as the icon.

Only loaded if `icons` is not defined. */
  icon?: FileName;
  /** The size of the square icon, in pixels. E.g. `32` for a 32px by 32px icon. Must be larger than `0`.

Only loaded if `icons` is not defined. */
  icon_size?: SpriteSizeType;
  /** Can't be an empty array. If this and `icon` is not set, the `material_background` in `variants` is used as the icon. */
  icons?: IconData[];
  is_foundation?: boolean;
  landing_steps_sound?: Sound;
  /** Specifies transition drawing priority. */
  layer: number;
  layer_group?: TileRenderLayer;
  /** For surfaces that use [fog effect](prototype:SurfaceRenderParameters::fog) of type `gleba`, this property determines whether given tile should contribute to fog intensity on a chunk or not. */
  lowland_fog?: boolean;
  map_color: Color;
  /** Must be equal to or greater than 0. */
  max_health?: number;
  /** If you want the tile to not be mineable, don't specify the minable property. Only non-mineable tiles become hidden tiles when placing mineable tiles on top of them. */
  minable?: MinableProperties;
  mined_sound?: Sound;
  /** Whether the tile needs tile correction logic applied when it's generated in the world, to prevent graphical artifacts. The tile correction logic disallows 1-wide stripes of the tile, see [Friday Facts #346](https://factorio.com/blog/post/fff-346). */
  needs_correction?: boolean;
  next_direction?: TileID;
  particle_tints?: TileBasedParticleTints;
  placeable_by?: ItemToPlace | ItemToPlace[];
  scorch_mark_color?: Color;
  searchable?: boolean;
  sprite_usage_surface?: SpriteUsageSurfaceHint;
  thawed_variant?: TileID;
  tint?: Color;
  transition_merges_with_tile?: TileID;
  transition_overlay_layer_offset?: number;
  /** Extra transitions. */
  transitions?: TileTransitionsToTiles[];
  transitions_between_transitions?: TileTransitionsBetweenTransitions[];
  /** Called by [InvokeTileEffectTriggerEffectItem](prototype:InvokeTileEffectTriggerEffectItem). */
  trigger_effect?: TriggerEffect;
  /** Graphics for this tile. */
  variants: TileTransitionsVariants;
  vehicle_friction_modifier?: number;
  walking_sound?: Sound;
  walking_speed_modifier?: number;
  weight?: Weight;
}

export type TilePrototype = _TilePrototype &
  Omit<Prototype, keyof _TilePrototype>;

export function isTilePrototype(value: unknown): value is TilePrototype {
  return (value as { type: string }).type === 'tile';
}

/** A tips and tricks entry. */
interface _TipsAndTricksItem {
  type: 'tips-and-tricks-item';
  /** Name of a [TipsAndTricksItemCategory](prototype:TipsAndTricksItemCategory), used for the sorting of this tips and tricks entry. Tips and trick entries are sorted first by category and then by their `order` within that category. */
  category?: string;
  /** An array of names of other tips and tricks items. This tips and tricks entry is only shown to the player once they have marked all dependencies as read. */
  dependencies?: string[];
  /** Path to the icon file.

Only loaded if `icons` is not defined. */
  icon?: FileName;
  /** The size of the square icon, in pixels. E.g. `32` for a 32px by 32px icon. Must be larger than `0`.

Only loaded if `icons` is not defined. */
  icon_size?: SpriteSizeType;
  /** Can't be an empty array. */
  icons?: IconData[];
  image?: FileName;
  /** The tips and tricks entry is indented by `indent`×6 spaces. */
  indent?: number;
  /** Whether the tip title on the left in the tips and tricks GUI should use the "title_tip_item" style (semi bold font). */
  is_title?: boolean;
  /** Used to order prototypes in inventory, recipes and GUIs. May not exceed a length of 200 characters. */
  order?: Order;
  player_input_method_filter?: PlayerInputMethodFilter;
  simulation?: SimulationDefinition;
  /** Condition for never showing the tip notification to the player. */
  skip_trigger?: TipTrigger;
  starting_status?: TipStatus;
  /** String to add in front of the tips and trick entries name. Can be anything, the base game tends to use [rich text](https://wiki.factorio.com/Rich_text) tags for items, e.g. `[item=wooden-chest]` here. */
  tag?: string;
  /** Condition for when the tip notification should be shown to the player. */
  trigger?: TipTrigger;
  /** Name of a [TutorialDefinition](prototype:TutorialDefinition). */
  tutorial?: string;
}

export type TipsAndTricksItem = _TipsAndTricksItem &
  Omit<PrototypeBase, keyof _TipsAndTricksItem>;

export function isTipsAndTricksItem(
  value: unknown,
): value is TipsAndTricksItem {
  return (value as { type: string }).type === 'tips-and-tricks-item';
}

/** A [TipsAndTricksItem](prototype:TipsAndTricksItem) category, used for sorting of tips and tricks entries: Tips and trick entries are sorted first by category and then by their order within that category. */
export interface TipsAndTricksItemCategory {
  name: string;
  /** Tips and trick categories are sorted by `order`, and then the tips and tips entries are sorted by their own order within those categories. */
  order: Order;
  type: 'tips-and-tricks-item-category';
}

export function isTipsAndTricksItemCategory(
  value: unknown,
): value is TipsAndTricksItemCategory {
  return (value as { type: string }).type === 'tips-and-tricks-item-category';
}

/** Items with a "durability". Used for [science packs](https://wiki.factorio.com/Science_pack). */
interface _ToolPrototype {
  type: 'tool';
  /** The durability of this tool. Must be positive. Mandatory if `infinite` is false. Ignored if <code>infinite</code> is true. */
  durability?: number;
  /** May not be longer than 200 characters. */
  durability_description_key?: string;
  /** May not be longer than 200 characters.

In-game, the game provides the locale with three [parameters](https://wiki.factorio.com/Tutorial:Localisation#Localising_with_parameters):

`__1__`: remaining durability

`__2__`: total durability

`__3__`: durability as a percentage

So when a locale key that has the following translation

`Remaining durability is __1__ out of __2__ which is __3__ %`

is applied to a tool with 2 remaining durability out of 8 it will be displayed as

`Remaining durability is 2 out of 8 which is 25 %` */
  durability_description_value?: string;
  /** Whether this tool has infinite durability. If this is false, `durability` must be specified. */
  infinite?: boolean;
}

export type ToolPrototype = _ToolPrototype &
  Omit<ItemPrototype, keyof _ToolPrototype>;

export function isToolPrototype(value: unknown): value is ToolPrototype {
  return (value as { type: string }).type === 'tool';
}

/** This prototype is used for receiving an achievement when the player has a specified train path length. */
interface _TrainPathAchievementPrototype {
  type: 'train-path-achievement';
  /** The achievement will trigger if a train path is longer than this. */
  minimum_distance: number;
}

export type TrainPathAchievementPrototype = _TrainPathAchievementPrototype &
  Omit<AchievementPrototype, keyof _TrainPathAchievementPrototype>;

export function isTrainPathAchievementPrototype(
  value: unknown,
): value is TrainPathAchievementPrototype {
  return (value as { type: string }).type === 'train-path-achievement';
}

/** A [train stop](https://wiki.factorio.com/Train_stop). */
interface _TrainStopPrototype {
  type: 'train-stop';
  animation_ticks_per_frame: number;
  animations?: Animation4Way;
  /** Has to be 2 for 2x2 grid. */
  build_grid_size?: 2;
  chart_name?: boolean;
  circuit_connector?: [
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
    CircuitConnectorDefinition,
  ];
  circuit_wire_max_distance?: number;
  color?: Color;
  default_priority_signal?: SignalIDConnector;
  default_train_stopped_signal?: SignalIDConnector;
  default_trains_count_signal?: SignalIDConnector;
  default_trains_limit_signal?: SignalIDConnector;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  drawing_boxes?: TrainStopDrawingBoxes;
  light1?: TrainStopLight;
  light2?: TrainStopLight;
  rail_overlay_animations?: Animation4Way;
  top_animations?: Animation4Way;
}

export type TrainStopPrototype = _TrainStopPrototype &
  Omit<EntityWithOwnerPrototype, keyof _TrainStopPrototype>;

export function isTrainStopPrototype(
  value: unknown,
): value is TrainStopPrototype {
  return (value as { type: string }).type === 'train-stop';
}

/** Abstract class that anything that is a belt or can connect to belts uses. */
interface _TransportBeltConnectablePrototype {
  type: 'transport-belt-connectable';
  animation_speed_coefficient?: number;
  belt_animation_set?: TransportBeltAnimationSet;
  /** Transport belt connectable entities must have [collision_box](prototype:EntityPrototype::collision_box) of an appropriate minimal size, they should occupy more than half of every tile the entity covers. */
  collision_box?: BoundingBox;
  /** Transport belt connectable entities cannot have the `"building-direction-8-way"` flag. */
  flags?: EntityPrototypeFlags;
  /** The speed of the belt: `speed × 480 = x Items/second`.

The raw value is expressed as the number of tiles traveled by each item on the belt per tick, relative to the belt's maximum density - e.g. `x items/second ÷ (4 items/lane × 2 lanes/belt × 60 ticks/second) = <speed> belts/tick` where a "belt" is the size of one tile. See [Transport_belts/Physics](https://wiki.factorio.com/Transport_belts/Physics) for more details.

Must be a positive non-infinite number. The number is a fixed point number with 8 bits reserved for decimal precision, meaning the smallest value step is `1/2^8 = 0.00390625`. In the simple case of a non-curved belt, the rate is multiples of `1.875` items/s, even though the entity tooltip may show a different rate. */
  speed: number;
}

export type TransportBeltConnectablePrototype =
  _TransportBeltConnectablePrototype &
    Omit<EntityWithOwnerPrototype, keyof _TransportBeltConnectablePrototype>;

export function isTransportBeltConnectablePrototype(
  value: unknown,
): value is TransportBeltConnectablePrototype {
  return (value as { type: string }).type === 'transport-belt-connectable';
}

/** A [transport belt](https://wiki.factorio.com/Transport_belt). */
interface _TransportBeltPrototype {
  type: 'transport-belt';
  belt_animation_set?: TransportBeltAnimationSetWithCorners;
  /** Set of 7 [circuit connector definitions](prototype:CircuitConnectorDefinition) in order: X, H, V, SE, SW, NE and NW. */
  circuit_connector?: CircuitConnectorDefinition[];
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  connector_frame_sprites?: TransportBeltConnectorFrame;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** The name of the [UndergroundBeltPrototype](prototype:UndergroundBeltPrototype) which is used in quick-replace fashion when the smart belt dragging behavior is triggered. */
  related_underground_belt?: EntityID;
}

export type TransportBeltPrototype = _TransportBeltPrototype &
  Omit<TransportBeltConnectablePrototype, keyof _TransportBeltPrototype>;

export function isTransportBeltPrototype(
  value: unknown,
): value is TransportBeltPrototype {
  return (value as { type: string }).type === 'transport-belt';
}

/** A [tree](https://wiki.factorio.com/Tree). */
interface _TreePrototype {
  type: 'tree';
  /** Mandatory if `variations` is defined. */
  colors?: Color[];
  darkness_of_burnt_tree?: number;
  /** The amount of health automatically regenerated. Trees will regenerate every 60 ticks with `healing_per_tick × 60`. */
  healing_per_tick?: number;
  /** Mandatory if `variations` is not defined. */
  pictures?: SpriteVariations;
  stateless_visualisation_variations?: StatelessVisualisations[];
  variation_weights?: number[];
  /** If defined, it can't be empty. */
  variations?: TreeVariation[];
}

export type TreePrototype = _TreePrototype &
  Omit<EntityWithHealthPrototype, keyof _TreePrototype>;

export function isTreePrototype(value: unknown): value is TreePrototype {
  return (value as { type: string }).type === 'tree';
}

/** The base game always internally defines a "common" trigger target type. See [Design discussion: Trigger target type](https://forums.factorio.com/71657). */
export interface TriggerTargetType {
  name: string;
  type: 'trigger-target-type';
}

export function isTriggerTargetType(
  value: unknown,
): value is TriggerTargetType {
  return (value as { type: string }).type === 'trigger-target-type';
}

/** Smoke, but it's not an entity for optimization purposes. */
interface _TrivialSmokePrototype {
  type: 'trivial-smoke';
  /** Smoke always moves randomly unless `movement_slow_down_factor` is 0. If `affected_by_wind` is true, the smoke will also be moved by wind. */
  affected_by_wind?: boolean;
  animation: Animation;
  color?: Color;
  cyclic?: boolean;
  /** Can't be 0 - the smoke will never render. */
  duration: number;
  end_scale?: number;
  /** `fade_in_duration` + `fade_away_duration` must be <= `duration`. */
  fade_away_duration?: number;
  /** `fade_in_duration` + `fade_away_duration` must be <= `duration`. */
  fade_in_duration?: number;
  glow_animation?: Animation;
  glow_fade_away_duration?: number;
  /** Value between 0 and 1, with 1 being no slowdown and 0 being no movement. */
  movement_slow_down_factor?: number;
  render_layer?: RenderLayer;
  show_when_smoke_off?: boolean;
  spread_duration?: number;
  start_scale?: number;
}

export type TrivialSmokePrototype = _TrivialSmokePrototype &
  Omit<Prototype, keyof _TrivialSmokePrototype>;

export function isTrivialSmokePrototype(
  value: unknown,
): value is TrivialSmokePrototype {
  return (value as { type: string }).type === 'trivial-smoke';
}

/** A turret that needs no extra ammunition. See the children for turrets that need some kind of ammunition. */
interface _TurretPrototype {
  type: 'turret';
  alert_when_attacking?: boolean;
  allow_turning_when_starting_attack?: boolean;
  attack_from_start_frame?: boolean;
  /** Requires ammo_type in attack_parameters unless this is a [AmmoTurretPrototype](prototype:AmmoTurretPrototype). */
  attack_parameters: AttackParameters;
  attack_target_mask?: TriggerTargetMask;
  attacking_animation?: RotatedAnimation8Way;
  /** Controls the speed of the attacking_animation: `1 ÷ attacking_speed = duration of the attacking_animation` */
  attacking_speed?: number;
  call_for_help_radius: number;
  /** Set of [circuit connector definitions](prototype:CircuitConnectorDefinition) for all directions used by this turret. Required amount of elements is based on other prototype values: 8 elements if building-direction-8-way flag is set, or 16 elements if building-direction-16-way flag is set, or 4 elements if turret_base_has_direction is set to true, or 1 element. */
  circuit_connector?: CircuitConnectorDefinition[];
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  default_speed?: number;
  default_speed_secondary?: number;
  default_speed_when_killed?: number;
  default_starting_progress_when_killed?: number;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  dying_sound?: Sound;
  ending_attack_animation?: RotatedAnimation8Way;
  /** Controls the speed of the ending_attack_animation: `1 ÷ ending_attack_speed = duration of the ending_attack_animation` */
  ending_attack_speed?: number;
  ending_attack_speed_secondary?: number;
  ending_attack_speed_when_killed?: number;
  ending_attack_starting_progress_when_killed?: number;
  energy_glow_animation?: RotatedAnimation8Way;
  /** The range of the flickering of the alpha of `energy_glow_animation`. Default is range 0.2, so animation alpha can be anywhere between 0.8 and 1.0. */
  energy_glow_animation_flicker_strength?: number;
  folded_animation: RotatedAnimation8Way;
  folded_animation_is_stateless?: boolean;
  /** It's randomized whether a particular turret uses the primary or the secondary speed for its animations.

Controls the speed of the folded_animation: `1 ÷ folded_speed = duration of the folded_animation` */
  folded_speed?: number;
  /** It's randomized whether a particular turret uses the primary or the secondary speed for its animations.

Controls the speed of the folded_animation: `1 ÷ folded_speed_secondary = duration of the folded_animation` */
  folded_speed_secondary?: number;
  folded_speed_when_killed?: number;
  folded_starting_progress_when_killed?: number;
  folded_state_corpse?: EntityID | EntityID[];
  folding_animation?: RotatedAnimation8Way;
  folding_sound?: Sound;
  /** Controls the speed of the folding_animation: `1 ÷ folding_speed = duration of the folding_animation` */
  folding_speed?: number;
  folding_speed_secondary?: number;
  folding_speed_when_killed?: number;
  folding_starting_progress_when_killed?: number;
  /** The intensity of light in the form of `energy_glow_animation` drawn on top of `energy_glow_animation`. */
  glow_light_intensity?: number;
  graphics_set: TurretGraphicsSet;
  gun_animation_render_layer?: RenderLayer;
  gun_animation_secondary_draw_order?: number;
  ignore_target_mask?: TriggerTargetMask;
  integration?: Sprite;
  /** Whether this prototype should be a high priority target for enemy forces. See [Military units and structures](https://wiki.factorio.com/Military_units_and_structures). */
  is_military_target?: boolean;
  prepare_range?: number;
  prepared_alternative_animation?: RotatedAnimation8Way;
  /** The chance for `prepared_alternative_animation` to be used. */
  prepared_alternative_chance?: number;
  prepared_alternative_sound?: Sound;
  /** It's randomized whether a particular turret uses the primary or the secondary speed for its animations.

Controls the speed of the prepared_alternative_animation: `1 ÷ prepared_alternative_speed = duration of the prepared_alternative_animation` */
  prepared_alternative_speed?: number;
  /** It's randomized whether a particular turret uses the primary or the secondary speed for its animations.

Controls the speed of the prepared_alternative_animation: `1 ÷ prepared_alternative_speed_secondary = duration of the prepared_alternative_animation` */
  prepared_alternative_speed_secondary?: number;
  prepared_alternative_speed_when_killed?: number;
  prepared_alternative_starting_progress_when_killed?: number;
  prepared_animation?: RotatedAnimation8Way;
  prepared_sound?: Sound;
  /** It's randomized whether a particular turret uses the primary or the secondary speed for its animations.

Controls the speed of the prepared_animation: `1 ÷ prepared_speed = duration of the prepared_animation` */
  prepared_speed?: number;
  /** It's randomized whether a particular turret uses the primary or the secondary speed for its animations.

Controls the speed of the prepared_animation: `1 ÷ prepared_speed_secondary = duration of the prepared_animation` */
  prepared_speed_secondary?: number;
  prepared_speed_when_killed?: number;
  prepared_starting_progress_when_killed?: number;
  preparing_animation?: RotatedAnimation8Way;
  preparing_sound?: Sound;
  /** Controls the speed of the preparing_animation: `1 ÷ preparing_speed = duration of the preparing_animation` */
  preparing_speed?: number;
  preparing_speed_secondary?: number;
  preparing_speed_when_killed?: number;
  preparing_starting_progress_when_killed?: number;
  random_animation_offset?: boolean;
  resource_indicator_animation?: RotatedAnimation8Way;
  rotating_sound?: InterruptibleSound;
  rotation_speed?: number;
  rotation_speed_secondary?: number;
  rotation_speed_when_killed?: number;
  rotation_starting_progress_when_killed?: number;
  shoot_in_prepare_state?: boolean;
  /** Decoratives to be created when the spawner is created by the [map generator](https://wiki.factorio.com/Map_generator). Placed when enemies expand if `spawn_decorations_on_expansion` is set to true. */
  spawn_decoration?: CreateDecorativesTriggerEffectItem[];
  /** Whether `spawn_decoration` should be spawned when this turret is created through [enemy expansion](https://wiki.factorio.com/Enemies#Expansions). */
  spawn_decorations_on_expansion?: boolean;
  special_effect?: TurretSpecialEffect;
  /** When `false` turret will enter `starting_attack` state without checking its ammo or energy levels. [FluidTurretPrototype](prototype:FluidTurretPrototype) forces this to `true`. */
  start_attacking_only_when_can_shoot?: boolean;
  starting_attack_animation?: RotatedAnimation8Way;
  starting_attack_sound?: Sound;
  /** Controls the speed of the starting_attack_animation: `1 ÷ starting_attack_speed = duration of the starting_attack_animation` */
  starting_attack_speed?: number;
  starting_attack_speed_secondary?: number;
  starting_attack_speed_when_killed?: number;
  starting_attack_starting_progress_when_killed?: number;
  turret_base_has_direction?: boolean;
  unfolds_before_dying?: boolean;
}

export type TurretPrototype = _TurretPrototype &
  Omit<EntityWithOwnerPrototype, keyof _TurretPrototype>;

export function isTurretPrototype(value: unknown): value is TurretPrototype {
  return (value as { type: string }).type === 'turret';
}

/** The definition of the tutorial to be used in the tips and tricks, see [TipsAndTricksItem](prototype:TipsAndTricksItem). The actual tutorial scripting code is defined in the tutorial scenario. The scenario must be placed in the `tutorials` folder in the mod. */
interface _TutorialDefinition {
  type: 'tutorial';
  /** Used to order prototypes in inventory, recipes and GUIs. May not exceed a length of 200 characters. */
  order?: Order;
  /** Name of the folder for this tutorial scenario in the [`tutorials` folder](https://wiki.factorio.com/Tutorial:Mod_structure#Subfolders). */
  scenario: string;
}

export type TutorialDefinition = _TutorialDefinition &
  Omit<PrototypeBase, keyof _TutorialDefinition>;

export function isTutorialDefinition(
  value: unknown,
): value is TutorialDefinition {
  return (value as { type: string }).type === 'tutorial';
}

/** An [underground belt](https://wiki.factorio.com/Underground_belt). */
interface _UndergroundBeltPrototype {
  type: 'underground-belt';
  max_distance: number;
  max_distance_tint?: Color;
  max_distance_underground_remove_belts_sprite?: Sprite;
  structure?: UndergroundBeltStructure;
  underground_collision_mask?: CollisionMaskConnector;
  underground_remove_belts_sprite?: Sprite;
  underground_sprite?: Sprite;
}

export type UndergroundBeltPrototype = _UndergroundBeltPrototype &
  Omit<TransportBeltConnectablePrototype, keyof _UndergroundBeltPrototype>;

export function isUndergroundBeltPrototype(
  value: unknown,
): value is UndergroundBeltPrototype {
  return (value as { type: string }).type === 'underground-belt';
}

/** Entity that moves around and attacks players, for example [biters and spitters](https://wiki.factorio.com/Enemies#Creatures). */
interface _UnitPrototype {
  type: 'unit';
  absorptions_to_join_attack?: Record<AirbornePollutantID, number>;
  affected_by_tiles?: boolean;
  ai_settings?: UnitAISettings;
  /** If this is true, this entities `is_military_target property` can be changed runtime (on the entity, not on the prototype itself). */
  allow_run_time_change_of_is_military_target?: false;
  alternative_attacking_frame_sequence?: UnitAlternativeFrameSequence;
  /** Requires animation in attack_parameters. Requires ammo_type in attack_parameters. */
  attack_parameters: AttackParameters;
  can_open_gates?: boolean;
  /** How fast the `run_animation` frames are advanced. The animations are advanced animation_speed frames per `distance_per_frame` that the unit moves.

`frames_advanced = (distance_moved ÷ distance_per_frame) * animation_speed` */
  distance_per_frame: number;
  distraction_cooldown: number;
  /** The sound file to play when entity dies. */
  dying_sound?: Sound;
  /** If the unit is immune to movement by belts. */
  has_belt_immunity?: boolean;
  /** Whether this prototype should be a high priority target for enemy forces. See [Military units and structures](https://wiki.factorio.com/Military_units_and_structures). */
  is_military_target?: true;
  light?: LightDefinition;
  max_pursue_distance?: number;
  /** In ticks. */
  min_pursue_time?: number;
  move_while_shooting?: boolean;
  /** Movement speed of the unit in the world, in tiles per tick. Must be equal to or greater than 0. */
  movement_speed: number;
  radar_range?: number;
  render_layer?: RenderLayer;
  rotation_speed?: number;
  run_animation: RotatedAnimation;
  /** Only loaded if `walking_sound` is defined. */
  running_sound_animation_positions?: number[];
  spawning_time_modifier?: number;
  /** Max is 100.

Note: Setting to 50 or above can lead to undocumented behavior of individual units creating groups on their own when attacking or being attacked. */
  vision_distance: number;
  walking_sound?: Sound;
  /** A sound the unit makes when it sets out to attack. */
  warcry?: Sound;
}

export type UnitPrototype = _UnitPrototype &
  Omit<EntityWithOwnerPrototype, keyof _UnitPrototype>;

export function isUnitPrototype(value: unknown): value is UnitPrototype {
  return (value as { type: string }).type === 'unit';
}

/** An [upgrade planner](https://wiki.factorio.com/Upgrade_planner). */
interface _UpgradeItemPrototype {
  type: 'upgrade-item';
  /** The [SelectionModeData::mode](prototype:SelectionModeData::mode) is hardcoded to `"cancel-upgrade"`.

The filters are parsed, but then ignored and forced to be empty. */
  alt_select: SelectionModeData;
  /** This property is hardcoded to `false`. */
  always_include_tiles?: boolean;
  /** If the item will draw its label when held in the cursor in place of the item count. */
  draw_label_for_cursor_render?: boolean;
  /** The [SelectionModeData::mode](prototype:SelectionModeData::mode) is hardcoded to `"upgrade"`.

The filters are parsed, but then ignored and forced to be empty. */
  select: SelectionModeData;
  /** Count of items of the same name that can be stored in one inventory slot. Must be 1 when the `"not-stackable"` flag is set. */
  stack_size: 1;
}

export type UpgradeItemPrototype = _UpgradeItemPrototype &
  Omit<SelectionToolPrototype, keyof _UpgradeItemPrototype>;

export function isUpgradeItemPrototype(
  value: unknown,
): value is UpgradeItemPrototype {
  return (value as { type: string }).type === 'upgrade-item';
}

/** This prototype is used for receiving an achievement when the player uses a capsule. */
interface _UseItemAchievementPrototype {
  type: 'use-item-achievement';
  /** How many capsules need to be used. */
  amount?: number;
  limit_quality: QualityID;
  /** If this is false, the player carries over their statistics from this achievement through all their saves. */
  limited_to_one_game?: boolean;
  /** This will trigger the achievement, if this capsule is used. */
  to_use: ItemID;
}

export type UseItemAchievementPrototype = _UseItemAchievementPrototype &
  Omit<AchievementPrototype, keyof _UseItemAchievementPrototype>;

export function isUseItemAchievementPrototype(
  value: unknown,
): value is UseItemAchievementPrototype {
  return (value as { type: string }).type === 'use-item-achievement';
}

/** Constants used by the game that are not specific to certain prototypes. See [utility-constants.lua](https://github.com/wube/factorio-data/blob/master/core/prototypes/utility-constants.lua) for the values used by the base game. */
interface _UtilityConstants {
  type: 'utility-constants';
  agricultural_range_visualization_color: Color;
  artillery_range_visualization_color: Color;
  asteroid_collector_blockage_update_tile_distance: number;
  asteroid_collector_max_nurbs_control_point_separation: number;
  asteroid_collector_navmesh_refresh_tick_interval: number;
  asteroid_collector_static_head_swing_segment_count: number;
  asteroid_collector_static_head_swing_strength_scale: number;
  asteroid_fading_range: number;
  asteroid_position_offset_to_speed_coefficient: number;
  asteroid_spawning_offset: SimpleBoundingBox;
  asteroid_spawning_with_random_orientation_max_speed: number;
  /** The base game uses more entries here that are applied via the ammo-category.lua file. */
  bonus_gui_ordering: BonusGuiOrdering;
  building_buildable_tint: Color;
  building_buildable_too_far_tint: Color;
  building_collision_mask: CollisionMaskConnector;
  building_ignorable_tint: Color;
  building_no_tint: Color;
  building_not_buildable_tint: Color;
  capsule_range_visualization_color: Color;
  /** Chart means map and minimap. */
  chart: ChartUtilityConstants;
  chart_search_highlight: Color;
  checkerboard_black: Color;
  checkerboard_white: Color;
  clear_cursor_volume_modifier: number;
  clipboard_history_size: number;
  color_filters?: ColorFilterData[];
  count_button_size: number;
  daytime_color_lookup: DaytimeColorLookupTable;
  deconstruct_mark_tint: Color;
  default_alert_icon_scale: number;
  default_alert_icon_scale_by_type?: Record<string, number>;
  default_alert_icon_shift_by_type?: Record<string, Vector>;
  /** The strings can be entity types or custom strings. */
  default_collision_masks: Record<string, CollisionMaskConnector>;
  default_enemy_force_color: Color;
  default_item_weight: Weight;
  default_other_force_color: Color;
  /** The default value of [FluidBox::max_pipeline_extent](prototype:FluidBox::max_pipeline_extent). */
  default_pipeline_extent: number;
  /** Must contain arrival and departure with [procession_style](prototype:ProcessionPrototype::procession_style) containing 0. */
  default_planet_procession_set: ProcessionSet;
  /** Must contain arrival and departure with [procession_style](prototype:ProcessionPrototype::procession_style) containing 0. */
  default_platform_procession_set: ProcessionSet;
  default_player_force_color: Color;
  default_scorch_mark_color: Color;
  /** The strings are entity types. */
  default_trigger_target_mask_by_type?: Record<string, TriggerTargetMask>;
  disabled_recipe_slot_background_tint: Color;
  disabled_recipe_slot_tint: Color;
  drop_item_radius: number;
  dynamic_recipe_overload_factor: number;
  /** Silently clamped to be between 0 and 0.99. */
  ejected_item_direction_variation: number;
  /** Silently clamped to be between 0 and 1. */
  ejected_item_friction: number;
  /** Silently clamped to be between 1 tick and 5 minutes (`5 * 60 * 60` ticks). */
  ejected_item_lifetime: MapTick;
  /** Silently clamped to be between 0 and 1/60. */
  ejected_item_speed: number;
  enabled_recipe_slot_tint: Color;
  enemies_in_simulation_volume_modifier: number;
  entity_button_background_color: Color;
  entity_renderer_search_box_limits: EntityRendererSearchBoxLimits;
  environment_sounds_transition_fade_in_ticks: number;
  equipment_default_background_border_color: Color;
  equipment_default_background_color: Color;
  equipment_default_grabbed_background_color: Color;
  explosions_in_simulation_volume_modifier: number;
  filter_outline_color: Color;
  /** Must be >= 1. */
  flying_text_ttl: number;
  forced_enabled_recipe_slot_background_tint: Color;
  freezing_temperature: number;
  frozen_color_lookup: ColorLookupTable;
  ghost_layer: CollisionLayerID;
  ghost_shimmer_settings: GhostShimmerConfig;
  ghost_tint: Color;
  ghost_tint_delivering: Color;
  gui_remark_color: Color;
  gui_search_match_background_color: Color;
  gui_search_match_foreground_color: Color;
  icon_shadow_color: Color;
  icon_shadow_inset: number;
  icon_shadow_radius: number;
  icon_shadow_sharpness: number;
  /** Must be >= 1. */
  inserter_hand_stack_items_per_sprite: ItemCountType;
  /** Must be >= 1. */
  inserter_hand_stack_max_sprites: ItemCountType;
  /** Must be in range [1, 100]. */
  inventory_width: number;
  item_ammo_magazine_left_bar_color: Color;
  item_default_random_tint_strength: Color;
  /** There must be one array item with a threshold of `0`. */
  item_health_bar_colors: ItemHealthColorData[];
  item_outline_color: Color;
  item_outline_inset: number;
  item_outline_radius: number;
  item_outline_sharpness: number;
  item_tool_durability_bar_color: Color;
  /** Radius of area where cargo pods won't land. */
  landing_area_clear_zone_radius: number;
  /** Max radius where cargo pods will land. */
  landing_area_max_radius: number;
  large_area_size: number;
  large_blueprint_area_size: number;
  /** Can be set to anything from range 0 to 255, but larger values will be clamped to 160. Setting it to larger values can have performance impact (growing geometrically). */
  light_renderer_search_distance_limit: number;
  lightning_attractor_collection_range_color: Color;
  lightning_attractor_protection_range_color: Color;
  logistic_gui_selected_network_highlight_tint: Color;
  logistic_gui_unselected_network_highlight_tint: Color;
  low_energy_robot_estimate_multiplier: number;
  main_menu_background_image_location: FileName;
  main_menu_background_vignette_intensity: number;
  main_menu_background_vignette_sharpness: number;
  /** The strings represent the names of the simulations. */
  main_menu_simulations?: Record<string, SimulationDefinition>;
  manual_rail_building_reach_modifier: number;
  map_editor: MapEditorConstants;
  /** Must be >= 1. */
  max_belt_stack_size: number;
  max_fluid_flow: FluidAmount;
  max_logistic_filter_count: LogisticFilterIndex;
  max_terrain_building_size: number;
  maximum_recipe_overload_multiplier: number;
  medium_area_size: number;
  medium_blueprint_area_size: number;
  minimap_slot_clicked_tint: Color;
  minimap_slot_hovered_tint: Color;
  minimum_recipe_overload_multiplier: number;
  missing_preview_sprite_location: FileName;
  /** Must be in range [1, 100]. */
  module_inventory_width: number;
  /** Silently clamped to be between 0 and 1. */
  moving_sound_count_reduction_rate: number;
  music_transition_fade_in_ticks: number;
  music_transition_fade_out_ticks: number;
  music_transition_pause_ticks: number;
  /** The table with `name = "default"` must exist and be the first member of the array. */
  player_colors: PlayerColorData[];
  probability_product_count_tint: Color;
  rail_planner_count_button_color: Color;
  rail_segment_colors: Color[];
  recipe_step_limit: number;
  remote_view_LPF_max_cutoff_frequency: number;
  remote_view_LPF_min_cutoff_frequency: number;
  rocket_lift_weight: Weight;
  script_command_console_chat_color: Color;
  /** Must be in range [1, 100]. */
  select_group_row_count: number;
  /** Must be in range [1, 100]. */
  select_slot_row_count: number;
  selected_chart_search_highlight: Color;
  server_command_console_chat_color: Color;
  show_chunk_components_collision_mask: CollisionMaskConnector;
  small_area_size: number;
  small_blueprint_area_size: number;
  /** Variables: speed, thrust, weight, width, height */
  space_platform_default_speed_formula: MathExpression;
  /** Determines how fast space platforms will send items in trash slots to the surface. Each item type has its own cooldown. */
  space_platform_dump_cooldown: number;
  space_platform_max_size: SimpleBoundingBox;
  space_platform_relative_speed_factor: number;
  space_platform_starfield_movement_vector: Vector;
  spawner_evolution_factor_health_modifier: number;
  tile_ghost_tint: Color;
  tile_ghost_tint_delivering: Color;
  /** Must be >= 1. */
  tooltip_monitor_edge_border: number;
  train_inactivity_wait_condition_default: number;
  train_on_elevated_rail_shadow_shift_multiplier: Vector;
  train_path_finding: TrainPathFinderConstants;
  train_pushed_by_player_ignores_friction: boolean;
  train_pushed_by_player_max_acceleration: number;
  train_pushed_by_player_max_speed: number;
  train_temporary_stop_wait_time: number;
  train_time_wait_condition_default: number;
  train_visualization: TrainVisualizationConstants;
  tree_leaf_distortion_distortion_far: Vector;
  tree_leaf_distortion_distortion_near: Vector;
  tree_leaf_distortion_speed_far: Vector;
  tree_leaf_distortion_speed_near: Vector;
  tree_leaf_distortion_strength_far: Vector;
  tree_leaf_distortion_strength_near: Vector;
  tree_shadow_roughness: number;
  tree_shadow_speed: number;
  turret_range_visualization_color: Color;
  underground_belt_max_distance_tint: Color;
  underground_pipe_max_distance_tint: Color;
  unit_group_max_pursue_distance: number;
  unit_group_pathfind_resolution: number;
  /** Silently clamped to be between 0 and 1. */
  walking_sound_count_reduction_rate: number;
  water_collision_mask: CollisionMaskConnector;
  weapons_in_simulation_volume_modifier: number;
  zero_count_value_tint: Color;
  zoom_to_world_can_use_nightvision: boolean;
  zoom_to_world_daytime_color_lookup: DaytimeColorLookupTable;
  zoom_to_world_effect_strength: number;
}

export type UtilityConstants = _UtilityConstants &
  Omit<PrototypeBase, keyof _UtilityConstants>;

export function isUtilityConstants(value: unknown): value is UtilityConstants {
  return (value as { type: string }).type === 'utility-constants';
}

/** Sounds used by the game that are not specific to certain prototypes. */
interface _UtilitySounds {
  type: 'utility-sounds';
  achievement_unlocked: Sound;
  alert_destroyed: Sound;
  armor_insert: Sound;
  armor_remove: Sound;
  axe_fighting: Sound;
  axe_mining_ore: Sound;
  axe_mining_stone: Sound;
  build_animated_huge: Sound;
  build_animated_large: Sound;
  build_animated_medium: Sound;
  build_animated_small: Sound;
  build_blueprint_huge: Sound;
  build_blueprint_large: Sound;
  build_blueprint_medium: Sound;
  build_blueprint_small: Sound;
  build_ghost_upgrade: Sound;
  build_ghost_upgrade_cancel: Sound;
  build_huge: Sound;
  build_large: Sound;
  build_medium: Sound;
  build_small: Sound;
  cannot_build: Sound;
  clear_cursor: Sound;
  confirm: Sound;
  console_message: Sound;
  crafting_finished: Sound;
  deconstruct_huge: Sound;
  deconstruct_large: Sound;
  deconstruct_medium: Sound;
  deconstruct_robot: Sound;
  deconstruct_small: Sound;
  default_driving_sound: InterruptibleSound;
  default_landing_steps: Sound;
  default_manual_repair: Sound;
  drop_item: Sound;
  entity_settings_copied: Sound;
  entity_settings_pasted: Sound;
  game_lost: Sound;
  game_won: Sound;
  gui_click: Sound;
  inventory_click: Sound;
  inventory_move: Sound;
  item_deleted: Sound;
  item_spawned: Sound;
  list_box_click: Sound;
  metal_walking_sound: Sound;
  mining_wood: Sound;
  new_objective: Sound;
  paste_activated: Sound;
  picked_up_item: Sound;
  rail_plan_start: Sound;
  research_completed: Sound;
  rotated_huge: Sound;
  rotated_large: Sound;
  rotated_medium: Sound;
  rotated_small: Sound;
  scenario_message: Sound;
  segment_dying_sound?: Sound;
  smart_pipette: Sound;
  switch_gun: Sound;
  tutorial_notice: Sound;
  undo: Sound;
  wire_connect_pole: Sound;
  wire_disconnect: Sound;
  wire_pickup: Sound;
}

export type UtilitySounds = _UtilitySounds &
  Omit<PrototypeBase, keyof _UtilitySounds>;

export function isUtilitySounds(value: unknown): value is UtilitySounds {
  return (value as { type: string }).type === 'utility-sounds';
}

/** Sprites used by the game that are not specific to certain prototypes. */
interface _UtilitySprites {
  type: 'utility-sprites';
  achievement_label: Sprite;
  achievement_label_completed: Sprite;
  achievement_label_failed: Sprite;
  achievement_warning: Sprite;
  add: Sprite;
  add_white: Sprite;
  alert_arrow: Sprite;
  ammo_damage_modifier_constant?: Sprite;
  ammo_damage_modifier_icon: Sprite;
  ammo_icon: Sprite;
  and_or: Sprite;
  any_quality: Sprite;
  area_icon: Sprite;
  arrow_button: Animation;
  artillery_range_modifier_constant?: Sprite;
  artillery_range_modifier_icon: Sprite;
  asteroid_chunk_editor_icon: Sprite;
  asteroid_collector_path_blocked_icon: Sprite;
  backward_arrow: Sprite;
  backward_arrow_black: Sprite;
  bar_gray_pip: Sprite;
  battery: Sprite;
  beacon_distribution_modifier_constant?: Sprite;
  beacon_distribution_modifier_icon: Sprite;
  belt_stack_size_bonus_modifier_constant?: Sprite;
  belt_stack_size_bonus_modifier_icon: Sprite;
  bookmark: Sprite;
  brush_circle_shape: Sprite;
  brush_icon: Sprite;
  brush_square_shape: Sprite;
  buildability_collision: Sprite;
  buildability_collision_elevated: Sprite;
  buildability_elevated_collision_bottom: Sprite;
  buildability_elevated_collision_line: Sprite;
  buildability_elevated_collision_top: Sprite;
  bulk_inserter_capacity_bonus_modifier_constant?: Sprite;
  bulk_inserter_capacity_bonus_modifier_icon: Sprite;
  cable_editor_icon: Sprite;
  cargo_landing_pad_count_modifier_constant?: Sprite;
  cargo_landing_pad_count_modifier_icon: Sprite;
  center: Sprite;
  change_recipe: Sprite;
  change_recipe_productivity_modifier_constant?: Sprite;
  change_recipe_productivity_modifier_icon: Sprite;
  character_additional_mining_categories_modifier_constant?: Sprite;
  character_additional_mining_categories_modifier_icon: Sprite;
  character_build_distance_modifier_constant?: Sprite;
  character_build_distance_modifier_icon: Sprite;
  character_crafting_speed_modifier_constant?: Sprite;
  character_crafting_speed_modifier_icon: Sprite;
  character_health_bonus_modifier_constant?: Sprite;
  character_health_bonus_modifier_icon: Sprite;
  character_inventory_slots_bonus_modifier_constant?: Sprite;
  character_inventory_slots_bonus_modifier_icon: Sprite;
  character_item_drop_distance_modifier_constant?: Sprite;
  character_item_drop_distance_modifier_icon: Sprite;
  character_item_pickup_distance_modifier_constant?: Sprite;
  character_item_pickup_distance_modifier_icon: Sprite;
  character_logistic_requests_modifier_constant?: Sprite;
  character_logistic_requests_modifier_icon: Sprite;
  character_logistic_trash_slots_modifier_constant?: Sprite;
  character_logistic_trash_slots_modifier_icon: Sprite;
  character_loot_pickup_distance_modifier_constant?: Sprite;
  character_loot_pickup_distance_modifier_icon: Sprite;
  character_mining_speed_modifier_constant?: Sprite;
  character_mining_speed_modifier_icon: Sprite;
  character_reach_distance_modifier_constant?: Sprite;
  character_reach_distance_modifier_icon: Sprite;
  character_resource_reach_distance_modifier_constant?: Sprite;
  character_resource_reach_distance_modifier_icon: Sprite;
  character_running_speed_modifier_constant?: Sprite;
  character_running_speed_modifier_icon: Sprite;
  check_mark: Sprite;
  check_mark_dark_green: Sprite;
  check_mark_green: Sprite;
  check_mark_white: Sprite;
  circuit_network_panel: Sprite;
  cliff_deconstruction_enabled_modifier_constant?: Sprite;
  cliff_deconstruction_enabled_modifier_icon: Sprite;
  cliff_editor_icon: Sprite;
  clock: Sprite;
  clone: Sprite;
  clone_editor_icon: Sprite;
  close: Sprite;
  close_black: Sprite;
  close_fat: Sprite;
  close_map_preview: Sprite;
  clouds: Animation;
  collapse: Sprite;
  color_effect: Sprite;
  color_picker: Sprite;
  confirm_slot: Sprite;
  construction_radius_visualization: Sprite;
  controller_joycon_a: Sprite;
  controller_joycon_b: Sprite;
  controller_joycon_back: Sprite;
  controller_joycon_black_a: Sprite;
  controller_joycon_black_b: Sprite;
  controller_joycon_black_back: Sprite;
  controller_joycon_black_dpdown: Sprite;
  controller_joycon_black_dpleft: Sprite;
  controller_joycon_black_dpright: Sprite;
  controller_joycon_black_dpup: Sprite;
  controller_joycon_black_left_stick: Sprite;
  controller_joycon_black_leftshoulder: Sprite;
  controller_joycon_black_leftstick: Sprite;
  controller_joycon_black_lefttrigger: Sprite;
  controller_joycon_black_paddle1: Sprite;
  controller_joycon_black_paddle2: Sprite;
  controller_joycon_black_paddle3: Sprite;
  controller_joycon_black_paddle4: Sprite;
  controller_joycon_black_right_stick: Sprite;
  controller_joycon_black_rightshoulder: Sprite;
  controller_joycon_black_rightstick: Sprite;
  controller_joycon_black_righttrigger: Sprite;
  controller_joycon_black_start: Sprite;
  controller_joycon_black_x: Sprite;
  controller_joycon_black_y: Sprite;
  controller_joycon_dpdown: Sprite;
  controller_joycon_dpleft: Sprite;
  controller_joycon_dpright: Sprite;
  controller_joycon_dpup: Sprite;
  controller_joycon_left_stick: Sprite;
  controller_joycon_leftshoulder: Sprite;
  controller_joycon_leftstick: Sprite;
  controller_joycon_lefttrigger: Sprite;
  controller_joycon_paddle1: Sprite;
  controller_joycon_paddle2: Sprite;
  controller_joycon_paddle3: Sprite;
  controller_joycon_paddle4: Sprite;
  controller_joycon_right_stick: Sprite;
  controller_joycon_rightshoulder: Sprite;
  controller_joycon_rightstick: Sprite;
  controller_joycon_righttrigger: Sprite;
  controller_joycon_start: Sprite;
  controller_joycon_x: Sprite;
  controller_joycon_y: Sprite;
  controller_ps_a: Sprite;
  controller_ps_b: Sprite;
  controller_ps_back: Sprite;
  controller_ps_black_a: Sprite;
  controller_ps_black_b: Sprite;
  controller_ps_black_back: Sprite;
  controller_ps_black_dpdown: Sprite;
  controller_ps_black_dpleft: Sprite;
  controller_ps_black_dpright: Sprite;
  controller_ps_black_dpup: Sprite;
  controller_ps_black_left_stick: Sprite;
  controller_ps_black_leftshoulder: Sprite;
  controller_ps_black_leftstick: Sprite;
  controller_ps_black_lefttrigger: Sprite;
  controller_ps_black_right_stick: Sprite;
  controller_ps_black_rightshoulder: Sprite;
  controller_ps_black_rightstick: Sprite;
  controller_ps_black_righttrigger: Sprite;
  controller_ps_black_start: Sprite;
  controller_ps_black_x: Sprite;
  controller_ps_black_y: Sprite;
  controller_ps_dpdown: Sprite;
  controller_ps_dpleft: Sprite;
  controller_ps_dpright: Sprite;
  controller_ps_dpup: Sprite;
  controller_ps_left_stick: Sprite;
  controller_ps_leftshoulder: Sprite;
  controller_ps_leftstick: Sprite;
  controller_ps_lefttrigger: Sprite;
  controller_ps_right_stick: Sprite;
  controller_ps_rightshoulder: Sprite;
  controller_ps_rightstick: Sprite;
  controller_ps_righttrigger: Sprite;
  controller_ps_start: Sprite;
  controller_ps_x: Sprite;
  controller_ps_y: Sprite;
  controller_steamdeck_a: Sprite;
  controller_steamdeck_b: Sprite;
  controller_steamdeck_back: Sprite;
  controller_steamdeck_black_a: Sprite;
  controller_steamdeck_black_b: Sprite;
  controller_steamdeck_black_back: Sprite;
  controller_steamdeck_black_dpdown: Sprite;
  controller_steamdeck_black_dpleft: Sprite;
  controller_steamdeck_black_dpright: Sprite;
  controller_steamdeck_black_dpup: Sprite;
  controller_steamdeck_black_left_stick: Sprite;
  controller_steamdeck_black_leftshoulder: Sprite;
  controller_steamdeck_black_leftstick: Sprite;
  controller_steamdeck_black_lefttrigger: Sprite;
  controller_steamdeck_black_paddle1: Sprite;
  controller_steamdeck_black_paddle2: Sprite;
  controller_steamdeck_black_paddle3: Sprite;
  controller_steamdeck_black_paddle4: Sprite;
  controller_steamdeck_black_right_stick: Sprite;
  controller_steamdeck_black_rightshoulder: Sprite;
  controller_steamdeck_black_rightstick: Sprite;
  controller_steamdeck_black_righttrigger: Sprite;
  controller_steamdeck_black_start: Sprite;
  controller_steamdeck_black_x: Sprite;
  controller_steamdeck_black_y: Sprite;
  controller_steamdeck_dpdown: Sprite;
  controller_steamdeck_dpleft: Sprite;
  controller_steamdeck_dpright: Sprite;
  controller_steamdeck_dpup: Sprite;
  controller_steamdeck_left_stick: Sprite;
  controller_steamdeck_leftshoulder: Sprite;
  controller_steamdeck_leftstick: Sprite;
  controller_steamdeck_lefttrigger: Sprite;
  controller_steamdeck_paddle1: Sprite;
  controller_steamdeck_paddle2: Sprite;
  controller_steamdeck_paddle3: Sprite;
  controller_steamdeck_paddle4: Sprite;
  controller_steamdeck_right_stick: Sprite;
  controller_steamdeck_rightshoulder: Sprite;
  controller_steamdeck_rightstick: Sprite;
  controller_steamdeck_righttrigger: Sprite;
  controller_steamdeck_start: Sprite;
  controller_steamdeck_x: Sprite;
  controller_steamdeck_y: Sprite;
  controller_xbox_a: Sprite;
  controller_xbox_b: Sprite;
  controller_xbox_back: Sprite;
  controller_xbox_black_a: Sprite;
  controller_xbox_black_b: Sprite;
  controller_xbox_black_back: Sprite;
  controller_xbox_black_dpdown: Sprite;
  controller_xbox_black_dpleft: Sprite;
  controller_xbox_black_dpright: Sprite;
  controller_xbox_black_dpup: Sprite;
  controller_xbox_black_left_stick: Sprite;
  controller_xbox_black_leftshoulder: Sprite;
  controller_xbox_black_leftstick: Sprite;
  controller_xbox_black_lefttrigger: Sprite;
  controller_xbox_black_right_stick: Sprite;
  controller_xbox_black_rightshoulder: Sprite;
  controller_xbox_black_rightstick: Sprite;
  controller_xbox_black_righttrigger: Sprite;
  controller_xbox_black_start: Sprite;
  controller_xbox_black_x: Sprite;
  controller_xbox_black_y: Sprite;
  controller_xbox_dpdown: Sprite;
  controller_xbox_dpleft: Sprite;
  controller_xbox_dpright: Sprite;
  controller_xbox_dpup: Sprite;
  controller_xbox_left_stick: Sprite;
  controller_xbox_leftshoulder: Sprite;
  controller_xbox_leftstick: Sprite;
  controller_xbox_lefttrigger: Sprite;
  controller_xbox_right_stick: Sprite;
  controller_xbox_rightshoulder: Sprite;
  controller_xbox_rightstick: Sprite;
  controller_xbox_righttrigger: Sprite;
  controller_xbox_start: Sprite;
  controller_xbox_x: Sprite;
  controller_xbox_y: Sprite;
  copper_wire: Sprite;
  copper_wire_highlight: Sprite;
  copy: Sprite;
  covered_chunk: Sprite;
  crafting_machine_recipe_not_unlocked: Sprite;
  create_ghost_on_entity_death_modifier_constant?: Sprite;
  create_ghost_on_entity_death_modifier_icon: Sprite;
  cross_select: Sprite;
  crosshair: Sprite;
  cursor_box: CursorBoxSpecification;
  cursor_icon: Sprite;
  custom_tag_icon: Sprite;
  custom_tag_in_map_view: Sprite;
  danger_icon: Sprite;
  deconstruction_mark: Sprite;
  deconstruction_time_to_live_modifier_constant?: Sprite;
  deconstruction_time_to_live_modifier_icon: Sprite;
  decorative_editor_icon: Sprite;
  default_ammo_damage_modifier_icon: Sprite;
  default_gun_speed_modifier_icon: Sprite;
  default_turret_attack_modifier_icon: Sprite;
  destination_full_icon: Sprite;
  destroyed_icon: Sprite;
  down_arrow: Sprite;
  downloaded: Sprite;
  downloading: Sprite;
  dropdown: Sprite;
  editor_pause: Sprite;
  editor_play: Sprite;
  editor_selection: Sprite;
  editor_speed_down: Sprite;
  editor_speed_up: Sprite;
  electricity_icon: Sprite;
  electricity_icon_unplugged: Sprite;
  empty_ammo_slot: Sprite;
  empty_armor_slot: Sprite;
  empty_drop_cargo_slot: Sprite;
  empty_gun_slot: Sprite;
  empty_inserter_hand_slot: Sprite;
  empty_module_slot: Sprite;
  empty_robot_material_slot: Sprite;
  empty_robot_slot: Sprite;
  empty_trash_slot: Sprite;
  enemy_force_icon: Sprite;
  enter: Sprite;
  entity_editor_icon: Sprite;
  entity_info_dark_background: Sprite;
  equipment_collision: Sprite;
  equipment_grid: Sprite;
  equipment_slot: Sprite;
  expand: Sprite;
  expand_dots: Sprite;
  explosion_chart_visualization: Animation;
  export: Sprite;
  export_slot: Sprite;
  feedback: Sprite;
  filter_blacklist: Sprite;
  /** The sprite will be drawn on top of [fluid turrets](prototype:FluidTurretPrototype) that are out of fluid ammunition and don't have [FluidTurretPrototype::out_of_ammo_alert_icon](prototype:FluidTurretPrototype::out_of_ammo_alert_icon) set. */
  fluid_icon: Sprite;
  fluid_indication_arrow: Sprite;
  fluid_indication_arrow_both_ways: Sprite;
  fluid_visualization_connection: Sprite;
  fluid_visualization_connection_both_ways: Sprite;
  fluid_visualization_connection_underground: Sprite;
  fluid_visualization_extent_arrow: Sprite;
  follower_robot_lifetime_modifier_constant?: Sprite;
  follower_robot_lifetime_modifier_icon: Sprite;
  force_editor_icon: Sprite;
  force_ghost_cursor: Sprite;
  force_tile_ghost_cursor: Sprite;
  forward_arrow: Sprite;
  forward_arrow_black: Sprite;
  frozen_icon: Sprite;
  fuel_icon: Sprite;
  game_stopped_visualization: Sprite;
  ghost_bar_pip: Sprite;
  ghost_cursor: Sprite;
  give_item_modifier_constant?: Sprite;
  give_item_modifier_icon: Sprite;
  go_to_arrow: Sprite;
  gps_map_icon: Sprite;
  gradient: Sprite;
  green_circle: Sprite;
  green_dot: Sprite;
  green_wire: Sprite;
  green_wire_highlight: Sprite;
  grey_placement_indicator_leg: Sprite;
  grey_rail_signal_placement_indicator: Sprite;
  grid_view: Sprite;
  gun_speed_modifier_constant?: Sprite;
  gun_speed_modifier_icon: Sprite;
  hand: Sprite;
  hand_black: Sprite;
  health_bar_green_pip: Sprite;
  health_bar_red_pip: Sprite;
  health_bar_yellow_pip: Sprite;
  heat_exchange_indication: Sprite;
  hint_arrow_down: Sprite;
  hint_arrow_left: Sprite;
  hint_arrow_right: Sprite;
  hint_arrow_up: Sprite;
  import: Sprite;
  import_slot: Sprite;
  indication_arrow: Sprite;
  indication_line: Sprite;
  inserter_stack_size_bonus_modifier_constant?: Sprite;
  inserter_stack_size_bonus_modifier_icon: Sprite;
  item_editor_icon: Sprite;
  item_to_be_delivered_symbol: Sprite;
  laboratory_productivity_modifier_constant?: Sprite;
  laboratory_productivity_modifier_icon: Sprite;
  laboratory_speed_modifier_constant?: Sprite;
  laboratory_speed_modifier_icon: Sprite;
  left_arrow: Sprite;
  light_cone: Sprite;
  light_medium: Sprite;
  light_small: Sprite;
  lightning_warning_icon: Sprite;
  line_icon: Sprite;
  list_view: Sprite;
  logistic_network_panel_black: Sprite;
  logistic_network_panel_white: Sprite;
  logistic_radius_visualization: Sprite;
  lua_snippet_tool_icon: Sprite;
  map: Sprite;
  map_exchange_string: Sprite;
  max_distance_underground_remove_belts: Sprite;
  max_failed_attempts_per_tick_per_construction_queue_modifier_constant?: Sprite;
  max_failed_attempts_per_tick_per_construction_queue_modifier_icon: Sprite;
  max_successful_attempts_per_tick_per_construction_queue_modifier_constant?: Sprite;
  max_successful_attempts_per_tick_per_construction_queue_modifier_icon: Sprite;
  maximum_following_robots_count_modifier_constant?: Sprite;
  maximum_following_robots_count_modifier_icon: Sprite;
  medium_gui_arrow: Sprite;
  mining_drill_productivity_bonus_modifier_constant?: Sprite;
  mining_drill_productivity_bonus_modifier_icon: Sprite;
  mining_with_fluid_modifier_constant?: Sprite;
  mining_with_fluid_modifier_icon: Sprite;
  missing_icon: Sprite;
  missing_mod_icon: Sprite;
  mod_category: Sprite;
  mod_dependency_arrow: Sprite;
  mod_downloads_count: Sprite;
  mod_last_updated: Sprite;
  mouse_cursor: Sprite;
  move_tag: Sprite;
  multiplayer_waiting_icon: Sprite;
  nature_icon: Sprite;
  navmesh_pending_icon: Animation;
  neutral_force_icon: Sprite;
  no_building_material_icon: Sprite;
  no_nature_icon: Sprite;
  no_path_icon: Sprite;
  no_platform_storage_space_icon: Sprite;
  no_roboport_storage_space_icon: Sprite;
  no_storage_space_icon: Sprite;
  none_editor_icon: Sprite;
  not_available: Sprite;
  not_available_black: Sprite;
  not_enough_construction_robots_icon: Sprite;
  not_enough_repair_packs_icon: Sprite;
  not_played_yet_dark_green: Sprite;
  not_played_yet_green: Sprite;
  nothing_modifier_constant?: Sprite;
  nothing_modifier_icon: Sprite;
  notification: Sprite;
  output_console_gradient: Sprite;
  paint_bucket_icon: Sprite;
  parametrise: Sprite;
  pause: Sprite;
  pin_arrow: Sprite;
  pin_center: Sprite;
  pipeline_disabled_icon: Sprite;
  placement_indicator_leg: Sprite;
  platform_entity_build_animations: EntityBuildAnimations;
  play: Sprite;
  played_dark_green: Sprite;
  played_green: Sprite;
  player_force_icon: Sprite;
  preset: Sprite;
  pump_cannot_connect_icon: Sprite;
  questionmark: Sprite;
  rail_path_not_possible: Sprite;
  rail_planner_allow_elevated_rails_modifier_constant?: Sprite;
  rail_planner_allow_elevated_rails_modifier_icon: Sprite;
  rail_planner_indication_arrow: Sprite;
  rail_planner_indication_arrow_anchored: Sprite;
  rail_planner_indication_arrow_too_far: Sprite;
  rail_signal_placement_indicator: Sprite;
  rail_support_on_deep_oil_ocean_modifier_constant?: Sprite;
  rail_support_on_deep_oil_ocean_modifier_icon: Sprite;
  rail_support_placement_indicator: Sprite;
  reassign: Sprite;
  rebuild_mark: Sprite;
  recharge_icon: Sprite;
  recipe_arrow: Sprite;
  red_wire: Sprite;
  red_wire_highlight: Sprite;
  reference_point: Sprite;
  refresh: Sprite;
  refresh_white: Animation;
  rename_icon: Sprite;
  reset: Sprite;
  reset_white: Sprite;
  resource_editor_icon: Sprite;
  resources_depleted_icon: Sprite;
  right_arrow: Sprite;
  robot_slot: Sprite;
  scripting_editor_icon: Sprite;
  search: Sprite;
  search_icon: Sprite;
  select_icon_black: Sprite;
  select_icon_white: Sprite;
  set_bar_slot: Sprite;
  shield_bar_pip: Sprite;
  shoot_cursor_green: Sprite;
  shoot_cursor_red: Sprite;
  short_indication_line: Sprite;
  short_indication_line_green: Sprite;
  show_electric_network_in_map_view: Sprite;
  show_logistics_network_in_map_view: Sprite;
  show_pipelines_in_map_view: Sprite;
  show_player_names_in_map_view: Sprite;
  show_rail_signal_states_in_map_view: Sprite;
  show_recipe_icons_in_map_view: Sprite;
  show_tags_in_map_view: Sprite;
  show_train_station_names_in_map_view: Sprite;
  show_turret_range_in_map_view: Sprite;
  show_worker_robots_in_map_view: Sprite;
  shuffle: Sprite;
  side_menu_achievements_icon: Sprite;
  side_menu_blueprint_library_icon: Sprite;
  side_menu_bonus_icon: Sprite;
  side_menu_factoriopedia_icon: Sprite;
  side_menu_logistic_networks_icon: Sprite;
  side_menu_map_icon: Sprite;
  side_menu_menu_icon: Sprite;
  side_menu_players_icon: Sprite;
  side_menu_production_icon: Sprite;
  side_menu_space_platforms_icon: Sprite;
  side_menu_technology_icon: Sprite;
  side_menu_train_icon: Sprite;
  side_menu_tutorials_icon: Sprite;
  slot: Sprite;
  slots_view: Sprite;
  small_gui_arrow: Sprite;
  sort_by_name: Sprite;
  sort_by_time: Sprite;
  space_age_icon: Sprite;
  spawn_flag: Sprite;
  speed_down: Sprite;
  speed_up: Sprite;
  spray_icon: Sprite;
  starmap_platform_moving: Sprite;
  starmap_platform_moving_clicked: Sprite;
  starmap_platform_moving_hovered: Sprite;
  starmap_platform_stacked: Sprite;
  starmap_platform_stacked_clicked: Sprite;
  starmap_platform_stacked_hovered: Sprite;
  starmap_platform_stopped: Sprite;
  starmap_platform_stopped_clicked: Sprite;
  starmap_platform_stopped_hovered: Sprite;
  starmap_star: Sprite;
  station_name: Sprite;
  status_blue: Sprite;
  status_inactive: Sprite;
  status_not_working: Sprite;
  status_working: Sprite;
  status_yellow: Sprite;
  stop: Sprite;
  surface_editor_icon: Sprite;
  sync_mods: Sprite;
  technology_white: Sprite;
  tick_custom: Sprite;
  tick_once: Sprite;
  tick_sixty: Sprite;
  tile_editor_icon: Sprite;
  tile_ghost_cursor: Sprite;
  time_editor_icon: Sprite;
  tip_icon: Sprite;
  too_far: Sprite;
  too_far_from_roboport_icon: Sprite;
  tooltip_category_spoilable: Sprite;
  track_button: Sprite;
  track_button_white: Sprite;
  train_braking_force_bonus_modifier_constant?: Sprite;
  train_braking_force_bonus_modifier_icon: Sprite;
  train_stop_disabled_in_map_view: Sprite;
  train_stop_full_in_map_view: Sprite;
  train_stop_in_map_view: Sprite;
  train_stop_placement_indicator: Sprite;
  trash: Sprite;
  trash_white: Sprite;
  turret_attack_modifier_constant?: Sprite;
  turret_attack_modifier_icon: Sprite;
  unclaimed_cargo_icon: Sprite;
  underground_pipe_connection: Sprite;
  underground_remove_belts: Sprite;
  underground_remove_pipes: Sprite;
  unlock_circuit_network_modifier_constant?: Sprite;
  unlock_circuit_network_modifier_icon: Sprite;
  unlock_quality_modifier_constant?: Sprite;
  unlock_quality_modifier_icon: Sprite;
  unlock_recipe_modifier_constant?: Sprite;
  unlock_recipe_modifier_icon: Sprite;
  unlock_space_location_modifier_constant?: Sprite;
  unlock_space_location_modifier_icon: Sprite;
  unlock_space_platforms_modifier_constant?: Sprite;
  unlock_space_platforms_modifier_icon: Sprite;
  upgrade_blueprint: Sprite;
  upgrade_mark: Sprite;
  variations_tool_icon: Sprite;
  vehicle_logistics_modifier_constant?: Sprite;
  vehicle_logistics_modifier_icon: Sprite;
  warning: Sprite;
  warning_icon: Sprite;
  warning_white: Sprite;
  white_mask: Sprite;
  white_square: Sprite;
  white_square_icon: Sprite;
  wire_shadow: Sprite;
  worker_robot_battery_modifier_constant?: Sprite;
  worker_robot_battery_modifier_icon: Sprite;
  worker_robot_speed_modifier_constant?: Sprite;
  worker_robot_speed_modifier_icon: Sprite;
  worker_robot_storage_modifier_constant?: Sprite;
  worker_robot_storage_modifier_icon: Sprite;
}

export type UtilitySprites = _UtilitySprites &
  Omit<PrototypeBase, keyof _UtilitySprites>;

export function isUtilitySprites(value: unknown): value is UtilitySprites {
  return (value as { type: string }).type === 'utility-sprites';
}

/** Abstract base of all vehicles. */
interface _VehiclePrototype {
  type: 'vehicle';
  /** Determines whether this vehicle accepts passengers. This includes both drivers and gunners, if applicable. */
  allow_passengers?: boolean;
  allow_remote_driving?: boolean;
  /** Must be positive. There is no functional difference between the two ways to set braking power/force. */
  braking_power: Energy | number;
  crash_trigger?: TriggerEffect;
  /** Name of a [DeliverCategory](prototype:DeliverCategory). */
  deliver_category?: string;
  /** The (movement) energy used per hit point (1 hit point = 1 health damage) taken and dealt for this vehicle during collisions. The smaller the number, the more damage this vehicle and the rammed entity take during collisions: `damage = energy / energy_per_hit_point`. */
  energy_per_hit_point: number;
  /** The name of the [EquipmentGridPrototype](prototype:EquipmentGridPrototype) this vehicle has. */
  equipment_grid?: EquipmentGridID;
  /** Must be positive. There is no functional difference between the two ways to set friction force. */
  friction: number;
  impact_speed_to_volume_ratio?: number;
  /** The sprite that represents this vehicle on the map/minimap. */
  minimap_representation?: Sprite;
  /** The sprite that represents this vehicle on the map/minimap when it is selected. */
  selected_minimap_representation?: Sprite;
  stop_trigger?: TriggerEffect;
  stop_trigger_speed?: number;
  /** Must be in the [0, 1] interval. */
  terrain_friction_modifier?: number;
  /** Must be positive. Weight of the entity used for physics calculation when car hits something. */
  weight: number;
}

export type VehiclePrototype = _VehiclePrototype &
  Omit<EntityWithOwnerPrototype, keyof _VehiclePrototype>;

export function isVehiclePrototype(value: unknown): value is VehiclePrototype {
  return (value as { type: string }).type === 'vehicle';
}

/** A [virtual signal](https://wiki.factorio.com/Circuit_network#Virtual_signals). */
interface _VirtualSignalPrototype {
  type: 'virtual-signal';
  /** Path to the icon file that is used to represent this virtual signal.

Mandatory if `icons` is not defined. */
  icon?: FileName;
  /** The size of the square icon, in pixels. E.g. `32` for a 32px by 32px icon. Must be larger than `0`.

Only loaded if `icons` is not defined. */
  icon_size?: SpriteSizeType;
  /** The icon that is used to represent this virtual signal. Can't be an empty array. */
  icons?: IconData[];
}

export type VirtualSignalPrototype = _VirtualSignalPrototype &
  Omit<Prototype, keyof _VirtualSignalPrototype>;

export function isVirtualSignalPrototype(
  value: unknown,
): value is VirtualSignalPrototype {
  return (value as { type: string }).type === 'virtual-signal';
}

/** A [wall](https://wiki.factorio.com/Wall). */
interface _WallPrototype {
  type: 'wall';
  circuit_connector?: CircuitConnectorDefinition;
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  connected_gate_visualization?: Sprite;
  default_output_signal?: SignalIDConnector;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  pictures?: WallPictures;
  /** Different walls will visually connect to each other if their merge group is the same. */
  visual_merge_group?: number;
  wall_diode_green?: Sprite4Way;
  wall_diode_green_light_bottom?: LightDefinition;
  wall_diode_green_light_left?: LightDefinition;
  wall_diode_green_light_right?: LightDefinition;
  wall_diode_green_light_top?: LightDefinition;
  wall_diode_red?: Sprite4Way;
  wall_diode_red_light_bottom?: LightDefinition;
  wall_diode_red_light_left?: LightDefinition;
  wall_diode_red_light_right?: LightDefinition;
  wall_diode_red_light_top?: LightDefinition;
}

export type WallPrototype = _WallPrototype &
  Omit<EntityWithOwnerPrototype, keyof _WallPrototype>;

export function isWallPrototype(value: unknown): value is WallPrototype {
  return (value as { type: string }).type === 'wall';
}

export interface ActivateEquipmentCapsuleAction {
  /** Activation is only implemented for [ActiveDefenseEquipmentPrototype](prototype:ActiveDefenseEquipmentPrototype). */
  equipment: EquipmentID;
  type: 'equipment-remote';
}

export function isActivateEquipmentCapsuleAction(
  value: unknown,
): value is ActivateEquipmentCapsuleAction {
  return (value as { type: string }).type === 'equipment-remote';
}

interface _ActivateImpactTriggerEffectItem {
  /** Name of a [DeliverCategory](prototype:DeliverCategory). */
  deliver_category?: string;
  type: 'activate-impact';
}

export type ActivateImpactTriggerEffectItem = _ActivateImpactTriggerEffectItem &
  Omit<TriggerEffectItem, keyof _ActivateImpactTriggerEffectItem>;

export function isActivateImpactTriggerEffectItem(
  value: unknown,
): value is ActivateImpactTriggerEffectItem {
  return (value as { type: string }).type === 'activate-impact';
}

interface _ActivatePasteTipTrigger {
  type: 'activate-paste';
}

export type ActivatePasteTipTrigger = _ActivatePasteTipTrigger &
  Omit<CountBasedTipTrigger, keyof _ActivatePasteTipTrigger>;

export function isActivatePasteTipTrigger(
  value: unknown,
): value is ActivatePasteTipTrigger {
  return (value as { type: string }).type === 'activate-paste';
}

interface _ActivityBarStyleSpecification {
  bar?: ElementImageSet;
  bar_background?: ElementImageSet;
  bar_size_ratio?: number;
  bar_width?: number;
  color?: Color;
  speed?: number;
  type: 'activity_bar_style';
}

export type ActivityBarStyleSpecification = _ActivityBarStyleSpecification &
  Omit<BaseStyleSpecification, keyof _ActivityBarStyleSpecification>;

export function isActivityBarStyleSpecification(
  value: unknown,
): value is ActivityBarStyleSpecification {
  return (value as { type: string }).type === 'activity_bar_style';
}

export interface ActivityMatchingModifiers {
  inverted?: boolean;
  maximum?: number;
  /** Cannot be larger than `maximum`. */
  minimum?: number;
  multiplier?: number;
  offset?: number;
}
export interface AdvancedMapGenSettings {
  asteroids?: MapGenPresetAsteroidSettings;
  difficulty_settings?: MapGenPresetDifficultySettings;
  enemy_evolution?: MapGenPresetEnemyEvolutionSettings;
  enemy_expansion?: MapGenPresetEnemyExpansionSettings;
  pollution?: MapGenPresetPollutionSettings;
}
export interface AdvancedVolumeControl {
  attenuation?: Fade;
  /** Has to be in the range (-1.0, 1.0). */
  darkness_threshold?: number;
  fades?: Fades;
}
export interface AggregationSpecification {
  /** If `true`, already playing sounds are taken into account when checking `max_count`. */
  count_already_playing?: boolean;
  max_count: number;
  priority?: 'closest' | 'farthest' | 'newest' | 'oldest';
  /** If `count_already_playing` is `true`, this will determine maximum progress when instance is counted toward playing sounds. */
  progress_threshold?: number;
  /** If `false`, the volume of sound instances above `max_count` is calculated according to the formula `volume = (x + 1) ^ (-volume_reduction_rate)`, where `x` is the order number of an instance above the threshold.

If `true`, sound instances above `max_count` are removed. */
  remove: boolean;
  /** Has to be greater than or equal to 0.0. */
  volume_reduction_rate?: number;
}
export interface AgriculturalCraneProperties {
  min_arm_extent?: number;
  min_grappler_extent?: number;
  /** In degrees. */
  operation_angle?: number;
  origin: Vector3D;
  parts: CranePart[];
  shadow_direction: Vector3D;
  speed: AgriculturalCraneSpeed;
  telescope_default_extention?: number;
}
export interface AgriculturalCraneSpeed {
  arm: AgriculturalCraneSpeedArm;
  grappler: AgriculturalCraneSpeedGrappler;
}
export interface AgriculturalCraneSpeedArm {
  /** Must be positive. */
  extension_speed?: number;
  /** May not be 0. */
  turn_rate?: number;
}
export interface AgriculturalCraneSpeedGrappler {
  allow_transpolar_movement?: boolean;
  /** Must be positive. */
  extension_speed?: number;
  /** May not be 0. */
  horizontal_turn_rate?: number;
  /** May not be 0. */
  vertical_turn_rate?: number;
}
interface _AlternativeBuildTipTrigger {
  type: 'alternative-build';
}

export type AlternativeBuildTipTrigger = _AlternativeBuildTipTrigger &
  Omit<CountBasedTipTrigger, keyof _AlternativeBuildTipTrigger>;

export function isAlternativeBuildTipTrigger(
  value: unknown,
): value is AlternativeBuildTipTrigger {
  return (value as { type: string }).type === 'alternative-build';
}

interface _AmmoDamageModifier {
  /** Name of the [AmmoCategory](prototype:AmmoCategory) that is affected. */
  ammo_category: AmmoCategoryID;
  /** If set to `false`, use the icon from [UtilitySprites](prototype:UtilitySprites) for this technology effect icon. */
  infer_icon?: boolean;
  /** Modification value, which will be added to the current ammo damage modifier upon researching. */
  modifier: number;
  type: 'ammo-damage';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type AmmoDamageModifier = _AmmoDamageModifier &
  Omit<BaseModifier, keyof _AmmoDamageModifier>;

export function isAmmoDamageModifier(
  value: unknown,
): value is AmmoDamageModifier {
  return (value as { type: string }).type === 'ammo-damage';
}

/** Definition of actual parameters used in attack. */
export interface AmmoType {
  /** Describes actions taken upon attack happening. */
  action?: Trigger;
  /** When true, the gun will be able to shoot even when the target is out of range. Only applies when `target_type` equals `"position"`. The gun will fire at the maximum range in the direction of the target position. */
  clamp_position?: boolean;
  consumption_modifier?: number;
  cooldown_modifier?: number;
  /** Energy consumption of a single shot, if applicable. */
  energy_consumption?: Energy;
  /** Affects the `range` value of the shooting gun prototype's [BaseAttackParameters](prototype:BaseAttackParameters) to give a modified maximum range. The `min_range` value of the gun is unaffected.

This has no effect on artillery turrets and wagons even though the bonus appears in the GUI. [Forum thread](https://forums.factorio.com/103658). */
  range_modifier?: number;
  /** Only exists (and is then mandatory) if the [AmmoItemPrototype::ammo_type](prototype:AmmoItemPrototype::ammo_type) this AmmoType is defined on has multiple ammo types.

Defines for which kind of entity this ammo type applies. Each entity kind can only be used once per array. */
  source_type?: AmmoSourceType;
  /** List of entities that can be targeted by this ammo type. */
  target_filter?: EntityID[];
  /** `"entity"` fires at an entity, `"position"` fires directly at a position, `"direction"` fires in a direction.

If this is `"entity"`, `clamp_position` is forced to be `false`. */
  target_type?: 'entity' | 'position' | 'direction';
}
export interface AndTipTrigger {
  /** If all of the triggers are fulfilled, this trigger is considered fulfilled. */
  triggers: TipTrigger[];
  type: 'and';
}

export function isAndTipTrigger(value: unknown): value is AndTipTrigger {
  return (value as { type: string }).type === 'and';
}

export interface AnimatedVector {
  direction_shift?: DirectionShift;
  /** Default render layer for the rotations. */
  render_layer?: RenderLayer;
  rotations: VectorRotation[];
}
/** Specifies an animation that can be used in the game.

Note that if any frame of the animation is specified from the same source as any other [Sprite](prototype:Sprite) or frame of other animation, it will be shared. */
interface _Animation {
  /** Only loaded if `layers` is not defined. Mandatory if neither `stripes` nor `filenames` are defined.

The path to the sprite file to use. */
  filename?: FileName;
  /** Only loaded if neither `layers` nor `stripes` are defined. */
  filenames?: FileName[];
  /** If this property is present, all Animation definitions have to be placed as entries in the array, and they will all be loaded from there. `layers` may not be an empty table. Each definition in the array may also have the `layers` property.

`animation_speed` and `max_advance` of the first layer are used for all layers. All layers will run at the same speed.

If this property is present, all other properties, including those inherited from AnimationParameters, are ignored. */
  layers?: Animation[];
  /** Only loaded if `layers` is not defined. Mandatory if `filenames` is defined. */
  lines_per_file?: number;
  /** Only loaded if `layers` is not defined and if `filenames` is defined. */
  slice?: number;
  /** Only loaded if `layers` is not defined. */
  stripes?: Stripe[];
}

export type Animation = _Animation &
  Omit<AnimationParameters, keyof _Animation>;
/** If this is loaded as a single Animation, it applies to all directions. Any direction that is not defined defaults to the north animation. */
interface _Animation4Way {
  east?: Animation;
  north: Animation;
  north_east?: Animation;
  north_west?: Animation;
  south?: Animation;
  south_east?: Animation;
  south_west?: Animation;
  west?: Animation;
}
export interface AnimationElement {
  always_draw?: boolean;
  animation?: Animation;
  apply_tint?: boolean;
  render_layer?: RenderLayer;
  /** Used to determine render order for sprites with the same `render_layer` in the same position. Sprites with a higher `secondary_draw_order` are drawn on top. */
  secondary_draw_order?: number;
}
interface _AnimationParameters {
  /** Modifier of the animation playing speed, the default of `1` means one animation frame per tick (60 fps). The speed of playing can often vary depending on the usage (output of steam engine for example). Has to be greater than `0`. */
  animation_speed?: number;
  /** Number of slices this is sliced into when using the "optimized atlas packing" option. If you are a modder, you can just ignore this property. Example: If this is 4, the sprite will be sliced into a 4×4 grid. */
  dice?: number;
  /** Same as `dice` above, but this specifies only how many slices there are on the x axis. */
  dice_x?: number;
  /** Same as `dice` above, but this specifies only how many slices there are on the y axis. */
  dice_y?: number;
  /** Can't be `0`. */
  frame_count?: number;
  frame_sequence?: AnimationFrameSequence;
  /** Unused. */
  generate_sdf?: boolean;
  /** Mandatory if `size` is not defined.

Height of one frame in pixels, from 0-4096. */
  height?: SpriteSizeType;
  /** Specifies how many pictures are on each horizontal line in the image file. `0` means that all the pictures are in one horizontal line. Once the specified number of pictures are loaded from a line, the pictures from the next line are loaded. This is to allow having longer animations loaded in to Factorio's graphics matrix than the game engine's width limit of 8192px per input file. The restriction on input files is to be compatible with most graphics cards. */
  line_length?: number;
  /** Maximum amount of frames the animation can move forward in one update. Useful to cap the animation speed on entities where it is variable, such as car animations. */
  max_advance?: number;
  /** Only loaded if this is an icon, that is it has the flag `"group=icon"` or `"group=gui"`.

Note that `mipmap_count` doesn't make sense in an animation, as it is not possible to layout mipmaps in a way that would load both the animation and the mipmaps correctly (besides animations with just one frame). See [here](https://forums.factorio.com/viewtopic.php?p=549058#p549058). */
  mipmap_count?: number;
  /** How many times to repeat the animation to complete an animation cycle. E.g. if one layer is 10 frames, a second layer of 1 frame would need `repeat_count = 10` to match the complete cycle. */
  repeat_count?: number;
  run_mode?: AnimationRunMode;
  /** The width and height of one frame. If this is a tuple, the first member of the tuple is the width and the second is the height. Otherwise the size is both width and height. Width and height may only be in the range of 0-4096. */
  size?: SpriteSizeType | [SpriteSizeType, SpriteSizeType];
  /** Mandatory if `size` is not defined.

Width of one frame in pixels, from 0-4096. */
  width?: SpriteSizeType;
}

export type AnimationParameters = _AnimationParameters &
  Omit<SpriteParameters, keyof _AnimationParameters>;
interface _AnimationSheet {
  /** Only loaded, and mandatory if `filenames` is not defined.

The path to the animation file to use. */
  filename?: FileName;
  filenames?: FileName[];
  line_length?: number;
  /** Mandatory if `filenames` is defined. */
  lines_per_file?: number;
  variation_count: number;
}

export type AnimationSheet = _AnimationSheet &
  Omit<AnimationParameters, keyof _AnimationSheet>;
interface _AnimationVariations {
  /** The variations are arranged vertically in the file, one row for each variation. */
  sheet?: AnimationSheet;
  /** Only loaded if `sheet` is not defined. */
  sheets?: AnimationSheet[];
}
interface _ApplyStarterPackTipTrigger {
  type: 'apply-starter-pack';
}

export type ApplyStarterPackTipTrigger = _ApplyStarterPackTipTrigger &
  Omit<CountBasedTipTrigger, keyof _ApplyStarterPackTipTrigger>;

export function isApplyStarterPackTipTrigger(
  value: unknown,
): value is ApplyStarterPackTipTrigger {
  return (value as { type: string }).type === 'apply-starter-pack';
}

interface _AreaTriggerItem {
  collision_mode?: 'distance-from-collision-box' | 'distance-from-center';
  radius: number;
  show_in_tooltip?: boolean;
  target_entities?: boolean;
  trigger_from_target?: boolean;
  type: 'area';
}

export type AreaTriggerItem = _AreaTriggerItem &
  Omit<TriggerItem, keyof _AreaTriggerItem>;

export function isAreaTriggerItem(value: unknown): value is AreaTriggerItem {
  return (value as { type: string }).type === 'area';
}

interface _ArtilleryRangeModifier {
  /** If set to `false`, use the icon from [UtilitySprites](prototype:UtilitySprites) for this technology effect icon. */
  infer_icon?: boolean;
  type: 'artillery-range';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type ArtilleryRangeModifier = _ArtilleryRangeModifier &
  Omit<SimpleModifier, keyof _ArtilleryRangeModifier>;

export function isArtilleryRangeModifier(
  value: unknown,
): value is ArtilleryRangeModifier {
  return (value as { type: string }).type === 'artillery-range';
}

export interface ArtilleryRemoteCapsuleAction {
  /** Name of an [ArtilleryFlarePrototype](prototype:ArtilleryFlarePrototype). */
  flare: EntityID;
  play_sound_on_failure?: boolean;
  type: 'artillery-remote';
}

export function isArtilleryRemoteCapsuleAction(
  value: unknown,
): value is ArtilleryRemoteCapsuleAction {
  return (value as { type: string }).type === 'artillery-remote';
}

interface _ArtilleryTriggerDelivery {
  /** Maximum deviation of the projectile from source orientation, in +/- (`x radians / 2`). Example: `3.14 radians -> +/- (180° / 2)`, meaning up to 90° deviation in either direction of rotation. */
  direction_deviation?: number;
  /** Name of a [ArtilleryProjectilePrototype](prototype:ArtilleryProjectilePrototype). */
  projectile: EntityID;
  range_deviation?: number;
  starting_speed: number;
  starting_speed_deviation?: number;
  trigger_fired_artillery?: boolean;
  type: 'artillery';
}

export type ArtilleryTriggerDelivery = _ArtilleryTriggerDelivery &
  Omit<TriggerDeliveryItem, keyof _ArtilleryTriggerDelivery>;

export function isArtilleryTriggerDelivery(
  value: unknown,
): value is ArtilleryTriggerDelivery {
  return (value as { type: string }).type === 'artillery';
}

export interface AsteroidCollectorGraphicsSet {
  animation?: Animation4Way;
  arm_head_animation?: RotatedAnimation;
  arm_head_top_animation?: RotatedAnimation;
  arm_link?: RotatedSprite;
  below_arm_pictures?: RotatedSprite;
  below_ground_pictures?: RotatedSprite;
  status_lamp_picture_full?: RotatedSprite;
  status_lamp_picture_off?: RotatedSprite;
  status_lamp_picture_on?: RotatedSprite;
}
export interface AsteroidGraphicsSet {
  ambient_light?: Color;
  brightness?: number;
  light_width?: number;
  lights?: LightProperties | LightProperties[];
  normal_strength?: number;
  rotation_speed?: number;
  specular_power?: number;
  specular_purity?: number;
  specular_strength?: number;
  sprite?: Sprite;
  sss_amount?: number;
  sss_contrast?: number;
  variations?: AsteroidVariation | AsteroidVariation[];
}
export interface AsteroidSettings {
  max_ray_portals_expanded_per_tick: number;
  spawning_rate: number;
}
export interface AsteroidSpawnPoint {
  /** Facing the north. Must be in `[0, 1]` range. */
  angle_when_stopped?: number;
  /** Must be >= 0. */
  probability: number;
  /** Must be > 0. */
  speed: number;
}
export interface AsteroidVariation {
  color_texture: Sprite;
  normal_map: Sprite;
  roughness_map: Sprite;
  shadow_shift?: Vector;
}
export interface AttackReactionItem {
  action?: Trigger;
  damage_type?: DamageTypeID;
  range: number;
  reaction_modifier?: number;
}
export interface Attenuation {
  curve_type: AttenuationType;
  tuning_parameter?: number;
}
export interface AutoplaceSettings {
  /** Overrides the FrequencySizeRichness provided to the [AutoplaceSpecification](prototype:AutoplaceSpecification) of the entity/tile/decorative. Takes priority over the FrequencySizeRichness set in the [autoplace control](prototype:AutoplaceSpecification::control). */
  settings?: Record<EntityID, FrequencySizeRichness>;
  /** Whether missing autoplace names for this type should be default enabled. */
  treat_missing_as_default?: boolean;
}
/** Autoplace specification is used to determine which entities are placed when generating map. Currently it is used for enemy bases, tiles, resources and other entities (trees, fishes, etc.).

Autoplace specification describe conditions for placing tiles, entities, and decoratives during surface generation. Autoplace specification defines probability of placement on any given tile and richness, which has different meaning depending on the thing being placed. */
export interface AutoplaceSpecification {
  /** Name of the [AutoplaceControl](prototype:AutoplaceControl) (row in the map generator GUI) that applies to this entity. */
  control?: AutoplaceControlID;
  /** Indicates whether the thing should be placed even if [MapGenSettings](runtime:MapGenSettings) do not provide frequency/size/richness for it. (either for the specific prototype or for the control named by AutoplaceSpecification.control).

If true, normal frequency/size/richness (`value=1`) are used in that case. Otherwise it is treated as if 'none' were selected. */
  default_enabled?: boolean;
  /** Force of the placed entity. Can be a custom force name. Only relevant for [EntityWithOwnerPrototype](prototype:EntityWithOwnerPrototype). */
  force?: 'enemy' | 'player' | 'neutral' | string;
  /** A map of expression name to expression. Used by `probability_expression` and `richness_expression`.

Local expressions are meant to store data locally similar to local variables in Lua. Their purpose is to hold noise expressions used multiple times in the named noise expression, or just to tell the reader that the local expression has a specific purpose. Local expressions can access other local definitions and also function parameters, but recursive definitions aren't supported. */
  local_expressions?: Record<string, NoiseExpression>;
  /** A map of function name to function. Used by `probability_expression` and `richness_expression`.

Local functions serve the same purpose as local expressions - they aren't visible outside of the specific prototype and they have access to other local definitions. */
  local_functions?: Record<string, NoiseFunction>;
  /** Order for placing the entity (has no effect when placing tiles). Entities whose order compares less are placed earlier (this influences placing multiple entities which collide with itself), from entities with equal order string only one with the highest probability is placed. */
  order?: Order;
  /** For entities and decoratives, how many times to attempt to place on each tile. Probability and collisions are taken into account each attempt. */
  placement_density?: number;
  /** Provides a noise expression that will be evaluated at every point on the map to determine probability. */
  probability_expression: NoiseExpression;
  /** If specified, provides a noise expression that will be evaluated to determine richness. Otherwise, `probability_expression` will be used instead. */
  richness_expression?: NoiseExpression;
  /** Restricts tiles or tile transitions the entity can appear on. */
  tile_restriction?: TileIDRestriction[];
}
/** The abstract base of all [AttackParameters](prototype:AttackParameters). */
export interface BaseAttackParameters {
  /** Used in tooltips to set the tooltip category. It is also used to get the locale keys for activation instructions and speed of the action for the tooltip.

For example, an activation_type of "throw" will result in the tooltip category "thrown" and the tooltip locale keys "gui.instruction-to-throw" and "description.throwing-speed". */
  activation_type?: 'shoot' | 'throw' | 'consume' | 'activate';
  /** Mandatory if `ammo_category` is not defined. */
  ammo_categories?: AmmoCategoryID[];
  /** Mandatory if `ammo_categories` is not defined. */
  ammo_category?: AmmoCategoryID;
  /** Must be greater than or equal to `0`. */
  ammo_consumption_modifier?: number;
  /** Can be mandatory. */
  ammo_type?: AmmoType;
  animation?: RotatedAnimation;
  /** Number of ticks in which it will be possible to shoot again. If < 1, multiple shots can be performed in one tick. */
  cooldown: number;
  /** Must be between `0` and `1`. */
  cooldown_deviation?: number;
  /** Played during the attack. */
  cyclic_sound?: CyclicSound;
  damage_modifier?: number;
  /** Used when searching for the nearest enemy, when this is > 0, enemies that aren't burning are preferred over burning enemies. Definition of "burning" for this: Entity has sticker attached to it, and the sticker has a [spread_fire_entity](prototype:StickerPrototype::spread_fire_entity) set. */
  fire_penalty?: number;
  /** A higher penalty will discourage turrets from targeting units with higher health. A negative penalty will encourage turrets to target units with higher health. */
  health_penalty?: number;
  /** Setting this to anything but zero causes projectiles to aim for the predicted location based on enemy movement instead of the current enemy location. If set, this property adds a flat number of ticks atop `lead_target_for_projectile_speed` that the shooter must lead. */
  lead_target_for_projectile_delay?: number;
  /** Setting this to anything but zero causes homing projectiles to aim for the predicted location based on enemy movement instead of the current enemy location. If set, this property specifies the distance travelled per tick of the fired projectile. */
  lead_target_for_projectile_speed?: number;
  /** If less than `range`, the entity will choose a random distance between `range` and `min_attack_distance` and attack from that distance. */
  min_attack_distance?: number;
  /** The minimum distance (in tiles) between an entity and target. If a unit's target is less than this, the unit will attempt to move away before attacking. A [flamethrower turret](https://wiki.factorio.com/Flamethrower_turret) does not move, but has a minimum range. Less than this, it is unable to target an enemy. */
  min_range?: number;
  movement_slow_down_cooldown?: number;
  movement_slow_down_factor?: number;
  /** Before an entity can attack, the distance (in tiles) between the entity and target must be less than or equal to this. */
  range: number;
  range_mode?: RangeMode;
  /** A higher penalty will discourage turrets from targeting units that would take longer to turn to face. */
  rotate_penalty?: number;
  /** Played once at the start of the attack if these are [ProjectileAttackParameters](prototype:ProjectileAttackParameters). */
  sound?: LayeredSound;
  /** If this is <= 0, it is set to 1. Arc from 0 to 1, so for example 0.25 is 90°. Used by the [flamethrower turret](https://wiki.factorio.com/Flamethrower_turret) in the base game. Arcs greater than 0.5 but less than 1 will be clamped to 0.5 as targeting in arcs larger than half circle is [not implemented](https://forums.factorio.com/94654). */
  turn_range?: number;
  use_shooter_direction?: boolean;
  /** Number of ticks it takes for the weapon to actually shoot after the order for shooting has been made. This also allows to "adjust" the shooting animation to the effect of shooting.

[CapsuleActions](prototype:CapsuleAction) cannot have attack parameters with non-zero warmup. */
  warmup?: number;
}
/** The abstract base of all [EnergySources](prototype:EnergySource). Specifies the way an entity gets its energy. */
export interface BaseEnergySource {
  /** The pollution an entity emits per minute at full energy consumption. This is exactly the value that is shown in the entity tooltip. */
  emissions_per_minute?: Record<AirbornePollutantID, number>;
  /** Whether to render the "no network" icon if the entity is not connected to an electric network. */
  render_no_network_icon?: boolean;
  /** Whether to render the "no power" icon if the entity is low on power. Also applies to the "no fuel" icon when using burner energy sources. */
  render_no_power_icon?: boolean;
}
/** The abstract base of all [Modifiers](prototype:Modifier). */
export interface BaseModifier {
  hidden?: boolean;
  /** Path to the icon file.

Only loaded if `icons` is not defined. */
  icon?: FileName;
  /** The size of the square icon, in pixels. E.g. `32` for a 32px by 32px icon. Must be larger than `0`.

Only loaded if `icons` is not defined. */
  icon_size?: SpriteSizeType;
  /** Can't be an empty array. */
  icons?: IconData[];
}
/** The abstract base of all [StyleSpecifications](prototype:StyleSpecification). */
export interface BaseStyleSpecification {
  bottom_margin?: number;
  bottom_padding?: number;
  /** Name of a custom GUI effect, which are hard-coded in the game's engine. Only has one option currently. */
  effect?: 'compilatron-hologram';
  effect_opacity?: number;
  /** Sets `minimal_height`, `maximal_height` and `natural_height` to the same value. */
  height?: number;
  horizontal_align?: HorizontalAlign;
  horizontally_squashable?: StretchRule;
  horizontally_stretchable?: StretchRule;
  ignored_by_search?: boolean;
  left_margin?: number;
  left_padding?: number;
  /** Sets `top_margin`, `right_margin`, `bottom_margin` and `left_margin` to the same value. */
  margin?: number;
  /** Maximal height ensures that the widget will never be bigger than than that size. It can't be stretched to be bigger. */
  maximal_height?: number;
  /** Maximal width ensures that the widget will never be bigger than than that size. It can't be stretched to be bigger. */
  maximal_width?: number;
  /** Minimal height ensures that the widget will never be smaller than than that size. It can't be squashed to be smaller. */
  minimal_height?: number;
  /** Minimal width ensures that the widget will never be smaller than than that size. It can't be squashed to be smaller. */
  minimal_width?: number;
  /** Natural height specifies the height of the element tries to have, but it can still be squashed/stretched to have a different size. */
  natural_height?: number;
  /** If this is a tuple, the first member sets `natural_width` and the second sets `natural_height`. Otherwise, both `natural_width` and `natural_height` are set to the same value. */
  natural_size?: number | [number, number];
  /** Natural width specifies the width of the element tries to have, but it can still be squashed/stretched to have a different size. */
  natural_width?: number;
  never_hide_by_search?: boolean;
  /** Sets `top_padding`, `right_padding`, `bottom_padding` and `left_padding` to the same value. */
  padding?: number;
  /** Name of a [StyleSpecification](prototype:StyleSpecification). This style inherits all property values from its parent.

Styles without a parent property default to the root style for their type. The exception to this are the root styles themselves, as they cannot have a parent set. Due to this, for root styles, some style properties are mandatory and behavior may be unexpected, such as an element not showing up because its size defaults to `0`. */
  parent?: string;
  right_margin?: number;
  right_padding?: number;
  /** If this is a tuple, the first member sets `width`, and the second sets `height`. Otherwise, both `width` and `height` are set to the same value. */
  size?: number | [number, number];
  tooltip?: LocalisedString;
  top_margin?: number;
  top_padding?: number;
  vertical_align?: VerticalAlign;
  vertically_squashable?: StretchRule;
  vertically_stretchable?: StretchRule;
  /** Sets `minimal_width`, `maximal_width` and `natural_width` to the same value. */
  width?: number;
}
interface _BeaconDistributionModifier {
  /** If set to `false`, use the icon from [UtilitySprites](prototype:UtilitySprites) for this technology effect icon. */
  infer_icon?: boolean;
  type: 'beacon-distribution';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type BeaconDistributionModifier = _BeaconDistributionModifier &
  Omit<SimpleModifier, keyof _BeaconDistributionModifier>;

export function isBeaconDistributionModifier(
  value: unknown,
): value is BeaconDistributionModifier {
  return (value as { type: string }).type === 'beacon-distribution';
}

export interface BeaconGraphicsSet {
  animation_layer?: RenderLayer;
  animation_list?: AnimationElement[];
  animation_progress?: number;
  /** Which tint set in [ModulePrototype::beacon_tint](prototype:ModulePrototype::beacon_tint) should be applied to elements of the `animation_list`, if any. */
  apply_module_tint?: ModuleTint;
  base_layer?: RenderLayer;
  draw_animation_when_idle?: boolean;
  draw_light_when_idle?: boolean;
  frozen_patch?: Sprite;
  light?: LightDefinition;
  module_icons_suppressed?: boolean;
  module_tint_mode?: 'single-module' | 'mix';
  /** The visualisations available for displaying the modules in the beacon. The visualisation is chosen based on art style, see [BeaconModuleVisualizations::art_style](prototype:BeaconModuleVisualizations::art_style) and [ModulePrototype::art_style](prototype:ModulePrototype::art_style). */
  module_visualisations?: BeaconModuleVisualizations[];
  no_modules_tint?: Color;
  random_animation_offset?: boolean;
  reset_animation_when_frozen?: boolean;
  top_layer?: RenderLayer;
}
export interface BeaconModuleVisualization {
  /** Which tint set in [ModulePrototype::beacon_tint](prototype:ModulePrototype::beacon_tint) should be applied to this, if any. */
  apply_module_tint?: ModuleTint;
  has_empty_slot?: boolean;
  pictures?: SpriteVariations;
  render_layer?: RenderLayer;
  /** Used to determine render order for sprites with the same `render_layer` in the same position. Sprites with a higher `secondary_draw_order` are drawn on top. */
  secondary_draw_order?: number;
}
export interface BeaconModuleVisualizations {
  /** The visualization is chosen based on the [ModulePrototype::art_style](prototype:ModulePrototype::art_style), meaning if module art style equals beacon module visualization art style then this visualization is chosen. Vanilla uses `"vanilla"` here. */
  art_style: string;
  /** The outer array contains the different slots, the inner array contains the different layers for those slots (with different tints etc). Example: */
  slots?: BeaconModuleVisualization[][];
  tier_offset?: number;
  use_for_empty_slots?: boolean;
}
export interface BeaconVisualizationTints {
  primary?: Color;
  quaternary?: Color;
  secondary?: Color;
  tertiary?: Color;
}
export interface BeamAnimationSet {
  /** Body segment of the beam. */
  body?: AnimationVariations;
  /** End point of the beam. */
  ending?: Animation;
  /** Head segment of the beam. */
  head?: Animation;
  render_layer?: RenderLayer;
  /** Start point of the beam. */
  start?: Animation;
  /** Tail segment of the beam. */
  tail?: Animation;
}
interface _BeamAttackParameters {
  source_direction_count?: number;
  source_offset?: Vector;
  type: 'beam';
}

export type BeamAttackParameters = _BeamAttackParameters &
  Omit<BaseAttackParameters, keyof _BeamAttackParameters>;

export function isBeamAttackParameters(
  value: unknown,
): value is BeamAttackParameters {
  return (value as { type: string }).type === 'beam';
}

export interface BeamGraphicsSet {
  beam?: BeamAnimationSet;
  /** Must be larger than 0. */
  desired_segment_length?: number;
  ground?: BeamAnimationSet;
  random_end_animation_rotation?: boolean;
  randomize_animation_per_segment?: boolean;
  transparent_start_end_animations?: boolean;
}
interface _BeamTriggerDelivery {
  add_to_shooter?: boolean;
  /** Name of a [BeamPrototype](prototype:BeamPrototype). */
  beam: EntityID;
  destroy_with_source_or_target?: boolean;
  duration?: number;
  max_length?: number;
  source_offset?: Vector;
  type: 'beam';
}

export type BeamTriggerDelivery = _BeamTriggerDelivery &
  Omit<TriggerDeliveryItem, keyof _BeamTriggerDelivery>;

export function isBeamTriggerDelivery(
  value: unknown,
): value is BeamTriggerDelivery {
  return (value as { type: string }).type === 'beam';
}

export interface BeltReaderLayer {
  render_layer?: RenderLayer;
  /** Must have a `frame_count` of `4`, one for each direction. */
  sprites: RotatedAnimation;
}
interface _BeltStackSizeBonusModifier {
  type: 'belt-stack-size-bonus';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type BeltStackSizeBonusModifier = _BeltStackSizeBonusModifier &
  Omit<SimpleModifier, keyof _BeltStackSizeBonusModifier>;

export function isBeltStackSizeBonusModifier(
  value: unknown,
): value is BeltStackSizeBonusModifier {
  return (value as { type: string }).type === 'belt-stack-size-bonus';
}

interface _BeltTraverseTipTrigger {
  type: 'belt-traverse';
}

export type BeltTraverseTipTrigger = _BeltTraverseTipTrigger &
  Omit<CountBasedTipTrigger, keyof _BeltTraverseTipTrigger>;

export function isBeltTraverseTipTrigger(
  value: unknown,
): value is BeltTraverseTipTrigger {
  return (value as { type: string }).type === 'belt-traverse';
}

export interface BoilerPictureSet {
  east: BoilerPictures;
  north: BoilerPictures;
  south: BoilerPictures;
  west: BoilerPictures;
}
export interface BoilerPictures {
  /** Animation that is drawn on top of the `structure` when `burning_cooldown` is larger than 1. The animation alpha can be controlled by the energy source light intensity, depending on `fire_flicker_enabled`.

The secondary draw order of this is higher than the secondary draw order of `fire_glow`, so this is drawn above `fire_glow`. */
  fire?: Animation;
  /** Animation that is drawn on top of the `structure` when `burning_cooldown` is larger than 1. The animation alpha can be controlled by the energy source light intensity, depending on `fire_glow_flicker_enabled`.

The secondary draw order of this is lower than the secondary draw order of `fire`, so this is drawn below `fire`. */
  fire_glow?: Animation;
  /** Drawn above the `structure`, in the "higher-object-under" [RenderLayer](prototype:RenderLayer). May be useful to correct problems with neighboring pipes overlapping the structure graphics. */
  patch?: Sprite;
  structure: Animation;
}
export interface BonusGuiOrdering {
  artillery_range: Order;
  beacon_distribution: Order;
  bulk_inserter: Order;
  character: Order;
  follower_robots: Order;
  inserter: Order;
  mining_productivity: Order;
  research_speed: Order;
  stack_inserter: Order;
  train_braking_force: Order;
  turret_attack: Order;
  worker_robots: Order;
}
interface _BoolModifier {
  /** The value this modifier will have upon researching. */
  modifier: boolean;
}

export type BoolModifier = _BoolModifier &
  Omit<BaseModifier, keyof _BoolModifier>;
export interface BorderImageSet {
  border_width?: number;
  bottom_end?: Sprite;
  bottom_left_corner?: Sprite;
  bottom_right_corner?: Sprite;
  bottom_t?: Sprite;
  cross?: Sprite;
  horizontal_line?: Sprite;
  left_end?: Sprite;
  left_t?: Sprite;
  right_end?: Sprite;
  right_t?: Sprite;
  scale?: number;
  top_end?: Sprite;
  top_left_coner?: Sprite;
  top_right_corner?: Sprite;
  top_t?: Sprite;
  vertical_line?: Sprite;
}
/** BoundingBoxes are typically centered around the position of an entity.

BoundingBoxes are usually specified with the short-hand notation of passing an array of exactly 2 or 3 items.

The first tuple item is left_top, the second tuple item is right_bottom. There is an unused third tuple item, a [float](prototype:float) that represents the orientation.

Positive x goes towards east, positive y goes towards south. This means that the upper-left point is the least dimension in x and y, and lower-right is the greatest. */
interface _BoundingBox {
  left_top: MapPosition;
  /** Unused. */
  orientation?: RealOrientation;
  right_bottom: MapPosition;
}
/** A cursor box, for use in [UtilitySprites](prototype:UtilitySprites). */
export interface BoxSpecification {
  /** Whether this is a complete box or just the top left corner. If this is true, `side_length` and `side_height` must be present. Otherwise `max_side_length` must be present. */
  is_whole_box?: boolean;
  /** Only loaded, and mandatory if `is_whole_box` is `false`. */
  max_side_length?: number;
  /** Only loaded, and mandatory if `is_whole_box` is `true`. */
  side_height?: number;
  /** Only loaded, and mandatory if `is_whole_box` is `true`. */
  side_length?: number;
  sprite: Sprite;
}
interface _BuildEntityByRobotTipTrigger {
  type: 'build-entity-by-robot';
}

export type BuildEntityByRobotTipTrigger = _BuildEntityByRobotTipTrigger &
  Omit<CountBasedTipTrigger, keyof _BuildEntityByRobotTipTrigger>;

export function isBuildEntityByRobotTipTrigger(
  value: unknown,
): value is BuildEntityByRobotTipTrigger {
  return (value as { type: string }).type === 'build-entity-by-robot';
}

export interface BuildEntityTechnologyTrigger {
  entity: EntityIDFilter;
  type: 'build-entity';
}

export function isBuildEntityTechnologyTrigger(
  value: unknown,
): value is BuildEntityTechnologyTrigger {
  return (value as { type: string }).type === 'build-entity';
}

interface _BuildEntityTipTrigger {
  build_by_dragging?: boolean;
  build_in_line?: boolean;
  /** Building is considered consecutive when the built entity is the same as the last built entity. */
  consecutive?: boolean;
  entity?: EntityID;
  linear_power_pole_line?: boolean;
  match_type_only?: boolean;
  quality?: QualityID;
  type: 'build-entity';
}

export type BuildEntityTipTrigger = _BuildEntityTipTrigger &
  Omit<CountBasedTipTrigger, keyof _BuildEntityTipTrigger>;

export function isBuildEntityTipTrigger(
  value: unknown,
): value is BuildEntityTipTrigger {
  return (value as { type: string }).type === 'build-entity';
}

interface _BulkInserterCapacityBonusModifier {
  /** If set to `false`, use the icon from [UtilitySprites](prototype:UtilitySprites) for this technology effect icon. */
  infer_icon?: boolean;
  type: 'bulk-inserter-capacity-bonus';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type BulkInserterCapacityBonusModifier =
  _BulkInserterCapacityBonusModifier &
    Omit<SimpleModifier, keyof _BulkInserterCapacityBonusModifier>;

export function isBulkInserterCapacityBonusModifier(
  value: unknown,
): value is BulkInserterCapacityBonusModifier {
  return (value as { type: string }).type === 'bulk-inserter-capacity-bonus';
}

interface _BurnerEnergySource {
  burner_usage?: BurnerUsageID;
  burnt_inventory_size?: ItemStackIndex;
  /** `1` means 100% effectivity. Must be greater than `0`. Multiplier of the energy output. */
  effectivity?: number;
  /** The energy source can be used with fuel from these [fuel categories](prototype:FuelCategory). */
  fuel_categories?: FuelCategoryID[];
  fuel_inventory_size: ItemStackIndex;
  light_flicker?: LightFlickeringDefinition;
  smoke?: SmokeSource[];
  type: 'burner';
}

export type BurnerEnergySource = _BurnerEnergySource &
  Omit<BaseEnergySource, keyof _BurnerEnergySource>;

export function isBurnerEnergySource(
  value: unknown,
): value is BurnerEnergySource {
  return (value as { type: string }).type === 'burner';
}

interface _ButtonStyleSpecification {
  clicked_font_color?: Color;
  clicked_vertical_offset?: number;
  default_font_color?: Color;
  disabled_font_color?: Color;
  draw_grayscale_picture?: boolean;
  draw_shadow_under_picture?: boolean;
  /** Name of a [FontPrototype](prototype:FontPrototype). */
  font?: string;
  hovered_font_color?: Color;
  icon_horizontal_align?: HorizontalAlign;
  invert_colors_of_picture_when_disabled?: boolean;
  invert_colors_of_picture_when_hovered_or_toggled?: boolean;
  pie_progress_color?: Color;
  selected_clicked_font_color?: Color;
  selected_font_color?: Color;
  selected_hovered_font_color?: Color;
  strikethrough_color?: Color;
  type: 'button_style';
}

export type ButtonStyleSpecification = _ButtonStyleSpecification &
  Omit<
    StyleWithClickableGraphicalSetSpecification,
    keyof _ButtonStyleSpecification
  >;

export function isButtonStyleSpecification(
  value: unknown,
): value is ButtonStyleSpecification {
  return (value as { type: string }).type === 'button_style';
}

interface _CameraEffectTriggerEffectItem {
  delay?: number;
  duration: number;
  ease_in_duration?: number;
  ease_out_duration?: number;
  full_strength_max_distance?: number;
  max_distance?: number;
  strength?: number;
  type: 'camera-effect';
}

export type CameraEffectTriggerEffectItem = _CameraEffectTriggerEffectItem &
  Omit<TriggerEffectItem, keyof _CameraEffectTriggerEffectItem>;

export function isCameraEffectTriggerEffectItem(
  value: unknown,
): value is CameraEffectTriggerEffectItem {
  return (value as { type: string }).type === 'camera-effect';
}

interface _CameraStyleSpecification {
  type: 'camera_style';
}

export type CameraStyleSpecification = _CameraStyleSpecification &
  Omit<EmptyWidgetStyleSpecification, keyof _CameraStyleSpecification>;

export function isCameraStyleSpecification(
  value: unknown,
): value is CameraStyleSpecification {
  return (value as { type: string }).type === 'camera_style';
}

export interface CaptureSpawnerTechnologyTrigger {
  entity?: EntityID;
  type: 'capture-spawner';
}

export function isCaptureSpawnerTechnologyTrigger(
  value: unknown,
): value is CaptureSpawnerTechnologyTrigger {
  return (value as { type: string }).type === 'capture-spawner';
}

export interface CargoBayConnectableGraphicsSet {
  animation?: Animation;
  animation_render_layer?: RenderLayer;
  connections?: CargoBayConnections;
  picture?: LayeredSprite;
}
/** Walls should have an even number of variations because they are interleaved. */
export interface CargoBayConnections {
  bottom_left_inner_corner?: LayeredSpriteVariations;
  bottom_left_outer_corner?: LayeredSpriteVariations;
  bottom_right_inner_corner?: LayeredSpriteVariations;
  bottom_right_outer_corner?: LayeredSpriteVariations;
  bottom_wall?: LayeredSpriteVariations;
  bridge_crossing?: LayeredSpriteVariations;
  bridge_horizontal_narrow?: LayeredSpriteVariations;
  bridge_horizontal_wide?: LayeredSpriteVariations;
  bridge_vertical_narrow?: LayeredSpriteVariations;
  bridge_vertical_wide?: LayeredSpriteVariations;
  left_wall?: LayeredSpriteVariations;
  right_wall?: LayeredSpriteVariations;
  top_left_inner_corner?: LayeredSpriteVariations;
  top_left_outer_corner?: LayeredSpriteVariations;
  top_right_inner_corner?: LayeredSpriteVariations;
  top_right_outer_corner?: LayeredSpriteVariations;
  top_wall?: LayeredSpriteVariations;
}
export interface CargoHatchDefinition {
  busy_timeout_ticks?: number;
  cargo_unit_entity_to_spawn?: EntityID;
  /** Cannot use `fade_ticks`. */
  closing_sound?: InterruptibleSound;
  /** render layer for objects entering the hatch. */
  entering_render_layer?: RenderLayer;
  hatch_graphics?: Animation;
  hatch_opening_ticks?: number;
  /** render layer for the hatch itself. */
  hatch_render_layer?: RenderLayer;
  /** [ProcessionGraphic](prototype:ProcessionGraphic) index pointing to the [ProcessionGraphicCatalogue](prototype:ProcessionGraphicCatalogue) inside the current [SpaceLocationPrototype](prototype:SpaceLocationPrototype). */
  illumination_graphic_index?: number;
  offset?: Vector;
  /** Cannot use `fade_ticks`. */
  opening_sound?: InterruptibleSound;
  pod_shadow_offset?: Vector;
  receiving_cargo_units?: EntityID[];
  /** y height relative to hatch position where the pod art gets clipped from sky to regular sorting layer. */
  sky_slice_height?: number;
  /** y height relative to hatch position where the pod art gets cut off. */
  slice_height?: number;
  /** y height relative to hatch position where the pod travels to during preparing and parking. */
  travel_height?: number;
}
interface _CargoLandingPadLimitModifier {
  type: 'cargo-landing-pad-count';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type CargoLandingPadLimitModifier = _CargoLandingPadLimitModifier &
  Omit<SimpleModifier, keyof _CargoLandingPadLimitModifier>;

export function isCargoLandingPadLimitModifier(
  value: unknown,
): value is CargoLandingPadLimitModifier {
  return (value as { type: string }).type === 'cargo-landing-pad-count';
}

/** A cargo station is any entity that has the capacity to send cargo units. In Space Age those are [RocketSiloPrototype](prototype:RocketSiloPrototype), [SpacePlatformHubPrototype](prototype:SpacePlatformHubPrototype) and [CargoLandingPadPrototype](prototype:CargoLandingPadPrototype). [Cargo bays](prototype:CargoBayPrototype) may provide additional cargo hatches to cargo stations which are cargo bay connectable. */
export interface CargoStationParameters {
  /** Big additional hatch that goes over the actual hatches. */
  giga_hatch_definitions?: GigaCargoHatchDefinition[];
  hatch_definitions?: CargoHatchDefinition[];
  /** Packed cargo units will wait for the full order to be completed. This is useful to save rockets in rocket silos when items trickle in slowly. The platform hub has immediate access to items so false is better to allow partial fulfillments. */
  prefer_packed_cargo_units?: boolean;
}
interface _ChainTriggerDelivery {
  chain: ActiveTriggerID;
  type: 'chain';
}

export type ChainTriggerDelivery = _ChainTriggerDelivery &
  Omit<TriggerDeliveryItem, keyof _ChainTriggerDelivery>;

export function isChainTriggerDelivery(
  value: unknown,
): value is ChainTriggerDelivery {
  return (value as { type: string }).type === 'chain';
}

interface _ChangeRecipeProductivityModifier {
  change: EffectValue;
  recipe: RecipeID;
  type: 'change-recipe-productivity';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type ChangeRecipeProductivityModifier =
  _ChangeRecipeProductivityModifier &
    Omit<BaseModifier, keyof _ChangeRecipeProductivityModifier>;

export function isChangeRecipeProductivityModifier(
  value: unknown,
): value is ChangeRecipeProductivityModifier {
  return (value as { type: string }).type === 'change-recipe-productivity';
}

interface _ChangeSurfaceTipTrigger {
  surface: string;
  type: 'change-surface';
}

export type ChangeSurfaceTipTrigger = _ChangeSurfaceTipTrigger &
  Omit<CountBasedTipTrigger, keyof _ChangeSurfaceTipTrigger>;

export function isChangeSurfaceTipTrigger(
  value: unknown,
): value is ChangeSurfaceTipTrigger {
  return (value as { type: string }).type === 'change-surface';
}

/** The data for one variation of [character animations](prototype:CharacterPrototype::animations). */
export interface CharacterArmorAnimation {
  /** The names of the armors this animation data is used for. Don't define this if you want the animations to be used for the player without armor. */
  armors?: ItemID[];
  /** Will be clamped to range [0, 1000]. When the character is flying, each [SmokeSource](prototype:SmokeSource) in `smoke_in_air` will generate `extra_smoke_cycles_per_tile` * [SmokeSource::frequency](prototype:SmokeSource::frequency) additional smokes per tile moved. */
  extra_smoke_cycles_per_tile?: number;
  /** flipped_shadow_running_with_gun must be nil or contain exactly 18 directions, so all of the combination of gun direction and moving direction can be covered. Some of these variations are used in reverse to save space. You can use the character animation in the base game for reference. `flipped_shadow_running_with_gun` has to have same frame count as `running_with_gun`. */
  flipped_shadow_running_with_gun?: RotatedAnimation;
  flying?: RotatedAnimation;
  /** Must contain exactly 18 or 40 directions, so all of the combination of gun direction and moving direction can be covered. Some of these variations are used in reverse to save space. You can use the character animation in the base game for reference. */
  flying_with_gun?: RotatedAnimation;
  idle?: RotatedAnimation;
  idle_in_air?: RotatedAnimation;
  idle_with_gun: RotatedAnimation;
  idle_with_gun_in_air?: RotatedAnimation;
  landing?: RotatedAnimation;
  mining_with_tool: RotatedAnimation;
  running?: RotatedAnimation;
  /** Must contain exactly 18 or 40 directions, so all of the combination of gun direction and moving direction can be covered. Some of these variations are used in reverse to save space. You can use the character animation in the base game for reference. */
  running_with_gun: RotatedAnimation;
  /** Will be clamped to range [0, 1000]. When the character is flying, each [SmokeSource](prototype:SmokeSource) in `smoke_in_air` will generate `smoke_cycles_per_tick` * [SmokeSource::frequency](prototype:SmokeSource::frequency) smokes per tick on average. */
  smoke_cycles_per_tick?: number;
  /** Smoke generator for when in air. */
  smoke_in_air?: SmokeSource[];
  take_off?: RotatedAnimation;
}
interface _CharacterBuildDistanceModifier {
  type: 'character-build-distance';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type CharacterBuildDistanceModifier = _CharacterBuildDistanceModifier &
  Omit<SimpleModifier, keyof _CharacterBuildDistanceModifier>;

export function isCharacterBuildDistanceModifier(
  value: unknown,
): value is CharacterBuildDistanceModifier {
  return (value as { type: string }).type === 'character-build-distance';
}

interface _CharacterCraftingSpeedModifier {
  type: 'character-crafting-speed';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type CharacterCraftingSpeedModifier = _CharacterCraftingSpeedModifier &
  Omit<SimpleModifier, keyof _CharacterCraftingSpeedModifier>;

export function isCharacterCraftingSpeedModifier(
  value: unknown,
): value is CharacterCraftingSpeedModifier {
  return (value as { type: string }).type === 'character-crafting-speed';
}

interface _CharacterHealthBonusModifier {
  type: 'character-health-bonus';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type CharacterHealthBonusModifier = _CharacterHealthBonusModifier &
  Omit<SimpleModifier, keyof _CharacterHealthBonusModifier>;

export function isCharacterHealthBonusModifier(
  value: unknown,
): value is CharacterHealthBonusModifier {
  return (value as { type: string }).type === 'character-health-bonus';
}

interface _CharacterInventorySlotsBonusModifier {
  type: 'character-inventory-slots-bonus';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type CharacterInventorySlotsBonusModifier =
  _CharacterInventorySlotsBonusModifier &
    Omit<SimpleModifier, keyof _CharacterInventorySlotsBonusModifier>;

export function isCharacterInventorySlotsBonusModifier(
  value: unknown,
): value is CharacterInventorySlotsBonusModifier {
  return (value as { type: string }).type === 'character-inventory-slots-bonus';
}

interface _CharacterItemDropDistanceModifier {
  type: 'character-item-drop-distance';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type CharacterItemDropDistanceModifier =
  _CharacterItemDropDistanceModifier &
    Omit<SimpleModifier, keyof _CharacterItemDropDistanceModifier>;

export function isCharacterItemDropDistanceModifier(
  value: unknown,
): value is CharacterItemDropDistanceModifier {
  return (value as { type: string }).type === 'character-item-drop-distance';
}

interface _CharacterItemPickupDistanceModifier {
  type: 'character-item-pickup-distance';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type CharacterItemPickupDistanceModifier =
  _CharacterItemPickupDistanceModifier &
    Omit<SimpleModifier, keyof _CharacterItemPickupDistanceModifier>;

export function isCharacterItemPickupDistanceModifier(
  value: unknown,
): value is CharacterItemPickupDistanceModifier {
  return (value as { type: string }).type === 'character-item-pickup-distance';
}

interface _CharacterLogisticRequestsModifier {
  type: 'character-logistic-requests';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type CharacterLogisticRequestsModifier =
  _CharacterLogisticRequestsModifier &
    Omit<BoolModifier, keyof _CharacterLogisticRequestsModifier>;

export function isCharacterLogisticRequestsModifier(
  value: unknown,
): value is CharacterLogisticRequestsModifier {
  return (value as { type: string }).type === 'character-logistic-requests';
}

interface _CharacterLogisticTrashSlotsModifier {
  type: 'character-logistic-trash-slots';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type CharacterLogisticTrashSlotsModifier =
  _CharacterLogisticTrashSlotsModifier &
    Omit<SimpleModifier, keyof _CharacterLogisticTrashSlotsModifier>;

export function isCharacterLogisticTrashSlotsModifier(
  value: unknown,
): value is CharacterLogisticTrashSlotsModifier {
  return (value as { type: string }).type === 'character-logistic-trash-slots';
}

interface _CharacterLootPickupDistanceModifier {
  type: 'character-loot-pickup-distance';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type CharacterLootPickupDistanceModifier =
  _CharacterLootPickupDistanceModifier &
    Omit<SimpleModifier, keyof _CharacterLootPickupDistanceModifier>;

export function isCharacterLootPickupDistanceModifier(
  value: unknown,
): value is CharacterLootPickupDistanceModifier {
  return (value as { type: string }).type === 'character-loot-pickup-distance';
}

interface _CharacterMiningSpeedModifier {
  type: 'character-mining-speed';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type CharacterMiningSpeedModifier = _CharacterMiningSpeedModifier &
  Omit<SimpleModifier, keyof _CharacterMiningSpeedModifier>;

export function isCharacterMiningSpeedModifier(
  value: unknown,
): value is CharacterMiningSpeedModifier {
  return (value as { type: string }).type === 'character-mining-speed';
}

interface _CharacterReachDistanceModifier {
  type: 'character-reach-distance';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type CharacterReachDistanceModifier = _CharacterReachDistanceModifier &
  Omit<SimpleModifier, keyof _CharacterReachDistanceModifier>;

export function isCharacterReachDistanceModifier(
  value: unknown,
): value is CharacterReachDistanceModifier {
  return (value as { type: string }).type === 'character-reach-distance';
}

interface _CharacterResourceReachDistanceModifier {
  type: 'character-resource-reach-distance';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type CharacterResourceReachDistanceModifier =
  _CharacterResourceReachDistanceModifier &
    Omit<SimpleModifier, keyof _CharacterResourceReachDistanceModifier>;

export function isCharacterResourceReachDistanceModifier(
  value: unknown,
): value is CharacterResourceReachDistanceModifier {
  return (
    (value as { type: string }).type === 'character-resource-reach-distance'
  );
}

interface _CharacterRunningSpeedModifier {
  type: 'character-running-speed';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type CharacterRunningSpeedModifier = _CharacterRunningSpeedModifier &
  Omit<SimpleModifier, keyof _CharacterRunningSpeedModifier>;

export function isCharacterRunningSpeedModifier(
  value: unknown,
): value is CharacterRunningSpeedModifier {
  return (value as { type: string }).type === 'character-running-speed';
}

export interface ChargableGraphics {
  charge_animation?: Animation;
  charge_animation_is_looped?: boolean;
  charge_cooldown?: number;
  charge_light?: LightDefinition;
  discharge_animation?: Animation;
  discharge_cooldown?: number;
  discharge_light?: LightDefinition;
  picture?: Sprite;
}
export interface ChartUtilityConstants {
  artillery_range_color: Color;
  blue_signal_color: Color;
  chart_construction_robot_color: Color;
  chart_deconstruct_tint: Color;
  chart_delivery_to_me_logistic_robot_color: Color;
  chart_logistic_robot_color: Color;
  chart_mobile_construction_robot_color: Color;
  chart_personal_construction_robot_color: Color;
  chart_player_circle_size: number;
  chart_train_stop_disabled_text_color: Color;
  chart_train_stop_full_text_color: Color;
  chart_train_stop_text_color: Color;
  circuit_network_member_color: Color;
  copper_wire_color: Color;
  custom_tag_max_scale?: number;
  custom_tag_scale?: number;
  custom_tag_selected_overlay_tint?: Color;
  /** The strings are entity types. */
  default_color_by_type?: Record<string, Color>;
  default_enemy_color: Color;
  default_enemy_territory_color: Color;
  default_friendly_color: Color;
  /** The strings are entity types. */
  default_friendly_color_by_type?: Record<string, Color>;
  disabled_switch_color: Color;
  electric_line_minimum_absolute_width: number;
  electric_line_width: number;
  electric_power_pole_color: Color;
  elevated_rail_color: Color;
  enabled_switch_color: Color;
  entity_ghost_color: Color;
  explosion_visualization_duration: number;
  green_signal_color: Color;
  green_wire_color: Color;
  rail_color: Color;
  rail_ramp_color: Color;
  red_signal_color: Color;
  red_wire_color: Color;
  resource_outline_selection_color: Color;
  tile_ghost_color: Color;
  train_current_path_outline_color: Color;
  train_path_color: Color;
  train_preview_path_outline_color: Color;
  turret_range_color: Color;
  vehicle_inner_color: Color;
  vehicle_outer_color: Color;
  vehicle_outer_color_selected: Color;
  vehicle_wagon_connection_color: Color;
  yellow_signal_color: Color;
  zoom_threshold_to_draw_spider_path: number;
}
interface _CheckBoxStyleSpecification {
  checkmark?: Sprite;
  disabled_checkmark?: Sprite;
  disabled_font_color?: Color;
  /** Name of a [FontPrototype](prototype:FontPrototype). */
  font?: string;
  font_color?: Color;
  intermediate_mark?: Sprite;
  text_padding?: number;
  type: 'checkbox_style';
}

export type CheckBoxStyleSpecification = _CheckBoxStyleSpecification &
  Omit<
    StyleWithClickableGraphicalSetSpecification,
    keyof _CheckBoxStyleSpecification
  >;

export function isCheckBoxStyleSpecification(
  value: unknown,
): value is CheckBoxStyleSpecification {
  return (value as { type: string }).type === 'checkbox_style';
}

/** Definition of a circuit connector. */
export interface CircuitConnectorDefinition {
  /** Defines how wires visually connect to this circuit connector. */
  points?: WireConnectionPoint;
  /** The pictures displayed for circuit connector. */
  sprites?: CircuitConnectorSprites;
}
export interface CircuitConnectorLayer {
  east?: RenderLayer;
  north?: RenderLayer;
  south?: RenderLayer;
  west?: RenderLayer;
}
export interface CircuitConnectorSecondaryDrawOrder {
  east?: number;
  north?: number;
  south?: number;
  west?: number;
}
export interface CircuitConnectorSprites {
  blue_led_light_offset?: Vector;
  /** Drawn when the entity is connected to a circuit network or a logistic network. */
  connector_main?: Sprite;
  /** Drawn when the entity is connected to a circuit network or a logistic network. */
  connector_shadow?: Sprite;
  led_blue: Sprite;
  led_blue_off?: Sprite;
  led_green: Sprite;
  led_light: LightDefinition;
  led_red: Sprite;
  red_green_led_light_offset?: Vector;
  /** Drawn when the entity is connected to a circuit network. */
  wire_pins?: Sprite;
  /** Drawn when the entity is connected to a circuit network. */
  wire_pins_shadow?: Sprite;
}
interface _CircuitNetworkModifier {
  type: 'unlock-circuit-network';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type CircuitNetworkModifier = _CircuitNetworkModifier &
  Omit<BoolModifier, keyof _CircuitNetworkModifier>;

export function isCircuitNetworkModifier(
  value: unknown,
): value is CircuitNetworkModifier {
  return (value as { type: string }).type === 'unlock-circuit-network';
}

export interface CircularParticleCreationSpecification {
  center?: Vector;
  creation_distance?: number;
  creation_distance_orientation?: number;
  direction?: number;
  direction_deviation?: number;
  height?: number;
  height_deviation?: number;
  name: ParticleID;
  speed?: number;
  speed_deviation?: number;
  starting_frame_speed: number;
  starting_frame_speed_deviation?: number;
  use_source_position?: boolean;
  vertical_speed?: number;
  vertical_speed_deviation?: number;
}
interface _ClearCursorTipTrigger {
  type: 'clear-cursor';
}

export type ClearCursorTipTrigger = _ClearCursorTipTrigger &
  Omit<CountBasedTipTrigger, keyof _ClearCursorTipTrigger>;

export function isClearCursorTipTrigger(
  value: unknown,
): value is ClearCursorTipTrigger {
  return (value as { type: string }).type === 'clear-cursor';
}

interface _CliffDeconstructionEnabledModifier {
  type: 'cliff-deconstruction-enabled';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type CliffDeconstructionEnabledModifier =
  _CliffDeconstructionEnabledModifier &
    Omit<BoolModifier, keyof _CliffDeconstructionEnabledModifier>;

export function isCliffDeconstructionEnabledModifier(
  value: unknown,
): value is CliffDeconstructionEnabledModifier {
  return (value as { type: string }).type === 'cliff-deconstruction-enabled';
}

export interface CliffPlacementSettings {
  /** Elevation at which the first row of cliffs is placed. Can not be set from the map generation GUI. */
  cliff_elevation_0?: number;
  /** Elevation difference between successive rows of cliffs. This is inversely proportional to 'frequency' in the map generation GUI. Specifically, when set from the GUI the value is `40 / frequency`. */
  cliff_elevation_interval?: number;
  /** Smoothing makes cliffs straighter on rough elevation but makes placement inaccurate. 0 is no smoothing, 1 is full smoothing. Values outside of 0-1 are possible for specific effects but not recommended. */
  cliff_smoothing?: number;
  /** Name of the [AutoplaceControl](prototype:AutoplaceControl). */
  control?: AutoplaceControlID;
  /** Name of the [CliffPrototype](prototype:CliffPrototype). */
  name?: EntityID;
  /** Corresponds to 'continuity' in the GUI. This value is not used directly, but is used by the 'cliffiness' noise expression, which in combination with elevation and the two cliff elevation properties drives cliff placement (cliffs are placed when elevation crosses the elevation contours defined by `cliff_elevation_0` and `cliff_elevation_interval` when 'cliffiness' is greater than `0.5`). The default 'cliffiness' expression interprets this value such that larger values result in longer unbroken walls of cliffs, and smaller values (between `0` and `1`) result in larger gaps in cliff walls. */
  richness?: number;
}
export interface CloudsEffectProperties {
  additional_density_sample: CloudsTextureCoordinateTransformation;
  density?: number;
  density_at_night?: number;
  detail_exponent?: number;
  detail_factor?: number;
  detail_factor_at_night?: number;
  detail_noise_texture: EffectTexture;
  detail_sample_1: CloudsTextureCoordinateTransformation;
  detail_sample_2: CloudsTextureCoordinateTransformation;
  /** When set to 0, detail textures are not being "morphed" to each other, but lerped with ratio 0.5 instead. */
  detail_sample_morph_duration?: number;
  movement_speed_multiplier?: number;
  opacity?: number;
  opacity_at_night?: number;
  scale?: number;
  shape_factor?: number;
  shape_noise_texture: EffectTexture;
  shape_warp_strength?: number;
  shape_warp_weight?: number;
  warp_sample_1: CloudsTextureCoordinateTransformation;
  warp_sample_2: CloudsTextureCoordinateTransformation;
  warped_shape_sample: CloudsTextureCoordinateTransformation;
}
export interface CloudsTextureCoordinateTransformation {
  scale: number;
  wind_speed_factor?: number;
}
interface _ClusterTriggerItem {
  /** Must be at least `2`. */
  cluster_count: number;
  distance: number;
  distance_deviation?: number;
  type: 'cluster';
}

export type ClusterTriggerItem = _ClusterTriggerItem &
  Omit<TriggerItem, keyof _ClusterTriggerItem>;

export function isClusterTriggerItem(
  value: unknown,
): value is ClusterTriggerItem {
  return (value as { type: string }).type === 'cluster';
}

/** The base game provides common collision mask functions in a Lua file in the core [lualib](https://github.com/wube/factorio-data/blob/master/core/lualib/collision-mask-util.lua). */
export interface CollisionMaskConnector {
  /** Any prototype with this collision option will only be checked for collision with other prototype's collision masks if they are a tile. */
  colliding_with_tiles_only?: boolean;
  /** Uses the prototypes position rather than its collision box when doing collision checks with tile prototypes. Allows the prototype to overlap colliding tiles up until its center point. This is only respected for character movement and cars driven by players. */
  consider_tile_transitions?: boolean;
  /** Every key in the dictionary is the name of one [layer](prototype:CollisionLayerPrototype) the object collides with. The value is meaningless and always `true`. An empty table means that no layers are set. */
  layers: Record<CollisionLayerID, true>;
  /** Any two entities that both have this option enabled on their prototype and have an identical collision mask layers list will not collide. Other collision mask options are not included in the identical layer list check. This does mean that two different prototypes with the same collision mask layers and this option enabled will not collide. */
  not_colliding_with_itself?: boolean;
}
/** Table of red, green, blue, and alpha float values between 0 and 1. Alternatively, values can be from 0-255, they are interpreted as such if at least one value is `> 1`.

Color allows the short-hand notation of passing an array of exactly 3 or 4 numbers. The array items are r, g, b and optionally a, in that order.

The game usually expects colors to be in pre-multiplied form (color channels are pre-multiplied by alpha). */
interface _Color {
  /** alpha value (opacity) */
  a?: number;
  /** blue value */
  b?: number;
  /** green value */
  g?: number;
  /** red value */
  r?: number;
}
export interface ColorFilterData {
  localised_name: LocalisedString;
  /** 4 arrays of 4-length float arrays, essentially a 4x4 matrix. */
  matrix: number[][];
  name: string;
}
export interface ColorHintSpecification {
  text?: string;
  text_color?: Color;
}
export interface ColumnAlignment {
  alignment:
    | 'center'
    | 'left'
    | 'right'
    | 'top-left'
    | 'middle-left'
    | 'bottom-left'
    | 'top-center'
    | 'middle-center'
    | 'bottom-center'
    | 'top-right'
    | 'middle-right'
    | 'bottom-right';
  /** Column index. */
  column: number;
}
interface _ColumnWidth {
  /** Column index. */
  column: number;
}

export type ColumnWidth = _ColumnWidth &
  Omit<ColumnWidthItem, keyof _ColumnWidth>;
export interface ColumnWidthItem {
  maximal_width?: number;
  minimal_width?: number;
  /** Sets `minimal_width` and `maximal_width` to the same value. */
  width?: number;
}
/** Graphics for the heat pipe. */
export interface ConnectableEntityGraphics {
  corner_left_down: SpriteVariations;
  corner_left_up: SpriteVariations;
  corner_right_down: SpriteVariations;
  corner_right_up: SpriteVariations;
  cross: SpriteVariations;
  ending_down: SpriteVariations;
  ending_left: SpriteVariations;
  ending_right: SpriteVariations;
  ending_up: SpriteVariations;
  single: SpriteVariations;
  straight_horizontal: SpriteVariations;
  straight_vertical: SpriteVariations;
  t_down: SpriteVariations;
  t_left: SpriteVariations;
  t_right: SpriteVariations;
  t_up: SpriteVariations;
}
interface _ControlPoint {
  control: number;
  /** Has to be in range (0.0, 100.0). */
  volume_percentage: number;
}
export interface CountBasedTipTrigger {
  count?: number;
}
/** Clips the CoverGraphicProcessionLayer. */
export interface CoverGraphicEffectData {
  /** How much the pod's distance traveled moves the effect */
  distance_traveled_strength?: Vector;
  /** How much the pod's position moves the effect */
  pod_movement_strength?: Vector;
  /** Where the effect mask is centered. */
  relative_to?: EffectRelativeTo;
  style?: CloudEffectStyle;
}
/** Draws a layer of cloud texture covering the screen. It can fade in an out based on opacity and using the picture mask as gradient of areas which fade in soon or later.

There are two important concepts to understand:

- `mask` refers to something like a depth texture. It is applied across the whole screen and determines how the entire graphic fades in and out.

- `effect` in this context refers to clipping out portion of the cover graphic. It can use an effect_graphic. `is_cloud_effect_advanced` makes the `effect` modify opacity threshold of the `mask` rather than multiplying alpha.

Additionally an area can be masked out by range or effect mask. */
export interface CoverGraphicProcessionLayer {
  /** Clips the graphic. */
  alt_effect?: CoverGraphicEffectData;
  /** How much the pod's distance traveled moves the cloud coordinates */
  distance_traveled_strength?: Vector;
  /** Clips the graphic. */
  effect?: CoverGraphicEffectData;
  /** Used by certain effects. */
  effect_graphic?: ProcessionGraphic;
  /** Default values if unspecified:

- opacity : 1.0

- rotation : 0.0

- effect_scale_min : 0.0

- effect_scale_max : 1.0

- effect_shift : {0, 0}

- alt_effect_scale_min : 0.0

- alt_effect_scale_max : 1.0

- alt_effect_shift : {0, 0}

- offset : {0, 0} */
  frames: CoverGraphicProcessionLayerBezierControlPoint[];
  /** Main texture of the layer. */
  graphic?: ProcessionGraphic;
  /** Adds the final position value from given layer to this one. */
  inherit_from?: ProcessionLayerInheritanceGroupID;
  /** Advanced cloud effect mask modifies the regular mask thresholds instead of being a flat multiplication of the resulting opacity. */
  is_cloud_effect_advanced?: boolean;
  /** The texture and mask are interpreted as four smaller textures that are randomly tiled. */
  is_quad_texture?: boolean;
  /** Opacity gradient of the layer. */
  mask_graphic?: ProcessionGraphic;
  /** How much the pod's position moves the cloud coordinates */
  pod_movement_strength?: Vector;
  /** The group this layer belongs to, for inheritance. */
  reference_group?: ProcessionLayerInheritanceGroupID;
  render_layer?: RenderLayer;
  /** Add rotation of the pod to the cloud rotation. */
  rotate_with_pod?: boolean;
  secondary_draw_order?: number;
  /** Where the tiled texture is centered and rotated. */
  texture_relative_to?: EffectRelativeTo;
  type: 'cover-graphic';
  /** Size the textures are scaled to in the world. */
  world_size?: Vector;
}

export function isCoverGraphicProcessionLayer(
  value: unknown,
): value is CoverGraphicProcessionLayer {
  return (value as { type: string }).type === 'cover-graphic';
}

/** One frame in time for a Bezier interpolation. */
export interface CoverGraphicProcessionLayerBezierControlPoint {
  /** `alt_effect_scale_max` and `alt_effect_scale_max_t` interpolate a double smoothly over time. */
  alt_effect_scale_max?: number;
  /** Bidirectional tangent at the given timestamp. */
  alt_effect_scale_max_t?: number;
  /** `alt_effect_scale_min` and `alt_effect_scale_min_t` interpolate a double smoothly over time. */
  alt_effect_scale_min?: number;
  /** Bidirectional tangent at the given timestamp. */
  alt_effect_scale_min_t?: number;
  /** `alt_effect_shift` and `alt_effect_shift_t` interpolate a vector smoothly over time using `alt_effect_shift_rate` and `alt_effect_shift_rate_t` for a 0-1 rate curve.

Vector value. */
  alt_effect_shift?: Vector;
  /** Rate 0-1 value. */
  alt_effect_shift_rate?: number;
  /** Rate tangent. */
  alt_effect_shift_rate_t?: number;
  /** Vector tangent. */
  alt_effect_shift_t?: Vector;
  /** `effect_scale_max` and `effect_scale_max_t` interpolate a double smoothly over time. */
  effect_scale_max?: number;
  /** Bidirectional tangent at the given timestamp. */
  effect_scale_max_t?: number;
  /** `effect_scale_min` and `effect_scale_min_t` interpolate a double smoothly over time. */
  effect_scale_min?: number;
  /** Bidirectional tangent at the given timestamp. */
  effect_scale_min_t?: number;
  /** `effect_shift` and `effect_shift_t` interpolate a vector smoothly over time using `effect_shift_rate` and `effect_shift_rate_t` for a 0-1 rate curve.

Vector value. */
  effect_shift?: Vector;
  /** Rate 0-1 value. */
  effect_shift_rate?: number;
  /** Rate tangent. */
  effect_shift_rate_t?: number;
  /** Vector tangent. */
  effect_shift_t?: Vector;
  /** `offset` and `offset_t` interpolate a vector smoothly over time using `offset_rate` and `offset_rate_t` for a 0-1 rate curve.

Vector value. */
  offset?: Vector;
  /** Rate 0-1 value. */
  offset_rate?: number;
  /** Rate tangent. */
  offset_rate_t?: number;
  /** Vector tangent. */
  offset_t?: Vector;
  /** `opacity` and `opacity_t` interpolate a double smoothly over time. */
  opacity?: number;
  /** Bidirectional tangent at the given timestamp. */
  opacity_t?: number;
  /** `rotation` and `rotation_t` interpolate a double smoothly over time. */
  rotation?: number;
  /** Bidirectional tangent at the given timestamp. */
  rotation_t?: number;
  /** Mandatory if `opacity` or `rotation` or `effect_scale_min` or `effect_scale_max` is defined. */
  timestamp?: MapTick;
}
export interface CraftFluidTechnologyTrigger {
  amount?: number;
  fluid: FluidID;
  type: 'craft-fluid';
}

export function isCraftFluidTechnologyTrigger(
  value: unknown,
): value is CraftFluidTechnologyTrigger {
  return (value as { type: string }).type === 'craft-fluid';
}

export interface CraftItemTechnologyTrigger {
  count?: ItemCountType;
  item: ItemID;
  item_quality?: QualityID;
  type: 'craft-item';
}

export function isCraftItemTechnologyTrigger(
  value: unknown,
): value is CraftItemTechnologyTrigger {
  return (value as { type: string }).type === 'craft-item';
}

interface _CraftItemTipTrigger {
  /** Can only be used when `event_type` is `"crafting-finished"`. */
  consecutive?: boolean;
  event_type:
    | 'crafting-of-single-item-ordered'
    | 'crafting-of-multiple-items-ordered'
    | 'crafting-finished';
  item?: ItemID;
  type: 'craft-item';
}

export type CraftItemTipTrigger = _CraftItemTipTrigger &
  Omit<CountBasedTipTrigger, keyof _CraftItemTipTrigger>;

export function isCraftItemTipTrigger(
  value: unknown,
): value is CraftItemTipTrigger {
  return (value as { type: string }).type === 'craft-item';
}

interface _CraftingMachineGraphicsSet {
  animation_progress?: number;
  /** Render layer(s) for all directions of the circuit connectors. */
  circuit_connector_layer?: RenderLayer | CircuitConnectorLayer;
  /** Secondary draw order(s) for all directions of the circuit connectors. */
  circuit_connector_secondary_draw_order?:
    | number
    | CircuitConnectorSecondaryDrawOrder;
  frozen_patch?: Sprite4Way;
  reset_animation_when_frozen?: boolean;
}

export type CraftingMachineGraphicsSet = _CraftingMachineGraphicsSet &
  Omit<WorkingVisualisations, keyof _CraftingMachineGraphicsSet>;
export interface CranePart {
  allow_sprite_rotation?: boolean;
  dying_effect?: CranePartDyingEffect;
  extendable_length?: Vector3D;
  extendable_length_grappler?: Vector3D;
  is_contractible_by_cropping?: boolean;
  layer?: number;
  name?: string;
  /** Angle in radian, which is internally converted to a [RealOrientation](prototype:RealOrientation). */
  orientation_shift?: number;
  relative_position?: Vector3D;
  relative_position_grappler?: Vector3D;
  /** Only loaded if `sprite` is not defined. */
  rotated_sprite?: RotatedSprite;
  /** Only loaded if `sprite_reflection` is not defined. */
  rotated_sprite_reflection?: RotatedSprite;
  /** Only loaded if `sprite_shadow` is not defined. */
  rotated_sprite_shadow?: RotatedSprite;
  scale_to_fit_model?: boolean;
  should_scale_for_perspective?: boolean;
  snap_end?: number;
  snap_end_arm_extent_multiplier?: number;
  snap_start?: number;
  sprite?: Sprite;
  sprite_reflection?: Sprite;
  sprite_shadow?: Sprite;
  static_length?: Vector3D;
  static_length_grappler?: Vector3D;
}
export interface CranePartDyingEffect {
  explosion?: ExplosionDefinition;
  explosion_linear_distance_step?: number;
  particle_effect_linear_distance_step?: number;
  particle_effects?: CreateParticleTriggerEffectItem[];
}
export interface CraterPlacementDefinition {
  minimum_segments_to_place?: number;
  segment_probability?: number;
  segments: CraterSegment[];
}
export interface CraterSegment {
  offset: Vector;
  orientation: number;
}
interface _CreateAsteroidChunkEffectItem {
  asteroid_name: AsteroidChunkID;
  offset_deviation?: BoundingBox;
  offsets?: Vector[];
  type: 'create-asteroid-chunk';
}

export type CreateAsteroidChunkEffectItem = _CreateAsteroidChunkEffectItem &
  Omit<TriggerEffectItem, keyof _CreateAsteroidChunkEffectItem>;

export function isCreateAsteroidChunkEffectItem(
  value: unknown,
): value is CreateAsteroidChunkEffectItem {
  return (value as { type: string }).type === 'create-asteroid-chunk';
}

interface _CreateDecorativesTriggerEffectItem {
  apply_projection?: boolean;
  decorative: DecorativeID;
  radius_curve?: number;
  spawn_max: number;
  /** Must be less than 24. */
  spawn_max_radius: number;
  spawn_min?: number;
  spawn_min_radius: number;
  spread_evenly?: boolean;
  type: 'create-decorative';
}

export type CreateDecorativesTriggerEffectItem =
  _CreateDecorativesTriggerEffectItem &
    Omit<TriggerEffectItem, keyof _CreateDecorativesTriggerEffectItem>;

export function isCreateDecorativesTriggerEffectItem(
  value: unknown,
): value is CreateDecorativesTriggerEffectItem {
  return (value as { type: string }).type === 'create-decorative';
}

interface _CreateEntityTriggerEffectItem {
  /** If true, creates the entity as a member of the enemy force. If the surface.no_enemies_mode is true, the entity will not be created. */
  as_enemy?: boolean;
  check_buildability?: boolean;
  /** The name of the entity that should be created. */
  entity_name: EntityID;
  find_non_colliding_position?: boolean;
  /** If true and `as_enemy` is true, allows the entity to be created even if the current surface.no_enemies_mode is true. */
  ignore_no_enemies_mode?: boolean;
  /** Only loaded if `find_non_colliding_position` is defined. */
  non_colliding_fail_result?: Trigger;
  non_colliding_search_precision?: number;
  non_colliding_search_radius?: number;
  offset_deviation?: BoundingBox;
  /** If multiple offsets are specified, multiple entities are created. The projectile of the [Distractor capsule](https://wiki.factorio.com/Distractor_capsule) uses this property to spawn three Distractors. */
  offsets?: Vector[];
  /** The result entity will be protected from automated attacks of enemies. */
  protected?: boolean;
  show_in_tooltip?: boolean;
  /** Entity creation will not occur if any tile matches the collision condition. Defaults to no collisions. */
  tile_collision_mask?: CollisionMaskConnector;
  /** If `true`, the [on_trigger_created_entity](runtime:on_trigger_created_entity) event will be raised. */
  trigger_created_entity?: boolean;
  type: 'create-entity';
}

export type CreateEntityTriggerEffectItem = _CreateEntityTriggerEffectItem &
  Omit<TriggerEffectItem, keyof _CreateEntityTriggerEffectItem>;

export function isCreateEntityTriggerEffectItem(
  value: unknown,
): value is CreateEntityTriggerEffectItem {
  return (value as { type: string }).type === 'create-entity';
}

interface _CreateExplosionTriggerEffectItem {
  cycle_while_moving?: boolean;
  inherit_movement_distance_from_projectile?: boolean;
  max_movement_distance?: number;
  max_movement_distance_deviation?: number;
  type: 'create-explosion';
}

export type CreateExplosionTriggerEffectItem =
  _CreateExplosionTriggerEffectItem &
    Omit<
      CreateEntityTriggerEffectItem,
      keyof _CreateExplosionTriggerEffectItem
    >;

export function isCreateExplosionTriggerEffectItem(
  value: unknown,
): value is CreateExplosionTriggerEffectItem {
  return (value as { type: string }).type === 'create-explosion';
}

interface _CreateFireTriggerEffectItem {
  initial_ground_flame_count?: number;
  type: 'create-fire';
}

export type CreateFireTriggerEffectItem = _CreateFireTriggerEffectItem &
  Omit<CreateEntityTriggerEffectItem, keyof _CreateFireTriggerEffectItem>;

export function isCreateFireTriggerEffectItem(
  value: unknown,
): value is CreateFireTriggerEffectItem {
  return (value as { type: string }).type === 'create-fire';
}

interface _CreateGhostOnEntityDeathModifier {
  type: 'create-ghost-on-entity-death';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type CreateGhostOnEntityDeathModifier =
  _CreateGhostOnEntityDeathModifier &
    Omit<BoolModifier, keyof _CreateGhostOnEntityDeathModifier>;

export function isCreateGhostOnEntityDeathModifier(
  value: unknown,
): value is CreateGhostOnEntityDeathModifier {
  return (value as { type: string }).type === 'create-ghost-on-entity-death';
}

interface _CreateParticleTriggerEffectItem {
  apply_tile_tint?: 'primary' | 'secondary';
  frame_speed?: number;
  frame_speed_deviation?: number;
  initial_height: number;
  initial_height_deviation?: number;
  initial_vertical_speed?: number;
  initial_vertical_speed_deviation?: number;
  movement_multiplier?: number;
  offset_deviation?: SimpleBoundingBox;
  offsets?: Vector[];
  /** Create particles only when they are in 200 tiles range of any connected player. */
  only_when_visible?: boolean;
  particle_name: ParticleID;
  rotate_offsets?: boolean;
  show_in_tooltip?: boolean;
  speed_from_center?: number;
  speed_from_center_deviation?: number;
  /** Silently capped to a maximum of 100. */
  tail_length?: number;
  /** Silently capped to a maximum of 100. */
  tail_length_deviation?: number;
  tail_width?: number;
  tile_collision_mask?: CollisionMaskConnector;
  /** Only loaded if `apply_tile_tint` is not defined. */
  tint?: Color;
  type: 'create-particle';
}

export type CreateParticleTriggerEffectItem = _CreateParticleTriggerEffectItem &
  Omit<TriggerEffectItem, keyof _CreateParticleTriggerEffectItem>;

export function isCreateParticleTriggerEffectItem(
  value: unknown,
): value is CreateParticleTriggerEffectItem {
  return (value as { type: string }).type === 'create-particle';
}

interface _CreateSmokeTriggerEffectItem {
  initial_height?: number;
  speed?: Vector;
  speed_from_center?: number;
  speed_from_center_deviation?: number;
  speed_multiplier?: number;
  speed_multiplier_deviation?: number;
  starting_frame?: number;
  starting_frame_deviation?: number;
  type: 'create-smoke';
}

export type CreateSmokeTriggerEffectItem = _CreateSmokeTriggerEffectItem &
  Omit<CreateEntityTriggerEffectItem, keyof _CreateSmokeTriggerEffectItem>;

export function isCreateSmokeTriggerEffectItem(
  value: unknown,
): value is CreateSmokeTriggerEffectItem {
  return (value as { type: string }).type === 'create-smoke';
}

export interface CreateSpacePlatformTechnologyTrigger {
  type: 'create-space-platform';
}

export function isCreateSpacePlatformTechnologyTrigger(
  value: unknown,
): value is CreateSpacePlatformTechnologyTrigger {
  return (value as { type: string }).type === 'create-space-platform';
}

interface _CreateStickerTriggerEffectItem {
  show_in_tooltip?: boolean;
  /** Name of a [StickerPrototype](prototype:StickerPrototype) that should be created. */
  sticker: EntityID;
  /** If `true`, [on_trigger_created_entity](runtime:on_trigger_created_entity) will be triggered when the sticker is created. */
  trigger_created_entity?: boolean;
  type: 'create-sticker';
}

export type CreateStickerTriggerEffectItem = _CreateStickerTriggerEffectItem &
  Omit<TriggerEffectItem, keyof _CreateStickerTriggerEffectItem>;

export function isCreateStickerTriggerEffectItem(
  value: unknown,
): value is CreateStickerTriggerEffectItem {
  return (value as { type: string }).type === 'create-sticker';
}

interface _CreateTrivialSmokeEffectItem {
  initial_height?: number;
  max_radius?: number;
  offset_deviation?: BoundingBox;
  offsets?: Vector[];
  smoke_name: TrivialSmokeID;
  speed?: Vector;
  speed_from_center?: number;
  speed_from_center_deviation?: number;
  speed_multiplier?: number;
  speed_multiplier_deviation?: number;
  starting_frame?: number;
  starting_frame_deviation?: number;
  type: 'create-trivial-smoke';
}

export type CreateTrivialSmokeEffectItem = _CreateTrivialSmokeEffectItem &
  Omit<TriggerEffectItem, keyof _CreateTrivialSmokeEffectItem>;

export function isCreateTrivialSmokeEffectItem(
  value: unknown,
): value is CreateTrivialSmokeEffectItem {
  return (value as { type: string }).type === 'create-trivial-smoke';
}

export interface CursorBoxSpecification {
  blueprint_snap_rectangle: BoxSpecification[];
  copy: BoxSpecification[];
  electricity: BoxSpecification[];
  logistics: BoxSpecification[];
  multiplayer_selection: BoxSpecification[];
  not_allowed: BoxSpecification[];
  pair: BoxSpecification[];
  regular: BoxSpecification[];
  rts_selected: BoxSpecification[];
  rts_to_be_selected: BoxSpecification[];
  train_visualization: BoxSpecification[];
}
/** Used by [BaseAttackParameters](prototype:BaseAttackParameters) to play a sound during the attack. */
export interface CyclicSound {
  /** Played once at the beginning of the overall cyclic sound. */
  begin_sound?: Sound;
  /** Played once when the overall cyclic sound is requested to end. */
  end_sound?: Sound;
  /** Played repeatedly after the begin_sound was played. */
  middle_sound?: Sound;
}
/** Used to specify what type of damage and how much damage something deals. */
export interface DamageParameters {
  amount: number;
  /** The type of damage. See [here](https://wiki.factorio.com/Data.raw#damage-type) for a list of built-in types, and [DamageType](prototype:DamageType) for creating custom types. */
  type: DamageTypeID;
}
interface _DamageTriggerEffectItem {
  apply_damage_to_trees?: boolean;
  damage: DamageParameters;
  lower_damage_modifier?: number;
  lower_distance_threshold?: number;
  type: 'damage';
  upper_damage_modifier?: number;
  upper_distance_threshold?: number;
  use_substitute?: boolean;
  /** If `true`, no corpse for killed entities will be created. */
  vaporize?: boolean;
}

export type DamageTriggerEffectItem = _DamageTriggerEffectItem &
  Omit<TriggerEffectItem, keyof _DamageTriggerEffectItem>;

export function isDamageTriggerEffectItem(
  value: unknown,
): value is DamageTriggerEffectItem {
  return (value as { type: string }).type === 'damage';
}

interface _DamageTypeFilters {
  /** The damage types to filter for. */
  types: DamageTypeID | DamageTypeID[];
  /** Whether this is a whitelist or a blacklist of damage types. Defaults to being a blacklist. */
  whitelist?: boolean;
}
/** The data table is read by the game to load all prototypes.

At the end of the prototype stage, the data table is loaded by the game engine and the format of the prototypes is validated. Any extra properties are ignored. See [Data Lifecycle](runtime:data-lifecycle) for more information.

The data table and its properties are defined in Lua, so their source code can be viewed in [dataloader.lua](https://github.com/wube/factorio-data/blob/master/core/lualib/dataloader.lua). */
export interface Data {
  /** The primary way to add prototypes to the data table. */
  extend: () => void;
  /** Set by the game based on whether the demo or retail version is running. Should not be used by mods. */
  is_demo: boolean;
  /** A dictionary of prototype types to values that themselves are dictionaries of prototype names to specific prototypes.

This means that individual prototypes can be accessed with `local prototype = data.raw["prototype-type"]["internal-name"]`. */
  raw: Record<string, Record<string, AnyPrototype>>;
}
interface _DeconstructionTimeToLiveModifier {
  type: 'deconstruction-time-to-live';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type DeconstructionTimeToLiveModifier =
  _DeconstructionTimeToLiveModifier &
    Omit<SimpleModifier, keyof _DeconstructionTimeToLiveModifier>;

export function isDeconstructionTimeToLiveModifier(
  value: unknown,
): value is DeconstructionTimeToLiveModifier {
  return (value as { type: string }).type === 'deconstruction-time-to-live';
}

interface _DelayedTriggerDelivery {
  delayed_trigger: ActiveTriggerID;
  type: 'delayed';
}

export type DelayedTriggerDelivery = _DelayedTriggerDelivery &
  Omit<TriggerDeliveryItem, keyof _DelayedTriggerDelivery>;

export function isDelayedTriggerDelivery(
  value: unknown,
): value is DelayedTriggerDelivery {
  return (value as { type: string }).type === 'delayed';
}

/** This trigger is considered fulfilled when the [TipsAndTricksItem::dependencies](prototype:TipsAndTricksItem::dependencies) are fulfilled. */
export interface DependenciesMetTipTrigger {
  type: 'dependencies-met';
}

export function isDependenciesMetTipTrigger(
  value: unknown,
): value is DependenciesMetTipTrigger {
  return (value as { type: string }).type === 'dependencies-met';
}

export interface DestroyCliffsCapsuleAction {
  attack_parameters: AttackParameters;
  play_sound_on_failure?: boolean;
  radius: number;
  timeout?: number;
  type: 'destroy-cliffs';
  /** Whether using the capsule consumes an item from the stack. */
  uses_stack?: boolean;
}

export function isDestroyCliffsCapsuleAction(
  value: unknown,
): value is DestroyCliffsCapsuleAction {
  return (value as { type: string }).type === 'destroy-cliffs';
}

interface _DestroyCliffsTriggerEffectItem {
  /** Entity created at cliff location when a cliff is destroyed. */
  explosion_at_cliff?: EntityID;
  /** Entity created at trigger location every time trigger executes. */
  explosion_at_trigger?: EntityID;
  radius: number;
  type: 'destroy-cliffs';
}

export type DestroyCliffsTriggerEffectItem = _DestroyCliffsTriggerEffectItem &
  Omit<TriggerEffectItem, keyof _DestroyCliffsTriggerEffectItem>;

export function isDestroyCliffsTriggerEffectItem(
  value: unknown,
): value is DestroyCliffsTriggerEffectItem {
  return (value as { type: string }).type === 'destroy-cliffs';
}

interface _DestroyDecorativesTriggerEffectItem {
  /** If `true`, only decoratives with a [DecorativePrototype::trigger_effect](prototype:DecorativePrototype::trigger_effect) will be destroyed. */
  decoratives_with_trigger_only?: boolean;
  from_render_layer?: RenderLayer;
  include_decals?: boolean;
  /** Soft decoratives are those where [DecorativePrototype::grows_through_rail_path](prototype:DecorativePrototype::grows_through_rail_path) is `true`. */
  include_soft_decoratives?: boolean;
  invoke_decorative_trigger?: boolean;
  radius: number;
  to_render_layer?: RenderLayer;
  type: 'destroy-decoratives';
}

export type DestroyDecorativesTriggerEffectItem =
  _DestroyDecorativesTriggerEffectItem &
    Omit<TriggerEffectItem, keyof _DestroyDecorativesTriggerEffectItem>;

export function isDestroyDecorativesTriggerEffectItem(
  value: unknown,
): value is DestroyDecorativesTriggerEffectItem {
  return (value as { type: string }).type === 'destroy-decoratives';
}

export interface DifficultySettings {
  /** Must be >= 0.01 and <= 100. */
  spoil_time_modifier?: number;
  /** Must be >= 0.001 and <= 1000. */
  technology_price_multiplier?: number;
}
interface _DirectTriggerItem {
  filter_enabled?: boolean;
  type: 'direct';
}

export type DirectTriggerItem = _DirectTriggerItem &
  Omit<TriggerItem, keyof _DirectTriggerItem>;

export function isDirectTriggerItem(
  value: unknown,
): value is DirectTriggerItem {
  return (value as { type: string }).type === 'direct';
}

export interface DirectionShift {
  east?: Vector;
  north?: Vector;
  south?: Vector;
  west?: Vector;
}
interface _DoubleSliderStyleSpecification {
  type: 'double_slider_style';
}

export type DoubleSliderStyleSpecification = _DoubleSliderStyleSpecification &
  Omit<SliderStyleSpecification, keyof _DoubleSliderStyleSpecification>;

export function isDoubleSliderStyleSpecification(
  value: unknown,
): value is DoubleSliderStyleSpecification {
  return (value as { type: string }).type === 'double_slider_style';
}

interface _DropDownStyleSpecification {
  button_style?: ButtonStyleSpecification;
  icon?: Sprite;
  list_box_style?: ListBoxStyleSpecification;
  opened_sound?: Sound;
  selector_and_title_spacing?: number;
  type: 'dropdown_style';
}

export type DropDownStyleSpecification = _DropDownStyleSpecification &
  Omit<BaseStyleSpecification, keyof _DropDownStyleSpecification>;

export function isDropDownStyleSpecification(
  value: unknown,
): value is DropDownStyleSpecification {
  return (value as { type: string }).type === 'dropdown_style';
}

interface _DropItemTipTrigger {
  drop_into_entity?: boolean;
  type: 'drop-item';
}

export type DropItemTipTrigger = _DropItemTipTrigger &
  Omit<CountBasedTipTrigger, keyof _DropItemTipTrigger>;

export function isDropItemTipTrigger(
  value: unknown,
): value is DropItemTipTrigger {
  return (value as { type: string }).type === 'drop-item';
}

/** When applied to [modules](prototype:ModulePrototype), the resulting effect is a sum of all module effects, multiplied through calculations: `(1 + sum module effects)` or, for productivity `(0 + sum)`. */
export interface Effect {
  /** Multiplier to energy used during operation (not idle/drain use). The minimum possible sum is -80%. */
  consumption?: EffectValue;
  /** Multiplier to the pollution factor of an entity's pollution during use. The minimum possible sum is -80%. */
  pollution?: EffectValue;
  /** Multiplied against work completed, adds to the bonus results of operating. E.g. an extra crafted recipe or immediate research bonus. The minimum possible sum is 0%. */
  productivity?: EffectValue;
  quality?: EffectValue;
  /** Modifier to crafting speed, research speed, etc. The minimum possible sum is -80%. */
  speed?: EffectValue;
}
export interface EffectReceiver {
  base_effect?: Effect;
  uses_beacon_effects?: boolean;
  uses_module_effects?: boolean;
  uses_surface_effects?: boolean;
}

interface _EffectTexture {}

export type EffectTexture = _EffectTexture &
  Omit<SpriteSource, keyof _EffectTexture>;
interface _ElectricEnergySource {
  /** How much energy this entity can hold. */
  buffer_capacity?: Energy;
  /** How much energy (per second) will be continuously removed from the energy buffer. In-game, this is shown in the tooltip as "Min. [Minimum] Consumption". Applied as a constant consumption-per-tick, even when the entity has the property [active](runtime:LuaEntity::active) set to `false`. */
  drain?: Energy;
  /** The rate at which energy can be taken, from the network, to refill the energy buffer. `0` means no transfer. */
  input_flow_limit?: Energy;
  /** The rate at which energy can be provided, to the network, from the energy buffer. `0` means no transfer. */
  output_flow_limit?: Energy;
  type: 'electric';
  usage_priority: ElectricUsagePriority;
}

export type ElectricEnergySource = _ElectricEnergySource &
  Omit<BaseEnergySource, keyof _ElectricEnergySource>;

export function isElectricEnergySource(
  value: unknown,
): value is ElectricEnergySource {
  return (value as { type: string }).type === 'electric';
}

/** If this is loaded as a single ElementImageSetLayer, it gets used as `base`. */
interface _ElementImageSet {
  base?: ElementImageSetLayer;
  glow?: ElementImageSetLayer;
  shadow?: ElementImageSetLayer;
}
/** If this is loaded as a Sprite, it gets used as `center`. */
interface _ElementImageSetLayer {
  background_blur?: boolean;
  background_blur_sigma?: number;
  /** Sets `top_border`, `right_border`, `bottom_border` and `left_border`.

Only loaded if `corner_size` is not defined. Only loaded if `type` is `"composition"`. */
  border?: number;
  /** Only loaded if `type` is `"composition"`. */
  bottom?: Sprite;
  /** Only loaded if `type` is `"composition"`. */
  bottom_border?: number;
  bottom_outer_border_shift?: number;
  bottom_tiling?: boolean;
  /** Only loaded if `corner_size` is defined. Only loaded if `type` is `"composition"`. */
  bottom_width?: SpriteSizeType;
  /** Only loaded if `type` is `"composition"`. */
  center?: Sprite;
  /** Only loaded if `corner_size` is defined. Only loaded if `type` is `"composition"`. */
  center_height?: SpriteSizeType;
  center_tiling_horizontal?: boolean;
  center_tiling_vertical?: boolean;
  /** Only loaded if `corner_size` is defined. Only loaded if `type` is `"composition"`. */
  center_width?: SpriteSizeType;
  /** If this is a tuple, the first member of the tuple is width and the second is height. Otherwise the size is both width and height.

Only loaded if `type` is `"composition"`. */
  corner_size?: number | [number, number];
  custom_horizontal_tiling_sizes?: number[];
  /** Defines whether the border should be drawn inside the widget, which affects the padding and content size of the widget, or outside of the widget which doesn't affect size. The outer draw type is most commonly used for shadows, glows and insets. */
  draw_type?: 'inner' | 'outer';
  /** Only loaded if `corner_size` is defined. Only loaded if `type` is `"composition"`. */
  filename?: FileName;
  /** Only loaded if `type` is `"composition"`. */
  left?: Sprite;
  /** Only loaded if `type` is `"composition"`. */
  left_border?: number;
  /** Only loaded if `type` is `"composition"`. */
  left_bottom?: Sprite;
  /** Only loaded if `corner_size` is defined. Only loaded if `type` is `"composition"`. */
  left_height?: SpriteSizeType;
  left_outer_border_shift?: number;
  /** Tiling is used to make a side (not corner) texture repeat instead of being stretched. */
  left_tiling?: boolean;
  /** Only loaded if `type` is `"composition"`. */
  left_top?: Sprite;
  /** Only loaded if `corner_size` is defined. Only loaded if `type` is `"composition"`. */
  load_in_minimal_mode?: boolean;
  opacity?: number;
  overall_tiling_horizontal_padding?: number;
  /** Overall tiling is used to make the overall texture repeat instead of being stretched. */
  overall_tiling_horizontal_size?: number;
  overall_tiling_horizontal_spacing?: number;
  overall_tiling_vertical_padding?: number;
  overall_tiling_vertical_size?: number;
  overall_tiling_vertical_spacing?: number;
  /** Mandatory if `corner_size` is defined. Only loaded if `type` is `"composition"`. */
  position?: MapPosition;
  /** Only loaded if `type` is `"composition"`. */
  right?: Sprite;
  /** Only loaded if `type` is `"composition"`. */
  right_border?: number;
  /** Only loaded if `type` is `"composition"`. */
  right_bottom?: Sprite;
  /** Only loaded if `corner_size` is defined. Only loaded if `type` is `"composition"`. */
  right_height?: SpriteSizeType;
  right_outer_border_shift?: number;
  right_tiling?: boolean;
  /** Only loaded if `type` is `"composition"`. */
  right_top?: Sprite;
  /** Only loaded if `corner_size` is defined. Only loaded if `type` is `"composition"`. */
  scale?: number;
  /** Only loaded if `type` is `"composition"`. */
  stretch_monolith_image_to_size?: boolean;
  /** Only loaded if `type` is `"composition"`. */
  tint?: Color;
  /** Only loaded if `type` is `"composition"`. */
  top?: Sprite;
  /** Only loaded if `type` is `"composition"`. */
  top_border?: number;
  top_outer_border_shift?: number;
  top_tiling?: boolean;
  /** Only loaded if `corner_size` is defined. Only loaded if `type` is `"composition"`. */
  top_width?: SpriteSizeType;
  type?: 'none' | 'composition';
}
interface _EmptyWidgetStyleSpecification {
  graphical_set?: ElementImageSet;
  type: 'empty_widget_style';
}

export type EmptyWidgetStyleSpecification = _EmptyWidgetStyleSpecification &
  Omit<BaseStyleSpecification, keyof _EmptyWidgetStyleSpecification>;

export function isEmptyWidgetStyleSpecification(
  value: unknown,
): value is EmptyWidgetStyleSpecification {
  return (value as { type: string }).type === 'empty_widget_style';
}

export interface EnemyEvolutionSettings {
  /** Percentual increase in the evolution factor for every destroyed spawner */
  destroy_factor: number;
  enabled: boolean;
  /** Percentual increase in the evolution factor for 1 pollution unit */
  pollution_factor: number;
  /** Percentual increase in the evolution factor for every second (60 ticks) */
  time_factor: number;
}
export interface EnemyExpansionSettings {
  building_coefficient: number;
  enabled: boolean;
  enemy_building_influence_radius: number;
  friendly_base_influence_radius: number;
  /** A chunk has to have at most this much percent unbuildable tiles for it to be considered a candidate. This is to avoid chunks full of water to be marked as candidates. */
  max_colliding_tiles_coefficient: number;
  max_expansion_cooldown: number;
  /** Distance in chunks from the furthest base around. This prevents expansions from reaching too far into the player's territory. */
  max_expansion_distance: number;
  /** Ticks to expand to a single position for a base is used. Cooldown is calculated as follows: `cooldown = lerp(max_expansion_cooldown, min_expansion_cooldown, -e^2 + 2 * e)` where `lerp` is the linear interpolation function, and e is the current evolution factor. */
  min_expansion_cooldown: number;
  neighbouring_base_chunk_coefficient: number;
  neighbouring_chunk_coefficient: number;
  other_base_coefficient: number;
  settler_group_max_size: number;
  /** Size of the group that goes to build new base (the game interpolates between min size and max size based on evolution factor). */
  settler_group_min_size: number;
}
export interface EnemySpawnerAbsorption {
  absolute: number;
  proportional: number;
}
export interface EnemySpawnerGraphicsSet {
  animations?: AnimationVariations;
  integration?: SpriteVariations;
  random_animation_offset?: boolean;
  underwater_animations?: AnimationVariations;
  underwater_layer_offset?: number;
  water_effect_map_animations?: AnimationVariations;
}
interface _EnterVehicleTipTrigger {
  match_type_only?: boolean;
  type: 'enter-vehicle';
  vehicle?: EntityID;
}

export type EnterVehicleTipTrigger = _EnterVehicleTipTrigger &
  Omit<CountBasedTipTrigger, keyof _EnterVehicleTipTrigger>;

export function isEnterVehicleTipTrigger(
  value: unknown,
): value is EnterVehicleTipTrigger {
  return (value as { type: string }).type === 'enter-vehicle';
}

/** A single tiles worth of animations used when building entities. */
export interface EntityBuildAnimationPiece {
  /** The animation must have a total of 32 frames. */
  body: Animation;
  /** The animation must have a total of 32 frames. */
  top: Animation;
}
/** A set of animations used when building entities on space platforms. All EntityBuildAnimationPieces must have the same animation speed. */
export interface EntityBuildAnimations {
  back_left: EntityBuildAnimationPiece;
  back_right: EntityBuildAnimationPiece;
  front_left: EntityBuildAnimationPiece;
  front_right: EntityBuildAnimationPiece;
}
interface _EntityIDFilter {
  /** Only loaded if `quality` is defined. */
  comparator?: ComparatorString;
  name: EntityID;
  quality?: QualityID;
}
/** How far (in tiles) entities should be rendered outside the visible area of the screen. */
export interface EntityRendererSearchBoxLimits {
  /** Min value 4, max value 15. Min value 4 to compensate for tall entities like electric poles. */
  bottom: number;
  /** Min value 6, max value 15. Min value 6 to compensate for shadows. */
  left: number;
  /** Min value 3, max value 15. */
  right: number;
  /** Min value 3, max value 15. */
  top: number;
}
interface _EntityTransferTipTrigger {
  transfer?: 'in' | 'out';
  type: 'entity-transfer';
}

export type EntityTransferTipTrigger = _EntityTransferTipTrigger &
  Omit<CountBasedTipTrigger, keyof _EntityTransferTipTrigger>;

export function isEntityTransferTipTrigger(
  value: unknown,
): value is EntityTransferTipTrigger {
  return (value as { type: string }).type === 'entity-transfer';
}

/** The shape and dimensions of an equipment module. */
export interface EquipmentShape {
  height: number;
  /** Only used when when `type` is `"manual"`. Each inner array is a "position" inside width×height of the equipment. Each positions that is defined is a filled squares of the equipment shape. `{0, 0}` is the upper left corner of the equipment. */
  points?: number[][];
  /** The shape. When using "manual", `points` must be defined. */
  type: 'full' | 'manual';
  width: number;
}
interface _ExplosionDefinition {
  name: EntityID;
  offset?: Vector;
}
interface __Fade {
  from?: ControlPoint;
  to?: ControlPoint;
}

export type _Fade = __Fade & Omit<Attenuation, keyof __Fade>;
export interface Fades {
  /** At least one of `fade_in`and `fade_out` needs to be defined. */
  fade_in?: Fade;
  /** At least one of `fade_in`and `fade_out` needs to be defined. */
  fade_out?: Fade;
}
interface _FastBeltBendTipTrigger {
  type: 'fast-belt-bend';
}

export type FastBeltBendTipTrigger = _FastBeltBendTipTrigger &
  Omit<CountBasedTipTrigger, keyof _FastBeltBendTipTrigger>;

export function isFastBeltBendTipTrigger(
  value: unknown,
): value is FastBeltBendTipTrigger {
  return (value as { type: string }).type === 'fast-belt-bend';
}

interface _FastReplaceTipTrigger {
  match_type_only?: boolean;
  source?: EntityID;
  target?: EntityID;
  type: 'fast-replace';
}

export type FastReplaceTipTrigger = _FastReplaceTipTrigger &
  Omit<CountBasedTipTrigger, keyof _FastReplaceTipTrigger>;

export function isFastReplaceTipTrigger(
  value: unknown,
): value is FastReplaceTipTrigger {
  return (value as { type: string }).type === 'fast-replace';
}

/** A dictionary of feature flags and their status. It can be used to adjust prototypes based on whether the feature flags are enabled. */
export interface FeatureFlags {
  expansion_shaders: boolean;
  freezing: boolean;
  quality: boolean;
  rail_bridges: boolean;
  segmented_units: boolean;
  space_travel: boolean;
  spoiling: boolean;
}
interface _FlipEntityTipTrigger {
  type: 'flip-entity';
}

export type FlipEntityTipTrigger = _FlipEntityTipTrigger &
  Omit<CountBasedTipTrigger, keyof _FlipEntityTipTrigger>;

export function isFlipEntityTipTrigger(
  value: unknown,
): value is FlipEntityTipTrigger {
  return (value as { type: string }).type === 'flip-entity';
}

interface _FlowStyleSpecification {
  horizontal_spacing?: number;
  max_on_row?: number;
  type: 'flow_style';
  vertical_spacing?: number;
}

export type FlowStyleSpecification = _FlowStyleSpecification &
  Omit<BaseStyleSpecification, keyof _FlowStyleSpecification>;

export function isFlowStyleSpecification(
  value: unknown,
): value is FlowStyleSpecification {
  return (value as { type: string }).type === 'flow_style';
}

/** Used to set the fluid amount an entity can hold, as well as the connection points for pipes leading into and out of the entity.

Entities can have multiple fluidboxes. These can be part of a [FluidEnergySource](prototype:FluidEnergySource), or be specified directly in the entity prototype.

A fluidbox can store only one type of fluid at a time. However, a fluid system (ie. multiple connected fluid boxes) can contain multiple different fluids, see [Fluid mixing](https://wiki.factorio.com/Fluid_system#Fluid_mixing). */
export interface FluidBox {
  /** Defaults to true if `pipe_picture` is not defined, otherwise defaults to false. */
  always_draw_covers?: boolean;
  draw_only_when_connected?: boolean;
  /** Array of the [WorkingVisualisation::name](prototype:WorkingVisualisation::name) of working visualisations to enable when this fluidbox is present.

If `draw_only_when_connected` is `true`, then the working visualisation are only enabled when this is *connected*. */
  enable_working_visualisations?: string[];
  /** Can be used to specify which fluid is allowed to enter this fluid box. See [here](https://forums.factorio.com/viewtopic.php?f=28&t=46302). */
  filter?: FluidID;
  /** Hides the blue input/output arrows and icons at each connection point. */
  hide_connection_info?: boolean;
  /** The max extent that a pipeline with this fluidbox can span. A given pipeline's extent is calculated as the min extent of all the fluidboxes that comprise it. */
  max_pipeline_extent?: number;
  /** The maximum temperature allowed into the fluidbox. Only applied if a `filter` is specified. */
  maximum_temperature?: number;
  /** The minimum temperature allowed into the fluidbox. Only applied if a `filter` is specified. */
  minimum_temperature?: number;
  /** Connection points to connect to other fluidboxes. This is also marked as blue arrows in alt mode. Fluid may flow in or out depending on the `type` field of each connection.

Connection points may depend on the direction the entity is facing. These connection points cannot share positions with one another or the connection points of another fluid box belonging to the same entity.

Can't have more than 255 connections. */
  pipe_connections: PipeConnectionDefinition[];
  /** The pictures to show when another fluid box connects to this one. */
  pipe_covers?: Sprite4Way;
  pipe_covers_frozen?: Sprite4Way;
  pipe_picture?: Sprite4Way;
  pipe_picture_frozen?: Sprite4Way;
  production_type?: ProductionType;
  render_layer?: RenderLayer;
  /** Set the secondary draw order for all orientations. Used to determine render order for sprites with the same `render_layer` in the same position. Sprites with a higher `secondary_draw_order` are drawn on top. */
  secondary_draw_order?: number;
  /** Set the secondary draw order for each orientation. Used to determine render order for sprites with the same `render_layer` in the same position. Sprites with a higher `secondary_draw_order` are drawn on top.

The individual directions default to the value of `secondary_draw_order`. */
  secondary_draw_orders?: FluidBoxSecondaryDrawOrders;
  /** Must be greater than 0. */
  volume: FluidAmount;
}
export interface FluidBoxSecondaryDrawOrders {
  east?: number;
  north?: number;
  south?: number;
  west?: number;
}
interface _FluidEnergySource {
  /** If set to `true`, the energy source will calculate power based on the fluid's `fuel_value`, else it will calculate based on fluid temperature. */
  burns_fluid?: boolean;
  /** Property is only used when `burns_fluid` is `true` and the fluid has a [fuel_value](prototype:FluidPrototype::fuel_value) of `0`, or when `burns_fluid` is `false` and the fluid is at its `default_temperature`.

In those cases, this property determines whether the fluid should be destroyed, meaning that the fluid is consumed at the rate of `fluid_usage_per_tick`, without producing any power. */
  destroy_non_fuel_fluid?: boolean;
  /** `1` means 100% effectivity. Must be greater than `0`. Multiplier of the energy output. */
  effectivity?: number;
  /** All standard fluid box configurations are acceptable, but the type must be `"input"` or `"input-output"` to function correctly. `scale_fluid_usage = true`, `fluid_usage_per_tick`, or a filter on the fluidbox must be set to be able to calculate the fluid usage of the energy source. */
  fluid_box: FluidBox;
  /** The number of fluid units the energy source uses per tick. If used with `scale_fluid_usage`, this specifies the maximum. If this value is not set, `scale_energy_usage` is `false` and a fluid box filter is set, the game will attempt to calculate this value from the fluid box filter's fluid's `fuel_value` or `heat_capacity` and the entity's `energy_usage`. If `burns_fluid` is `false`, `maximum_temperature` will also be used. If the attempt of the game to calculate this value fails (`scale_energy_usage` is `false` and a fluid box filter is set), then `scale_energy_usage` will be forced to `true`, to prevent the energy source from being an infinite fluid sink. More context [on the forums](https://forums.factorio.com/90613). */
  fluid_usage_per_tick?: FluidAmount;
  light_flicker?: LightFlickeringDefinition;
  /** `0` means unlimited maximum temperature. If this is non-zero while `scale_fluid_usage` is `false` and `fluid_usage_per_tick` is not specified, the game will use this value to calculate `fluid_usage_per_tick`. To do that, the filter on the `fluid_box` must be set.

Only loaded if `burns_fluid` is `false`. */
  maximum_temperature?: number;
  /** If set to `true`, the energy source will consume as much fluid as required to produce the desired power, otherwise it will consume as much as it is allowed to, wasting any excess. */
  scale_fluid_usage?: boolean;
  smoke?: SmokeSource[];
  type: 'fluid';
}

export type FluidEnergySource = _FluidEnergySource &
  Omit<BaseEnergySource, keyof _FluidEnergySource>;

export function isFluidEnergySource(
  value: unknown,
): value is FluidEnergySource {
  return (value as { type: string }).type === 'fluid';
}

/** A fluid ingredient definition. */
export interface FluidIngredientPrototype {
  /** Can not be `<= 0`. */
  amount: FluidAmount;
  /** Used to specify which [CraftingMachinePrototype::fluid_boxes](prototype:CraftingMachinePrototype::fluid_boxes) this ingredient should use. It will use this one fluidbox. The index is 1-based and separate for input and output fluidboxes. */
  fluidbox_index?: number;
  /** Used to set crafting machine fluidbox volumes. Must be at least 1. */
  fluidbox_multiplier?: number;
  /** Amount that should not be included in the consumption statistics, typically with a matching product having the same amount set as [ignored_by_stats](prototype:FluidProductPrototype::ignored_by_stats). */
  ignored_by_stats?: FluidAmount;
  /** If `temperature` is not set, this sets the expected maximum temperature of the fluid ingredient. */
  maximum_temperature?: number;
  /** If `temperature` is not set, this sets the expected minimum temperature of the fluid ingredient. */
  minimum_temperature?: number;
  /** The name of a [FluidPrototype](prototype:FluidPrototype). */
  name: FluidID;
  /** Sets the expected temperature of the fluid ingredient. */
  temperature?: number;
  type: 'fluid';
}

export function isFluidIngredientPrototype(
  value: unknown,
): value is FluidIngredientPrototype {
  return (value as { type: string }).type === 'fluid';
}

/** A fluid product definition. */
export interface FluidProductPrototype {
  /** Can not be `< 0`. */
  amount?: FluidAmount;
  /** Only loaded, and mandatory if `amount` is not defined.

If set to a number that is less than `amount_min`, the game will use `amount_min` instead. */
  amount_max?: FluidAmount;
  /** Only loaded, and mandatory if `amount` is not defined.

Can not be `< 0`. */
  amount_min?: FluidAmount;
  /** Used to specify which [CraftingMachinePrototype::fluid_boxes](prototype:CraftingMachinePrototype::fluid_boxes) this product should use. It will use this one fluidbox. The index is 1-based and separate for input and output fluidboxes. */
  fluidbox_index?: number;
  /** Amount that should be deducted from any productivity induced bonus crafts.

This value can safely be set larger than the maximum expected craft amount, any excess is ignored.

This value is ignored when [allow_productivity](prototype:RecipePrototype::allow_productivity) is `false`. */
  ignored_by_productivity?: FluidAmount;
  /** Amount that should not be included in the fluid production statistics, typically with a matching ingredient having the same amount set as [ignored_by_stats](prototype:FluidIngredientPrototype::ignored_by_stats).

If `ignored_by_stats` is larger than the amount crafted (for instance due to probability) it will instead show as consumed.

Products with `ignored_by_stats` defined will not be set as recipe through the circuit network when using the product's fluid-signal. */
  ignored_by_stats?: FluidAmount;
  /** The name of a [FluidPrototype](prototype:FluidPrototype). */
  name: FluidID;
  /** Value between 0 and 1, `0` for 0% chance and `1` for 100% chance.

The effect of probability is no product, or a linear distribution on [min, max]. For a recipe with probability `p`, amount_min `min`, and amount_max `max`, the Expected Value of this product can be expressed as `p * (0.5 * (max + min))`. This is what will be shown in a recipe tooltip. The effect of `ignored_by_productivity` on the product is not shown.

When `amount_min` and `amount_max` are not provided, `amount` applies as min and max. The Expected Value simplifies to `p * amount`, providing `0` product, or `amount` product, on recipe completion. */
  probability?: number;
  /** When hovering over a recipe in the crafting menu the recipe tooltip will be shown. An additional item tooltip will be shown for every product, as a separate tooltip, if the item tooltip has a description and/or properties to show and if `show_details_in_recipe_tooltip` is `true`. */
  show_details_in_recipe_tooltip?: boolean;
  /** The temperature of the fluid product. */
  temperature?: number;
  type: 'fluid';
}

export function isFluidProductPrototype(
  value: unknown,
): value is FluidProductPrototype {
  return (value as { type: string }).type === 'fluid';
}

export interface FluidWagonConnectorGraphics {
  load_animations: PumpConnectorGraphics;
  unload_animations: PumpConnectorGraphics;
}
export interface FogEffectProperties {
  color1?: Color;
  color2?: Color;
  detail_noise_texture: EffectTexture;
  /** `gleba` type is rendered per chunk and opacity of fog depends on count of tiles with [lowland_fog](prototype:TilePrototype::lowland_fog) set to `true` on the chunk. */
  fog_type?: 'vulcanus' | 'gleba';
  shape_noise_texture: EffectTexture;
}
export interface FogMaskShapeDefinition {
  falloff?: number;
  rect: SimpleBoundingBox;
}
interface _FollowerRobotLifetimeModifier {
  /** If set to `false`, use the icon from [UtilitySprites](prototype:UtilitySprites) for this technology effect icon. */
  infer_icon?: boolean;
  type: 'follower-robot-lifetime';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type FollowerRobotLifetimeModifier = _FollowerRobotLifetimeModifier &
  Omit<SimpleModifier, keyof _FollowerRobotLifetimeModifier>;

export function isFollowerRobotLifetimeModifier(
  value: unknown,
): value is FollowerRobotLifetimeModifier {
  return (value as { type: string }).type === 'follower-robot-lifetime';
}

export interface FootprintParticle {
  /** The name of the particle that should be created when the character walks on the defined tiles. */
  particle_name?: ParticleID;
  /** The tiles this footprint particle is shown on when the player walks over them. */
  tiles: TileID[];
  /** Whether this footprint particle should be the default particle that is used for `tiles` that don't have an associated footprint particle. */
  use_as_default?: boolean;
}
interface _FootstepTriggerEffectItem {
  /** Can be used to specify multiple CreateParticleTriggerEffectItems. If this property is defined, all properties inherited from CreateParticleTriggerEffectItem are ignored. */
  actions?: CreateParticleTriggerEffectItem[];
  tiles: TileID[];
  /** When `true`, the trigger(s) defined in `actions` are the default triggers for tiles that don't have an associated footstep particle trigger. (ie. don't show up in one of the "tiles" lists). */
  use_as_default?: boolean;
}

export type FootstepTriggerEffectItem = _FootstepTriggerEffectItem &
  Omit<CreateParticleTriggerEffectItem, keyof _FootstepTriggerEffectItem>;
interface _FrameStyleSpecification {
  background_graphical_set?: ElementImageSet;
  border?: BorderImageSet;
  drag_by_title?: boolean;
  graphical_set?: ElementImageSet;
  header_background?: ElementImageSet;
  header_filler_style?: EmptyWidgetStyleSpecification;
  header_flow_style?: HorizontalFlowStyleSpecification;
  horizontal_flow_style?: HorizontalFlowStyleSpecification;
  title_style?: LabelStyleSpecification;
  type: 'frame_style';
  use_header_filler?: boolean;
  vertical_flow_style?: VerticalFlowStyleSpecification;
}

export type FrameStyleSpecification = _FrameStyleSpecification &
  Omit<BaseStyleSpecification, keyof _FrameStyleSpecification>;

export function isFrameStyleSpecification(
  value: unknown,
): value is FrameStyleSpecification {
  return (value as { type: string }).type === 'frame_style';
}

export interface FrequencySizeRichness {
  frequency?: MapGenSize;
  richness?: MapGenSize;
  size?: MapGenSize;
}
export interface FusionGeneratorDirectionGraphicsSet {
  animation?: Animation;
  fluid_input_graphics?: FusionGeneratorFluidInputGraphics[];
  fusion_effect_uv_map?: Sprite;
  working_light?: Animation;
}
export interface FusionGeneratorFluidInputGraphics {
  fusion_effect_uv_map?: Sprite;
  sprite?: Sprite;
  working_light?: Sprite;
}
export interface FusionGeneratorGraphicsSet {
  east_graphics_set: FusionGeneratorDirectionGraphicsSet;
  glow_color?: Color;
  light?: LightDefinition;
  north_graphics_set: FusionGeneratorDirectionGraphicsSet;
  render_layer?: RenderLayer;
  south_graphics_set: FusionGeneratorDirectionGraphicsSet;
  west_graphics_set: FusionGeneratorDirectionGraphicsSet;
}
export interface FusionReactorConnectionGraphics {
  fusion_effect_uv_map?: Sprite;
  pictures?: Animation;
  working_light_pictures?: Animation;
}
export interface FusionReactorGraphicsSet {
  connections_graphics?: FusionReactorConnectionGraphics[];
  default_fuel_glow_color?: Color;
  direction_to_connections_graphics?: Record<DirectionString, number[]>;
  fusion_effect_uv_map?: Sprite;
  light?: LightDefinition;
  /** Cannot be an empty string. */
  plasma_category: NeighbourConnectableConnectionCategory;
  render_layer?: RenderLayer;
  structure?: Sprite4Way;
  use_fuel_glow_color?: boolean;
  working_light_pictures?: Sprite4Way;
}
export interface GameControllerVibrationData {
  /** Duration in milliseconds. */
  duration?: number;
  /** Vibration intensity must be between 0 and 1. */
  high_frequency_vibration_intensity?: number;
  /** Vibration intensity must be between 0 and 1. */
  low_frequency_vibration_intensity?: number;
  play_for?: PlayFor;
}
export interface GameViewSettings {
  /** If this is defined then it sets the default value for all other properties. */
  default_show_value?: boolean;
  show_alert_gui?: boolean;
  show_controller_gui?: boolean;
  show_crafting_queue?: boolean;
  show_entity_info?: boolean;
  show_entity_tooltip?: boolean;
  show_hotkey_suggestions?: boolean;
  show_map_view_options?: boolean;
  show_minimap?: boolean;
  show_quickbar?: boolean;
  show_rail_block_visualisation?: boolean;
  show_research_info?: boolean;
  show_shortcut_bar?: boolean;
  show_side_menu?: boolean;
  show_tool_bar?: boolean;
  update_entity_selection?: boolean;
}
interface _GateOverRailBuildTipTrigger {
  type: 'gate-over-rail-build';
}

export type GateOverRailBuildTipTrigger = _GateOverRailBuildTipTrigger &
  Omit<CountBasedTipTrigger, keyof _GateOverRailBuildTipTrigger>;

export function isGateOverRailBuildTipTrigger(
  value: unknown,
): value is GateOverRailBuildTipTrigger {
  return (value as { type: string }).type === 'gate-over-rail-build';
}

interface _GeneratingPowerTipTrigger {
  type: 'generating-power';
}

export type GeneratingPowerTipTrigger = _GeneratingPowerTipTrigger &
  Omit<CountBasedTipTrigger, keyof _GeneratingPowerTipTrigger>;

export function isGeneratingPowerTipTrigger(
  value: unknown,
): value is GeneratingPowerTipTrigger {
  return (value as { type: string }).type === 'generating-power';
}

export interface GhostShimmerConfig {
  blend_mode: number;
  distortion: number;
  /** The array must have at least 6 elements. */
  distortion_layers: GhostShimmerDistortionData[];
  /** The array must have at least 6 elements. */
  overlay_layers: GhostShimmerOverlayData[];
  proportional_distortion: boolean;
  tint: Color;
  visualize_borders: boolean;
  world_uv_modulo: number;
}
export interface GhostShimmerDistortionData {
  intensity: number;
  shape: number;
  x: number;
  y: number;
}
export interface GhostShimmerOverlayData {
  blend_mode: number;
  cutoff: number;
  shape: number;
  tint: Color;
  x: number;
  y: number;
}
export interface GigaCargoHatchDefinition {
  /** Cannot use `fade_ticks`. */
  closing_sound?: InterruptibleSound;
  covered_hatches: number[];
  hatch_graphics_back?: Animation;
  hatch_graphics_front?: Animation;
  hatch_render_layer_back?: RenderLayer;
  hatch_render_layer_front?: RenderLayer;
  /** Cannot use `fade_ticks`. */
  opening_sound?: InterruptibleSound;
}
interface _GiveItemModifier {
  count?: ItemCountType;
  item: ItemID;
  quality?: QualityID;
  type: 'give-item';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type GiveItemModifier = _GiveItemModifier &
  Omit<BaseModifier, keyof _GiveItemModifier>;

export function isGiveItemModifier(value: unknown): value is GiveItemModifier {
  return (value as { type: string }).type === 'give-item';
}

export interface GlobalRecipeTints {
  primary?: Color;
  quaternary?: Color;
  secondary?: Color;
  tertiary?: Color;
}
export interface GlobalTintEffectProperties {
  global_intensity: number;
  global_scale: number;
  intensity: Vector4f;
  noise_texture: EffectTexture;
  offset: Vector4f;
  scale_u: Vector4f;
  scale_v: Vector4f;
  zoom_factor: number;
  zoom_intensity: number;
}
interface _GlowStyleSpecification {
  image_set?: ElementImageSet;
  type: 'glow_style';
}

export type GlowStyleSpecification = _GlowStyleSpecification &
  Omit<BaseStyleSpecification, keyof _GlowStyleSpecification>;

export function isGlowStyleSpecification(
  value: unknown,
): value is GlowStyleSpecification {
  return (value as { type: string }).type === 'glow_style';
}

interface _GraphStyleSpecification {
  background_color?: Color;
  data_line_highlight_distance?: number;
  /** Name of a [FontPrototype](prototype:FontPrototype). */
  font?: string;
  graph_right_margin?: number;
  graph_top_margin?: number;
  grid_lines_color?: Color;
  guide_lines_color?: Color;
  horizontal_label_style?: LabelStyleSpecification;
  horizontal_labels_margin?: number;
  line_colors?: Color[];
  minimal_horizontal_label_spacing?: number;
  minimal_vertical_label_spacing?: number;
  selection_dot_radius?: number;
  type: 'graph_style';
  vertical_label_style?: LabelStyleSpecification;
  vertical_labels_margin?: number;
}

export type GraphStyleSpecification = _GraphStyleSpecification &
  Omit<BaseStyleSpecification, keyof _GraphStyleSpecification>;

export function isGraphStyleSpecification(
  value: unknown,
): value is GraphStyleSpecification {
  return (value as { type: string }).type === 'graph_style';
}

interface _GroupAttackTipTrigger {
  type: 'group-attack';
}

export type GroupAttackTipTrigger = _GroupAttackTipTrigger &
  Omit<CountBasedTipTrigger, keyof _GroupAttackTipTrigger>;

export function isGroupAttackTipTrigger(
  value: unknown,
): value is GroupAttackTipTrigger {
  return (value as { type: string }).type === 'group-attack';
}

export interface GunShift4Way {
  east?: Vector;
  north: Vector;
  south?: Vector;
  west?: Vector;
}
interface _GunSpeedModifier {
  /** Name of the [AmmoCategory](prototype:AmmoCategory) that is affected. */
  ammo_category: AmmoCategoryID;
  /** If set to `false`, use the icon from [UtilitySprites](prototype:UtilitySprites) for this technology effect icon. */
  infer_icon?: boolean;
  /** Modification value, which will be added to the current gun speed modifier upon researching. */
  modifier: number;
  type: 'gun-speed';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type GunSpeedModifier = _GunSpeedModifier &
  Omit<BaseModifier, keyof _GunSpeedModifier>;

export function isGunSpeedModifier(value: unknown): value is GunSpeedModifier {
  return (value as { type: string }).type === 'gun-speed';
}

/** Used to specify heat capacity properties without a [heat energy source](prototype:HeatEnergySource). */
export interface HeatBuffer {
  /** May contain up to 32 connections. */
  connections?: HeatConnection[];
  default_temperature?: number;
  heat_glow?: Sprite4Way;
  heat_picture?: Sprite4Way;
  heat_pipe_covers?: Sprite4Way;
  /** Must be >= `default_temperature`. */
  max_temperature: number;
  max_transfer: Energy;
  min_temperature_gradient?: number;
  /** Must be >= `default_temperature` and <= `max_temperature`. */
  min_working_temperature?: number;
  minimum_glow_temperature?: number;
  pipe_covers?: Sprite4Way;
  specific_heat: Energy;
}
/** Defines the connections for [HeatEnergySource](prototype:HeatEnergySource) and [HeatBuffer](prototype:HeatBuffer). */
export interface HeatConnection {
  /** The "outward" direction of this heat connection. For a connection to succeed, the other heat connection must face the opposite direction (a south-facing connection needs a north-facing connection to succeed). A connection rotates with the entity. */
  direction: Direction;
  /** The location of the heat pipe connection, relative to the center of the entity in the north-facing direction. */
  position: MapPosition;
}
interface _HeatEnergySource {
  /** May contain up to 32 connections. */
  connections?: HeatConnection[];
  default_temperature?: number;
  /** Heat energy sources do not support producing pollution. */
  emissions_per_minute?: Record<AirbornePollutantID, number>;
  heat_glow?: Sprite4Way;
  heat_picture?: Sprite4Way;
  heat_pipe_covers?: Sprite4Way;
  /** Must be >= `default_temperature`. */
  max_temperature: number;
  max_transfer: Energy;
  min_temperature_gradient?: number;
  /** Must be >= `default_temperature` and <= `max_temperature`. */
  min_working_temperature?: number;
  minimum_glow_temperature?: number;
  pipe_covers?: Sprite4Way;
  specific_heat: Energy;
  type: 'heat';
}

export type HeatEnergySource = _HeatEnergySource &
  Omit<BaseEnergySource, keyof _HeatEnergySource>;

export function isHeatEnergySource(value: unknown): value is HeatEnergySource {
  return (value as { type: string }).type === 'heat';
}

interface _HorizontalFlowStyleSpecification {
  horizontal_spacing?: number;
  type: 'horizontal_flow_style';
}

export type HorizontalFlowStyleSpecification =
  _HorizontalFlowStyleSpecification &
    Omit<BaseStyleSpecification, keyof _HorizontalFlowStyleSpecification>;

export function isHorizontalFlowStyleSpecification(
  value: unknown,
): value is HorizontalFlowStyleSpecification {
  return (value as { type: string }).type === 'horizontal_flow_style';
}

interface _HorizontalScrollBarStyleSpecification {
  type: 'horizontal_scrollbar_style';
}

export type HorizontalScrollBarStyleSpecification =
  _HorizontalScrollBarStyleSpecification &
    Omit<
      ScrollBarStyleSpecification,
      keyof _HorizontalScrollBarStyleSpecification
    >;

export function isHorizontalScrollBarStyleSpecification(
  value: unknown,
): value is HorizontalScrollBarStyleSpecification {
  return (value as { type: string }).type === 'horizontal_scrollbar_style';
}

/** One layer of an icon. Icon layering follows the following rules:

- The rendering order of the individual icon layers follows the array order: Later added icon layers (higher index) are drawn on top of previously added icon layers (lower index).

- By default the first icon layer will draw an outline (or shadow in GUI), other layers will draw it only if they have `draw_background` explicitly set to `true`. There are caveats to this though. See [the doc](prototype:IconData::draw_background).

- When the final icon is displayed with transparency (e.g. a faded out alert), the icon layer overlap may look [undesirable](https://forums.factorio.com/viewtopic.php?p=575844#p575844).

- When the final icon is displayed with a shadow (e.g. an item on the ground or on a belt when item shadows are turned on), each icon layer will [cast a shadow](https://forums.factorio.com/84888) and the shadow is cast on the layer below it.

- The final icon will always be resized and centered in GUI so that all its layers fit the target slot, but won't be resized when displayed on machines in alt-mode. For example: recipe first icon layer is size 128, scale 1, the icon group will be displayed at resolution /4 to fit the 32px GUI boxes, but will be displayed 4 times as large on buildings.

- Shift values are based on [`expected_icon_size / 2`](prototype:IconData::scale).

The game automatically generates [icon mipmaps](https://factorio.com/blog/post/fff-291) for all icons. However, icons can have custom mipmaps defined. Custom mipmaps may help to achieve clearer icons at reduced size (e.g. when zooming out) than auto-generated mipmaps. If an icon file contains mipmaps then the game will automatically infer the icon's mipmap count. Icon files for custom mipmaps must contain half-size images with a geometric-ratio, for each mipmap level. Each next level is aligned to the upper-left corner, with no extra padding. Example sequence: `128x128@(0,0)`, `64x64@(128,0)`, `32x32@(192,0)` is three mipmaps. */
export interface IconData {
  /** Outline is drawn using signed distance field generated on load.One icon image, will have only one SDF generated. But if the image is used in multiple icon with different scales, outline width won't match the desired width in all the scales but the largest one. */
  draw_background?: boolean;
  /** Path to the icon file. */
  icon: FileName;
  /** The size of the square icon, in pixels. E.g. `32` for a 32px by 32px icon. Must be larger than `0`. */
  icon_size?: SpriteSizeType;
  /** Defaults to `(expected_icon_size / 2) / icon_size`.

Specifies the scale of the icon on the GUI scale. A scale of `2` means that the icon will be two times bigger on screen (and thus more pixelated).

Expected icon sizes:

- `512` for [SpaceLocationPrototype::starmap_icon](prototype:SpaceLocationPrototype::starmap_icon).

- `256` for [TechnologyPrototype](prototype:TechnologyPrototype).

- `128` for [AchievementPrototype](prototype:AchievementPrototype) and [ItemGroup](prototype:ItemGroup).

- `32` for [ShortcutPrototype::icons](prototype:ShortcutPrototype::icons) and `24` for [ShortcutPrototype::small_icons](prototype:ShortcutPrototype::small_icons).

- `64` for the rest of the prototypes that use icons. */
  scale?: number;
  /** Used to offset the icon "layer" from the overall icon. The shift is applied from the center (so negative shifts are left and up, respectively). Shift values are "in pixels" where the overall icon is assumed to be `expected_icon_size / 2` pixels in width and height, meaning shift `{0, expected_icon_size/2}` will shift it by entire icon height down. */
  shift?: Vector;
  /** The tint to apply to the icon. */
  tint?: Color;
}
/** Specification of where and how should be the alt-mode icons of entities be drawn. */
export interface IconDrawSpecification {
  /** Render layer of the icon. */
  renderLayer?:
    | 'entity-info-icon-below'
    | 'entity-info-icon-above'
    | 'air-entity-info-icon';
  scale?: number;
  /** Scale of the icon when there are many items. */
  scale_for_many?: number;
  shift?: Vector;
}
/** Specification of where and how should be the icons of individual inventories be drawn. */
export interface IconSequencePositioning {
  // inventory_index: defines.inventory;
  max_icon_rows?: number;
  max_icons_per_row?: number;
  multi_row_initial_height_modifier?: number;
  scale?: number;
  separation_multiplier?: number;
  shift?: Vector;
}
interface _ImageStyleSpecification {
  graphical_set?: ElementImageSet;
  invert_colors_of_picture_when_hovered_or_toggled?: boolean;
  stretch_image_to_widget_size?: boolean;
  type: 'image_style';
}

export type ImageStyleSpecification = _ImageStyleSpecification &
  Omit<BaseStyleSpecification, keyof _ImageStyleSpecification>;

export function isImageStyleSpecification(
  value: unknown,
): value is ImageStyleSpecification {
  return (value as { type: string }).type === 'image_style';
}

interface _InsertItemTriggerEffectItem {
  count?: ItemCountType;
  /** Name of the [ItemPrototype](prototype:ItemPrototype) that should be created. */
  item: ItemID;
  quality?: QualityID;
  type: 'insert-item';
}

export type InsertItemTriggerEffectItem = _InsertItemTriggerEffectItem &
  Omit<TriggerEffectItem, keyof _InsertItemTriggerEffectItem>;

export function isInsertItemTriggerEffectItem(
  value: unknown,
): value is InsertItemTriggerEffectItem {
  return (value as { type: string }).type === 'insert-item';
}

interface _InserterStackSizeBonusModifier {
  /** If set to `false`, use the icon from [UtilitySprites](prototype:UtilitySprites) for this technology effect icon. */
  infer_icon?: boolean;
  type: 'inserter-stack-size-bonus';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type InserterStackSizeBonusModifier = _InserterStackSizeBonusModifier &
  Omit<SimpleModifier, keyof _InserterStackSizeBonusModifier>;

export function isInserterStackSizeBonusModifier(
  value: unknown,
): value is InserterStackSizeBonusModifier {
  return (value as { type: string }).type === 'inserter-stack-size-bonus';
}

interface _InstantTriggerDelivery {
  type: 'instant';
}

export type InstantTriggerDelivery = _InstantTriggerDelivery &
  Omit<TriggerDeliveryItem, keyof _InstantTriggerDelivery>;

export function isInstantTriggerDelivery(
  value: unknown,
): value is InstantTriggerDelivery {
  return (value as { type: string }).type === 'instant';
}

export interface InterruptibleSound {
  fade_ticks?: number;
  minimal_change_per_tick?: number;
  /** Has to be greater or equal to `1`. */
  minimal_sound_duration_for_stopped_sound?: number;
  /** At least one of sound and stopped_sound has to be defined. */
  sound?: Sound;
  /** At least one of sound and stopped_sound has to be defined. */
  stopped_sound?: Sound;
}
interface _InvokeTileEffectTriggerEffectItem {
  tile_collision_mask?: CollisionMaskConnector;
  type: 'invoke-tile-trigger';
}

export type InvokeTileEffectTriggerEffectItem =
  _InvokeTileEffectTriggerEffectItem &
    Omit<TriggerEffectItem, keyof _InvokeTileEffectTriggerEffectItem>;

export function isInvokeTileEffectTriggerEffectItem(
  value: unknown,
): value is InvokeTileEffectTriggerEffectItem {
  return (value as { type: string }).type === 'invoke-tile-trigger';
}

export interface ItemHealthColorData {
  color: Color;
  /** Cannot be negative. */
  threshold: number;
}
interface _ItemIDFilter {
  /** Only loaded if `quality` is defined. */
  comparator?: ComparatorString;
  name: ItemID;
  quality?: QualityID;
}
/** An item ingredient definition. */
export interface ItemIngredientPrototype {
  /** Cannot be `0`. */
  amount: number;
  /** Amount that should not be included in the consumption statistics, typically with a matching product having the same amount set as [ignored_by_stats](prototype:ItemProductPrototype::ignored_by_stats). */
  ignored_by_stats?: number;
  name: ItemID;
  type: 'item';
}

export function isItemIngredientPrototype(
  value: unknown,
): value is ItemIngredientPrototype {
  return (value as { type: string }).type === 'item';
}

/** An item product definition. */
export interface ItemProductPrototype {
  amount?: number;
  /** Only loaded, and mandatory if `amount` is not defined.

If set to a number that is less than `amount_min`, the game will use `amount_min` instead. */
  amount_max?: number;
  /** Only loaded, and mandatory if `amount` is not defined. */
  amount_min?: number;
  /** Probability that a craft will yield one additional product. Also applies to bonus crafts caused by productivity. */
  extra_count_fraction?: number;
  /** Amount that should be deducted from any productivity induced bonus crafts.

This value can safely be set larger than the maximum expected craft amount, any excess is ignored.

This value is ignored when [allow_productivity](prototype:RecipePrototype::allow_productivity) is `false`. */
  ignored_by_productivity?: number;
  /** Amount that should not be included in the item production statistics, typically with a matching ingredient having the same amount set as [ignored_by_stats](prototype:ItemIngredientPrototype::ignored_by_stats).

If `ignored_by_stats` is larger than the amount crafted (for instance due to probability) it will instead show as consumed.

Products with `ignored_by_stats` defined will not be set as recipe through the circuit network when using the product's item-signal. */
  ignored_by_stats?: number;
  /** The name of an [ItemPrototype](prototype:ItemPrototype). */
  name: ItemID;
  /** Must be >= `0` and < `1`. */
  percent_spoiled?: number;
  /** Value between 0 and 1, `0` for 0% chance and `1` for 100% chance.

The effect of probability is no product, or a linear distribution on [min, max]. For a recipe with probability `p`, amount_min `min`, and amount_max `max`, the Expected Value of this product can be expressed as `p * (0.5 * (max + min))`. This is what will be shown in a recipe tooltip. The effect of `ignored_by_productivity` on the product is not shown.

When `amount_min` and `amount_max` are not provided, `amount` applies as min and max. The Expected Value simplifies to `p * amount`, providing `0` product, or `amount` product, on recipe completion. */
  probability?: number;
  /** When hovering over a recipe in the crafting menu the recipe tooltip will be shown. An additional item tooltip will be shown for every product, as a separate tooltip, if the item tooltip has a description and/or properties to show and if `show_details_in_recipe_tooltip` is `true`. */
  show_details_in_recipe_tooltip?: boolean;
  type: 'item';
}

export function isItemProductPrototype(
  value: unknown,
): value is ItemProductPrototype {
  return (value as { type: string }).type === 'item';
}

/** Item that when placed creates this entity/tile. */
export interface ItemToPlace {
  /** How many items are used to place one of this entity/tile. Can't be larger than the stack size of the item. */
  count: ItemCountType;
  /** The item used to place this entity/tile. */
  item: ItemID;
}
interface _KillTipTrigger {
  damage_type?: DamageTypeID;
  entity?: EntityID;
  match_type_only?: boolean;
  type: 'kill';
}

export type KillTipTrigger = _KillTipTrigger &
  Omit<CountBasedTipTrigger, keyof _KillTipTrigger>;

export function isKillTipTrigger(value: unknown): value is KillTipTrigger {
  return (value as { type: string }).type === 'kill';
}

interface _LabelStyleSpecification {
  clicked_font_color?: Color;
  disabled_font_color?: Color;
  /** Name of a [FontPrototype](prototype:FontPrototype). */
  font?: string;
  font_color?: Color;
  game_controller_hovered_font_color?: Color;
  hovered_font_color?: Color;
  parent_hovered_font_color?: Color;
  rich_text_highlight_error_color?: Color;
  rich_text_highlight_ok_color?: Color;
  rich_text_highlight_warning_color?: Color;
  rich_text_setting?: RichTextSetting;
  single_line?: boolean;
  type: 'label_style';
  underlined?: boolean;
}

export type LabelStyleSpecification = _LabelStyleSpecification &
  Omit<BaseStyleSpecification, keyof _LabelStyleSpecification>;

export function isLabelStyleSpecification(
  value: unknown,
): value is LabelStyleSpecification {
  return (value as { type: string }).type === 'label_style';
}

interface _LaboratoryProductivityModifier {
  /** If set to `false`, use the icon from [UtilitySprites](prototype:UtilitySprites) for this technology effect icon. */
  infer_icon?: boolean;
  type: 'laboratory-productivity';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type LaboratoryProductivityModifier = _LaboratoryProductivityModifier &
  Omit<SimpleModifier, keyof _LaboratoryProductivityModifier>;

export function isLaboratoryProductivityModifier(
  value: unknown,
): value is LaboratoryProductivityModifier {
  return (value as { type: string }).type === 'laboratory-productivity';
}

interface _LaboratorySpeedModifier {
  /** If set to `false`, use the icon from [UtilitySprites](prototype:UtilitySprites) for this technology effect icon. */
  infer_icon?: boolean;
  type: 'laboratory-speed';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type LaboratorySpeedModifier = _LaboratorySpeedModifier &
  Omit<SimpleModifier, keyof _LaboratorySpeedModifier>;

export function isLaboratorySpeedModifier(
  value: unknown,
): value is LaboratorySpeedModifier {
  return (value as { type: string }).type === 'laboratory-speed';
}

interface _LayeredSound {
  layers: Sound[];
}
interface __LayeredSprite {
  render_layer: RenderLayer;
}

export type _LayeredSprite = __LayeredSprite &
  Omit<Sprite, keyof __LayeredSprite>;
/** Specifies a light source. This is loaded either as a single light source or as an array of light sources. */
interface _LightDefinition {
  add_perspective?: boolean;
  /** Color of the light. */
  color?: Color;
  flicker_interval?: number;
  flicker_max_modifier?: number;
  flicker_min_modifier?: number;
  /** Brightness of the light in the range `[0, 1]`, where `0` is no light and `1` is the maximum light. */
  intensity: number;
  minimum_darkness?: number;
  /** Offsets tick used to calculate flicker by position hash. Useful to desynchronize flickering of multiple stationary lights. */
  offset_flicker?: boolean;
  /** Only loaded, and mandatory if `type` is `"oriented"`. */
  picture?: Sprite;
  /** Only loaded if `type` is `"oriented"`. */
  rotation_shift?: RealOrientation;
  shift?: Vector;
  /** The radius of the light in tiles. Note that the light gets darker near the edges, so the effective size of the light will appear to be smaller. */
  size: number;
  source_orientation_offset?: RealOrientation;
  type?: 'basic' | 'oriented';
}
/** Specifies the light flicker. Note that this defaults to "showing a white light" instead of the usually expected "showing nothing". */
export interface LightFlickeringDefinition {
  border_fix_speed?: number;
  /** Color of the light. */
  color?: Color;
  derivation_change_deviation?: number;
  derivation_change_frequency?: number;
  light_intensity_to_size_coefficient?: number;
  /** Brightness of the light in the range `[0, 1]` where `0` is no light and `1` is the maximum light. */
  maximum_intensity?: number;
  /** Brightness of the light in the range `[0, 1]` where `0` is no light and `1` is the maximum light. */
  minimum_intensity?: number;
  /** The radius of the light in tiles. Note, that the light gets darker near the edges, so the effective size of the light seems to be smaller. */
  minimum_light_size?: number;
}
export interface LightProperties {
  color?: Color;
  direction?: Vector3D;
}
export interface LightningGraphicsSet {
  attractor_hit_animation?: Animation;
  bolt_detail_level?: number;
  bolt_half_width?: number;
  bolt_midpoint_variance?: number;
  cloud_background?: Animation;
  /** Must be less than or equal to `bolt_detail_level`. */
  cloud_detail_level?: number;
  cloud_fork_orientation_variance?: number;
  /** Cannot be 255. */
  cloud_forks?: number;
  explosion?: AnimationVariations;
  /** Cannot be 1. */
  fork_intensity_multiplier?: number;
  fork_orientation_variance?: number;
  ground_streamer_variance?: number;
  ground_streamers?: Animation[];
  light?: LightDefinition;
  max_bolt_offset?: number;
  max_fork_probability?: number;
  max_ground_streamer_distance?: number;
  max_relative_fork_length?: number;
  min_ground_streamer_distance?: number;
  min_relative_fork_length?: number;
  relative_cloud_fork_length?: number;
  /** If not empty, enables the lightning shader. */
  shader_configuration?: LightningShaderConfiguration[];
}
interface _LightningPriorityRule {
  priority_bonus: number;
}

export type LightningPriorityRule = _LightningPriorityRule &
  Omit<LightningRuleBase, keyof _LightningPriorityRule>;
export interface LightningProperties {
  exemption_rules: LightningRuleBase[];
  /** Cannot be an empty array. Names of [lightning entities](prototype:LightningPrototype). */
  lightning_types: EntityID[];
  lightnings_per_chunk_per_tick: number;
  priority_rules: LightningPriorityRule[];
  search_radius: number;
}
export interface LightningRuleBase {
  string: string;
  type:
    | 'impact-soundset'
    | 'prototype'
    | 'id'
    | 'countAsRockForFilteredDeconstruction';
}
export interface LightningShaderConfiguration {
  color: Color;
  distortion: number;
  power: number;
  thickness: number;
}
interface _LimitChestTipTrigger {
  type: 'limit-chest';
}

export type LimitChestTipTrigger = _LimitChestTipTrigger &
  Omit<CountBasedTipTrigger, keyof _LimitChestTipTrigger>;

export function isLimitChestTipTrigger(
  value: unknown,
): value is LimitChestTipTrigger {
  return (value as { type: string }).type === 'limit-chest';
}

interface _LineStyleSpecification {
  border?: BorderImageSet;
  type: 'line_style';
}

export type LineStyleSpecification = _LineStyleSpecification &
  Omit<BaseStyleSpecification, keyof _LineStyleSpecification>;

export function isLineStyleSpecification(
  value: unknown,
): value is LineStyleSpecification {
  return (value as { type: string }).type === 'line_style';
}

interface _LineTriggerItem {
  range: number;
  range_effects?: TriggerEffect;
  type: 'line';
  width: number;
}

export type LineTriggerItem = _LineTriggerItem &
  Omit<TriggerItem, keyof _LineTriggerItem>;

export function isLineTriggerItem(value: unknown): value is LineTriggerItem {
  return (value as { type: string }).type === 'line';
}

export interface LinkedBeltStructure {
  back_patch?: Sprite4Way;
  direction_in?: Sprite4Way;
  direction_in_side_loading?: Sprite4Way;
  direction_out?: Sprite4Way;
  direction_out_side_loading?: Sprite4Way;
  front_patch?: Sprite4Way;
}
interface _ListBoxStyleSpecification {
  item_style?: ButtonStyleSpecification;
  scroll_pane_style?: ScrollPaneStyleSpecification;
  type: 'list_box_style';
}

export type ListBoxStyleSpecification = _ListBoxStyleSpecification &
  Omit<BaseStyleSpecification, keyof _ListBoxStyleSpecification>;

export function isListBoxStyleSpecification(
  value: unknown,
): value is ListBoxStyleSpecification {
  return (value as { type: string }).type === 'list_box_style';
}

export interface LoaderStructure {
  back_patch?: Sprite4Way;
  direction_in?: Sprite4Way;
  direction_out?: Sprite4Way;
  front_patch?: Sprite4Way;
}
/** The items generated when an [EntityWithHealthPrototype](prototype:EntityWithHealthPrototype) is killed. */
export interface LootItem {
  /** Must be `> 0`. */
  count_max?: number;
  count_min?: number;
  /** The item to spawn. */
  item: ItemID;
  /** `0` is 0% and `1` is 100%. Must be `> 0`. */
  probability?: number;
}
interface _LowPowerTipTrigger {
  type: 'low-power';
}

export type LowPowerTipTrigger = _LowPowerTipTrigger &
  Omit<CountBasedTipTrigger, keyof _LowPowerTipTrigger>;

export function isLowPowerTipTrigger(
  value: unknown,
): value is LowPowerTipTrigger {
  return (value as { type: string }).type === 'low-power';
}

export interface MainSound {
  activity_to_speed_modifiers?: ActivityMatchingModifiers;
  activity_to_volume_modifiers?: ActivityMatchingModifiers;
  /** Modifies how far a sound can be heard. Can only be 1 or lower, has to be a positive number. */
  audible_distance_modifier?: number;
  /** Can't be used when `match_progress_to_activity` is true. */
  fade_in_ticks?: number;
  /** Can't be used when `match_progress_to_activity` is true. */
  fade_out_ticks?: number;
  match_progress_to_activity?: boolean;
  match_speed_to_activity?: boolean;
  match_volume_to_activity?: boolean;
  play_for_working_visualisations?: string[];
  /** Modifies how often the sound is played. */
  probability?: number;
  sound?: Sound;
}
interface _ManualTransferTipTrigger {
  type: 'manual-transfer';
}

export type ManualTransferTipTrigger = _ManualTransferTipTrigger &
  Omit<CountBasedTipTrigger, keyof _ManualTransferTipTrigger>;

export function isManualTransferTipTrigger(
  value: unknown,
): value is ManualTransferTipTrigger {
  return (value as { type: string }).type === 'manual-transfer';
}

interface _ManualWireDragTipTrigger {
  match_type_only?: boolean;
  source?: EntityID;
  target?: EntityID;
  type: 'manual-wire-drag';
  wire_type?: 'red' | 'green' | 'copper';
}

export type ManualWireDragTipTrigger = _ManualWireDragTipTrigger &
  Omit<CountBasedTipTrigger, keyof _ManualWireDragTipTrigger>;

export function isManualWireDragTipTrigger(
  value: unknown,
): value is ManualWireDragTipTrigger {
  return (value as { type: string }).type === 'manual-wire-drag';
}

export interface MapEditorConstants {
  cliff_editor_remove_cliffs_color: Color;
  clone_editor_brush_cursor_preview_tint: Color;
  clone_editor_brush_destination_color: Color;
  clone_editor_brush_source_color: Color;
  clone_editor_brush_world_preview_tint: Color;
  clone_editor_copy_destination_allowed_color: Color;
  clone_editor_copy_destination_not_allowed_color: Color;
  clone_editor_copy_source_color: Color;
  decorative_editor_selection_preview_radius: number;
  decorative_editor_selection_preview_tint: Color;
  force_editor_select_area_color: Color;
  script_editor_drag_area_color: Color;
  script_editor_select_area_color: Color;
  tile_editor_area_selection_color: Color;
  tile_editor_selection_preview_radius: number;
  tile_editor_selection_preview_tint: Color;
}
export interface MapGenPreset {
  /** If any setting is not set, it will use the default values. */
  advanced_settings?: AdvancedMapGenSettings;
  /** If any setting is not set, it will use the default values. */
  basic_settings?: MapGenSettings;
  /** Whether this is the default preset. If `true`, this preset may not have any other properties besides this and order.

If no MapGenPreset has `default = true`, the preset selector will have a blank preset label, with default settings. The "blank" preset goes away when another preset is selected. */
  default?: boolean;
  /** Specifies the ordering in the [map generator GUI](https://wiki.factorio.com/Map_generator). */
  order: Order;
}
export interface MapGenPresetAsteroidSettings {
  max_ray_portals_expanded_per_tick?: number;
  spawning_rate?: number;
}
export interface MapGenPresetDifficultySettings {
  technology_price_multiplier?: number;
}
export interface MapGenPresetEnemyEvolutionSettings {
  /** Percentual increase in the evolution factor for every destroyed spawner */
  destroy_factor?: number;
  enabled?: boolean;
  /** Percentual increase in the evolution factor for 1 pollution unit */
  pollution_factor?: number;
  /** Percentual increase in the evolution factor for every second (60 ticks) */
  time_factor?: number;
}
export interface MapGenPresetEnemyExpansionSettings {
  enabled?: boolean;
  /** In ticks. */
  max_expansion_cooldown?: number;
  /** Distance in chunks from the furthest base around. This prevents expansions from reaching too far into the player's territory. */
  max_expansion_distance?: number;
  /** Ticks to expand to a single position for a base is used. Cooldown is calculated as follows: `cooldown = lerp(max_expansion_cooldown, min_expansion_cooldown, -e^2 + 2 * e)` where `lerp` is the linear interpolation function, and e is the current evolution factor. */
  min_expansion_cooldown?: number;
  settler_group_max_size?: number;
  /** Size of the group that goes to build new base (the game interpolates between min size and max size based on evolution factor). */
  settler_group_min_size?: number;
}
/** The pollution settings, the values are for 60 ticks (1 second). */
export interface MapGenPresetPollutionSettings {
  /** Must be >= 0.1. Also known as absorption modifier. */
  ageing?: number;
  /** Must be <= 0.25. Amount that is diffused to neighboring chunks. */
  diffusion_ratio?: number;
  enabled?: boolean;
  /** Must be >= 0.1. */
  enemy_attack_pollution_consumption_modifier?: number;
  min_pollution_to_damage_trees?: number;
  pollution_restored_per_tree_damage?: number;
}
export interface MapGenSettings {
  autoplace_controls?: Record<AutoplaceControlID, FrequencySizeRichness>;
  /** Each setting in this table maps the string type to the settings for that type. */
  autoplace_settings?: Record<
    'entity' | 'tile' | 'decorative',
    AutoplaceSettings
  >;
  cliff_settings?: CliffPlacementSettings;
  /** Whether undefined `autoplace_controls` should fall back to the default controls or not. */
  default_enable_all_autoplace_controls?: boolean;
  /** Height of the map in tiles. Silently limited to 2 000 000, ie. +/- 1 million tiles from the center in both directions. */
  height?: number;
  /** If true, enemy creatures will not naturally spawn from spawners, map gen, or trigger effects. */
  no_enemies_mode?: boolean;
  /** If true, enemy creatures will not attack unless the player first attacks them. */
  peaceful_mode?: boolean;
  /** Map of property name (`"elevation"`, etc) to name of noise expression that will provide it. Entries may be omitted. A notable usage is changing autoplace behavior of an entity based on the preset, which cannot be read from a noise expression. */
  property_expression_names?: Record<string, string | boolean | number>;
  /** Read by the game, but not used or set in the GUI. */
  seed?: number;
  /** Size of the starting area. The starting area only effects enemy placement, and has no effect on resources. */
  starting_area?: MapGenSize;
  /** Array of the positions of the starting areas. */
  starting_points?: MapPosition[];
  territory_settings?: TerritorySettings;
  /** Width of the map in tiles. Silently limited to 2 000 000, ie. +/- 1 million tiles from the center in both directions. */
  width?: number;
}
export interface MapLocation {
  /** Direction this connection point will be facing to. */
  direction: MapPosition;
  /** Position relative to entity's position where the connection point will be located at. */
  position: MapPosition;
}
/** Coordinates of a tile in a map. Positive x goes towards east, positive y goes towards south, and x is the first dimension in the array format.

The coordinates are stored as a fixed-size 32 bit integer, with 8 bits reserved for decimal precision, meaning the smallest value step is `1/2^8 = 0.00390625` tiles. */
interface _MapPosition {
  x: number;
  y: number;
}
/** Used by [TilePrototype](prototype:TilePrototype). */
export interface MaterialTextureParameters {
  /** Frame count. */
  count: number;
  /** Once the specified number of pictures is loaded, other pictures are loaded on other line. This is to allow having longer animations in matrix, to input files with too high width. The game engine limits the width of any input files to 8192px, so it is compatible with most graphics cards. 0 means that all the pictures are in one horizontal line. */
  line_length?: number;
  picture: FileName;
  scale?: number;
  /** Horizontal position of the sprite in the source file in pixels. */
  x?: SpriteSizeType;
  /** Vertical position of the sprite in the source file in pixels. */
  y?: SpriteSizeType;
}
interface _MaxFailedAttemptsPerTickPerConstructionQueueModifier {
  type: 'max-failed-attempts-per-tick-per-construction-queue';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type MaxFailedAttemptsPerTickPerConstructionQueueModifier =
  _MaxFailedAttemptsPerTickPerConstructionQueueModifier &
    Omit<
      SimpleModifier,
      keyof _MaxFailedAttemptsPerTickPerConstructionQueueModifier
    >;

export function isMaxFailedAttemptsPerTickPerConstructionQueueModifier(
  value: unknown,
): value is MaxFailedAttemptsPerTickPerConstructionQueueModifier {
  return (
    (value as { type: string }).type ===
    'max-failed-attempts-per-tick-per-construction-queue'
  );
}

interface _MaxSuccessfulAttemptsPerTickPerConstructionQueueModifier {
  type: 'max-successful-attempts-per-tick-per-construction-queue';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type MaxSuccessfulAttemptsPerTickPerConstructionQueueModifier =
  _MaxSuccessfulAttemptsPerTickPerConstructionQueueModifier &
    Omit<
      SimpleModifier,
      keyof _MaxSuccessfulAttemptsPerTickPerConstructionQueueModifier
    >;

export function isMaxSuccessfulAttemptsPerTickPerConstructionQueueModifier(
  value: unknown,
): value is MaxSuccessfulAttemptsPerTickPerConstructionQueueModifier {
  return (
    (value as { type: string }).type ===
    'max-successful-attempts-per-tick-per-construction-queue'
  );
}

interface _MaximumFollowingRobotsCountModifier {
  /** If set to `false`, use the icon from [UtilitySprites](prototype:UtilitySprites) for this technology effect icon. */
  infer_icon?: boolean;
  type: 'maximum-following-robots-count';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type MaximumFollowingRobotsCountModifier =
  _MaximumFollowingRobotsCountModifier &
    Omit<SimpleModifier, keyof _MaximumFollowingRobotsCountModifier>;

export function isMaximumFollowingRobotsCountModifier(
  value: unknown,
): value is MaximumFollowingRobotsCountModifier {
  return (value as { type: string }).type === 'maximum-following-robots-count';
}

/** The mining properties of objects. For formulas for the mining time, see [mining](https://wiki.factorio.com/Mining). */
export interface MinableProperties {
  /** Only loaded if `results` is not defined.

How many of result are dropped. */
  count?: number;
  /** The amount of fluid that is used up when this object is mined. If this is > 0, this object cannot be mined by hand. */
  fluid_amount?: FluidAmount;
  /** Name of a [ParticlePrototype](prototype:ParticlePrototype). Which set of particles to use. */
  mining_particle?: ParticleID;
  /** How many seconds are required to mine this object at 1 mining speed. */
  mining_time: number;
  mining_trigger?: Trigger;
  /** Name of a [FluidPrototype](prototype:FluidPrototype). The fluid that is used up when this object is mined. */
  required_fluid?: FluidID;
  /** Only loaded if `results` is not defined.

Which item is dropped when this is mined. Cannot be empty. If you want the entity to not be minable, don't specify the minable properties, if you want it to be minable with no result item, don't specify the result at all. */
  result?: ItemID;
  /** The items that are returned when this object is mined. */
  results?: ProductPrototype[];
}
export interface MineEntityTechnologyTrigger {
  entity: EntityID;
  type: 'mine-entity';
}

export function isMineEntityTechnologyTrigger(
  value: unknown,
): value is MineEntityTechnologyTrigger {
  return (value as { type: string }).type === 'mine-entity';
}

interface _MineItemByRobotTipTrigger {
  type: 'mine-item-by-robot';
}

export type MineItemByRobotTipTrigger = _MineItemByRobotTipTrigger &
  Omit<CountBasedTipTrigger, keyof _MineItemByRobotTipTrigger>;

export function isMineItemByRobotTipTrigger(
  value: unknown,
): value is MineItemByRobotTipTrigger {
  return (value as { type: string }).type === 'mine-item-by-robot';
}

interface _MinimapStyleSpecification {
  type: 'minimap_style';
}

export type MinimapStyleSpecification = _MinimapStyleSpecification &
  Omit<EmptyWidgetStyleSpecification, keyof _MinimapStyleSpecification>;

export function isMinimapStyleSpecification(
  value: unknown,
): value is MinimapStyleSpecification {
  return (value as { type: string }).type === 'minimap_style';
}

/** Used by [MiningDrillPrototype](prototype:MiningDrillPrototype). */
interface _MiningDrillGraphicsSet {
  animation_progress?: number;
  /** Render layer(s) for all directions of the circuit connectors. */
  circuit_connector_layer?: RenderLayer | CircuitConnectorLayer;
  /** Secondary draw order(s) for all directions of the circuit connectors. */
  circuit_connector_secondary_draw_order?:
    | number
    | CircuitConnectorSecondaryDrawOrder;
  drilling_vertical_movement_duration?: number;
  frozen_patch?: Sprite4Way;
  reset_animation_when_frozen?: boolean;
}

export type MiningDrillGraphicsSet = _MiningDrillGraphicsSet &
  Omit<WorkingVisualisations, keyof _MiningDrillGraphicsSet>;
interface _MiningDrillProductivityBonusModifier {
  /** If set to `false`, use the icon from [UtilitySprites](prototype:UtilitySprites) for this technology effect icon. */
  infer_icon?: boolean;
  type: 'mining-drill-productivity-bonus';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type MiningDrillProductivityBonusModifier =
  _MiningDrillProductivityBonusModifier &
    Omit<SimpleModifier, keyof _MiningDrillProductivityBonusModifier>;

export function isMiningDrillProductivityBonusModifier(
  value: unknown,
): value is MiningDrillProductivityBonusModifier {
  return (value as { type: string }).type === 'mining-drill-productivity-bonus';
}

interface _MiningWithFluidModifier {
  type: 'mining-with-fluid';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type MiningWithFluidModifier = _MiningWithFluidModifier &
  Omit<BoolModifier, keyof _MiningWithFluidModifier>;

export function isMiningWithFluidModifier(
  value: unknown,
): value is MiningWithFluidModifier {
  return (value as { type: string }).type === 'mining-with-fluid';
}

/** The user-set value of a startup [mod setting](https://wiki.factorio.com/Tutorial:Mod_settings). */
export interface ModSetting {
  /** The value of the mod setting. The type depends on the kind of setting. */
  value: number | boolean | string | Color;
}
interface _ModuleTransferTipTrigger {
  module: ItemID;
  type: 'module-transfer';
}

export type ModuleTransferTipTrigger = _ModuleTransferTipTrigger &
  Omit<CountBasedTipTrigger, keyof _ModuleTransferTipTrigger>;

export function isModuleTransferTipTrigger(
  value: unknown,
): value is ModuleTransferTipTrigger {
  return (value as { type: string }).type === 'module-transfer';
}

/** Defines how this entity connects to its neighbours */
export interface NeighbourConnectable {
  /** If the connection positions and directions will be affected by entity's direction. */
  affected_by_direction?: boolean;
  /** Definitions of the connection points. */
  connections: NeighbourConnectableConnectionDefinition[];
  /** Distance by which connection point is shifted along its direction to select a position where neighbor will be searched. */
  neighbour_search_distance?: number;
}
/** In order for 2 NeighbourConnectable to connect they need to share a connection point at the same position with opposite direction and both accept neighbor's category. */
export interface NeighbourConnectableConnectionDefinition {
  /** Name of a category this connection should belong to. Used when deciding which connections are allowed to connect to this.

Cannot be an empty string. */
  category: NeighbourConnectableConnectionCategory;
  location: MapLocation;
  /** Table of neighbor categories this connection will connect to. */
  neighbour_category?: NeighbourConnectableConnectionCategory[];
}
interface _NestedTriggerEffectItem {
  action: Trigger;
  type: 'nested-result';
}

export type NestedTriggerEffectItem = _NestedTriggerEffectItem &
  Omit<TriggerEffectItem, keyof _NestedTriggerEffectItem>;

export function isNestedTriggerEffectItem(
  value: unknown,
): value is NestedTriggerEffectItem {
  return (value as { type: string }).type === 'nested-result';
}

/** The advantage of noise functions over [noise expressions](prototype:NoiseExpression) is that they have parameters. */
export interface NoiseFunction {
  expression: NoiseExpression;
  /** A map of expression name to expression.

Local expressions are meant to store data locally similar to local variables in Lua. Their purpose is to hold noise expressions used multiple times in the named noise expression, or just to tell the reader that the local expression has a specific purpose. Local expressions can access other local definitions and also function parameters, but recursive definitions aren't supported. */
  local_expressions?: Record<string, NoiseExpression>;
  /** A map of function name to function.

Local functions serve the same purpose as local expressions - they aren't visible outside of the specific prototype and they have access to other local definitions. */
  local_functions?: Record<string, NoiseFunction>;
  /** The order of the parameters matters because functions can also be called with positional arguments.

A function can't have more than 255 parameters. */
  parameters: string[];
}
interface _NothingModifier {
  effect_description?: LocalisedString;
  type: 'nothing';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type NothingModifier = _NothingModifier &
  Omit<BaseModifier, keyof _NothingModifier>;

export function isNothingModifier(value: unknown): value is NothingModifier {
  return (value as { type: string }).type === 'nothing';
}

export interface OffshorePumpGraphicsSet {
  /** Rendered in "object" layer, with secondary draw order 0. */
  animation?: Animation4Way;
  /** Rendered in layer specified by `base_render_layer`, with secondary draw order 0. */
  base_pictures?: Sprite4Way;
  base_render_layer?: RenderLayer;
  /** Rendered in "object" layer, with secondary draw order 20. */
  fluid_animation?: Animation4Way;
  /** Rendered in "object" layer, with secondary draw order 40. */
  glass_pictures?: Sprite4Way;
  underwater_layer_offset?: number;
  /** Drawn by tile renderer when water animation is enabled. */
  underwater_pictures?: Sprite4Way;
}
export interface OrTipTrigger {
  /** If at least one of the triggers is fulfilled, this trigger is considered fulfilled. */
  triggers: TipTrigger[];
  type: 'or';
}

export function isOrTipTrigger(value: unknown): value is OrTipTrigger {
  return (value as { type: string }).type === 'or';
}

export interface OrientedCliffPrototype {
  collision_bounding_box: BoundingBox;
  pictures?: SpriteVariations;
  pictures_lower?: SpriteVariations;
  render_layer?: RenderLayer;
}
export interface OrientedCliffPrototypeSet {
  east_to_none: OrientedCliffPrototype;
  east_to_north: OrientedCliffPrototype;
  east_to_south: OrientedCliffPrototype;
  east_to_west: OrientedCliffPrototype;
  none_to_east: OrientedCliffPrototype;
  none_to_north: OrientedCliffPrototype;
  none_to_south: OrientedCliffPrototype;
  none_to_west: OrientedCliffPrototype;
  north_to_east: OrientedCliffPrototype;
  north_to_none: OrientedCliffPrototype;
  north_to_south: OrientedCliffPrototype;
  north_to_west: OrientedCliffPrototype;
  south_to_east: OrientedCliffPrototype;
  south_to_none: OrientedCliffPrototype;
  south_to_north: OrientedCliffPrototype;
  south_to_west: OrientedCliffPrototype;
  west_to_east: OrientedCliffPrototype;
  west_to_none: OrientedCliffPrototype;
  west_to_north: OrientedCliffPrototype;
  west_to_south: OrientedCliffPrototype;
}
export interface OtherColors {
  bar?: ElementImageSet;
  color?: Color;
  less_than: number;
}
interface _PasteEntitySettingsTipTrigger {
  match_type_only?: boolean;
  source?: EntityID;
  target?: EntityID;
  type: 'paste-entity-settings';
}

export type PasteEntitySettingsTipTrigger = _PasteEntitySettingsTipTrigger &
  Omit<CountBasedTipTrigger, keyof _PasteEntitySettingsTipTrigger>;

export function isPasteEntitySettingsTipTrigger(
  value: unknown,
): value is PasteEntitySettingsTipTrigger {
  return (value as { type: string }).type === 'paste-entity-settings';
}

export interface PathFinderSettings {
  /** When looking for path from cache make sure it doesn't end too far from requested end. This is typically higher than accept value for the start because the end target can be moving. */
  cache_accept_path_end_distance_ratio: number;
  /** When looking for path from cache make sure it doesn't start too far from requested start in relative distance terms. */
  cache_accept_path_start_distance_ratio: number;
  /** When searching for connection to path cache path, search at most for this number of steps times the initial estimate. */
  cache_max_connect_to_cache_steps_multiplier: number;
  /** When assigning rating to the best path this * end distances is considered. This is typically higher than value for the start to achieve better path end quality. */
  cache_path_end_distance_rating_multiplier: number;
  /** When assigning rating to the best path this * start distances is considered. */
  cache_path_start_distance_rating_multiplier: number;
  /** This is the "threshold" to decide what is short and what is not. */
  direct_distance_to_consider_short_request: number;
  /** Enemy is not moving/or is too close and has different destination. */
  enemy_with_different_destination_collision_penalty: number;
  /** Collision penalty for collisions in the extended bounding box but outside the entity's actual bounding box. */
  extended_collision_penalty: number;
  /** The pathfinder performs a step of the backward search every `fwd2bwd_ratio`'th step. The minimum allowed value is 2, which means symmetric search. */
  fwd2bwd_ratio: number;
  /** Simplification for now; collision with everything else is this. */
  general_entity_collision_penalty: number;
  /** Collision penalty for successors of positions that require destroy to reach. */
  general_entity_subsequent_collision_penalty: number;
  /** When comparing nodes in open which one to check next, heuristic value is multiplied by this ratio. The higher the number the more is the search directed directly towards the goal. */
  goal_pressure_ratio: number;
  /** If there is a moving unit further than this we don't really care. */
  ignore_moving_enemy_collision_distance: number;
  /** Minimal distance to goal for path to be searched in long path cache. */
  long_cache_min_cacheable_distance: number;
  long_cache_size: number;
  /** Up until this amount any client will be served by the path finder (no estimate on the path length). */
  max_clients_to_accept_any_new_request: number;
  /** From max_clients_to_accept_any_new_request till this one only those that have a short estimate will be served. */
  max_clients_to_accept_short_new_request: number;
  /** When this is exhausted no more requests are allowed, at the moment the first path to exhaust this will be finished (even if it is hundreds of steps). */
  max_steps_worked_per_tick: number;
  max_work_done_per_tick: number;
  /** Absolute minimum of steps that will be performed for every path find request no matter what. */
  min_steps_to_check_path_find_termination: number;
  /** Same as cache_accept_path_end_distance_ratio, but used for negative cache queries. */
  negative_cache_accept_path_end_distance_ratio: number;
  /** Same as cache_accept_path_start_distance_ratio, but used for negative cache queries. */
  negative_cache_accept_path_start_distance_ratio: number;
  negative_path_cache_delay_interval: number;
  overload_levels: number[];
  overload_multipliers: number[];
  /** Minimal number of algorithm steps for path to be inserted into the short path cache. */
  short_cache_min_algo_steps_to_cache: number;
  /** Minimal distance to goal for path to be searched in short path cache. */
  short_cache_min_cacheable_distance: number;
  /** Number of elements in the cache. */
  short_cache_size: number;
  /** If a short request takes more than this many steps, it will be rescheduled as a long request. */
  short_request_max_steps: number;
  /** How many steps will be allocated to short requests each tick, as a ratio of all available steps per tick. */
  short_request_ratio: number;
  /** Somewhere along the path is stuck enemy we need to avoid. This is mainly to handle situations when units have arrived and are attacking the target then units further in the back will use this and run around the target. */
  stale_enemy_with_same_destination_collision_penalty: number;
  /** If the current actual cost from start is higher than this times estimate of start to goal then path finding is terminated. */
  start_to_goal_cost_multiplier_to_terminate_path_find: number;
  use_path_cache: boolean;
}
export interface PerceivedPerformance {
  maximum?: number;
  /** Must be less than or equal to `maximum`. */
  minimum?: number;
  performance_to_activity_rate?: number;
}
interface _PersistentWorldAmbientSoundDefinition {
  sound: Sound;
}
export interface PersistentWorldAmbientSoundsDefinition {
  /** Mandatory if `crossfade` is defined. */
  base_ambience?:
    | PersistentWorldAmbientSoundDefinition
    | PersistentWorldAmbientSoundDefinition[];
  crossfade?: PersistentWorldAmbientSoundsDefinitionCrossfade;
  semi_persistent?:
    | SemiPersistentWorldAmbientSoundDefinition
    | SemiPersistentWorldAmbientSoundDefinition[];
  /** Mandatory if `crossfade` is defined. */
  wind?:
    | PersistentWorldAmbientSoundDefinition
    | PersistentWorldAmbientSoundDefinition[];
}
interface _PersistentWorldAmbientSoundsDefinitionCrossfade {
  order: ['wind' | 'base_ambience', 'wind' | 'base_ambience'];
}

export type PersistentWorldAmbientSoundsDefinitionCrossfade =
  _PersistentWorldAmbientSoundsDefinitionCrossfade &
    Omit<Fade, keyof _PersistentWorldAmbientSoundsDefinitionCrossfade>;
export interface PipeConnectionDefinition {
  /** Connection category bitmask makes it possible to define different categories of pipe connections that are not able to connect with each other. For example if a mod should have a "steam pipes" and "cryogenic pipes" category and they should not connect with each other.

In case of a normal connection, a bitmask may contain multiple bits set. This allows to create a mod where pipes of different categories would not connect to each other while still making it possible for crafting machines and other entities to connect to any of the specified pipes.

By default, all pipe connections have the `"default"` category. So a pipe that should connect to a new category and standard pipes can have the `connection_category = {"my-new-pipe", "default"}`.

May have at most one category when `connection_type` is `"underground"`.

Only loaded if `connection_type` is `"normal"` or `"underground"`. */
  connection_category?: string | string[];
  /** Selects set of rules to follow when looking for other FluidBox this connection should connect to. */
  connection_type?: PipeConnectionType;
  /** Primary direction this connection points to when entity direction is north and the entity is not mirrored. When entity is rotated or mirrored, effective direction will be computed based on this value.

Only loaded, and mandatory if `connection_type` is `"normal"` or `"underground"`. */
  direction?: Direction;
  /** Array of the [WorkingVisualisation::name](prototype:WorkingVisualisation::name) of working visualisations to enable when this pipe connection is present.

If the owning fluidbox has [draw_only_when_connected](prototype:FluidBox::draw_only_when_connected) set to `true`, then the working visualisation is only enabled if this pipe connection is *connected*. */
  enable_working_visualisations?: string[];
  /** Allowed direction of fluid flow at this connection. Pipeline entities (`pipe`, `pipe-to-ground`, and `storage-tank`) do not support this property. */
  flow_direction?: 'input-output' | 'input' | 'output';
  /** Expected to be unique inside of a single entity. Used to uniquely identify where a linked connection should connect to.

Only loaded, and mandatory if `connection_type` is `"linked"`. */
  linked_connection_id?: FluidBoxLinkedConnectionID;
  /** Only loaded if `connection_type` is `"underground"`. */
  max_distance_tint?: Color;
  /** Only loaded if `connection_type` is `"underground"`. */
  max_underground_distance?: number;
  /** Position relative to entity's center where pipes can connect to this fluidbox regardless the directions of entity.

Only loaded if `connection_type` is `"normal"` or `"underground"`. */
  position?: MapPosition;
  /** The 4 separate positions corresponding to the 4 main directions of entity. Positions must correspond to directions going one after another.

This is used for example by "pumpjack" where connections are consistently near bottom-left corner (2 directions) or near top-right corner (2 directions).

Only loaded, and mandatory if `position` is not defined and if `connection_type` is `"normal"` or `"underground"`. */
  positions?: [MapPosition, MapPosition, MapPosition, MapPosition];
  /** An underground connection may be defined as colliding with tiles in which case if any tile is placed between underground ends the connection will not be established.

In order to connect, both ends must have the same collision mask specified.

Only loaded if `connection_type` is `"underground"`. */
  underground_collision_mask?: CollisionMaskConnector;
}
export interface PipePictures {
  corner_down_left?: Sprite;
  corner_down_left_disabled_visualization?: Sprite;
  corner_down_left_frozen?: Sprite;
  corner_down_left_visualization?: Sprite;
  corner_down_right?: Sprite;
  corner_down_right_disabled_visualization?: Sprite;
  corner_down_right_frozen?: Sprite;
  corner_down_right_visualization?: Sprite;
  corner_up_left?: Sprite;
  corner_up_left_disabled_visualization?: Sprite;
  corner_up_left_frozen?: Sprite;
  corner_up_left_visualization?: Sprite;
  corner_up_right?: Sprite;
  corner_up_right_disabled_visualization?: Sprite;
  corner_up_right_frozen?: Sprite;
  corner_up_right_visualization?: Sprite;
  cross?: Sprite;
  cross_disabled_visualization?: Sprite;
  cross_frozen?: Sprite;
  cross_visualization?: Sprite;
  ending_down?: Sprite;
  ending_down_disabled_visualization?: Sprite;
  ending_down_frozen?: Sprite;
  ending_down_visualization?: Sprite;
  ending_left?: Sprite;
  ending_left_disabled_visualization?: Sprite;
  ending_left_frozen?: Sprite;
  ending_left_visualization?: Sprite;
  ending_right?: Sprite;
  ending_right_disabled_visualization?: Sprite;
  ending_right_frozen?: Sprite;
  ending_right_visualization?: Sprite;
  ending_up?: Sprite;
  ending_up_disabled_visualization?: Sprite;
  ending_up_frozen?: Sprite;
  ending_up_visualization?: Sprite;
  fluid_background?: Sprite;
  /** Visualizes the flow of the fluid in the pipe. Drawn when the fluid's temperature is above [FluidPrototype::gas_temperature](prototype:FluidPrototype::gas_temperature). */
  gas_flow?: Animation;
  /** Visualizes the flow of the fluid in the pipe. Drawn when `(fluid_temp - fluid_min_temp) / (fluid_max_temp - fluid_min_temp)` is larger than `2/3` and the fluid's temperature is below [FluidPrototype::gas_temperature](prototype:FluidPrototype::gas_temperature). */
  high_temperature_flow?: Sprite;
  horizontal_window_background?: Sprite;
  /** Visualizes the flow of the fluid in the pipe. Drawn when `(fluid_temp - fluid_min_temp) / (fluid_max_temp - fluid_min_temp)` is less than or equal to `1/3` and the fluid's temperature is below [FluidPrototype::gas_temperature](prototype:FluidPrototype::gas_temperature). */
  low_temperature_flow?: Sprite;
  /** Visualizes the flow of the fluid in the pipe. Drawn when `(fluid_temp - fluid_min_temp) / (fluid_max_temp - fluid_min_temp)` is larger than `1/3` and less than or equal to `2/3` and the fluid's temperature is below [FluidPrototype::gas_temperature](prototype:FluidPrototype::gas_temperature). */
  middle_temperature_flow?: Sprite;
  straight_horizontal?: Sprite;
  straight_horizontal_disabled_visualization?: Sprite;
  straight_horizontal_frozen?: Sprite;
  straight_horizontal_visualization?: Sprite;
  straight_horizontal_window?: Sprite;
  straight_horizontal_window_disabled_visualization?: Sprite;
  straight_horizontal_window_frozen?: Sprite;
  straight_horizontal_window_visualization?: Sprite;
  straight_vertical?: Sprite;
  straight_vertical_disabled_visualization?: Sprite;
  straight_vertical_frozen?: Sprite;
  straight_vertical_single?: Sprite;
  straight_vertical_single_disabled_visualization?: Sprite;
  straight_vertical_single_frozen?: Sprite;
  straight_vertical_single_visualization?: Sprite;
  straight_vertical_visualization?: Sprite;
  straight_vertical_window?: Sprite;
  straight_vertical_window_disabled_visualization?: Sprite;
  straight_vertical_window_frozen?: Sprite;
  straight_vertical_window_visualization?: Sprite;
  t_down?: Sprite;
  t_down_disabled_visualization?: Sprite;
  t_down_frozen?: Sprite;
  t_down_visualization?: Sprite;
  t_left?: Sprite;
  t_left_disabled_visualization?: Sprite;
  t_left_frozen?: Sprite;
  t_left_visualization?: Sprite;
  t_right?: Sprite;
  t_right_disabled_visualization?: Sprite;
  t_right_frozen?: Sprite;
  t_right_visualization?: Sprite;
  t_up?: Sprite;
  t_up_disabled_visualization?: Sprite;
  t_up_frozen?: Sprite;
  t_up_visualization?: Sprite;
  vertical_window_background?: Sprite;
}
export interface PlaceAsTile {
  condition: CollisionMaskConnector;
  condition_size: number;
  invert?: boolean;
  result: TileID;
  tile_condition?: TileID[];
}
interface _PlaceEquipmentTipTrigger {
  equipment?: EquipmentID;
  type: 'place-equipment';
}

export type PlaceEquipmentTipTrigger = _PlaceEquipmentTipTrigger &
  Omit<CountBasedTipTrigger, keyof _PlaceEquipmentTipTrigger>;

export function isPlaceEquipmentTipTrigger(
  value: unknown,
): value is PlaceEquipmentTipTrigger {
  return (value as { type: string }).type === 'place-equipment';
}

export interface PlanTrainPathTipTrigger {
  distance: number;
  type: 'plan-train-path';
}

export function isPlanTrainPathTipTrigger(
  value: unknown,
): value is PlanTrainPathTipTrigger {
  return (value as { type: string }).type === 'plan-train-path';
}

export interface PlanetPrototypeMapGenSettings {
  autoplace_controls?: Record<AutoplaceControlID, FrequencySizeRichness>;
  /** Each setting in this table maps the string type to the settings for that type. */
  autoplace_settings?: Record<
    'entity' | 'tile' | 'decorative',
    AutoplaceSettings
  >;
  /** Used for showing the planet icon in map generator GUI next to aux climate control. */
  aux_climate_control?: boolean;
  cliff_settings?: CliffPlacementSettings;
  /** Used for showing the planet icon in map generator GUI next to moisture climate control. */
  moisture_climate_control?: boolean;
  /** Map of property name (e.g. "elevation") to name of noise expression that will provide it. Entries may be omitted. A notable usage is changing autoplace behavior of an entity based on the preset, which cannot be read from a noise expression. */
  property_expression_names?: Record<string, string | boolean | number>;
  territory_settings?: TerritorySettings;
}
interface _PlaySoundTriggerEffectItem {
  /** Negative values are silently clamped to 0. */
  audible_distance_modifier?: number;
  /** Negative values are silently clamped to 0. */
  max_distance?: number;
  /** Negative values are silently clamped to 0. */
  min_distance?: number;
  play_on_target_position?: boolean;
  sound: Sound;
  type: 'play-sound';
  /** Negative values are silently clamped to 0. */
  volume_modifier?: number;
}

export type PlaySoundTriggerEffectItem = _PlaySoundTriggerEffectItem &
  Omit<TriggerEffectItem, keyof _PlaySoundTriggerEffectItem>;

export function isPlaySoundTriggerEffectItem(
  value: unknown,
): value is PlaySoundTriggerEffectItem {
  return (value as { type: string }).type === 'play-sound';
}

export interface PlayerColorData {
  chat_color: Color;
  name: string;
  player_color: Color;
}
interface _PlumeEffect {
  age_discrimination?: number;
}

export type PlumeEffect = _PlumeEffect &
  Omit<StatelessVisualisation, keyof _PlumeEffect>;
export interface PlumesSpecification {
  max_probability?: number;
  max_y_offset?: number;
  min_probability?: number;
  min_y_offset?: number;
  /** Array may not be empty and may at most have 255 elements.

Non-zero `period` needs to be provided. May not have `positions` or `particle_tick_offset`. */
  stateless_visualisations?: PlumeEffect | PlumeEffect[];
}
/** One frame in time for a Bezier interpolation. */
export interface PodAnimationProcessionBezierControlPoint {
  /** the frame of the pod animation played. */
  frame: number;
  timestamp: MapTick;
}
export interface PodAnimationProcessionLayer {
  frames: PodAnimationProcessionBezierControlPoint[];
  graphic?: ProcessionGraphic;
  type: 'pod-animation';
}

export function isPodAnimationProcessionLayer(
  value: unknown,
): value is PodAnimationProcessionLayer {
  return (value as { type: string }).type === 'pod-animation';
}

/** One frame in time for a Bezier interpolation. */
export interface PodDistanceTraveledProcessionBezierControlPoint {
  /** `distance` and `distance_t` interpolate a double smoothly over time. */
  distance?: number;
  /** Bidirectional tangent at the given timestamp. */
  distance_t?: number;
  /** Mandatory if `distance` is defined. */
  timestamp?: MapTick;
}
export interface PodDistanceTraveledProcessionLayer {
  contribute_to_distance_traveled?: boolean;
  distance_traveled_contribution?: number;
  frames: PodDistanceTraveledProcessionBezierControlPoint[];
  /** The group this layer belongs to, for inheritance. */
  reference_group?: ProcessionLayerInheritanceGroupID;
  type: 'pod-distance-traveled';
}

export function isPodDistanceTraveledProcessionLayer(
  value: unknown,
): value is PodDistanceTraveledProcessionLayer {
  return (value as { type: string }).type === 'pod-distance-traveled';
}

/** One frame in time for a Bezier interpolation. */
export interface PodMovementProcessionBezierControlPoint {
  /** `offset` and `offset_t` interpolate a vector smoothly over time using `offset_rate` and `offset_rate_t` for a 0-1 rate curve.

Vector value. */
  offset?: Vector;
  /** Rate 0-1 value. */
  offset_rate?: number;
  /** Rate tangent. */
  offset_rate_t?: number;
  /** Vector tangent. */
  offset_t?: Vector;
  /** `tilt` and `tilt_t` interpolate a double smoothly over time. */
  tilt?: number;
  /** Bidirectional tangent at the given timestamp. */
  tilt_t?: number;
  /** Mandatory if `tilt` is defined. */
  timestamp?: MapTick;
}
export interface PodMovementProcessionLayer {
  contribute_to_distance_traveled?: boolean;
  distance_traveled_contribution?: number;
  frames: PodMovementProcessionBezierControlPoint[];
  /** Adds the final position value from given layer to this one. */
  inherit_from?: ProcessionLayerInheritanceGroupID;
  /** The group this layer belongs to, for inheritance. */
  reference_group?: ProcessionLayerInheritanceGroupID;
  type: 'pod-movement';
}

export function isPodMovementProcessionLayer(
  value: unknown,
): value is PodMovementProcessionLayer {
  return (value as { type: string }).type === 'pod-movement';
}

/** One frame in time for a Bezier interpolation. */
export interface PodOpacityProcessionBezierControlPoint {
  /** `cutscene_opacity` and `cutscene_opacity_t` interpolate a double smoothly over time. */
  cutscene_opacity?: number;
  /** Bidirectional tangent at the given timestamp. */
  cutscene_opacity_t?: number;
  /** `lut_blend` and `lut_blend_t` interpolate a double smoothly over time.

LUT won't be overridden however, until the pod is drawn above the game via `draw_switch_tick`. */
  lut_blend?: number;
  /** Bidirectional tangent at the given timestamp. */
  lut_blend_t?: number;
  /** `outside_opacity` and `outside_opacity_t` interpolate a double smoothly over time. */
  outside_opacity?: number;
  /** Bidirectional tangent at the given timestamp. */
  outside_opacity_t?: number;
  /** Mandatory if `cutscene_opacity` or `outside_opacity` is defined. */
  timestamp?: MapTick;
}
export interface PodOpacityProcessionLayer {
  /** Default values if unspecified:

- cutscene_opacity : 1.0

- outside_opacity : 1.0

- lut_blend : 0.0

- environment_volume : 1.0

- environment_muffle_intensity : 0.0 */
  frames: PodOpacityProcessionBezierControlPoint[];
  lut: ColorLookupTable;
  type: 'pod-opacity';
}

export function isPodOpacityProcessionLayer(
  value: unknown,
): value is PodOpacityProcessionLayer {
  return (value as { type: string }).type === 'pod-opacity';
}

/** The pollution settings, the values are for 60 ticks (1 second). */
export interface PollutionSettings {
  /** Constant modifier a percentage of 1; the pollution eaten by a chunks tiles. Also known as absorption modifier. */
  ageing: number;
  /** Amount that is diffused to neighboring chunks. */
  diffusion_ratio: number;
  enabled: boolean;
  enemy_attack_pollution_consumption_modifier: number;
  /** Anything bigger than this is visualized as this value. */
  expected_max_per_chunk: number;
  max_pollution_to_restore_trees: number;
  min_pollution_to_damage_trees: number;
  /** This much pollution units must be on the chunk to start diffusing. */
  min_to_diffuse: number;
  /** Anything lower than this (but > 0) is visualized as this value. */
  min_to_show_per_chunk: number;
  pollution_per_tree_damage: number;
  pollution_restored_per_tree_damage: number;
  pollution_with_max_forest_damage: number;
}
export interface ProcessionAudio {
  /** Mandatory if `type` is `"pod_catalogue"` or `type` is `"location_catalogue"`. */
  catalogue_id?: number;
  /** Mandatory if `type` is `"looped-sound"`. */
  looped_sound?: InterruptibleSound;
  /** Mandatory if `type` is `"sound"`. */
  sound?: Sound;
  type: ProcessionAudioType;
}
export interface ProcessionAudioCatalogueItem {
  index: number;
  /** One or the other. */
  looped_sound?: InterruptibleSound;
  /** One or the other. */
  sound?: Sound;
}
/** Controls sounds during procession. */
export interface ProcessionAudioEvent {
  /** Has to be defined unless the type is "stop-looped-sound". */
  audio?: ProcessionAudio;
  /** Has to be defined unless the type is "play-sound". */
  loop_id?: number;
  type: ProcessionAudioEventType;
  /** Has to be defined unless the type is "stop-looped-sound". */
  usage?: ProcessionAudioUsage;
}
export interface ProcessionGraphic {
  /** Mandatory if `type` is `"animation"`. */
  animation?: Animation;
  /** Mandatory if `type` is `"pod-catalogue"` or `type` is `"location-catalogue"`. */
  catalogue_id?: number;
  /** Mandatory if `type` is `"sprite"`. */
  sprite?: Sprite;
  type: ProcessionGraphicType;
}
/** Either picture or animation must be provided. */
export interface ProcessionGraphicCatalogueItem {
  animation?: Animation;
  index: number;
  picture?: Sprite;
}
/** Lists arrivals and departures available for travel to a given surface. */
export interface ProcessionSet {
  arrival: ProcessionID[];
  departure: ProcessionID[];
}
/** A wrapper for a collection of [ProcessionLayers](prototype:ProcessionLayer). */
export interface ProcessionTimeline {
  audio_events: ProcessionAudioEvent[];
  /** During procession, the pod will at some point start being drawn above the rest of the game:

- When ascending this tick will go from world to above.

- When descending this tick will go from above to world.

Notably, LUT override won't be applied until the pod is drawn above the game. */
  draw_switch_tick?: MapTick;
  /** The time to play this cutscene regardless of individual layer durations. */
  duration: MapTick;
  /** The real duration of the intermezzo playing will be below this value. */
  intermezzo_max_duration?: MapTick;
  /** The real duration of the intermezzo playing will be above this value. */
  intermezzo_min_duration?: MapTick;
  layers: ProcessionLayer[];
  /** Time to initiate usage specific actions:

- Ascending animation will detach from rocket on this tick.

- Descending animation will request hatch to be opened. */
  special_action_tick?: MapTick;
}
export interface ProductionHealthEffect {
  not_producing?: number;
  producing?: number;
}
export interface ProgrammableSpeakerInstrument {
  name: string;
  /** Cannot be an empty array. */
  notes: ProgrammableSpeakerNote[];
}
export interface ProgrammableSpeakerNote {
  name: string;
  /** Cannot contain aggregation. */
  sound: Sound;
}
interface _ProgressBarStyleSpecification {
  bar?: ElementImageSet;
  bar_background?: ElementImageSet;
  bar_width?: number;
  color?: Color;
  embed_text_in_bar?: boolean;
  filled_font_color?: Color;
  /** Name of a [FontPrototype](prototype:FontPrototype). */
  font?: string;
  font_color?: Color;
  other_colors?: OtherColors[];
  side_text_padding?: number;
  type: 'progressbar_style';
}

export type ProgressBarStyleSpecification = _ProgressBarStyleSpecification &
  Omit<BaseStyleSpecification, keyof _ProgressBarStyleSpecification>;

export function isProgressBarStyleSpecification(
  value: unknown,
): value is ProgressBarStyleSpecification {
  return (value as { type: string }).type === 'progressbar_style';
}

interface _ProjectileAttackParameters {
  apply_projection_to_projectile_creation_position?: boolean;
  /** When used with `projectile_creation_parameters`, this offsets what the turret's sprite looks at. Setting to `{0,1}` will cause the turret to aim one tile up from the target but the projectile will still aim for the entity. Can be used to give the illusion of height but can also confuse aim logic when set too high.

When used without `projectile_creation_parameters`, this sets the turret's rotation axis. */
  projectile_center?: Vector;
  projectile_creation_distance?: number;
  /** Used to shoot from multiple points. The turret will look at the enemy as normal but the bullet will spawn from a random offset position. Can be used to create multi-barreled weapons. */
  projectile_creation_offsets?: Vector[];
  /** Used to shoot projectiles from arbitrary points. Used by worms. If not set then the launch positions are calculated using `projectile_center` and `projectile_creation_distance`. */
  projectile_creation_parameters?: CircularProjectileCreationSpecification;
  /** Used to shoot from different sides of the turret. Setting to `0.25` shoots from the right side, `0.5` shoots from the back, and `0.75` shoots from the left. The turret will look at the enemy as normal but the bullet will spawn from the offset position. Can be used to create right-handed weapons. */
  projectile_orientation_offset?: RealOrientation;
  /** Used to show bullet shells/casings being ejected from the gun, see [artillery shell casings](https://factorio.com/blog/post/fff-345). */
  shell_particle?: CircularParticleCreationSpecification;
  type: 'projectile';
}

export type ProjectileAttackParameters = _ProjectileAttackParameters &
  Omit<BaseAttackParameters, keyof _ProjectileAttackParameters>;

export function isProjectileAttackParameters(
  value: unknown,
): value is ProjectileAttackParameters {
  return (value as { type: string }).type === 'projectile';
}

interface _ProjectileTriggerDelivery {
  /** Maximum deviation of the projectile from source orientation, in +/- (`x radians / 2`). Example: `3.14 radians -> +/- (180° / 2)`, meaning up to 90° deviation in either direction of rotation. */
  direction_deviation?: number;
  max_range?: number;
  min_range?: number;
  /** Name of a [ProjectilePrototype](prototype:ProjectilePrototype). */
  projectile: EntityID;
  /** The maximum deviation of the projectile maximum range from `max_range` is `max_range × range_deviation ÷ 2`. This means a deviation of `0.5` will appear as a maximum of `0.25` (25%) deviation of an initial range goal. Post-deviation range may exceed `max_range` or be less than `min_range`. */
  range_deviation?: number;
  /** Starting speed in tiles per tick. */
  starting_speed: number;
  starting_speed_deviation?: number;
  type: 'projectile';
}

export type ProjectileTriggerDelivery = _ProjectileTriggerDelivery &
  Omit<TriggerDeliveryItem, keyof _ProjectileTriggerDelivery>;

export function isProjectileTriggerDelivery(
  value: unknown,
): value is ProjectileTriggerDelivery {
  return (value as { type: string }).type === 'projectile';
}

/** Used by [UnitPrototype](prototype:UnitPrototype). */
export interface PrototypeStrafeSettings {
  /** Must be between 0 and 1 inclusive. */
  clockwise_chance?: number;
  face_target?: boolean;
  /** Must be between 0 and max_distance inclusive. */
  ideal_distance?: number;
  /** Must be between between 0 and 1 inclusive. */
  ideal_distance_importance?: number;
  /** Must be between 0 and ideal_distance_importance inclusive. */
  ideal_distance_importance_variance?: number;
  /** Must be >= `0`. */
  ideal_distance_tolerance?: number;
  /** Must be >= `0`. */
  ideal_distance_variance?: number;
  /** Must be >= `0`. */
  max_distance?: number;
}
export interface PuddleTileEffectParameters {
  puddle_noise_texture: EffectTexture;
  /** Only loaded, and mandatory if `water_effect_parameters` is not defined. Must be name of a [TileEffectDefinition](prototype:TileEffectDefinition) which has `shader` set to `"water"`. */
  water_effect?: TileEffectDefinitionID;
  water_effect_parameters?: WaterTileEffectParameters;
}
/** A mapping of arrays of [PumpConnectorGraphicsAnimations](prototype:PumpConnectorGraphicsAnimation) to all 4 directions of the pump connection (to a fluid wagon). */
export interface PumpConnectorGraphics {
  /** Size of the array must be 6 or more. */
  east: PumpConnectorGraphicsAnimation[];
  /** Size of the array must be 6 or more. */
  north: PumpConnectorGraphicsAnimation[];
  /** Size of the array must be 6 or more. */
  south: PumpConnectorGraphicsAnimation[];
  /** Size of the array must be 6 or more. */
  west: PumpConnectorGraphicsAnimation[];
}
export interface PumpConnectorGraphicsAnimation {
  connector?: Animation;
  connector_shadow?: Animation;
  standup_base?: Animation;
  standup_shadow?: Animation;
  standup_top?: Animation;
}
/** The push back effect used by the [discharge defense](https://wiki.factorio.com/Discharge_defense).

Aims to push the target entity away from the source entity by the `distance` from the target entity's current position. Searches within double the `distance` from the pushed to position for the nearest non-colliding position for the target entity to be teleported too. If no valid non-colliding position is found or the target is not teleportable, then no push back occurs. */
interface _PushBackTriggerEffectItem {
  distance: number;
  type: 'push-back';
}

export type PushBackTriggerEffectItem = _PushBackTriggerEffectItem &
  Omit<TriggerEffectItem, keyof _PushBackTriggerEffectItem>;

export function isPushBackTriggerEffectItem(
  value: unknown,
): value is PushBackTriggerEffectItem {
  return (value as { type: string }).type === 'push-back';
}

interface _RadioButtonStyleSpecification {
  disabled_font_color?: Color;
  /** Name of a [FontPrototype](prototype:FontPrototype). */
  font?: string;
  font_color?: Color;
  text_padding?: number;
  type: 'radiobutton_style';
}

export type RadioButtonStyleSpecification = _RadioButtonStyleSpecification &
  Omit<
    StyleWithClickableGraphicalSetSpecification,
    keyof _RadioButtonStyleSpecification
  >;

export function isRadioButtonStyleSpecification(
  value: unknown,
): value is RadioButtonStyleSpecification {
  return (value as { type: string }).type === 'radiobutton_style';
}

/** Sprite to be shown around the entity when it is selected/held in the cursor. */
export interface RadiusVisualisationSpecification {
  /** Must be greater than or equal to 0. */
  distance?: number;
  draw_in_cursor?: boolean;
  draw_on_selection?: boolean;
  offset?: Vector;
  sprite?: Sprite;
}
export interface RailFenceDirectionSet {
  east?: SpriteVariations;
  north?: SpriteVariations;
  northeast?: SpriteVariations;
  northwest?: SpriteVariations;
  south?: SpriteVariations;
  southeast?: SpriteVariations;
  southwest?: SpriteVariations;
  west?: SpriteVariations;
}
/** Used for graphics by [RailPrototype](prototype:RailPrototype). */
export interface RailFenceGraphicsSet {
  back_fence_render_layer?: RenderLayer;
  back_fence_render_layer_secondary?: RenderLayer;
  front_fence_render_layer?: RenderLayer;
  front_fence_render_layer_secondary?: RenderLayer;
  /** Must be 2 or 4. */
  segment_count: number;
  side_A: RailFencePictureSet;
  side_B: RailFencePictureSet;
}
export interface RailFencePictureSet {
  ends: [
    RailFenceDirectionSet,
    RailFenceDirectionSet,
    RailFenceDirectionSet,
    RailFenceDirectionSet,
  ];
  ends_upper?: [
    RailFenceDirectionSet,
    RailFenceDirectionSet,
    RailFenceDirectionSet,
    RailFenceDirectionSet,
  ];
  fence: RailFenceDirectionSet;
  fence_upper?: RailFenceDirectionSet;
}
export interface RailPictureSet {
  back_rail_endings?: Sprite16Way;
  east: RailPieceLayers;
  fog_mask?: RailsFogMaskDefinitions;
  front_rail_endings?: Sprite16Way;
  north: RailPieceLayers;
  northeast: RailPieceLayers;
  northwest: RailPieceLayers;
  /** Can be used to load rail endings instead of the front and back variants.

Only loaded if `front_rail_endings` or `back_rail_endings` are not defined. */
  rail_endings: Sprite16Way;
  render_layers: RailRenderLayers;
  secondary_render_layers?: RailRenderLayers;
  /** Must contain exactly 16 directions and 6 frames. */
  segment_visualisation_endings?: RotatedAnimation;
  slice_origin?: RailsSliceOffsets;
  south: RailPieceLayers;
  southeast: RailPieceLayers;
  southwest: RailPieceLayers;
  west: RailPieceLayers;
}
/** Used for graphics by [RailPrototype](prototype:RailPrototype) and [RailRemnantsPrototype](prototype:RailRemnantsPrototype). */
export interface RailPieceLayers {
  /** Must have same number of variations as `metals` or be empty. */
  backplates?: SpriteVariations;
  /** May not have more than 16 variations. */
  metals?: SpriteVariations;
  segment_visualisation_middle?: Sprite;
  shadow_mask?: Sprite;
  shadow_subtract_mask?: Sprite;
  /** May not have more than 16 variations. */
  stone_path?: SpriteVariations;
  /** May not have more than 16 variations. */
  stone_path_background?: SpriteVariations;
  /** May not have more than 16 variations. */
  ties?: SpriteVariations;
  underwater_structure?: Sprite;
  water_reflection?: Sprite;
}
interface _RailPlannerAllowElevatedRailsModifier {
  type: 'rail-planner-allow-elevated-rails';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type RailPlannerAllowElevatedRailsModifier =
  _RailPlannerAllowElevatedRailsModifier &
    Omit<BoolModifier, keyof _RailPlannerAllowElevatedRailsModifier>;

export function isRailPlannerAllowElevatedRailsModifier(
  value: unknown,
): value is RailPlannerAllowElevatedRailsModifier {
  return (
    (value as { type: string }).type === 'rail-planner-allow-elevated-rails'
  );
}

export interface RailRenderLayers {
  back_end?: RenderLayer;
  front_end?: RenderLayer;
  metal?: RenderLayer;
  screw?: RenderLayer;
  stone_path?: RenderLayer;
  stone_path_lower?: RenderLayer;
  tie?: RenderLayer;
  underwater_layer_offset?: number;
}
export interface RailSignalColorToFrameIndex {
  blue?: number;
  green?: number;
  none?: number;
  red?: number;
  yellow?: number;
}
export interface RailSignalLightDefinition {
  light: LightDefinition;
  shift?: Vector;
}
export interface RailSignalLights {
  blue?: RailSignalLightDefinition;
  green?: RailSignalLightDefinition;
  red?: RailSignalLightDefinition;
  yellow?: RailSignalLightDefinition;
}
export interface RailSignalPictureSet {
  circuit_connector?: CircuitConnectorDefinition[];
  circuit_connector_render_layer?: RenderLayer;
  lights: RailSignalLights;
  rail_piece?: RailSignalStaticSpriteLayer;
  selection_box_shift?: Vector[];
  signal_color_to_structure_frame_index: RailSignalColorToFrameIndex;
  structure: RotatedAnimation;
  structure_align_to_animation_index?: number[];
  structure_render_layer?: RenderLayer;
  upper_rail_piece?: RailSignalStaticSpriteLayer;
}
export interface RailSignalStaticSpriteLayer {
  align_to_frame_index?: number[];
  hide_if_not_connected_to_rails?: boolean;
  hide_if_simulation?: boolean;
  render_layer?: RenderLayer;
  /** Must be an empty array or contain exactly 16 values. */
  shifts?: MapPosition[];
  sprites: Animation;
}
export interface RailSupportGraphicsSet {
  render_layer?: RenderLayer;
  structure: RotatedSprite;
  underwater_layer_offset?: number;
  underwater_structure?: RotatedSprite;
}
interface _RailSupportOnDeepOilOceanModifier {
  type: 'rail-support-on-deep-oil-ocean';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type RailSupportOnDeepOilOceanModifier =
  _RailSupportOnDeepOilOceanModifier &
    Omit<BoolModifier, keyof _RailSupportOnDeepOilOceanModifier>;

export function isRailSupportOnDeepOilOceanModifier(
  value: unknown,
): value is RailSupportOnDeepOilOceanModifier {
  return (value as { type: string }).type === 'rail-support-on-deep-oil-ocean';
}

export interface RailsFogMaskDefinitions {
  east?: FogMaskShapeDefinition;
  north?: FogMaskShapeDefinition;
  south?: FogMaskShapeDefinition;
  west?: FogMaskShapeDefinition;
}
export interface RailsSliceOffsets {
  east?: Vector;
  north?: Vector;
  south?: Vector;
  west?: Vector;
}
/** If no tint is specified, the machine falls back to [WorkingVisualisations::default_recipe_tint](prototype:WorkingVisualisations::default_recipe_tint). */
export interface RecipeTints {
  primary?: Color;
  quaternary?: Color;
  secondary?: Color;
  tertiary?: Color;
}
/** A research progress product definition. */
export interface ResearchProgressProductPrototype {
  amount?: number;
  research_item: ItemID;
  type: 'research-progress';
}

export function isResearchProgressProductPrototype(
  value: unknown,
): value is ResearchProgressProductPrototype {
  return (value as { type: string }).type === 'research-progress';
}

export interface ResearchTechnologyTipTrigger {
  technology: TechnologyID;
  type: 'research';
}

export function isResearchTechnologyTipTrigger(
  value: unknown,
): value is ResearchTechnologyTipTrigger {
  return (value as { type: string }).type === 'research';
}

export interface ResearchWithSciencePackTipTrigger {
  science_pack: ItemID;
  type: 'research-with-science-pack';
}

export function isResearchWithSciencePackTipTrigger(
  value: unknown,
): value is ResearchWithSciencePackTipTrigger {
  return (value as { type: string }).type === 'research-with-science-pack';
}

/** Resistances to certain types of attacks from enemy, and physical damage. See [Damage](https://wiki.factorio.com/Damage). */
export interface Resistance {
  /** The [flat resistance](https://wiki.factorio.com/Damage#Decrease.2C_or_.22flat.22_resistance) to the given damage type. (Higher is better) */
  decrease?: number;
  /** The [percentage resistance](https://wiki.factorio.com/Damage#Percentage_resistance) to the given damage type. (Higher is better) */
  percent?: number;
  type: DamageTypeID;
}
export interface RollingStockRotatedSlopedGraphics {
  rotated: RotatedSprite;
  slope_angle_between_frames?: number;
  slope_back_equals_front?: boolean;
  sloped?: RotatedSprite;
}
interface _RotateEntityTipTrigger {
  type: 'rotate-entity';
}

export type RotateEntityTipTrigger = _RotateEntityTipTrigger &
  Omit<CountBasedTipTrigger, keyof _RotateEntityTipTrigger>;

export function isRotateEntityTipTrigger(
  value: unknown,
): value is RotateEntityTipTrigger {
  return (value as { type: string }).type === 'rotate-entity';
}

interface _RotatedAnimation {
  /** Only loaded if `layers` is not defined. */
  apply_projection?: boolean;
  /** Only loaded if `layers` is not defined.

If `true`, `direction_count` must be greater than `1`. */
  axially_symmetrical?: boolean;
  /** Only loaded if `layers` is not defined. */
  counterclockwise?: boolean;
  /** Only loaded if `layers` is not defined.

The sequential animation instance is loaded equal to the entities direction within the `direction_count` setting.

Direction count to [Direction](prototype:Direction) (animation sequence number):

- `1`: North (1)

- `2`: North (1), South (2)

- `4`: North (1), East (2), South (3), West (4)

- `8`: North (1), Northeast (2), East (3), Southeast (4), South (5), Southwest (6), West (7), Northwest (8) */
  direction_count?: number;
  /** Only loaded, and mandatory if `layers`, `stripes`, and `filenames` are not defined.

The path to the sprite file to use. */
  filename?: FileName;
  /** Only loaded if both `layers` and `stripes` are not defined. */
  filenames?: FileName[];
  /** If this property is present, all RotatedAnimation definitions have to be placed as entries in the array, and they will all be loaded from there. `layers` may not be an empty table. Each definition in the array may also have the `layers` property.

If this property is present, all other properties, including those inherited from AnimationParameters, are ignored. */
  layers?: RotatedAnimation[];
  /** Only loaded if `layers` is not defined. Mandatory if `filenames` is defined. */
  lines_per_file?: number;
  /** Only loaded if `layers` is not defined. */
  middle_orientation?: RealOrientation;
  /** Only loaded if `layers` is not defined.

Automatically clamped to be between `0` and `1`. */
  orientation_range?: number;
  /** Only loaded if `layers` is not defined. Mandatory if `filenames` is defined. */
  slice?: number;
  /** Only loaded if `layers` is not defined. */
  still_frame?: number;
  /** Only loaded if `layers` is not defined. */
  stripes?: Stripe[];
}

export type RotatedAnimation = _RotatedAnimation &
  Omit<AnimationParameters, keyof _RotatedAnimation>;
/** A map of rotated animations for all 8 directions of the entity. If this is loaded as a single RotatedAnimation, it applies to all directions.

Any direction that is not defined defaults to the rotated animation of the opposite direction. If that is also not defined, it defaults to the north rotated animation. */
interface _RotatedAnimation8Way {
  east?: RotatedAnimation;
  north: RotatedAnimation;
  north_east?: RotatedAnimation;
  north_west?: RotatedAnimation;
  south?: RotatedAnimation;
  south_east?: RotatedAnimation;
  south_west?: RotatedAnimation;
  west?: RotatedAnimation;
}
/** Specifies series of sprites used to visualize different rotations of the object. */
interface _RotatedSprite {
  /** Only loaded if `layers` is not defined. */
  allow_low_quality_rotation?: boolean;
  /** Only loaded if `layers` is not defined.

Used to fix the inconsistency of direction of the entity in 3d when rendered and direction on the screen (where the 45 degree angle for projection is used). */
  apply_projection?: boolean;
  /** Only loaded if `layers` is not defined.

When `true`, the same picture is used for left/right direction, just flipped, which can save half of the space required, but is not usable once the picture contains shadows, etc. */
  axially_symmetrical?: boolean;
  /** Only loaded if `layers` is not defined. */
  back_equals_front?: boolean;
  /** Only loaded if `layers` is not defined.

Set to `true` to indicate sprites in the spritesheet are in counterclockwise order. */
  counterclockwise?: boolean;
  /** Only loaded if `layers` is not defined.

Number of slices this is sliced into when using the "optimized atlas packing" option. If you are a modder, you can just ignore this property. Example: If this is 4, the sprite will be sliced into a 4x4 grid. */
  dice?: SpriteSizeType;
  /** Only loaded if `layers` is not defined.

Same as `dice` above, but this specifies only how many slices there are on the x axis. */
  dice_x?: SpriteSizeType;
  /** Only loaded if `layers` is not defined.

Same as `dice` above, but this specifies only how many slices there are on the y axis. */
  dice_y?: SpriteSizeType;
  /** Only loaded, and mandatory if `layers` is not defined.

Count of direction (frames) specified. */
  direction_count?: number;
  /** Only loaded if `layers` is not defined.

The path to the sprite file to use. */
  filename?: FileName;
  /** Only loaded, and mandatory if both `layers` and `filename` are not defined. */
  filenames?: FileName[];
  /** A list of overrides and customizations for each specific frame within the rotated sprite. This can be used to adjust each individual frame's width, height, and other properties. If this property is present, then it must contain at least as many `RotatedSpriteFrame` as there are sprites in this RotatedSprite. */
  frames?: RotatedSpriteFrame[];
  /** Only loaded if `layers` is not defined.

Unused. */
  generate_sdf?: boolean;
  /** If this property is present, all RotatedSprite definitions have to be placed as entries in the array, and they will all be loaded from there. `layers` may not be an empty table. Each definition in the array may also have the `layers` property.

If this property is present, all other properties, including those inherited from SpriteParameters, are ignored. */
  layers?: RotatedSprite[];
  /** Only loaded if `layers` is not defined.

Once the specified number of pictures is loaded, other pictures are loaded on other line. This is to allow having more sprites in matrix, to input files with too high width. The game engine limits the width of any input files to 8192px, so it is compatible with most graphics cards. 0 means that all the pictures are in one horizontal line. */
  line_length?: number;
  /** Only loaded if `layers` is not defined. Mandatory if `filenames` is defined. */
  lines_per_file?: number;
}

export type RotatedSprite = _RotatedSprite &
  Omit<SpriteParameters, keyof _RotatedSprite>;
/** Specifies frame-specific properties of an individual sprite within a RotatedSprite set. Some properties are absolute values, and some are relative and inherited from the parent RotatedSprite prototype definition. */
export interface RotatedSpriteFrame {
  /** Height of the sprite in pixels, from 0-4096. If not defined, inherits the height of the parent RotatedSprite. */
  height?: SpriteSizeType;
  /** The shift in tiles of this specific frame, relative to the shift of the parent RotatedSprite. `util.by_pixel()` can be used to divide the shift by 32 which is the usual pixel height/width of 1 tile in normal resolution. Note that 32 pixel tile height/width is not enforced anywhere - any other tile height or width is also possible. */
  shift?: Vector;
  /** Width of the sprite in pixels, from 0-4096. If not defined, inherits the width of the parent RotatedSprite. */
  width?: SpriteSizeType;
  /** The horizontal offset of the sprite relative to its specific frame within the parent RotatedSprite. */
  x?: SpriteSizeType;
  /** The vertical offset of the sprite relative to its specific frame within the parent RotatedSprite. */
  y?: SpriteSizeType;
}
interface _ScriptTriggerEffectItem {
  /** The effect ID that will be provided in [on_script_trigger_effect](runtime:on_script_trigger_effect). */
  effect_id: string;
  type: 'script';
}

export type ScriptTriggerEffectItem = _ScriptTriggerEffectItem &
  Omit<TriggerEffectItem, keyof _ScriptTriggerEffectItem>;

export function isScriptTriggerEffectItem(
  value: unknown,
): value is ScriptTriggerEffectItem {
  return (value as { type: string }).type === 'script';
}

interface _ScrollBarStyleSpecification {
  background_graphical_set?: ElementImageSet;
  thumb_button_style?: ButtonStyleSpecification;
}

export type ScrollBarStyleSpecification = _ScrollBarStyleSpecification &
  Omit<BaseStyleSpecification, keyof _ScrollBarStyleSpecification>;
interface _ScrollPaneStyleSpecification {
  always_draw_borders?: boolean;
  background_graphical_set?: ElementImageSet;
  dont_force_clipping_rect_for_contents?: boolean;
  extra_bottom_margin_when_activated?: number;
  extra_bottom_padding_when_activated?: number;
  extra_left_margin_when_activated?: number;
  extra_left_padding_when_activated?: number;
  /** Sets `extra_top_margin_when_activated`, `extra_bottom_margin_when_activated`, `extra_left_margin_when_activated` and `extra_right_margin_when_activated`. */
  extra_margin_when_activated?: number;
  /** Sets `extra_top_padding_when_activated`, `extra_bottom_padding_when_activated`, `extra_left_padding_when_activated` and `extra_right_padding_when_activated`. */
  extra_padding_when_activated?: number;
  extra_right_margin_when_activated?: number;
  extra_right_padding_when_activated?: number;
  extra_top_margin_when_activated?: number;
  extra_top_padding_when_activated?: number;
  graphical_set?: ElementImageSet;
  horizontal_scrollbar_style?: HorizontalScrollBarStyleSpecification;
  scrollbars_go_outside?: boolean;
  type: 'scroll_pane_style';
  vertical_flow_style?: VerticalFlowStyleSpecification;
  vertical_scrollbar_style?: VerticalScrollBarStyleSpecification;
}

export type ScrollPaneStyleSpecification = _ScrollPaneStyleSpecification &
  Omit<BaseStyleSpecification, keyof _ScrollPaneStyleSpecification>;

export function isScrollPaneStyleSpecification(
  value: unknown,
): value is ScrollPaneStyleSpecification {
  return (value as { type: string }).type === 'scroll_pane_style';
}

/** Used by [SegmentedUnitPrototype](prototype:SegmentedUnitPrototype) to define and manage the segments that make up the body of the entity. */
export interface SegmentEngineSpecification {
  /** The segments that compose the entity's body. Must contain no more than 63 entries. */
  segments: SegmentSpecification[];
}
/** A container for an individual instance of a [SegmentPrototype](prototype:SegmentPrototype) within a [SegmentEngineSpecification](prototype:SegmentEngineSpecification). May contain context-specific customizations unique to the associated segment instance. */
export interface SegmentSpecification {
  /** Name of the [SegmentPrototype](prototype:SegmentPrototype) to use in this position. */
  segment: EntityID;
}
export interface SelectionModeData {
  border_color: Color;
  chart_color?: Color;
  count_button_color?: Color;
  cursor_box_type: CursorBoxType;
  ended_sound?: Sound;
  entity_filter_mode?: 'whitelist' | 'blacklist';
  entity_filters?: EntityID[];
  entity_type_filters?: string[];
  mode: SelectionModeFlags;
  play_ended_sound_when_nothing_selected?: boolean;
  started_sound?: Sound;
  tile_filter_mode?: 'whitelist' | 'blacklist';
  tile_filters?: TileID[];
}
interface _SemiPersistentWorldAmbientSoundDefinition {
  delay_mean_seconds?: number;
  delay_variance_seconds?: number;
  sound: Sound;
}
export interface SendItemToOrbitTechnologyTrigger {
  item: ItemIDFilter;
  type: 'send-item-to-orbit';
}

export function isSendItemToOrbitTechnologyTrigger(
  value: unknown,
): value is SendItemToOrbitTechnologyTrigger {
  return (value as { type: string }).type === 'send-item-to-orbit';
}

interface _SendSpidertronTipTrigger {
  append?: boolean;
  type: 'send-spidertron';
}

export type SendSpidertronTipTrigger = _SendSpidertronTipTrigger &
  Omit<CountBasedTipTrigger, keyof _SendSpidertronTipTrigger>;

export function isSendSpidertronTipTrigger(
  value: unknown,
): value is SendSpidertronTipTrigger {
  return (value as { type: string }).type === 'send-spidertron';
}

export interface SequenceTipTrigger {
  /** List of triggers to fulfill. */
  triggers: TipTrigger[];
  type: 'sequence';
}

export function isSequenceTipTrigger(
  value: unknown,
): value is SequenceTipTrigger {
  return (value as { type: string }).type === 'sequence';
}

interface _SetFilterTipTrigger {
  consecutive?: boolean;
  entity?: EntityID;
  match_type_only?: boolean;
  type: 'set-filter';
}

export type SetFilterTipTrigger = _SetFilterTipTrigger &
  Omit<CountBasedTipTrigger, keyof _SetFilterTipTrigger>;

export function isSetFilterTipTrigger(
  value: unknown,
): value is SetFilterTipTrigger {
  return (value as { type: string }).type === 'set-filter';
}

interface _SetLogisticRequestTipTrigger {
  entity?: EntityID;
  logistic_chest_only?: boolean;
  type: 'set-logistic-request';
}

export type SetLogisticRequestTipTrigger = _SetLogisticRequestTipTrigger &
  Omit<CountBasedTipTrigger, keyof _SetLogisticRequestTipTrigger>;

export function isSetLogisticRequestTipTrigger(
  value: unknown,
): value is SetLogisticRequestTipTrigger {
  return (value as { type: string }).type === 'set-logistic-request';
}

interface _SetRecipeTipTrigger {
  any_quality?: boolean;
  consecutive?: boolean;
  machine?: EntityID;
  recipe?: RecipeID;
  type: 'set-recipe';
  uses_fluid?: boolean;
}

export type SetRecipeTipTrigger = _SetRecipeTipTrigger &
  Omit<CountBasedTipTrigger, keyof _SetRecipeTipTrigger>;

export function isSetRecipeTipTrigger(
  value: unknown,
): value is SetRecipeTipTrigger {
  return (value as { type: string }).type === 'set-recipe';
}

interface _SetTileTriggerEffectItem {
  apply_on_space_platform?: boolean;
  apply_projection?: boolean;
  radius: number;
  tile_collision_mask?: CollisionMaskConnector;
  tile_name: TileID;
  type: 'set-tile';
}

export type SetTileTriggerEffectItem = _SetTileTriggerEffectItem &
  Omit<TriggerEffectItem, keyof _SetTileTriggerEffectItem>;

export function isSetTileTriggerEffectItem(
  value: unknown,
): value is SetTileTriggerEffectItem {
  return (value as { type: string }).type === 'set-tile';
}

/** A struct that provides access to the user-set values of startup [mod settings](https://wiki.factorio.com/Tutorial:Mod_settings). */
export interface Settings {
  /** All startup mod settings, indexed by the name of the setting. */
  startup: Record<string, ModSetting>;
}
export interface ShiftAnimationWaypoints {
  east: Vector[];
  north: Vector[];
  south: Vector[];
  west: Vector[];
}
interface _ShootTipTrigger {
  target?: 'enemy' | 'entity';
  type: 'shoot';
}

export type ShootTipTrigger = _ShootTipTrigger &
  Omit<CountBasedTipTrigger, keyof _ShootTipTrigger>;

export function isShootTipTrigger(value: unknown): value is ShootTipTrigger {
  return (value as { type: string }).type === 'shoot';
}

interface _ShowExplosionOnChartTriggerEffectItem {
  scale: number;
  type: 'show-explosion-on-chart';
}

export type ShowExplosionOnChartTriggerEffectItem =
  _ShowExplosionOnChartTriggerEffectItem &
    Omit<TriggerEffectItem, keyof _ShowExplosionOnChartTriggerEffectItem>;

export function isShowExplosionOnChartTriggerEffectItem(
  value: unknown,
): value is ShowExplosionOnChartTriggerEffectItem {
  return (value as { type: string }).type === 'show-explosion-on-chart';
}

interface _SignalColorMapping {
  color: Color;
}

export type SignalColorMapping = _SignalColorMapping &
  Omit<SignalIDConnector, keyof _SignalColorMapping>;
export interface SignalIDConnector {
  /** Name of the signal. */
  name: VirtualSignalID;
  type:
    | 'virtual'
    | 'item'
    | 'fluid'
    | 'recipe'
    | 'entity'
    | 'space-location'
    | 'asteroid-chunk'
    | 'quality';
}
/** An axis aligned bounding box.

SimpleBoundingBoxes are usually specified with the short-hand notation of passing an array of exactly 2 numbers. The first position is left_top, the second position is right_bottom.

Positive x goes towards east, positive y goes towards south. This means that the upper-left point is the least dimension in x and y, and lower-right is the greatest. */
interface _SimpleBoundingBox {
  left_top: MapPosition;
  right_bottom: MapPosition;
}
interface _SimpleModifier {
  /** Modification value, which will be added to the variable it modifies. */
  modifier: number;
}

export type SimpleModifier = _SimpleModifier &
  Omit<BaseModifier, keyof _SimpleModifier>;
/** Used by tips and tricks and main menu simulations.

There are a few simulation-only APIs:

```
game.create_test_player{name=string}
game.activate_rail_planner{position=position,ghost_mode=bool,build_mode=defines.build_mode}
game.deactivate_rail_planner()
game.move_cursor{position=position,speed=number}  -- should be called every tick; returns true when target is reached
game.activate_selection()
game.finish_selection()
game.deactivate_selection()
game.scroll_clipboard_forwards()
game.scroll_clipboard_backwards()
game.camera_player_cursor_position [RW]
game.camera_position [RW]
game.camera_zoom [W]
game.camera_player [W]
game.camera_player_cursor_direction [W]
game.camera_alt_info [W]
player.drag_start_position [W]
player.raw_build_from_cursor{ghost_mode=bool,created_by_moving=bool,position=position}
surface.create_entities_from_blueprint_string{string=string,position=position,force=force,direction=defines.direction,flip_horizontal=bool,flip_vertical=bool,by_player=player}
``` */
export interface SimulationDefinition {
  /** If this is true, the map of the simulation is set to be a lab-tile checkerboard in the area of `{{-20, -15},{20, 15}}` when the scenario is first initialized (before init/init_file run). */
  checkboard?: boolean;
  game_view_settings?: GameViewSettings;
  /** If `save` is not given and this is true, a map gets generated by the game for use in the simulation. */
  generate_map?: boolean;
  hide_factoriopedia_gradient?: boolean;
  hide_health_bars?: boolean;
  /** Only loaded if `init_file` is not defined.

This code is run as a (silent) console command inside the simulation when it is first initialized. Since this is run as a console command, the restrictions of console commands apply, e.g. `require` is not available, see [here](runtime:libraries). */
  init?: string;
  /** This code is run as a (silent) console command inside the simulation when it is first initialized. Since this is run as a console command, the restrictions of console commands apply, e.g. `require` is not available, see [here](runtime:libraries). */
  init_file?: FileName;
  /** Amount of ticks that this simulation should run for before the simulation is shown to the player. These updates happen after init/init_file has been run and at the highest possible rate (> 60 UPS). */
  init_update_count?: number;
  /** How long this simulation takes. In the main menu simulations, another simulation will start after this simulation ends. */
  length?: number;
  /** An array of mods that will be run in this simulation if they are present and enabled. */
  mods?: string[];
  mute_alert_sounds?: boolean;
  mute_technology_finished_sound?: boolean;
  /** Overrides whether a simulation has its wind sounds muted.

Tips and Tricks simulations and Factoriopedia simulations have their wind sounds muted by default, other simulations don't. */
  mute_wind_sounds?: boolean;
  /** If true, overrides the simulation volume set by the player in the sound settings, simply setting the volume modifier to `1`. */
  override_volume?: boolean;
  planet?: SpaceLocationID;
  /** The save file that is used for this simulation. If not given and `generate_map` is `true`, a map is generated by the game. */
  save?: FileName;
  /** Only loaded if `update_file` is not defined.

This code is run as a (silent) console command inside the simulation every time the simulation is updated. Since this is run as a console command, the restrictions of console commands apply, e.g. `require` is not available, see [here](runtime:libraries). */
  update?: string;
  /** This code is run as a (silent) console command inside the simulation every time the simulation is updated. Since this is run as a console command, the restrictions of console commands apply, e.g. `require` is not available, see [here](runtime:libraries). */
  update_file?: FileName;
  /** Multiplier for the simulation volume set by the player in the sound settings. */
  volume_modifier?: number;
}
/** One frame in time for a Bezier interpolation. */
export interface SingleGraphicLayerProcessionBezierControlPoint {
  /** the frame of the pod animation played. Used only when 'animation_driven_by_curve' is enabled. */
  frame: number;
  /** `opacity` and `opacity_t` interpolate a double smoothly over time. */
  opacity?: number;
  /** Bidirectional tangent at the given timestamp. */
  opacity_t?: number;
  /** `rotation` and `rotation_t` interpolate a double smoothly over time. */
  rotation?: number;
  /** Bidirectional tangent at the given timestamp. */
  rotation_t?: number;
  /** `scale` and `scale_t` interpolate a double smoothly over time. */
  scale?: number;
  /** Bidirectional tangent at the given timestamp. */
  scale_t?: number;
  /** `shift` and `shift_t` interpolate a vector smoothly over time using `shift_rate` and `shift_rate_t` for a 0-1 rate curve.

Vector value. */
  shift?: Vector;
  /** Rate 0-1 value. */
  shift_rate?: number;
  /** Rate tangent. */
  shift_rate_t?: number;
  /** Vector tangent. */
  shift_t?: Vector;
  /** Mandatory if `opacity` or `tint` is defined. */
  timestamp?: MapTick;
  /** `tint` and `tint_t` interpolate a color smoothly over time. */
  tint?: Color;
  /** Bidirectional tangent at the given timestamp. */
  tint_t?: Color;
}
export interface SingleGraphicProcessionLayer {
  animation_driven_by_curve?: boolean;
  clip_with_hatches?: boolean;
  /** Swaps the order of sprite shift and rotation. */
  compensated_pivot?: boolean;
  /** Default values if unspecified:

- opacity : 1.0

- tint : {1.0, 1.0, 1.0, 1.0}

- scale : 1.0

- rotation : 0.0

- shift : {0.0, 0.0}

- frame : 0.0 */
  frames: SingleGraphicLayerProcessionBezierControlPoint[];
  graphic: ProcessionGraphic;
  is_passenger_only?: boolean;
  /** Where the sprite is centered. */
  relative_to?: EffectRelativeTo;
  render_layer?: RenderLayer;
  rotates_with_pod?: boolean;
  secondary_draw_order?: number;
  /** Only applied when the `relative_to` is `pod`. */
  shift_rotates_with_pod?: boolean;
  type: 'single-graphic';
}

export function isSingleGraphicProcessionLayer(
  value: unknown,
): value is SingleGraphicProcessionLayer {
  return (value as { type: string }).type === 'single-graphic';
}

interface _SliderStyleSpecification {
  button?: ButtonStyleSpecification;
  draw_notches?: boolean;
  empty_bar?: ElementImageSet;
  empty_bar_disabled?: ElementImageSet;
  full_bar?: ElementImageSet;
  full_bar_disabled?: ElementImageSet;
  high_button?: ButtonStyleSpecification;
  notch?: ElementImageSet;
  type: 'slider_style';
}

export type SliderStyleSpecification = _SliderStyleSpecification &
  Omit<BaseStyleSpecification, keyof _SliderStyleSpecification>;

export function isSliderStyleSpecification(
  value: unknown,
): value is SliderStyleSpecification {
  return (value as { type: string }).type === 'slider_style';
}

/** Definition of the smoke of an entity. */
export interface SmokeSource {
  deviation?: Vector;
  east_position?: Vector;
  /** Number of smokes generated per entity animation cycle (or per tick for some entities). Can't be negative or infinite. */
  frequency: number;
  has_8_directions?: boolean;
  height?: number;
  height_deviation?: number;
  name: TrivialSmokeID;
  /** Only loaded if `has_8_directions` is `true`. */
  north_east_position?: Vector;
  north_position?: Vector;
  /** Only loaded if `has_8_directions` is `true`. */
  north_west_position?: Vector;
  /** Offsets animation cycle, to move at which points of the cycle the smoke gets emitted. */
  offset?: number;
  /** Positional offset of smoke source relative to owner entity position. The vector is rotated by orientation of the entity.

If any of `north_position`, `north_east_position`, `east_position`, `south_east_position`, `south_position`, `south_west_position`, `west_position`, `north_west_position` is defined, `position` is used only as default value for directional positions. Orientation of the owner entity will be rounded to 4 or 8 directions and one of the directional positions will be used as the offset instead of `position`. */
  position?: Vector;
  /** Only loaded if `has_8_directions` is `true`. */
  south_east_position?: Vector;
  south_position?: Vector;
  /** Only loaded if `has_8_directions` is `true`. */
  south_west_position?: Vector;
  starting_frame?: number;
  starting_frame_deviation?: number;
  starting_vertical_speed?: number;
  starting_vertical_speed_deviation?: number;
  /** A value between `0` and `1`. */
  vertical_speed_slowdown?: number;
  west_position?: Vector;
}
interface _Sound {
  advanced_volume_control?: AdvancedVolumeControl;
  aggregation?: AggregationSpecification;
  allow_random_repeat?: boolean;
  /** Modifies how far a sound can be heard. Must be between `0` and `1` inclusive. */
  audible_distance_modifier?: number;
  category?: SoundType;
  /** Supported sound file formats are `.ogg` (Vorbis) and `.wav`.

Only loaded, and mandatory if `variations` is not defined. */
  filename?: FileName;
  game_controller_vibration_data?: GameControllerVibrationData;
  /** Must be `>= min_speed`.

Only loaded if `variations` is not defined. Only loaded, and mandatory if `min_speed` is defined. */
  max_speed?: number;
  /** Only loaded if `variations` is not defined.

Only loaded if `min_volume` is defined.

Must be `>= min_volume`. */
  max_volume?: number;
  /** Must be `>= 1 / 64`.

Only loaded if both `variations` and `speed` are not defined. */
  min_speed?: number;
  /** Only loaded if `variations` and `volume` are not defined.

Must be `>= 0`. */
  min_volume?: number;
  /** Only loaded if `variations` is not defined. */
  modifiers?: SoundModifier | SoundModifier[];
  /** Only loaded if `variations` is not defined. */
  preload?: boolean;
  /** Sounds with higher priority will replace a sound with lower priority if the maximum sounds limit is reached.

0 is the highest priority, 255 is the lowest priority. */
  priority?: number;
  /** Speed must be `>= 1 / 64`. This sets both min and max speeds.

Only loaded if `variations` is not defined. */
  speed?: number;
  speed_smoothing_window_size?: number;
  variations?: SoundDefinition | SoundDefinition[];
  /** Only loaded if `variations` is not defined.

This sets both min and max volumes.

Must be `>= 0`. */
  volume?: number;
}
export interface SoundAccent {
  audible_distance_modifier?: number;
  frame?: number;
  play_for_working_visualisations?: string[];
  sound?: Sound;
}
interface _SoundDefinition {
  /** Supported sound file formats are `.ogg` (Vorbis) and `.wav`. */
  filename: FileName;
  /** Only loaded, and mandatory, if `min_speed` is defined.

Must be `>= min_speed`. */
  max_speed?: number;
  /** Only loaded if `min_volume` is defined.

Must be `>= min_volume`. */
  max_volume?: number;
  /** Only loaded if `speed` is not defined.

Must be `>= 1 / 64`. */
  min_speed?: number;
  /** Only loaded if `volume` is not defined.

Must be `>= 0`. */
  min_volume?: number;
  modifiers?: SoundModifier | SoundModifier[];
  preload?: boolean;
  /** Speed must be `>= 1 / 64`. This sets both min and max speeds. */
  speed?: number;
  /** This sets both min and max volumes.

Must be `>= 0`. */
  volume?: number;
}
export interface SoundModifier {
  type: SoundModifierType;
  volume_multiplier: number;
}
interface _SpaceConnectionAsteroidSpawnDefinition {
  /** The type this is loaded as depends on `type`. */
  asteroid: EntityID;
  spawn_points: SpaceConnectionAsteroidSpawnPoint[];
  type?: 'entity' | 'asteroid-chunk';
}
interface _SpaceConnectionAsteroidSpawnPoint {
  distance: number;
}

export type SpaceConnectionAsteroidSpawnPoint =
  _SpaceConnectionAsteroidSpawnPoint &
    Omit<AsteroidSpawnPoint, keyof _SpaceConnectionAsteroidSpawnPoint>;
export interface SpaceDustEffectProperties {
  animation_speed?: number;
  asteroid_normal_texture: EffectTexture;
  asteroid_texture: EffectTexture;
  noise_texture: EffectTexture;
}
interface _SpaceLocationAsteroidSpawnDefinition {
  /** The type this is loaded as depends on `type`. */
  asteroid: EntityID;
  type?: 'entity' | 'asteroid-chunk';
}

export type SpaceLocationAsteroidSpawnDefinition =
  _SpaceLocationAsteroidSpawnDefinition &
    Omit<AsteroidSpawnPoint, keyof _SpaceLocationAsteroidSpawnDefinition>;
export interface SpacePlatformTileDefinition {
  position: TilePosition;
  tile: TileID;
}
interface _SpacePlatformsModifier {
  type: 'unlock-space-platforms';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type SpacePlatformsModifier = _SpacePlatformsModifier &
  Omit<BoolModifier, keyof _SpacePlatformsModifier>;

export function isSpacePlatformsModifier(
  value: unknown,
): value is SpacePlatformsModifier {
  return (value as { type: string }).type === 'unlock-space-platforms';
}

/** Nebulae are rendered only behind tiles with the effect, but stars are rendered behind entire terrain. For that reason using two or more tile types with different space effect on one surface is not supported. The game will allow this to happen, but rendering will chose one star configuration for entire screen.

Zoom is recalculated using formula `max(1/1024, pow(max(0, zoom * base_factor + base_offset), exponent) * factor + offset)`. */
export interface SpaceTileEffectParameters {
  nebula_brightness?: number;
  nebula_saturation?: number;
  nebula_scale?: number;
  scroll_factor?: number;
  star_brightness?: number;
  star_density?: number;
  star_parallax?: number;
  star_saturations?: number;
  star_scale?: number;
  star_shape?: number;
  zoom_base_factor?: number;
  zoom_base_offset?: number;
  zoom_exponent?: number;
  zoom_factor?: number;
  zoom_offset?: number;
}
/** The definition of a evolution and probability weights for a [spawnable unit](prototype:UnitSpawnDefinition) for a [EnemySpawnerPrototype](prototype:EnemySpawnerPrototype).

It can be specified as a table with named or numbered keys, but not a mix of both. If this is specified as a table with numbered keys then the first value is the evolution factor and the second is the spawn weight. */
interface _SpawnPoint {
  evolution_factor: number;
  /** Must be `>= 0`. */
  spawn_weight: number;
}
interface _SpeechBubbleStyleSpecification {
  arrow_graphical_set?: ElementImageSet;
  arrow_indent?: number;
  close_color?: Color;
  frame_style?: FrameStyleSpecification;
  label_style?: LabelStyleSpecification;
  pass_through_mouse?: boolean;
  type: 'speech_bubble_style';
}

export type SpeechBubbleStyleSpecification = _SpeechBubbleStyleSpecification &
  Omit<BaseStyleSpecification, keyof _SpeechBubbleStyleSpecification>;

export function isSpeechBubbleStyleSpecification(
  value: unknown,
): value is SpeechBubbleStyleSpecification {
  return (value as { type: string }).type === 'speech_bubble_style';
}

/** Used by [SpiderVehiclePrototype](prototype:SpiderVehiclePrototype). */
export interface SpiderEngineSpecification {
  legs: SpiderLegSpecification | SpiderLegSpecification[];
  /** The amount of overlap allowed between spider leg walking groups. Valid values are between 0.0 and 1.0. Default is 0.0 (no overlap); all legs in the current walking group must complete their step before the next walking group is allowed to move. 0.5 means the next walking group is allowed to start when the time remaining in the current walking group's step is about half of the time that the next group's step is predicted to take. */
  walking_group_overlap?: number;
}
export interface SpiderLegGraphicsSet {
  foot?: RotatedSprite;
  foot_shadow?: RotatedSprite;
  joint?: RotatedSprite;
  joint_render_layer?: RenderLayer;
  joint_shadow?: RotatedSprite;
  joint_turn_offset?: number;
  lower_part?: SpiderLegPart;
  lower_part_shadow?: SpiderLegPart;
  lower_part_water_reflection?: SpiderLegPart;
  upper_part?: SpiderLegPart;
  upper_part_shadow?: SpiderLegPart;
  upper_part_water_reflection?: SpiderLegPart;
}
export interface SpiderLegPart {
  bottom_end?: RotatedSprite;
  bottom_end_length?: number;
  /** The number of tiles in screen space to shift the bottom end of the leg part AWAY from the bottom joint. */
  bottom_end_offset?: number;
  middle?: RotatedSprite;
  middle_offset_from_bottom?: number;
  middle_offset_from_top?: number;
  /** The sprite layer in which to draw this leg part. */
  render_layer?: RenderLayer;
  top_end?: RotatedSprite;
  top_end_length?: number;
  /** The number of tiles in screen space to shift the top end of the leg part AWAY from the top joint. */
  top_end_offset?: number;
}
/** Used by [SpiderEngineSpecification](prototype:SpiderEngineSpecification) for [SpiderVehiclePrototype](prototype:SpiderVehiclePrototype). */
export interface SpiderLegSpecification {
  ground_position: Vector;
  /** Name of a [SpiderLegPrototype](prototype:SpiderLegPrototype). */
  leg: EntityID;
  /** Triggers to activate whenever the leg hits the ground, even if the owning spider is actively attacking an entity. For triggers, the source is the leg entity and the target is the leg's current position. Certain effects may not raise as desired, e.g. `"push-back"` does nothing. */
  leg_hit_the_ground_trigger?: TriggerEffect;
  /** Triggers to activate whenever the leg hits the ground and the owning spider is actively attacking an entity. These effects will trigger after `leg_hit_the_ground_trigger` have triggered. For triggers, the source is the let entity and the target is the leg's current position. Certain effects may not raise as desired. */
  leg_hit_the_ground_when_attacking_trigger?: TriggerEffect;
  mount_position: Vector;
  /** The walking group this leg belongs to. Legs in the same walking group move or stay still at the same time, according to the engine that drives them. Walking groups must start at 1 and increment upward without skipping any numbers. If all legs are part of the same walking_group, they will all move simultaneously. */
  walking_group: number;
}
export interface SpiderLegTriggerEffect {
  effect: TriggerEffect;
  /** A number between 0 and 1 (inclusive) representing the distance from the upper end of the leg (0) to the lower end of the leg (1) where the effects will be triggered. For the upper leg, position 0 represents the point that the leg connects to the entity's hip and position 1 represents the knee. For the lower leg, position 0 represents the knee and position 1 represents the foot. */
  position: number;
}
export interface SpiderTorsoGraphicsSet {
  animation?: RotatedAnimation;
  base_animation?: RotatedAnimation;
  base_render_layer?: RenderLayer;
  render_layer?: RenderLayer;
  shadow_animation?: RotatedAnimation;
  shadow_base_animation?: RotatedAnimation;
}
/** Used to specify the graphics for [SpiderVehiclePrototype](prototype:SpiderVehiclePrototype). */
interface _SpiderVehicleGraphicsSet {
  autopilot_destination_on_map_visualisation?: Animation;
  autopilot_destination_queue_on_map_visualisation?: Animation;
  autopilot_destination_queue_visualisation?: Animation;
  autopilot_destination_visualisation?: Animation;
  autopilot_destination_visualisation_render_layer?: RenderLayer;
  autopilot_path_visualisation_line_width?: number;
  autopilot_path_visualisation_on_map_line_width?: number;
  /** Placed in multiple positions, as determined by `light_positions`. */
  eye_light?: LightDefinition;
  light?: LightDefinition;
  /** Defines where each `eye_light` is placed. One array per eye and each of those arrays should contain one position per body direction. */
  light_positions?: Vector[][];
}

export type SpiderVehicleGraphicsSet = _SpiderVehicleGraphicsSet &
  Omit<SpiderTorsoGraphicsSet, keyof _SpiderVehicleGraphicsSet>;
export interface SpoilToTriggerResult {
  /** Must be positive (larger than 0). */
  items_per_trigger: ItemCountType;
  trigger: Trigger;
}
/** Specifies one picture that can be used in the game.

When there is more than one sprite or [Animation](prototype:Animation) frame with the same source file and dimensions/position in the game, they all share the same memory. */
interface _Sprite {
  /** Only loaded if `layers` is not defined.

Number of slices this is sliced into when using the "optimized atlas packing" option. If you are a modder, you can just ignore this property. Example: If this is 4, the sprite will be sliced into a 4x4 grid. */
  dice?: SpriteSizeType;
  /** Only loaded if `layers` is not defined.

Same as `dice` above, but this specifies only how many slices there are on the x axis. */
  dice_x?: SpriteSizeType;
  /** Only loaded if `layers` is not defined.

Same as `dice` above, but this specifies only how many slices there are on the y axis. */
  dice_y?: SpriteSizeType;
  /** Only loaded, and mandatory if `layers` is not defined.

The path to the sprite file to use. */
  filename?: FileName;
  /** If this property is present, all Sprite definitions have to be placed as entries in the array, and they will all be loaded from there. `layers` may not be an empty table. Each definition in the array may also have the `layers` property.

If this property is present, all other properties, including those inherited from SpriteParameters, are ignored. */
  layers?: Sprite[];
}

export type Sprite = _Sprite & Omit<SpriteParameters, keyof _Sprite>;
/** A map of sprites for all 16 directions of the entity. */
export interface Sprite16Way {
  /** Only loaded, and mandatory if both `sheets` and `sheet` are not defined. */
  east?: Sprite;
  /** Only loaded, and mandatory if both `sheets` and `sheet` are not defined. */
  east_north_east?: Sprite;
  /** Only loaded, and mandatory if both `sheets` and `sheet` are not defined. */
  east_south_east?: Sprite;
  /** Only loaded, and mandatory if both `sheets` and `sheet` are not defined. */
  north?: Sprite;
  /** Only loaded, and mandatory if both `sheets` and `sheet` are not defined. */
  north_east?: Sprite;
  /** Only loaded, and mandatory if both `sheets` and `sheet` are not defined. */
  north_north_east?: Sprite;
  /** Only loaded, and mandatory if both `sheets` and `sheet` are not defined. */
  north_north_west?: Sprite;
  /** Only loaded, and mandatory if both `sheets` and `sheet` are not defined. */
  north_west?: Sprite;
  /** Only loaded if `sheets` is not defined. */
  sheet?: SpriteNWaySheet;
  sheets?: SpriteNWaySheet[];
  /** Only loaded, and mandatory if both `sheets` and `sheet` are not defined. */
  south?: Sprite;
  /** Only loaded, and mandatory if both `sheets` and `sheet` are not defined. */
  south_east?: Sprite;
  /** Only loaded, and mandatory if both `sheets` and `sheet` are not defined. */
  south_south_east?: Sprite;
  /** Only loaded, and mandatory if both `sheets` and `sheet` are not defined. */
  south_south_west?: Sprite;
  /** Only loaded, and mandatory if both `sheets` and `sheet` are not defined. */
  south_west?: Sprite;
  /** Only loaded, and mandatory if both `sheets` and `sheet` are not defined. */
  west?: Sprite;
  /** Only loaded, and mandatory if both `sheets` and `sheet` are not defined. */
  west_north_west?: Sprite;
  /** Only loaded, and mandatory if both `sheets` and `sheet` are not defined. */
  west_south_west?: Sprite;
}
/** Sprites for the 4 major directions of the entity. If this is loaded as a single Sprite, it applies to all directions.

This struct is either loaded as `sheets` or `sheet` or a map of one sprite per direction. For per direction sprites, the sprites are loaded via `north`, `east`, `south` and `west`. */
interface _Sprite4Way {
  /** Only loaded, and mandatory if both `sheets` and `sheet` are not defined.

Only loaded if `north` is defined. */
  east?: Sprite;
  /** Only loaded if both `sheets` and `sheet` are not defined. */
  north?: Sprite;
  /** Only loaded if `sheets` is not defined. */
  sheet?: SpriteNWaySheet;
  sheets?: SpriteNWaySheet[];
  /** Only loaded, and mandatory if both `sheets` and `sheet` are not defined.

Only loaded if `north` is defined. */
  south?: Sprite;
  /** Only loaded, and mandatory if both `sheets` and `sheet` are not defined.

Only loaded if `north` is defined. */
  west?: Sprite;
}
interface _SpriteNWaySheet {
  /** Specifies how many of the directions of the SpriteNWay are filled up with this sheet. */
  frames?: number;
  /** Unused. */
  generate_sdf?: boolean;
}

export type SpriteNWaySheet = _SpriteNWaySheet &
  Omit<SpriteParameters, keyof _SpriteNWaySheet>;
interface _SpriteParameters {
  apply_runtime_tint?: boolean;
  apply_special_effect?: boolean;
  blend_mode?: BlendMode;
  /** Only one of `draw_as_shadow`, `draw_as_glow` and `draw_as_light` can be true. This takes precedence over `draw_as_light`.

Draws first as a normal sprite, then again as a light layer. See [https://forums.factorio.com/91682](https://forums.factorio.com/91682). */
  draw_as_glow?: boolean;
  /** Only one of `draw_as_shadow`, `draw_as_glow` and `draw_as_light` can be true. */
  draw_as_light?: boolean;
  /** Only one of `draw_as_shadow`, `draw_as_glow` and `draw_as_light` can be true. This takes precedence over `draw_as_glow` and `draw_as_light`. */
  draw_as_shadow?: boolean;
  flags?: SpriteFlags;
  /** This property is only used by sprites used in [UtilitySprites](prototype:UtilitySprites) that have the `"icon"` flag set.

If this is set to `true`, the game will generate an icon shadow (using signed distance fields) for the sprite. */
  generate_sdf?: boolean;
  invert_colors?: boolean;
  /** Only loaded if this is an icon, that is it has the flag `"group=icon"` or `"group=gui"`. Will be clamped to range `[0, 5]`. */
  mipmap_count?: number;
  priority?: SpritePriority;
  /** Whether to rotate the `shift` alongside the sprite's rotation. This only applies to sprites which are procedurally rotated by the game engine (like projectiles, wires, inserter hands, etc). */
  rotate_shift?: boolean;
  /** Values other than `1` specify the scale of the sprite on default zoom. A scale of `2` means that the picture will be two times bigger on screen (and thus more pixelated). */
  scale?: number;
  /** The shift in tiles. `util.by_pixel()` can be used to divide the shift by 32 which is the usual pixel height/width of 1 tile in normal resolution. Note that 32 pixel tile height/width is not enforced anywhere - any other tile height or width is also possible. */
  shift?: Vector;
  /** Provides hint to sprite atlas system, so it can try to put sprites that are intended to be used at the same locations to the same sprite atlas. */
  surface?: SpriteUsageSurfaceHint;
  tint?: Color;
  tint_as_overlay?: boolean;
  /** Provides hint to sprite atlas system, so it can pack sprites that are related to each other to the same sprite atlas. */
  usage?: SpriteUsageHint;
}

export type SpriteParameters = _SpriteParameters &
  Omit<SpriteSource, keyof _SpriteParameters>;
interface _SpriteSheet {
  /** Number of slices this is sliced into when using the "optimized atlas packing" option. If you are a modder, you can just ignore this property. Example: If this is 4, the sprite will be sliced into a 4x4 grid. */
  dice?: SpriteSizeType;
  /** Same as `dice` above, but this specifies only how many slices there are on the x axis. */
  dice_x?: SpriteSizeType;
  /** Same as `dice` above, but this specifies only how many slices there are on the y axis. */
  dice_y?: SpriteSizeType;
  filenames?: FileName[];
  /** If this property is present, all SpriteSheet definitions have to be placed as entries in the array, and they will all be loaded from there. `layers` may not be an empty table. Each definition in the array may also have the `layers` property.

If this property is present, all other properties, including those inherited from SpriteParameters, are ignored. */
  layers?: SpriteSheet[];
  line_length?: number;
  /** Mandatory if `filenames` is defined. */
  lines_per_file?: number;
  repeat_count?: number;
  variation_count?: number;
}

export type SpriteSheet = _SpriteSheet &
  Omit<SpriteParameters, keyof _SpriteSheet>;
export interface SpriteSource {
  /** The path to the sprite file to use. */
  filename: FileName;
  /** Mandatory if `size` is not defined.

Height of the picture in pixels, from 0-4096. */
  height?: SpriteSizeType;
  /** Minimal mode is entered when mod loading fails. You are in it when you see the gray box after (part of) the loading screen that tells you a mod error. Modders can ignore this property. */
  load_in_minimal_mode?: boolean;
  /** Loaded only when `x` and `y` are both `0`. The first member of the tuple is `x` and the second is `y`. */
  position?: [SpriteSizeType, SpriteSizeType];
  /** Whether alpha should be pre-multiplied. */
  premul_alpha?: boolean;
  /** The width and height of the sprite. If this is a tuple, the first member of the tuple is the width and the second is the height. Otherwise the size is both width and height. Width and height may only be in the range of 0-4096. */
  size?: SpriteSizeType | [SpriteSizeType, SpriteSizeType];
  /** Mandatory if `size` is not defined.

Width of the picture in pixels, from 0-4096. */
  width?: SpriteSizeType;
  /** Horizontal position of the sprite in the source file in pixels. */
  x?: SpriteSizeType;
  /** Vertical position of the sprite in the source file in pixels. */
  y?: SpriteSizeType;
}
interface _SpriteVariations {
  sheet: SpriteSheet;
}
interface _StackTransferTipTrigger {
  transfer?: 'stack' | 'inventory' | 'whole-inventory';
  type: 'stack-transfer';
}

export type StackTransferTipTrigger = _StackTransferTipTrigger &
  Omit<CountBasedTipTrigger, keyof _StackTransferTipTrigger>;

export function isStackTransferTipTrigger(
  value: unknown,
): value is StackTransferTipTrigger {
  return (value as { type: string }).type === 'stack-transfer';
}

export interface StateSteeringSettings {
  /** Used only for special "to look good" purposes (like in trailer). */
  force_unit_fuzzy_goto_behavior: boolean;
  /** Not including the radius of the unit. */
  radius: number;
  separation_factor: number;
  separation_force: number;
}
export interface StatelessVisualisation {
  acceleration_x?: number;
  acceleration_y?: number;
  acceleration_z?: number;
  adjust_animation_speed_by_base_scale?: boolean;
  affected_by_wind?: boolean;
  /** One of `nested_visualisations`, `animation` and `light` needs to be defined. */
  animation?: AnimationVariations;
  begin_scale?: number;
  can_lay_on_the_ground?: boolean;
  count?: number;
  end_scale?: number;
  fade_in_progress_duration?: number;
  fade_out_progress_duration?: number;
  /** One of `nested_visualisations`, `animation` and `light` needs to be defined. */
  light?: LightDefinition;
  /** Only loaded if `count` is not defined. */
  max_count?: number;
  /** Only loaded if `count` is not defined. */
  min_count?: number;
  /** Silently clamped to be between 0 and 1. */
  movement_slowdown_factor_x?: number;
  /** Silently clamped to be between 0 and 1. */
  movement_slowdown_factor_y?: number;
  /** Silently clamped to be between 0 and 1. */
  movement_slowdown_factor_z?: number;
  /** One of `nested_visualisations`, `animation` and `light` needs to be defined. */
  nested_visualisations?: StatelessVisualisation | StatelessVisualisation[];
  offset_x?: RangedValue;
  offset_y?: RangedValue;
  offset_z?: RangedValue;
  particle_tick_offset?: number;
  period?: number;
  /** Array may be at most 32 elements. */
  positions?: Vector[];
  /** Silently clamped to be between 0 and 1. */
  probability?: number;
  render_layer?: RenderLayer;
  scale?: RangedValue;
  /** Shadow variation count must be equal to animation variation count.

Only loaded if `animation` is defined. */
  shadow?: AnimationVariations;
  speed_x?: RangedValue;
  speed_y?: RangedValue;
  speed_z?: RangedValue;
  spread_progress_duration?: number;
}
export interface StatusColors {
  disabled?: Color;
  full_output?: Color;
  idle?: Color;
  insufficient_input?: Color;
  low_power?: Color;
  no_minable_resources?: Color;
  no_power?: Color;
  working?: Color;
}
export interface SteeringSettings {
  default: StateSteeringSettings;
  moving: StateSteeringSettings;
}
export interface StorageTankPictures {
  flow_sprite?: Sprite;
  fluid_background?: Sprite;
  frozen_patch?: Sprite4Way;
  gas_flow?: Animation;
  picture?: Sprite4Way;
  window_background?: Sprite;
}
interface _StreamAttackParameters {
  fluid_consumption?: FluidAmount;
  /** Controls which fluids can fuel this stream attack and their potential damage bonuses. */
  fluids?: StreamFluidProperties[];
  gun_barrel_length?: number;
  gun_center_shift?: Vector | GunShift4Way;
  projectile_creation_parameters?: CircularProjectileCreationSpecification;
  type: 'stream';
}

export type StreamAttackParameters = _StreamAttackParameters &
  Omit<BaseAttackParameters, keyof _StreamAttackParameters>;

export function isStreamAttackParameters(
  value: unknown,
): value is StreamAttackParameters {
  return (value as { type: string }).type === 'stream';
}

export interface StreamFluidProperties {
  damage_modifier?: number;
  type: FluidID;
}
interface _StreamTriggerDelivery {
  source_offset?: Vector;
  /** Name of a [FluidStreamPrototype](prototype:FluidStreamPrototype). */
  stream: EntityID;
  type: 'stream';
}

export type StreamTriggerDelivery = _StreamTriggerDelivery &
  Omit<TriggerDeliveryItem, keyof _StreamTriggerDelivery>;

export function isStreamTriggerDelivery(
  value: unknown,
): value is StreamTriggerDelivery {
  return (value as { type: string }).type === 'stream';
}

/** Used as an alternative way to specify animations. */
export interface Stripe {
  filename: FileName;
  /** Mandatory when Stripe is used in [Animation](prototype:Animation).

Optional when it is used in [RotatedAnimation](prototype:RotatedAnimation), where it defaults to [RotatedAnimation::direction_count](prototype:RotatedAnimation::direction_count). */
  height_in_frames: number;
  width_in_frames: number;
  x?: number;
  y?: number;
}
interface _StyleWithClickableGraphicalSetSpecification {
  clicked_graphical_set?: ElementImageSet;
  default_graphical_set?: ElementImageSet;
  disabled_graphical_set?: ElementImageSet;
  game_controller_selected_hovered_graphical_set?: ElementImageSet;
  hovered_graphical_set?: ElementImageSet;
  left_click_sound?: Sound;
  selected_clicked_graphical_set?: ElementImageSet;
  selected_graphical_set?: ElementImageSet;
  selected_hovered_graphical_set?: ElementImageSet;
}

export type StyleWithClickableGraphicalSetSpecification =
  _StyleWithClickableGraphicalSetSpecification &
    Omit<
      BaseStyleSpecification,
      keyof _StyleWithClickableGraphicalSetSpecification
    >;
/** Requires Space Age to use. */
export interface SurfaceCondition {
  max?: number;
  min?: number;
  property: SurfacePropertyID;
}
export interface SurfaceRenderParameters {
  clouds?: CloudsEffectProperties;
  day_night_cycle_color_lookup?: DaytimeColorLookupTable;
  /** When set to `true` and `clouds` property is not set, the legacy sprite clouds will be rendered on the surface. */
  draw_sprite_clouds?: boolean;
  fog?: FogEffectProperties;
  shadow_opacity?: number;
  space_dust_background?: SpaceDustEffectProperties;
  space_dust_foreground?: SpaceDustEffectProperties;
  terrain_tint_effect?: GlobalTintEffectProperties;
}
interface _SwitchStyleSpecification {
  active_label?: LabelStyleSpecification;
  button?: ButtonStyleSpecification;
  default_background?: Sprite;
  disabled_background?: Sprite;
  hover_background?: Sprite;
  inactive_label?: LabelStyleSpecification;
  left_button_position?: number;
  middle_button_position?: number;
  right_button_position?: number;
  type: 'switch_style';
}

export type SwitchStyleSpecification = _SwitchStyleSpecification &
  Omit<BaseStyleSpecification, keyof _SwitchStyleSpecification>;

export function isSwitchStyleSpecification(
  value: unknown,
): value is SwitchStyleSpecification {
  return (value as { type: string }).type === 'switch_style';
}

interface _TabStyleSpecification {
  /** Name of a [FontPrototype](prototype:FontPrototype). */
  badge_font?: string;
  badge_horizontal_spacing?: number;
  default_badge_font_color?: Color;
  default_badge_graphical_set?: ElementImageSet;
  default_font_color?: Color;
  disabled_badge_font_color?: Color;
  disabled_badge_graphical_set?: ElementImageSet;
  disabled_font_color?: Color;
  draw_grayscale_picture?: boolean;
  /** Name of a [FontPrototype](prototype:FontPrototype). */
  font?: string;
  hover_badge_graphical_set?: ElementImageSet;
  increase_height_when_selected?: boolean;
  left_edge_selected_graphical_set?: ElementImageSet;
  override_graphics_on_edges?: boolean;
  press_badge_graphical_set?: ElementImageSet;
  right_edge_selected_graphical_set?: ElementImageSet;
  selected_badge_font_color?: Color;
  selected_badge_graphical_set?: ElementImageSet;
  selected_font_color?: Color;
  type: 'tab_style';
}

export type TabStyleSpecification = _TabStyleSpecification &
  Omit<
    StyleWithClickableGraphicalSetSpecification,
    keyof _TabStyleSpecification
  >;

export function isTabStyleSpecification(
  value: unknown,
): value is TabStyleSpecification {
  return (value as { type: string }).type === 'tab_style';
}

interface _TabbedPaneStyleSpecification {
  tab_container?: TableStyleSpecification;
  tab_content_frame?: FrameStyleSpecification;
  type: 'tabbed_pane_style';
  vertical_spacing?: number;
}

export type TabbedPaneStyleSpecification = _TabbedPaneStyleSpecification &
  Omit<BaseStyleSpecification, keyof _TabbedPaneStyleSpecification>;

export function isTabbedPaneStyleSpecification(
  value: unknown,
): value is TabbedPaneStyleSpecification {
  return (value as { type: string }).type === 'tabbed_pane_style';
}

interface _TableStyleSpecification {
  apply_row_graphical_set_per_column?: boolean;
  background_graphical_set?: ElementImageSet;
  border?: BorderImageSet;
  bottom_cell_padding?: number;
  /** Sets `top_cell_padding`, `right_cell_padding`, `bottom_cell_padding` and `left_cell_padding` to the same value. */
  cell_padding?: number;
  clicked_graphical_set?: ElementImageSet;
  column_alignments?: ColumnAlignment[];
  column_graphical_set?: ElementImageSet;
  column_ordering_ascending_button_style?: ButtonStyleSpecification;
  column_ordering_descending_button_style?: ButtonStyleSpecification;
  column_widths?: ColumnWidthItem | ColumnWidth[];
  default_row_graphical_set?: ElementImageSet;
  even_row_graphical_set?: ElementImageSet;
  horizontal_line_color?: Color;
  horizontal_spacing?: number;
  hovered_graphical_set?: ElementImageSet;
  hovered_row_color?: Color;
  inactive_column_ordering_ascending_button_style?: ButtonStyleSpecification;
  inactive_column_ordering_descending_button_style?: ButtonStyleSpecification;
  left_cell_padding?: number;
  odd_row_graphical_set?: ElementImageSet;
  right_cell_padding?: number;
  selected_clicked_graphical_set?: ElementImageSet;
  selected_graphical_set?: ElementImageSet;
  selected_hovered_graphical_set?: ElementImageSet;
  selected_row_color?: Color;
  top_cell_padding?: number;
  type: 'table_style';
  vertical_line_color?: Color;
  vertical_spacing?: number;
  wide_as_column_count?: boolean;
}

export type TableStyleSpecification = _TableStyleSpecification &
  Omit<BaseStyleSpecification, keyof _TableStyleSpecification>;

export function isTableStyleSpecification(
  value: unknown,
): value is TableStyleSpecification {
  return (value as { type: string }).type === 'table_style';
}

interface _TechnologySlotStyleSpecification {
  clicked_ingredients_background?: ElementImageSet;
  clicked_overlay?: ElementImageSet;
  default_background_shadow?: ElementImageSet;
  default_ingredients_background?: ElementImageSet;
  disabled_ingredients_background?: ElementImageSet;
  highlighted_graphical_set?: ElementImageSet;
  highlighted_ingredients_background?: ElementImageSet;
  hovered_ingredients_background?: ElementImageSet;
  hovered_level_band?: ElementImageSet;
  hovered_level_font_color?: Color;
  hovered_level_range_band?: ElementImageSet;
  hovered_level_range_font_color?: Color;
  ingredient_icon_overlap?: number;
  ingredient_icon_size?: number;
  ingredients_height?: number;
  ingredients_padding?: number;
  level_band?: ElementImageSet;
  level_band_height?: number;
  level_band_width?: number;
  /** Name of a [FontPrototype](prototype:FontPrototype). */
  level_font?: string;
  level_font_color?: Color;
  level_offset_x?: number;
  level_offset_y?: number;
  level_range_band?: ElementImageSet;
  /** Name of a [FontPrototype](prototype:FontPrototype). */
  level_range_font?: string;
  level_range_font_color?: Color;
  level_range_offset_x?: number;
  level_range_offset_y?: number;
  progress_bar?: ElementImageSet;
  progress_bar_background?: ElementImageSet;
  progress_bar_color?: Color;
  progress_bar_height?: number;
  progress_bar_shadow?: ElementImageSet;
  type: 'technology_slot_style';
}

export type TechnologySlotStyleSpecification =
  _TechnologySlotStyleSpecification &
    Omit<ButtonStyleSpecification, keyof _TechnologySlotStyleSpecification>;

export function isTechnologySlotStyleSpecification(
  value: unknown,
): value is TechnologySlotStyleSpecification {
  return (value as { type: string }).type === 'technology_slot_style';
}

/** Either `count` or `count_formula` must be defined, never both. */
export interface TechnologyUnit {
  /** How many units are needed. Must be `> 0`. */
  count?: number;
  /** Formula that specifies how many units are needed per level of the technology.

If the last characters of the prototype name are `-<number>`, the level is taken to be the number, e.g. `physical-projectile-damage-2` implies a number of `2`. This defaults to `1`. There does not need to be lower-level technologies for a technology to be detected as having a level, meaning a technology or sequence of upgrade technologies can begin at any number.

For an infinite technology, the level begins at the given suffix (or `1` by default) and gains 1 level upon being researched, or if the `max_level` is reached, marked as completed. The initial level of a technology can not be greater than its `max_level`.

`l` and `L` are provided as variables in the expression, they represent the current level of the technology.

This formula can also be used at [runtime](runtime:LuaHelpers::evaluate_expression). */
  count_formula?: MathExpression;
  /** List of ingredients needed for one unit of research. The items must all be [ToolPrototypes](prototype:ToolPrototype). */
  ingredients: ResearchIngredient[];
  /** How much time one unit takes to research. In a lab with a crafting speed of `1`, it corresponds to the number of seconds. */
  time: number;
}
export interface TerritorySettings {
  /** Minimum number of chunks a territory must have. Below this, it will get deleted. */
  minimum_territory_size?: number;
  /** Mandatory if `units` is not empty. */
  territory_index_expression?: string;
  /** The result will be converted to integer, clamped and used as an index for `units` array. Negative values will result in empty spawn location. */
  territory_variation_expression?: string;
  /** Names of the [SegmentedUnitPrototype](prototype:SegmentedUnitPrototype). */
  units?: EntityID[];
}
interface _TextBoxStyleSpecification {
  active_background?: ElementImageSet;
  default_background?: ElementImageSet;
  disabled_background?: ElementImageSet;
  disabled_font_color?: Color;
  /** Name of a [FontPrototype](prototype:FontPrototype). */
  font?: string;
  font_color?: Color;
  game_controller_hovered_background?: ElementImageSet;
  rich_text_highlight_error_color?: Color;
  rich_text_highlight_ok_color?: Color;
  rich_text_highlight_warning_color?: Color;
  rich_text_setting?: RichTextSetting;
  selected_rich_text_highlight_error_color?: Color;
  selected_rich_text_highlight_ok_color?: Color;
  selected_rich_text_highlight_warning_color?: Color;
  selection_background_color?: Color;
  type: 'textbox_style';
}

export type TextBoxStyleSpecification = _TextBoxStyleSpecification &
  Omit<BaseStyleSpecification, keyof _TextBoxStyleSpecification>;

export function isTextBoxStyleSpecification(
  value: unknown,
): value is TextBoxStyleSpecification {
  return (value as { type: string }).type === 'textbox_style';
}

export interface ThrowCapsuleAction {
  attack_parameters: AttackParameters;
  type: 'throw';
  /** Whether using the capsule consumes an item from the stack. */
  uses_stack?: boolean;
}

export function isThrowCapsuleAction(
  value: unknown,
): value is ThrowCapsuleAction {
  return (value as { type: string }).type === 'throw';
}

interface _ThrusterGraphicsSet {
  flame?: Sprite;
  flame_effect?: EffectTexture;
  flame_effect_height?: number;
  flame_effect_offset?: number;
  flame_effect_width?: number;
  flame_half_height?: number;
  flame_position?: Vector;
}

export type ThrusterGraphicsSet = _ThrusterGraphicsSet &
  Omit<WorkingVisualisations, keyof _ThrusterGraphicsSet>;
interface _ThrusterPerformancePoint {
  effectivity: number;
  fluid_usage: FluidAmount;
  fluid_volume: number;
}
export interface TileAndAlpha {
  alpha: number;
  tile: TileID;
}
/** Used for particles created with [apply_tile_tint](prototype:CreateParticleTriggerEffectItem::apply_tile_tint) defined. */
export interface TileBasedParticleTints {
  primary?: Color;
  secondary?: Color;
}
export interface TileBuildSound {
  animated?: Sound;
  large?: Sound;
  medium?: Sound;
  small?: Sound;
}
export interface TileBuildabilityRule {
  area: SimpleBoundingBox;
  colliding_tiles?: CollisionMaskConnector;
  remove_on_collision?: boolean;
  required_tiles?: CollisionMaskConnector;
}
interface _TileLightPictures {
  /** Only powers of 2 from 1 to 128 can be used. Square size of the tile arrangement this sprite is used for. Used to calculate the `width` and `height` of the sprite which cannot be set directly. (width or height) = size * 32 / scale. */
  size: number;
}

export type TileLightPictures = _TileLightPictures &
  Omit<TileSpriteLayout, keyof _TileLightPictures>;
interface _TileMainPictures {
  /** Probability of 1x1 (size = 1) version of tile must be 1. */
  probability?: number;
  /** Only powers of 2 from 1 to 128 can be used. Square size of the tile arrangement this sprite is used for. Used to calculate the `width` and `height` of the sprite which cannot be set directly. (width or height) = size * 32 / scale. */
  size: number;
  weights?: number[];
}

export type TileMainPictures = _TileMainPictures &
  Omit<TileSpriteLayout, keyof _TileMainPictures>;
/** Coordinates of a tile on a map where each integer `x`/`y` represents a different tile. This uses the same format as [MapPosition](prototype:MapPosition), except it rounds any non-integer `x`/`y` down to whole numbers. It can be specified either with or without explicit keys. */
interface _TilePosition {
  x: number;
  y: number;
}
export interface TileSpriteLayout {
  /** Frame count. */
  count?: number;
  /** Once the specified number of pictures is loaded, other pictures are loaded on other line. This is to allow having longer animations in matrix, to input files with too high width. The game engine limits the width of any input files to 8192px, so it is compatible with most graphics cards. 0 means that all the pictures are in one horizontal line. */
  line_length?: number;
  picture: FileName;
  scale?: number;
  /** Horizontal position of the sprite in the source file in pixels. */
  x?: SpriteSizeType;
  /** Vertical position of the sprite in the source file in pixels. */
  y?: SpriteSizeType;
}
export interface TileSpriteLayoutVariant {
  /** Frame count. */
  count?: number;
  /** Once the specified number of pictures is loaded, other pictures are loaded on other line. This is to allow having longer animations in matrix, to input files with too high width. The game engine limits the width of any input files to 8192px, so it is compatible with most graphics cards. 0 means that all the pictures are in one horizontal line. */
  line_length?: number;
  scale?: number;
  spritesheet?: FileName;
  /** Height of the transition sprite in tiles. May be 1 or 2. It is forced to 1 for mask layers and for o_transition. A tile is considered 32px with scale 1 (so 64px with scale 0.5). Shift of the sprite will be adjusted such that the top 1x1 tile is centered on a tile being drawn (so it will be
```
{0, 0.5*(tile_height - 1)}
```
) It can be anything between 1 to 8 for `background` layer if `draw_background_layer_under_tiles` is set to true. */
  tile_height?: number;
  /** Horizontal position of the sprite in the source file in pixels. */
  x?: SpriteSizeType;
  /** Vertical position of the sprite in the source file in pixels. */
  y?: SpriteSizeType;
}
/** The properties from the parent TileSpriteLayoutVariant provide defaults for the TileTransitionVariantLayouts.

The `{inner_corner | outer_corner | side | double_side | u_transition | o_transition}_*` properties provide defaults for the corresponding properties in the TileTransitionVariantLayouts. They are used when the TileTransitionVariantLayouts have the same layout. See the example below. */
interface _TileTransitionSpritesheetLayout {
  /** Only loaded if [TileTransitions::auxiliary_effect_mask_layout](prototype:TileTransitions::auxiliary_effect_mask_layout) is not defined in the TileTransitions that load this. */
  auxiliary_effect_mask?: TileTransitionVariantLayout;
  /** Only loaded if [TileTransitions::background_layout](prototype:TileTransitions::background_layout) is not defined in the TileTransitions that load this. */
  background?: TileTransitionVariantLayout;
  /** Only loaded if [TileTransitions::background_mask_layout](prototype:TileTransitions::background_mask_layout) is not defined in the TileTransitions that load this. */
  background_mask?: TileTransitionVariantLayout;
  double_side_count?: number;
  double_side_line_length?: number;
  double_side_scale?: number;
  double_side_tile_height?: number;
  /** Horizontal position of the sprite in the source file in pixels. */
  double_side_x?: SpriteSizeType;
  /** Vertical position of the sprite in the source file in pixels. */
  double_side_y?: SpriteSizeType;
  /** Only loaded if [TileTransitions::effect_map_layout](prototype:TileTransitions::effect_map_layout) is not defined in the TileTransitions that load this. */
  effect_map?: TileTransitionVariantLayout;
  inner_corner_count?: number;
  inner_corner_line_length?: number;
  inner_corner_scale?: number;
  inner_corner_tile_height?: number;
  /** Horizontal position of the sprite in the source file in pixels. */
  inner_corner_x?: SpriteSizeType;
  /** Vertical position of the sprite in the source file in pixels. */
  inner_corner_y?: SpriteSizeType;
  /** Only loaded if [TileTransitions::lightmap_layout](prototype:TileTransitions::lightmap_layout) is not defined in the TileTransitions that load this. */
  lightmap?: TileTransitionVariantLayout;
  /** Only loaded if [TileTransitions::mask_layout](prototype:TileTransitions::mask_layout) is not defined in the TileTransitions that load this. */
  mask?: TileTransitionVariantLayout;
  o_transition_count?: number;
  o_transition_line_length?: number;
  o_transition_scale?: number;
  o_transition_tile_height?: number;
  /** Horizontal position of the sprite in the source file in pixels. */
  o_transition_x?: SpriteSizeType;
  /** Vertical position of the sprite in the source file in pixels. */
  o_transition_y?: SpriteSizeType;
  outer_corner_count?: number;
  outer_corner_line_length?: number;
  outer_corner_scale?: number;
  outer_corner_tile_height?: number;
  /** Horizontal position of the sprite in the source file in pixels. */
  outer_corner_x?: SpriteSizeType;
  /** Vertical position of the sprite in the source file in pixels. */
  outer_corner_y?: SpriteSizeType;
  /** Only loaded if [TileTransitions::overlay_layout](prototype:TileTransitions::overlay_layout) is not defined in the TileTransitions that load this. */
  overlay?: TileTransitionVariantLayout;
  side_count?: number;
  side_line_length?: number;
  side_scale?: number;
  side_tile_height?: number;
  /** Horizontal position of the sprite in the source file in pixels. */
  side_x?: SpriteSizeType;
  /** Vertical position of the sprite in the source file in pixels. */
  side_y?: SpriteSizeType;
  u_transition_count?: number;
  u_transition_line_length?: number;
  u_transition_scale?: number;
  u_transition_tile_height?: number;
  /** Horizontal position of the sprite in the source file in pixels. */
  u_transition_x?: SpriteSizeType;
  /** Vertical position of the sprite in the source file in pixels. */
  u_transition_y?: SpriteSizeType;
}

export type TileTransitionSpritesheetLayout = _TileTransitionSpritesheetLayout &
  Omit<TileSpriteLayoutVariant, keyof _TileTransitionSpritesheetLayout>;
/** The properties from the parent TileSpriteLayoutVariant provide defaults for the properties defined here.

The `{inner_corner | outer_corner | side | double_side | u_transition | o_transition}_*` properties provide defaults for the properties inside the specific variant. They are used to specify select values for the variant without creating the table for the variant.

These various ways to define the variants are also shown in the examples below. */
interface _TileTransitionVariantLayout {
  /** Defaults to the values set in the `double_side_*` properties. */
  double_side?: TileSpriteLayoutVariant;
  double_side_count?: number;
  double_side_line_length?: number;
  double_side_scale?: number;
  double_side_tile_height?: number;
  /** Horizontal position of the sprite in the source file in pixels. */
  double_side_x?: SpriteSizeType;
  /** Vertical position of the sprite in the source file in pixels. */
  double_side_y?: SpriteSizeType;
  /** Defaults to the values set in the `inner_corner_*` properties. */
  inner_corner?: TileSpriteLayoutVariant;
  inner_corner_count?: number;
  inner_corner_line_length?: number;
  inner_corner_scale?: number;
  inner_corner_tile_height?: number;
  /** Horizontal position of the sprite in the source file in pixels. */
  inner_corner_x?: SpriteSizeType;
  /** Vertical position of the sprite in the source file in pixels. */
  inner_corner_y?: SpriteSizeType;
  /** Defaults to the values set in the `o_transition_*` properties. */
  o_transition?: TileSpriteLayoutVariant;
  o_transition_count?: number;
  o_transition_line_length?: number;
  o_transition_scale?: number;
  o_transition_tile_height?: number;
  /** Horizontal position of the sprite in the source file in pixels. */
  o_transition_x?: SpriteSizeType;
  /** Vertical position of the sprite in the source file in pixels. */
  o_transition_y?: SpriteSizeType;
  /** Defaults to the values set in the `outer_corner_*` properties. */
  outer_corner?: TileSpriteLayoutVariant;
  outer_corner_count?: number;
  outer_corner_line_length?: number;
  outer_corner_scale?: number;
  outer_corner_tile_height?: number;
  /** Horizontal position of the sprite in the source file in pixels. */
  outer_corner_x?: SpriteSizeType;
  /** Vertical position of the sprite in the source file in pixels. */
  outer_corner_y?: SpriteSizeType;
  /** Defaults to the values set in the `side_*` properties. */
  side?: TileSpriteLayoutVariant;
  side_count?: number;
  side_line_length?: number;
  side_scale?: number;
  side_tile_height?: number;
  /** Horizontal position of the sprite in the source file in pixels. */
  side_x?: SpriteSizeType;
  /** Vertical position of the sprite in the source file in pixels. */
  side_y?: SpriteSizeType;
  /** Defaults to the values set in the `u_transition_*` properties. */
  u_transition?: TileSpriteLayoutVariant;
  u_transition_count?: number;
  u_transition_line_length?: number;
  u_transition_scale?: number;
  u_transition_tile_height?: number;
  /** Horizontal position of the sprite in the source file in pixels. */
  u_transition_x?: SpriteSizeType;
  /** Vertical position of the sprite in the source file in pixels. */
  u_transition_y?: SpriteSizeType;
  x_offset?: SpriteSizeType;
  y_offset?: SpriteSizeType;
}

export type TileTransitionVariantLayout = _TileTransitionVariantLayout &
  Omit<TileSpriteLayoutVariant, keyof _TileTransitionVariantLayout>;
/** Used for [TilePrototype](prototype:TilePrototype) graphics.

Use `layout` with `spritesheet` to define all the tile layers inside the `layout` property. The `*_enabled`, `*_layout` and `*_spritesheet` properties can be used to override specific layers of a reused layout. */
export interface TileTransitions {
  apply_effect_color_to_overlay?: boolean;
  apply_waving_effect_on_background_mask?: boolean;
  apply_waving_effect_on_masks?: boolean;
  auxiliary_effect_mask_enabled?: boolean;
  /** Overrides the `auxiliary_effect_mask` definition inside `layout`. */
  auxiliary_effect_mask_layout?: TileTransitionVariantLayout;
  /** Only loaded if `layout` or `auxiliary_effect_mask_layout` is defined.

Default spritesheet for `auxiliary_effect_mask_layout` and `layout.auxiliary_effect_mask`. */
  auxiliary_effect_mask_spritesheet?: FileName;
  background_enabled?: boolean;
  background_layer_group?: TileRenderLayer;
  background_layer_offset?: number;
  /** Overrides the `background` definition inside `layout`. */
  background_layout?: TileTransitionVariantLayout;
  background_mask_enabled?: boolean;
  /** Overrides the `background_mask` definition inside `layout`. */
  background_mask_layout?: TileTransitionVariantLayout;
  /** Only loaded if `layout` or `background_mask_layout` is defined.

Default spritesheet for `background_mask_layout` and `layout.background_mask`. */
  background_mask_spritesheet?: FileName;
  /** Only loaded if `layout` or `background_layout` is defined.

Default spritesheet for `background_layout` and `layout.background`. */
  background_spritesheet?: FileName;
  double_side_variations_in_group?: number;
  double_side_weights?: number[];
  draw_background_layer_under_tiles?: boolean;
  draw_simple_outer_corner_over_diagonal?: boolean;
  effect_map_enabled?: boolean;
  /** Overrides the `effect_map` definition inside `layout`. */
  effect_map_layout?: TileTransitionVariantLayout;
  /** Only loaded if `layout` or `effect_map_layout` is defined.

Default spritesheet for `effect_map_layout` and `layout.effect_map`. */
  effect_map_spritesheet?: FileName;
  inner_corner_weights?: number[];
  layout?: TileTransitionSpritesheetLayout;
  lightmap_enabled?: boolean;
  /** Overrides the `lightmap` definition inside `layout`. */
  lightmap_layout?: TileTransitionVariantLayout;
  /** Only loaded if `layout` or `lightmap_layout` is defined.

Default spritesheet for `lightmap_layout` and `layout.lightmap`. */
  lightmap_spritesheet?: FileName;
  mask_enabled?: boolean;
  /** Overrides the `mask` definition inside `layout`. */
  mask_layout?: TileTransitionVariantLayout;
  /** Only loaded if `layout` or `mask_layout` is defined.

Default spritesheet for `mask_layout` and `layout.mask`. */
  mask_spritesheet?: FileName;
  masked_background_layer_offset?: number;
  masked_overlay_layer_offset?: number;
  offset_background_layer_by_tile_layer?: boolean;
  outer_corner_weights?: number[];
  overlay_enabled?: boolean;
  overlay_layer_group?: TileRenderLayer;
  overlay_layer_offset?: number;
  /** Overrides the `overlay` definition inside `layout`. */
  overlay_layout?: TileTransitionVariantLayout;
  side_variations_in_group?: number;
  side_weights?: number[];
  /** Default spritesheet for all TileSpriteLayouts. */
  spritesheet?: FileName;
  u_transition_weights?: number[];
  water_patch?: Sprite;
  waving_effect_time_scale?: number;
}
interface _TileTransitionsBetweenTransitions {
  transition_group1: number;
  transition_group2: number;
}

export type TileTransitionsBetweenTransitions =
  _TileTransitionsBetweenTransitions &
    Omit<TileTransitions, keyof _TileTransitionsBetweenTransitions>;
interface _TileTransitionsToTiles {
  to_tiles: TileID[];
  transition_group: number;
}

export type TileTransitionsToTiles = _TileTransitionsToTiles &
  Omit<TileTransitions, keyof _TileTransitionsToTiles>;
export interface TileTransitionsVariants {
  empty_transitions?: boolean;
  light?: TileLightPictures[];
  main: TileMainPictures[];
  material_background?: MaterialTextureParameters;
  /** Must have the same `count` as material_background. */
  material_light?: MaterialTextureParameters;
  material_texture_height_in_tiles?: number;
  material_texture_width_in_tiles?: number;
  /** Only loaded, and mandatory if `empty_transitions` is `false`. */
  transition?: TileTransitions;
}
export interface TimeElapsedTipTrigger {
  ticks: number;
  type: 'time-elapsed';
}

export function isTimeElapsedTipTrigger(
  value: unknown,
): value is TimeElapsedTipTrigger {
  return (value as { type: string }).type === 'time-elapsed';
}

export interface TimeSinceLastTipActivationTipTrigger {
  ticks: MapTick;
  type: 'time-since-last-tip-activation';
}

export function isTimeSinceLastTipActivationTipTrigger(
  value: unknown,
): value is TimeSinceLastTipActivationTipTrigger {
  return (value as { type: string }).type === 'time-since-last-tip-activation';
}

/** One frame in time for a Bezier interpolation. */
export interface TintProcessionBezierControlPoint {
  /** `opacity` and `opacity_t` interpolate a double smoothly over time. */
  opacity?: number;
  /** Bidirectional tangent at the given timestamp. */
  opacity_t?: number;
  /** Mandatory if `opacity` or `tint_upper` or `tint_lower` is defined. */
  timestamp?: MapTick;
  /** `tint_lower` and `tint_lower_t` interpolate a color smoothly over time. */
  tint_lower?: Color;
  /** Bidirectional tangent at the given timestamp. */
  tint_lower_t?: Color;
  /** `tint_upper` and `tint_upper_t` interpolate a color smoothly over time. */
  tint_upper?: Color;
  /** Bidirectional tangent at the given timestamp. */
  tint_upper_t?: Color;
}
/** Fullscreen overlay which blends gradient from top to bottom edge of the screen using [premultiplied alpha blending](prototype:BlendMode::normal). */
export interface TintProcessionLayer {
  frames: TintProcessionBezierControlPoint[];
  render_layer?: RenderLayer;
  type: 'tint';
}

export function isTintProcessionLayer(
  value: unknown,
): value is TintProcessionLayer {
  return (value as { type: string }).type === 'tint';
}

interface _ToggleRailLayerTipTrigger {
  type: 'toggle-rail-layer';
}

export type ToggleRailLayerTipTrigger = _ToggleRailLayerTipTrigger &
  Omit<CountBasedTipTrigger, keyof _ToggleRailLayerTipTrigger>;

export function isToggleRailLayerTipTrigger(
  value: unknown,
): value is ToggleRailLayerTipTrigger {
  return (value as { type: string }).type === 'toggle-rail-layer';
}

interface _ToggleShowEntityInfoTipTrigger {
  type: 'toggle-show-entity-info';
}

export type ToggleShowEntityInfoTipTrigger = _ToggleShowEntityInfoTipTrigger &
  Omit<CountBasedTipTrigger, keyof _ToggleShowEntityInfoTipTrigger>;

export function isToggleShowEntityInfoTipTrigger(
  value: unknown,
): value is ToggleShowEntityInfoTipTrigger {
  return (value as { type: string }).type === 'toggle-show-entity-info';
}

interface _TrainBrakingForceBonusModifier {
  /** If set to `false`, use the icon from [UtilitySprites](prototype:UtilitySprites) for this technology effect icon. */
  infer_icon?: boolean;
  type: 'train-braking-force-bonus';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type TrainBrakingForceBonusModifier = _TrainBrakingForceBonusModifier &
  Omit<SimpleModifier, keyof _TrainBrakingForceBonusModifier>;

export function isTrainBrakingForceBonusModifier(
  value: unknown,
): value is TrainBrakingForceBonusModifier {
  return (value as { type: string }).type === 'train-braking-force-bonus';
}

export interface TrainPathFinderConstants {
  signal_reserved_by_circuit_network_penalty: number;
  stopped_manually_controlled_train_penalty: number;
  stopped_manually_controlled_train_without_passenger_penalty: number;
  train_arriving_to_signal_penalty: number;
  train_arriving_to_station_penalty: number;
  train_auto_without_schedule_penalty: number;
  train_in_station_penalty: number;
  train_in_station_with_no_other_valid_stops_in_schedule: number;
  train_stop_penalty: number;
  train_waiting_at_signal_penalty: number;
  /** Must be >= 0. */
  train_waiting_at_signal_tick_multiplier_penalty: number;
  train_with_no_path_penalty: number;
}
export interface TrainStopDrawingBoxes {
  east: BoundingBox;
  north: BoundingBox;
  south: BoundingBox;
  west: BoundingBox;
}
export interface TrainStopLight {
  light: LightDefinition;
  picture: Sprite4Way;
  red_picture: Sprite4Way;
}
export interface TrainVisualizationConstants {
  box_length: number;
  box_width: number;
  connection_distance: number;
  final_margin: number;
  joint_distance: number;
  last_box_color: Color;
  not_last_box_color: Color;
  stock_number_scale: number;
}
export interface TransitionApplication {
  offset?: boolean;
  pod_offset?: boolean;
  rotation?: boolean;
}
export interface TransportBeltAnimationSet {
  alternate?: boolean;
  animation_set: RotatedAnimation;
  belt_reader?: BeltReaderLayer[];
  east_index?: number;
  /** Only loaded if `frozen_patch` is defined. */
  east_index_frozen?: number;
  ending_east_index?: number;
  /** Only loaded if `frozen_patch` is defined. */
  ending_east_index_frozen?: number;
  ending_north_index?: number;
  /** Only loaded if `frozen_patch` is defined. */
  ending_north_index_frozen?: number;
  ending_south_index?: number;
  /** Only loaded if `frozen_patch` is defined. */
  ending_south_index_frozen?: number;
  ending_west_index?: number;
  /** Only loaded if `frozen_patch` is defined. */
  ending_west_index_frozen?: number;
  frozen_patch?: RotatedSprite;
  north_index?: number;
  /** Only loaded if `frozen_patch` is defined. */
  north_index_frozen?: number;
  south_index?: number;
  /** Only loaded if `frozen_patch` is defined. */
  south_index_frozen?: number;
  starting_east_index?: number;
  /** Only loaded if `frozen_patch` is defined. */
  starting_east_index_frozen?: number;
  starting_north_index?: number;
  /** Only loaded if `frozen_patch` is defined. */
  starting_north_index_frozen?: number;
  starting_south_index?: number;
  /** Only loaded if `frozen_patch` is defined. */
  starting_south_index_frozen?: number;
  starting_west_index?: number;
  /** Only loaded if `frozen_patch` is defined. */
  starting_west_index_frozen?: number;
  west_index?: number;
  /** Only loaded if `frozen_patch` is defined. */
  west_index_frozen?: number;
}
interface _TransportBeltAnimationSetWithCorners {
  east_to_north_index?: number;
  /** Only loaded if `frozen_patch` is defined. */
  east_to_north_index_frozen?: number;
  east_to_south_index?: number;
  /** Only loaded if `frozen_patch` is defined. */
  east_to_south_index_frozen?: number;
  north_to_east_index?: number;
  /** Only loaded if `frozen_patch` is defined. */
  north_to_east_index_frozen?: number;
  north_to_west_index?: number;
  /** Only loaded if `frozen_patch` is defined. */
  north_to_west_index_frozen?: number;
  south_to_east_index?: number;
  /** Only loaded if `frozen_patch` is defined. */
  south_to_east_index_frozen?: number;
  south_to_west_index?: number;
  /** Only loaded if `frozen_patch` is defined. */
  south_to_west_index_frozen?: number;
  west_to_north_index?: number;
  /** Only loaded if `frozen_patch` is defined. */
  west_to_north_index_frozen?: number;
  west_to_south_index?: number;
  /** Only loaded if `frozen_patch` is defined. */
  west_to_south_index_frozen?: number;
}

export type TransportBeltAnimationSetWithCorners =
  _TransportBeltAnimationSetWithCorners &
    Omit<
      TransportBeltAnimationSet,
      keyof _TransportBeltAnimationSetWithCorners
    >;
/** Used to define the graphics for the (in vanilla) yellow frame that is used when a [TransportBeltPrototype](prototype:TransportBeltPrototype) is connected to the circuit network. */
export interface TransportBeltConnectorFrame {
  frame_back_patch?: SpriteVariations;
  frame_front_patch?: SpriteVariations;
  frame_main: AnimationVariations;
  frame_main_scanner: Animation;
  frame_main_scanner_cross_horizontal_end_shift: Vector;
  frame_main_scanner_cross_horizontal_rotation: RealOrientation;
  frame_main_scanner_cross_horizontal_start_shift: Vector;
  frame_main_scanner_cross_horizontal_y_scale: number;
  frame_main_scanner_cross_vertical_end_shift: Vector;
  frame_main_scanner_cross_vertical_rotation: RealOrientation;
  frame_main_scanner_cross_vertical_start_shift: Vector;
  frame_main_scanner_cross_vertical_y_scale: number;
  frame_main_scanner_horizontal_end_shift: Vector;
  frame_main_scanner_horizontal_rotation: RealOrientation;
  frame_main_scanner_horizontal_start_shift: Vector;
  frame_main_scanner_horizontal_y_scale: number;
  frame_main_scanner_movement_speed: number;
  frame_main_scanner_nw_ne: Animation;
  frame_main_scanner_sw_se: Animation;
  frame_main_scanner_vertical_end_shift: Vector;
  frame_main_scanner_vertical_rotation: RealOrientation;
  frame_main_scanner_vertical_start_shift: Vector;
  frame_main_scanner_vertical_y_scale: number;
  frame_shadow: AnimationVariations;
}
/** Tree has number of "dying" stages, which is deduced from frame count of `shadow` if shadow is defined, otherwise from frame count of `trunk`. Frame count of `leaves` has to be one less than deduced number stages, as last stage is always assumed to be leafless. */
export interface TreeVariation {
  branch_generation: CreateParticleTriggerEffectItem;
  /** Only loaded if `shadow` is present. Defaults to `shadow.frame_count - 1`. */
  disable_shadow_distortion_beginning_at_frame?: number;
  leaf_generation: CreateParticleTriggerEffectItem;
  leaves: Animation;
  /** Normal must have the same frame_count as `leaves`. */
  normal?: Animation;
  /** Overlay must have the same frame_count as `leaves`. Won't be tinted by the tree color unless `apply_runtime_tint` is set to `true` in the sprite definition. See [here](https://forums.factorio.com/viewtopic.php?p=547758#p547758). */
  overlay?: Animation;
  /** Shadow must have 1 more `frame_count` than `leaves`. */
  shadow?: Animation;
  /** If `shadow` is not specified, this has to have one more frame than `leaves`. */
  trunk: Animation;
  underwater?: Animation;
  underwater_layer_offset?: number;
  water_reflection?: WaterReflectionDefinition;
}
/** The abstract base of all [TriggerDeliveries](prototype:TriggerDelivery). */
export interface TriggerDeliveryItem {
  /** Provides the source of the TriggerDelivery as as both the source and target of the effect. */
  source_effects?: TriggerEffect;
  target_effects?: TriggerEffect;
}
/** The abstract base of all [TriggerEffects](prototype:TriggerEffect). */
export interface TriggerEffectItem {
  affects_target?: boolean;
  /** Guaranteed to work with [EntityWithHealthPrototype::damaged_trigger_effect](prototype:EntityWithHealthPrototype::damaged_trigger_effect) and [EntityWithHealthPrototype::dying_trigger_effect](prototype:EntityWithHealthPrototype::dying_trigger_effect). Unknown if it works with other properties that use [TriggerEffect](prototype:TriggerEffect). */
  damage_type_filters?: DamageTypeFilters;
  /** Must be greater than `0` and less than or equal to `1`. */
  probability?: number;
  repeat_count?: number;
  repeat_count_deviation?: number;
  show_in_tooltip?: boolean;
}
/** A [TriggerEffect](prototype:TriggerEffect) with cooldown conditions, used to limit the frequency of trigger effects that would otherwise fire every single tick. If multiple cooldown conditions are defined, then all cooldowns must be satisfied before the effect can be triggered. */
export interface TriggerEffectWithCooldown {
  /** The travel distance between triggers that the triggerer must travel between effects. Negative values will mean there is no cooldown. */
  distance_cooldown?: number;
  effect: TriggerEffect;
  /** The initial state of the distance cooldown. In other words, the distance the triggerer must travel before the first effect can be triggered. Useful for staggering multiple effects. */
  initial_distance_cooldown?: number;
  /** The initial amount of time to wait before triggering the effect for the first time. */
  initial_time_cooldown?: MapTick;
  /** The number of ticks that elapse between triggers. */
  time_cooldown?: MapTick;
}
/** The abstract base of all [Triggers](prototype:Trigger). */
export interface TriggerItem {
  action_delivery?: TriggerDelivery | TriggerDelivery[];
  /** Only prototypes with these collision masks are affected by the trigger item. */
  collision_mask?: CollisionMaskConnector;
  /** Only prototypes with these flags are affected by the trigger item. */
  entity_flags?: EntityPrototypeFlags;
  /** Only entities meeting the force condition are affected by the trigger item. */
  force?: ForceCondition;
  ignore_collision_condition?: boolean;
  /** Must be greater than 0 and less than or equal to 1. */
  probability?: number;
  repeat_count?: number;
  /** The trigger affects only prototypes with these masks. */
  trigger_target_mask?: TriggerTargetMask;
}
interface _TurretAttackModifier {
  /** If set to `false`, use the icon from [UtilitySprites](prototype:UtilitySprites) for this technology effect icon. */
  infer_icon?: boolean;
  /** Modification value, which will be added to the current turret attack modifier upon researching. */
  modifier: number;
  /** Name of the [EntityPrototype](prototype:EntityPrototype) that is affected. This also works for non-turrets such as tanks, however, the bonus does not appear in the entity's tooltips. */
  turret_id: EntityID;
  type: 'turret-attack';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type TurretAttackModifier = _TurretAttackModifier &
  Omit<BaseModifier, keyof _TurretAttackModifier>;

export function isTurretAttackModifier(
  value: unknown,
): value is TurretAttackModifier {
  return (value as { type: string }).type === 'turret-attack';
}

export interface TurretBaseVisualisation {
  animation: Animation4Way;
  draw_when_frozen?: boolean;
  draw_when_has_ammo?: boolean;
  draw_when_has_energy?: boolean;
  draw_when_no_ammo?: boolean;
  draw_when_no_energy?: boolean;
  draw_when_not_frozen?: boolean;
  /** If not defined, visualisation will be drawn in all states. */
  enabled_states?: TurretState[];
  render_layer?: RenderLayer;
  secondary_draw_order?: number;
}
export interface TurretGraphicsSet {
  base_visualisation?: TurretBaseVisualisation | TurretBaseVisualisation[];
}
export interface TurretSpecialEffect {
  /** Only loaded if `type` is `"mask-by-circle"`. */
  attacking_falloff?: number;
  /** Only loaded if `type` is `"mask-by-circle"`. */
  attacking_max_radius?: number;
  /** Only loaded if `type` is `"mask-by-circle"`. */
  attacking_min_radius?: number;
  center?: TurretSpecialEffectCenter;
  /** Only loaded if `type` is `"mask-by-circle"`. */
  falloff?: number;
  /** Only loaded, and mandatory if `type` is `"mask-by-circle"`. */
  max_radius?: number;
  /** Only loaded if `type` is `"mask-by-circle"`. */
  min_radius?: number;
  type: 'mask-by-circle';
}

export function isTurretSpecialEffect(
  value: unknown,
): value is TurretSpecialEffect {
  return (value as { type: string }).type === 'mask-by-circle';
}

/** If this is loaded as a single Vector, it is used for all directions. */
interface _TurretSpecialEffectCenter {
  default?: Vector;
  east?: Vector;
  north?: Vector;
  north_east?: Vector;
  north_west?: Vector;
  south?: Vector;
  south_east?: Vector;
  south_west?: Vector;
  west?: Vector;
}
export interface UndergroundBeltStructure {
  back_patch?: Sprite4Way;
  direction_in?: Sprite4Way;
  direction_in_side_loading?: Sprite4Way;
  direction_out?: Sprite4Way;
  direction_out_side_loading?: Sprite4Way;
  front_patch?: Sprite4Way;
  frozen_patch_in?: Sprite4Way;
  frozen_patch_out?: Sprite4Way;
}
/** Used by [UnitPrototype](prototype:UnitPrototype) and [SpiderUnitPrototype](prototype:SpiderUnitPrototype). */
export interface UnitAISettings {
  /** If enabled, units that have nothing else to do will attempt to return to a spawner. */
  allow_try_return_to_spawner?: boolean;
  /** If enabled, units that repeatedly fail to succeed at commands will be destroyed. */
  destroy_when_commands_fail?: boolean;
  /** If enabled, units will try to separate themselves from nearby friendly units. */
  do_separation?: boolean;
  /** Must be between -8 and 8. */
  path_resolution_modifier?: number;
  strafe_settings?: PrototypeStrafeSettings;
}
export interface UnitAlternativeFrameSequence {
  attacking_animation_speed: number;
  /** Indices of frames from the attack parameter animation. */
  attacking_frame_sequence: number[];
  back_to_walk_animation_speed: number;
  /** Indices of frames from the attack parameter animation. */
  back_to_walk_frame_sequence: number[];
  cooldown_animation_speed: number;
  /** Indices of frames from the attack parameter animation. */
  cooldown_frame_sequence: number[];
  prepared_animation_speed: number;
  /** Indices of frames from the attack parameter animation. */
  prepared_frame_sequence: number[];
  /** Indices of frames from the attack parameter animation. */
  warmup2_frame_sequence: number[];
  warmup_animation_speed: number;
  /** Indices of frames from the attack parameter animation. */
  warmup_frame_sequence: number[];
}
export interface UnitGroupSettings {
  /** Maximum number of automatically created unit groups gathering for attack at any time. */
  max_gathering_unit_groups: number;
  max_group_gathering_time: number;
  /** If a member falls behind more than this times the group radius, the group will slow down to max_group_slowdown_factor. */
  max_group_member_fallback_factor: number;
  /** Limits for group radius (calculated by number of numbers). */
  max_group_radius: number;
  /** When members of a group are behind, the entire group will slow down to at most this factor of its max speed. */
  max_group_slowdown_factor: number;
  /** When a member gets ahead of its group, it will slow down to at most this factor of its speed. */
  max_member_slowdown_when_ahead: number;
  /** When a member falls behind the group he can speedup up till this much of his regular speed. */
  max_member_speedup_when_behind: number;
  /** Maximum size of an attack unit group. This only affects automatically-created unit groups; manual groups created through the API are unaffected. */
  max_unit_group_size: number;
  /** After the gathering is finished the group can still wait for late members, but it doesn't accept new ones anymore. */
  max_wait_time_for_late_members: number;
  /** If a member falls behind more than this time the group radius, it will be removed from the group. */
  member_disown_distance: number;
  /** Pollution triggered group waiting time is a random time between min and max gathering time */
  min_group_gathering_time: number;
  min_group_radius: number;
  tick_tolerance_when_member_arrives: number;
}
/** It can be specified as a table with named or numbered keys, but not a mix of both. If this is specified as a table with numbered keys then the first value is the unit and the second is the spawn points. */
interface _UnitSpawnDefinition {
  /** Array of evolution and probability info, with the following conditions:

- The `evolution_factor` must be ascending from entry to entry.

- The last entry's weight will be used when the `evolution_factor` is larger than the last entry.

- Weights are linearly interpolated between entries.

- Individual weights are scaled linearly so that the cumulative weight is `1`. */
  spawn_points: SpawnPoint[];
  unit: EntityID;
}
interface _UnlockQualityModifier {
  quality: QualityID;
  type: 'unlock-quality';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type UnlockQualityModifier = _UnlockQualityModifier &
  Omit<BaseModifier, keyof _UnlockQualityModifier>;

export function isUnlockQualityModifier(
  value: unknown,
): value is UnlockQualityModifier {
  return (value as { type: string }).type === 'unlock-quality';
}

interface _UnlockRecipeModifier {
  /** Prototype name of the [RecipePrototype](prototype:RecipePrototype) that is unlocked upon researching. */
  recipe: RecipeID;
  type: 'unlock-recipe';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type UnlockRecipeModifier = _UnlockRecipeModifier &
  Omit<BaseModifier, keyof _UnlockRecipeModifier>;

export function isUnlockRecipeModifier(
  value: unknown,
): value is UnlockRecipeModifier {
  return (value as { type: string }).type === 'unlock-recipe';
}

export interface UnlockRecipeTipTrigger {
  recipe: RecipeID;
  type: 'unlock-recipe';
}

export function isUnlockRecipeTipTrigger(
  value: unknown,
): value is UnlockRecipeTipTrigger {
  return (value as { type: string }).type === 'unlock-recipe';
}

interface _UnlockSpaceLocationModifier {
  space_location: SpaceLocationID;
  type: 'unlock-space-location';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type UnlockSpaceLocationModifier = _UnlockSpaceLocationModifier &
  Omit<BaseModifier, keyof _UnlockSpaceLocationModifier>;

export function isUnlockSpaceLocationModifier(
  value: unknown,
): value is UnlockSpaceLocationModifier {
  return (value as { type: string }).type === 'unlock-space-location';
}

interface _UseConfirmTipTrigger {
  type: 'use-confirm';
}

export type UseConfirmTipTrigger = _UseConfirmTipTrigger &
  Omit<CountBasedTipTrigger, keyof _UseConfirmTipTrigger>;

export function isUseConfirmTipTrigger(
  value: unknown,
): value is UseConfirmTipTrigger {
  return (value as { type: string }).type === 'use-confirm';
}

export interface UseOnSelfCapsuleAction {
  attack_parameters: AttackParameters;
  type: 'use-on-self';
  /** Whether using the capsule consumes an item from the stack. */
  uses_stack?: boolean;
}

export function isUseOnSelfCapsuleAction(
  value: unknown,
): value is UseOnSelfCapsuleAction {
  return (value as { type: string }).type === 'use-on-self';
}

interface _UsePipetteTipTrigger {
  type: 'use-pipette';
}

export type UsePipetteTipTrigger = _UsePipetteTipTrigger &
  Omit<CountBasedTipTrigger, keyof _UsePipetteTipTrigger>;

export function isUsePipetteTipTrigger(
  value: unknown,
): value is UsePipetteTipTrigger {
  return (value as { type: string }).type === 'use-pipette';
}

interface _UseRailPlannerTipTrigger {
  build_mode: BuildMode;
  type: 'use-rail-planner';
}

export type UseRailPlannerTipTrigger = _UseRailPlannerTipTrigger &
  Omit<CountBasedTipTrigger, keyof _UseRailPlannerTipTrigger>;

export function isUseRailPlannerTipTrigger(
  value: unknown,
): value is UseRailPlannerTipTrigger {
  return (value as { type: string }).type === 'use-rail-planner';
}

export interface VariableAmbientSoundLayer {
  composition_mode: VariableAmbientSoundCompositionMode;
  /** Name of a layer which controls this layer, a layer cannot control itself.

Only loaded, and mandatory if `composition_mode` is `"layer-controlled"`. */
  control_layer?: string;
  /** Defines a mapping between controlling layer's samples and this (controlled) layer's samples. The number of items in the mapping must be the same as the number of samples in the controlling layer. Item in the mapping with index N defines which samples of this layer can play when the sample N is playing in the controlling layer.

Only loaded, and mandatory if `composition_mode` is `"layer-controlled"`. */
  control_layer_sample_mapping?: number[][];
  /** If `true`, the last of [Sound::variations](prototype:Sound::variations) is played at the end of a sequence (if the sequence is long enough). The end sample counts towards the [VariableAmbientSoundLayerStateProperties::sequence_length](prototype:VariableAmbientSoundLayerStateProperties::sequence_length). */
  has_end_sample?: boolean;
  /** If `true`, the first of [Sound::variations](prototype:Sound::variations) is played at the start of a sequence. The start sample counts towards the [VariableAmbientSoundLayerStateProperties::sequence_length](prototype:VariableAmbientSoundLayerStateProperties::sequence_length) */
  has_start_sample?: boolean;
  /** Name has to be unique across all layers. */
  name: string;
  /** If greater than one, samples are composed in overlapping sub-layers, offset from each other.

If greater than one, one of `sublayer_starting_offset` or `sublayer_offset` must be defined. Both cannot be defined together.

Cannot be defined for layers with `"shuffled"` `composition_mode`.

Cannot be zero. */
  number_of_sublayers?: number;
  /** Explicitly defines sample lengths. The whole sample is played when this is not specified.

Cannot be defined together with `sublayer_offset`.

The minimum cannot be zero. */
  sample_length?: RandomRange;
  /** Specifies offset between two sub-layers' samples.

This implicitly dictates the sample lengths as two sub-layer offsets.

Only loaded if `number_of_sublayers` is greater than one.

Cannot be defined together with `sublayer_starting_offset`.

The minimum of [RandomRange](prototype:RandomRange) variant cannot be zero. */
  sublayer_offset?: RandomRange | ProbabilityTable;
  /** Specifies starting offset of the second sub-layer.

Only loaded if `number_of_sublayers` is greater than one.

Cannot be defined together with `sublayer_offset`.

The minimum of [RandomRange](prototype:RandomRange) variant cannot be zero. */
  sublayer_starting_offset?: RandomRange | ProbabilityTable;
  /** Cannot be empty.

Samples within a layer are the [Sound::variations](prototype:Sound::variations).

Number of samples must be the same across all variants.

Samples cannot have variable volume and all samples must have the same default volume. */
  variants: Sound[];
}
export interface VariableAmbientSoundLayerStateProperties {
  enabled?: boolean;
  /** Pause before a layer finishes playing. The last repetition and consequently the layer being finished is not counted until the pause finishes. */
  end_pause?: RandomRange;
  /** The number of times a layer repeats itself until it's considered finished. If it's not defined, the layer never finishes on its own. What counts as repetition depends on the [VariableAmbientSoundCompositionMode](prototype:VariableAmbientSoundCompositionMode).

Each sample played is counted as a repetition of `"randomized"` layer.

Repetition of `"semi-randomized"` layer is counted when its sequence is finished.

Repetition of `"shuffled"` layer is counted when all samples play once.

Each sample played is counted as a repetition of `"layer-controlled"` layer.

If `number_of_repetitions` of [VariableAmbientSoundLayer::control_layer](prototype:VariableAmbientSoundLayer::control_layer) of `"layer-controlled"` layer is smaller than `number_of_repetitions` of the controlled layer, `number_of_repetitions` of the control layer is used for the purposes of `pause_between_repetitions` and `end_pause`.

Cannot be zero. */
  number_of_repetitions?: RandomRange | ProbabilityTable;
  /** Pause between each repetition of a layer. The repetition is not counted until the pause finishes. */
  pause_between_repetitions?: RandomRange;
  /** Pause between individual samples within a sequence.

Cannot be defined for `"randomized"` layers without defining `sequence_length` as well. Alternatively, use `pause_between_repetitions` instead.

Cannot be defined for layers with `sublayer_offset` defined. */
  pause_between_samples?: RandomRange;
  /** Number of samples in a sequence.

The minimum cannot be zero.

Mandatory for layers with `"semi-randomized"` [VariableAmbientSoundCompositionMode](prototype:VariableAmbientSoundCompositionMode).

Applicable for layers with `"randomized"` [VariableAmbientSoundCompositionMode](prototype:VariableAmbientSoundCompositionMode).

Cannot be defined for layers with `"shuffled"` [VariableAmbientSoundCompositionMode](prototype:VariableAmbientSoundCompositionMode). */
  sequence_length?: RandomRange;
  /** A sample replaced by silence still counts as played for the purposes of sequence count, repetition count, pauses, etc.

Must be in the `[0.0, 1.0]` interval. */
  silence_instead_of_sample_probability?: number;
  /** Pause before a layer starts playing. */
  start_pause?: RandomRange;
  /** Index of a layer's variant.

Cannot be zero. */
  variant?: number;
}
export interface VariableAmbientSoundNextStateConditions {
  /** Specified sample must be playing in the specified layer. */
  layer_sample?: VariableAmbientSoundLayerSample;
  previous_state?: string;
  /** Cannot be zero. */
  weight: number;
}
export interface VariableAmbientSoundNextStateItem {
  /** Transition to `state` is possible only if all conditions are met. */
  conditions: VariableAmbientSoundNextStateConditions;
  /** Name of the state. */
  state: string;
}
export interface VariableAmbientSoundState {
  /** Pause before a layer finishes playing. The layer being finished is not counted until the pause finishes.

Optionally loaded for `intermezzo` states. */
  end_pause?: RandomRange;
  /** Must contain as many items as there is layers in the variable track. The items themselves can be empty. The order of items corresponds to the order of layers as they appear in the prototype definition.

Mandatory for `regular` and `final` states.

Cannot be defined for `intermezzo` or `stop` states. */
  layers_properties?: VariableAmbientSoundLayerStateProperties[];
  /** Name has to be unique across all states. */
  name: string;
  /** Cannot be defined if `next_states` is defined.

Doesn't need to be defined if there is only one state. */
  next_state?: string;
  /** List of name of layers used to trigger state transition.

Only loaded, and mandatory if `next_state_trigger` is `"layers-finished"`. */
  next_state_layers_finished_layers?: string[];
  /** Mandatory if there is more than one state or if the only state transitions to itself.

Can be defined for `regular` states only. */
  next_state_trigger?: VariableAmbientSoundNextStateTrigger;
  /** Cannot be defined if `next_state` is defined.

Cannot be defined if there is only one state.

Cannot be empty. */
  next_states?: VariableAmbientSoundNextStateItem[];
  /** Defines how many layers will be playing. Which layers will be playing is selected randomly.

The minimum cannot be zero, the maximum cannot be greater than the number of layers.

Cannot be defined if any of `layers_properties` define the `enabled` property.

Cannot be defined for `intermezzo` or `stop` states. */
  number_of_enabled_layers?: RandomRange;
  /** Pause before a layer starts playing.

Optionally loaded for `intermezzo` states. */
  start_pause?: RandomRange;
  /** Defines for how long this state will be active.

Mandatory if `next_state_trigger` is `"duration"`.

Optionally loaded for `intermezzo` states. */
  state_duration_seconds?: number;
  type?: VariableAmbientSoundStateType;
}
export interface VariableAmbientSoundVariableSound {
  /** Number of audio signal samples (default sampling frequency is 44.1kHz) defining a time grid. Music samples are aligned with this grid when queued. */
  alignment_samples?: number;
  intermezzo?: Sound;
  /** Cannot be empty. */
  layers: VariableAmbientSoundLayer[];
  /** Cannot be zero. */
  length_seconds: number;
  /** The first state is used as the starting state and cannot be an intermezzo state.

Cannot be empty. */
  states: VariableAmbientSoundState[];
}
/** A vector is a two-element array or dictionary containing the x and y components. Positive x goes east, positive y goes south. */
interface _Vector {
  x: number;
  y: number;
}
/** If this is specified as a three-element array then the array items are x, y and z, in that order. */
interface _Vector3D {
  x: number;
  y: number;
  z: number;
}
interface _Vector4f {
  w: number;
  x: number;
  y: number;
  z: number;
}
export interface VectorRotation {
  /** The size of all `frames` must be the same. */
  frames: Vector[];
  render_layer?: RenderLayer;
}
interface _VehicleLogisticsModifier {
  type: 'vehicle-logistics';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type VehicleLogisticsModifier = _VehicleLogisticsModifier &
  Omit<BoolModifier, keyof _VehicleLogisticsModifier>;

export function isVehicleLogisticsModifier(
  value: unknown,
): value is VehicleLogisticsModifier {
  return (value as { type: string }).type === 'vehicle-logistics';
}

interface _VerticalFlowStyleSpecification {
  type: 'vertical_flow_style';
  vertical_spacing?: number;
}

export type VerticalFlowStyleSpecification = _VerticalFlowStyleSpecification &
  Omit<BaseStyleSpecification, keyof _VerticalFlowStyleSpecification>;

export function isVerticalFlowStyleSpecification(
  value: unknown,
): value is VerticalFlowStyleSpecification {
  return (value as { type: string }).type === 'vertical_flow_style';
}

interface _VerticalScrollBarStyleSpecification {
  type: 'vertical_scrollbar_style';
}

export type VerticalScrollBarStyleSpecification =
  _VerticalScrollBarStyleSpecification &
    Omit<
      ScrollBarStyleSpecification,
      keyof _VerticalScrollBarStyleSpecification
    >;

export function isVerticalScrollBarStyleSpecification(
  value: unknown,
): value is VerticalScrollBarStyleSpecification {
  return (value as { type: string }).type === 'vertical_scrollbar_style';
}

export interface VisualState {
  color?: Color;
  duration: number;
  name: string;
  next_active: string;
  next_inactive: string;
}
/** Void energy sources provide unlimited free energy. */
interface _VoidEnergySource {
  type: 'void';
}

export type VoidEnergySource = _VoidEnergySource &
  Omit<BaseEnergySource, keyof _VoidEnergySource>;

export function isVoidEnergySource(value: unknown): value is VoidEnergySource {
  return (value as { type: string }).type === 'void';
}

export interface WallPictures {
  corner_left_down?: SpriteVariations;
  corner_right_down?: SpriteVariations;
  ending_left?: SpriteVariations;
  ending_right?: SpriteVariations;
  filling?: SpriteVariations;
  gate_connection_patch?: Sprite4Way;
  single?: SpriteVariations;
  straight_horizontal?: SpriteVariations;
  straight_vertical?: SpriteVariations;
  t_up?: SpriteVariations;
  water_connection_patch?: Sprite4Way;
}
/** Entity water reflection. [Currently only renders](https://forums.factorio.com/100703) for [EntityWithHealthPrototype](prototype:EntityWithHealthPrototype). */
export interface WaterReflectionDefinition {
  orientation_to_variation?: boolean;
  pictures?: SpriteVariations;
  rotate?: boolean;
}
export interface WaterTileEffectParameters {
  animation_scale: number | [number, number];
  animation_speed: number;
  dark_threshold: number | [number, number];
  far_zoom?: number;
  foam_color: Color;
  foam_color_multiplier: number;
  near_zoom?: number;
  reflection_threshold: number | [number, number];
  secondary_texture_variations_columns?: number;
  secondary_texture_variations_rows?: number;
  shader_variation?: EffectVariation;
  specular_lightness: Color;
  specular_threshold: number | [number, number];
  texture_variations_columns?: number;
  texture_variations_rows?: number;
  /** Texture size must be 512x512. Shader variant `"water"` must have 1 texture, `"lava"` and `"wetland-water"` must have 2 textures and `"oil"` must have 4 textures. */
  textures: EffectTexture[];
  tick_scale: number;
}
/** Definition of a point where circuit network wires can be connected to an entity. */
export interface WireConnectionPoint {
  shadow: WirePosition;
  wire: WirePosition;
}
/** Used by [WireConnectionPoint](prototype:WireConnectionPoint). */
export interface WirePosition {
  copper?: Vector;
  green?: Vector;
  red?: Vector;
}
interface _WorkerRobotBatteryModifier {
  /** If set to `false`, use the icon from [UtilitySprites](prototype:UtilitySprites) for this technology effect icon. */
  infer_icon?: boolean;
  type: 'worker-robot-battery';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type WorkerRobotBatteryModifier = _WorkerRobotBatteryModifier &
  Omit<SimpleModifier, keyof _WorkerRobotBatteryModifier>;

export function isWorkerRobotBatteryModifier(
  value: unknown,
): value is WorkerRobotBatteryModifier {
  return (value as { type: string }).type === 'worker-robot-battery';
}

interface _WorkerRobotSpeedModifier {
  /** If set to `false`, use the icon from [UtilitySprites](prototype:UtilitySprites) for this technology effect icon. */
  infer_icon?: boolean;
  type: 'worker-robot-speed';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type WorkerRobotSpeedModifier = _WorkerRobotSpeedModifier &
  Omit<SimpleModifier, keyof _WorkerRobotSpeedModifier>;

export function isWorkerRobotSpeedModifier(
  value: unknown,
): value is WorkerRobotSpeedModifier {
  return (value as { type: string }).type === 'worker-robot-speed';
}

interface _WorkerRobotStorageModifier {
  /** If set to `false`, use the icon from [UtilitySprites](prototype:UtilitySprites) for this technology effect icon. */
  infer_icon?: boolean;
  type: 'worker-robot-storage';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type WorkerRobotStorageModifier = _WorkerRobotStorageModifier &
  Omit<SimpleModifier, keyof _WorkerRobotStorageModifier>;

export function isWorkerRobotStorageModifier(
  value: unknown,
): value is WorkerRobotStorageModifier {
  return (value as { type: string }).type === 'worker-robot-storage';
}

/** This type is used to produce sound from in-game entities when they are working/idle. */
interface __WorkingSound {
  /** Might not work with all entities that use working_sound. */
  activate_sound?: Sound;
  apparent_volume?: number;
  /** Modifies how far a sound can be heard. Can only be 1 or lower, has to be a positive number. */
  audible_distance_modifier?: number;
  /** Might not work with all entities that use working_sound. */
  deactivate_sound?: Sound;
  extra_sounds_ignore_limit?: boolean;
  /** The sound to be played when the entity is idle. Might not work with all entities that use working_sound. */
  idle_sound?: Sound;
  /** If this property is defined, all properties inherited from MainSound (and not overridden here) are ignored. */
  main_sounds?: MainSound | MainSound[];
  max_sounds_per_type?: number;
  persistent?: boolean;
  sound_accents?: SoundAccent | SoundAccent[];
  use_doppler_shift?: boolean;
}

export type _WorkingSound = __WorkingSound &
  Omit<MainSound, keyof __WorkingSound>;
/** Used by crafting machines to display different graphics when the machine is running. */
export interface WorkingVisualisation {
  align_to_waypoint?: boolean;
  always_draw?: boolean;
  animated_shift?: boolean;
  animation?: Animation;
  /** Used by [CraftingMachinePrototype](prototype:CraftingMachinePrototype). Has precedence over `apply_tint`. */
  apply_recipe_tint?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'quaternary'
    | 'none';
  /** Used by [CraftingMachinePrototype](prototype:CraftingMachinePrototype) ("status" and "visual-state-color" only) and [MiningDrillPrototype](prototype:MiningDrillPrototype).

For "status" on CraftingMachine and MiningDrill, the colors are specified via [WorkingVisualisations::status_colors](prototype:WorkingVisualisations::status_colors). For "resource-color", the colors are specified via [ResourceEntityPrototype::mining_visualisation_tint](prototype:ResourceEntityPrototype::mining_visualisation_tint). */
  apply_tint?:
    | 'resource-color'
    | 'input-fluid-base-color'
    | 'input-fluid-flow-color'
    | 'status'
    | 'none'
    | 'visual-state-color';
  /** Whether the animations are always played at the same speed, not adjusted to the machine speed. */
  constant_speed?: boolean;
  /** Only loaded if [WorkingVisualisations::states](prototype:WorkingVisualisations::states) is defined in the WorkingVisualisations that loads this. */
  draw_in_states?: string[];
  /** Only loaded if [WorkingVisualisations::states](prototype:WorkingVisualisations::states) is defined in the WorkingVisualisations that loads this. */
  draw_when_state_filter_matches?: boolean;
  east_animation?: Animation;
  east_position?: Vector;
  east_secondary_draw_order?: number;
  effect?: 'flicker' | 'uranium-glow' | 'none';
  enabled_by_name?: boolean;
  enabled_in_animated_shift_during_transition?: boolean;
  enabled_in_animated_shift_during_waypoint_stop?: boolean;
  fadeout?: boolean;
  frame_based_on_shift_animation_progress?: boolean;
  light?: LightDefinition;
  mining_drill_scorch_mark?: boolean;
  name?: string;
  north_animation?: Animation;
  north_position?: Vector;
  north_secondary_draw_order?: number;
  render_layer?: RenderLayer;
  /** Only loaded, and mandatory if `mining_drill_scorch_mark` is `true`. */
  scorch_mark_fade_in_frames?: number;
  /** Only loaded, and mandatory if `mining_drill_scorch_mark` is `true`. Cannot be larger than `scorch_mark_lifetime`. */
  scorch_mark_fade_out_duration?: number;
  /** Only loaded, and mandatory if `mining_drill_scorch_mark` is `true`. */
  scorch_mark_lifetime?: number;
  /** Used to determine render order for sprites with the same `render_layer` in the same position. Sprites with a higher `secondary_draw_order` are drawn on top. */
  secondary_draw_order?: number;
  south_animation?: Animation;
  south_position?: Vector;
  south_secondary_draw_order?: number;
  synced_fadeout?: boolean;
  west_animation?: Animation;
  west_position?: Vector;
  west_secondary_draw_order?: number;
}
export interface WorkingVisualisations {
  /** Only loaded if `idle_animation` is defined. */
  always_draw_idle_animation?: boolean;
  animation?: Animation4Way;
  default_recipe_tint?: GlobalRecipeTints;
  /** Idle animation must have the same frame count as animation. */
  idle_animation?: Animation4Way;
  recipe_not_set_tint?: GlobalRecipeTints;
  /** Only loaded if `shift_animation_waypoints` is defined. */
  shift_animation_transition_duration?: number;
  /** Only loaded if `shift_animation_waypoints` is defined. */
  shift_animation_waypoint_stop_duration?: number;
  /** Only loaded if one of `shift_animation_waypoint_stop_duration` or `shift_animation_transition_duration` is not 0. */
  shift_animation_waypoints?: ShiftAnimationWaypoints;
  /** At least 2 visual states must be defined or no states at all. At most 32 states may be defined. */
  states?: VisualState[];
  /** Used by [WorkingVisualisation::apply_tint](prototype:WorkingVisualisation::apply_tint). */
  status_colors?: StatusColors;
  /** Used to display different animations when the machine is running, for example tinted based on the current recipe. */
  working_visualisations?: WorkingVisualisation[];
}
interface _WorldAmbientSoundDefinition {
  average_pause_seconds?: number;
  entity_to_sound_ratio?: number;
  max_entity_count?: number;
  /** Has to be less than or equal to `max_entity_count`. */
  min_entity_count?: number;
  radius?: number;
  sound?: Sound;
}

/** The name of an [ActiveTriggerPrototype](prototype:ActiveTriggerPrototype). */
export type ActiveTriggerID = string;

/** The name of an [AirbornePollutantPrototype](prototype:AirbornePollutantPrototype). */
export type AirbornePollutantID = string;

/** Lets the game know in what instances the audio file is played. */
export type AmbientSoundType =
  | 'menu-track'
  | 'main-track'
  | 'hero-track'
  | 'interlude';

/** The name of an [AmmoCategory](prototype:AmmoCategory). */
export type AmmoCategoryID = string;

/** Used to allow specifying different ammo effects depending on which kind of entity the ammo is used in.

If ammo is used in an entity that isn't covered by the defined source_types, e.g. only `"player"` and `"vehicle"` are defined and the ammo is used by a turret, the first defined AmmoType in the [AmmoItemPrototype::ammo_type](prototype:AmmoItemPrototype::ammo_type) array is used. */
export type AmmoSourceType = 'default' | 'player' | 'turret' | 'vehicle';

/** If this is loaded as a single Animation, it applies to all directions. Any direction that is not defined defaults to the north animation. */
export type Animation4Way = _Animation4Way | Animation;

/** This is a list of 1-based frame indices into the spritesheet. The actual length of the animation will then be the length of the frame_sequence (times `repeat_count`, plus the length minus two if `run_mode` is `"forward-then-backward"`). There is a limit for (actual) animation length of 255 frames.

Indices can be used in any order, repeated or not used at all. Unused frames are not loaded into VRAM at all, frames referenced multiple times are loaded just once, see [here](https://forums.factorio.com/53202). */
export type AnimationFrameSequence = number[];

export type AnimationRunMode = 'forward' | 'backward' | 'forward-then-backward';

export type AnimationVariations =
  | _AnimationVariations
  | Animation
  | Animation[];

/** A union of all prototypes. A specific prototype is loaded based on the value of the `type` key.

See the [Prototypes page](prototype:prototypes) for more information. */
export type AnyPrototype =
  | AccumulatorPrototype
  | AchievementPrototype
  | ActiveDefenseEquipmentPrototype
  | AgriculturalTowerPrototype
  | AirbornePollutantPrototype
  | AmbientSound
  | AmmoCategory
  | AmmoItemPrototype
  | AmmoTurretPrototype
  | AnimationPrototype
  | ArithmeticCombinatorPrototype
  | ArmorPrototype
  | ArrowPrototype
  | ArtilleryFlarePrototype
  | ArtilleryProjectilePrototype
  | ArtilleryTurretPrototype
  | ArtilleryWagonPrototype
  | AssemblingMachinePrototype
  | AsteroidChunkPrototype
  | AsteroidCollectorPrototype
  | AsteroidPrototype
  | AutoplaceControl
  | BatteryEquipmentPrototype
  | BeaconPrototype
  | BeamPrototype
  | BeltImmunityEquipmentPrototype
  | BlueprintBookPrototype
  | BlueprintItemPrototype
  | BoilerPrototype
  | BuildEntityAchievementPrototype
  | BurnerGeneratorPrototype
  | BurnerUsagePrototype
  | CapsulePrototype
  | CaptureRobotPrototype
  | CarPrototype
  | CargoBayPrototype
  | CargoLandingPadPrototype
  | CargoPodPrototype
  | CargoWagonPrototype
  | ChainActiveTriggerPrototype
  | ChangedSurfaceAchievementPrototype
  | CharacterCorpsePrototype
  | CharacterPrototype
  | CliffPrototype
  | CollisionLayerPrototype
  | CombatRobotCountAchievementPrototype
  | CombatRobotPrototype
  | CompleteObjectiveAchievementPrototype
  | ConstantCombinatorPrototype
  | ConstructWithRobotsAchievementPrototype
  | ConstructionRobotPrototype
  | ContainerPrototype
  | CopyPasteToolPrototype
  | CorpsePrototype
  | CraftingMachinePrototype
  | CreatePlatformAchievementPrototype
  | CurvedRailAPrototype
  | CurvedRailBPrototype
  | CustomEventPrototype
  | CustomInputPrototype
  | DamageType
  | DeciderCombinatorPrototype
  | DeconstructWithRobotsAchievementPrototype
  | DeconstructibleTileProxyPrototype
  | DeconstructionItemPrototype
  | DecorativePrototype
  | DelayedActiveTriggerPrototype
  | DeliverByRobotsAchievementPrototype
  | DeliverCategory
  | DeliverImpactCombination
  | DepleteResourceAchievementPrototype
  | DestroyCliffAchievementPrototype
  | DisplayPanelPrototype
  | DontBuildEntityAchievementPrototype
  | DontCraftManuallyAchievementPrototype
  | DontKillManuallyAchievementPrototype
  | DontResearchBeforeResearchingAchievementPrototype
  | DontUseEntityInEnergyProductionAchievementPrototype
  | EditorControllerPrototype
  | ElectricEnergyInterfacePrototype
  | ElectricPolePrototype
  | ElectricTurretPrototype
  | ElevatedCurvedRailAPrototype
  | ElevatedCurvedRailBPrototype
  | ElevatedHalfDiagonalRailPrototype
  | ElevatedStraightRailPrototype
  | EnemySpawnerPrototype
  | EnergyShieldEquipmentPrototype
  | EntityGhostPrototype
  | EquipArmorAchievementPrototype
  | EquipmentCategory
  | EquipmentGhostPrototype
  | EquipmentGridPrototype
  | ExplosionPrototype
  | FireFlamePrototype
  | FishPrototype
  | FluidPrototype
  | FluidStreamPrototype
  | FluidTurretPrototype
  | FluidWagonPrototype
  | FontPrototype
  | FuelCategory
  | FurnacePrototype
  | FusionGeneratorPrototype
  | FusionReactorPrototype
  | GatePrototype
  | GeneratorEquipmentPrototype
  | GeneratorPrototype
  | GodControllerPrototype
  | GroupAttackAchievementPrototype
  | GuiStyle
  | GunPrototype
  | HalfDiagonalRailPrototype
  | HeatInterfacePrototype
  | HeatPipePrototype
  | HighlightBoxEntityPrototype
  | ImpactCategory
  | InfinityContainerPrototype
  | InfinityPipePrototype
  | InserterPrototype
  | InventoryBonusEquipmentPrototype
  | ItemEntityPrototype
  | ItemGroup
  | ItemPrototype
  | ItemRequestProxyPrototype
  | ItemSubGroup
  | ItemWithEntityDataPrototype
  | ItemWithInventoryPrototype
  | ItemWithLabelPrototype
  | ItemWithTagsPrototype
  | KillAchievementPrototype
  | LabPrototype
  | LampPrototype
  | LandMinePrototype
  | LaneSplitterPrototype
  | LegacyCurvedRailPrototype
  | LegacyStraightRailPrototype
  | LightningAttractorPrototype
  | LightningPrototype
  | LinkedBeltPrototype
  | LinkedContainerPrototype
  | Loader1x1Prototype
  | Loader1x2Prototype
  | LoaderPrototype
  | LocomotivePrototype
  | LogisticContainerPrototype
  | LogisticRobotPrototype
  | MapGenPresets
  | MapSettings
  | MarketPrototype
  | MiningDrillPrototype
  | ModuleCategory
  | ModulePrototype
  | ModuleTransferAchievementPrototype
  | MouseCursor
  | MovementBonusEquipmentPrototype
  | NamedNoiseExpression
  | NamedNoiseFunction
  | NightVisionEquipmentPrototype
  | OffshorePumpPrototype
  | ParticlePrototype
  | ParticleSourcePrototype
  | PipePrototype
  | PipeToGroundPrototype
  | PlaceEquipmentAchievementPrototype
  | PlanetPrototype
  | PlantPrototype
  | PlayerDamagedAchievementPrototype
  | PlayerPortPrototype
  | PowerSwitchPrototype
  | ProcessionLayerInheritanceGroup
  | ProcessionPrototype
  | ProduceAchievementPrototype
  | ProducePerHourAchievementPrototype
  | ProgrammableSpeakerPrototype
  | ProjectilePrototype
  | PumpPrototype
  | QualityPrototype
  | RadarPrototype
  | RailChainSignalPrototype
  | RailPlannerPrototype
  | RailPrototype
  | RailRampPrototype
  | RailRemnantsPrototype
  | RailSignalPrototype
  | RailSupportPrototype
  | ReactorPrototype
  | RecipeCategory
  | RecipePrototype
  | RemoteControllerPrototype
  | RepairToolPrototype
  | ResearchAchievementPrototype
  | ResearchWithSciencePackAchievementPrototype
  | ResourceCategory
  | ResourceEntityPrototype
  | RoboportEquipmentPrototype
  | RoboportPrototype
  | RocketSiloPrototype
  | RocketSiloRocketPrototype
  | RocketSiloRocketShadowPrototype
  | RollingStockPrototype
  | SegmentPrototype
  | SegmentedUnitPrototype
  | SelectionToolPrototype
  | SelectorCombinatorPrototype
  | ShootAchievementPrototype
  | ShortcutPrototype
  | SimpleEntityPrototype
  | SimpleEntityWithForcePrototype
  | SimpleEntityWithOwnerPrototype
  | SmokeWithTriggerPrototype
  | SolarPanelEquipmentPrototype
  | SolarPanelPrototype
  | SoundPrototype
  | SpaceConnectionDistanceTraveledAchievementPrototype
  | SpaceConnectionPrototype
  | SpaceLocationPrototype
  | SpacePlatformHubPrototype
  | SpacePlatformStarterPackPrototype
  | SpectatorControllerPrototype
  | SpeechBubblePrototype
  | SpiderLegPrototype
  | SpiderUnitPrototype
  | SpiderVehiclePrototype
  | SpidertronRemotePrototype
  | SplitterPrototype
  | SpritePrototype
  | StickerPrototype
  | StorageTankPrototype
  | StraightRailPrototype
  | SurfacePropertyPrototype
  | SurfacePrototype
  | TechnologyPrototype
  | TemporaryContainerPrototype
  | ThrusterPrototype
  | TileEffectDefinition
  | TileGhostPrototype
  | TilePrototype
  | TipsAndTricksItem
  | TipsAndTricksItemCategory
  | ToolPrototype
  | TrainPathAchievementPrototype
  | TrainStopPrototype
  | TransportBeltConnectablePrototype
  | TransportBeltPrototype
  | TreePrototype
  | TriggerTargetType
  | TrivialSmokePrototype
  | TurretPrototype
  | TutorialDefinition
  | UndergroundBeltPrototype
  | UnitPrototype
  | UpgradeItemPrototype
  | UseItemAchievementPrototype
  | UtilityConstants
  | UtilitySounds
  | UtilitySprites
  | VehiclePrototype
  | VirtualSignalPrototype
  | WallPrototype;

/** The name of an [AsteroidChunkPrototype](prototype:AsteroidChunkPrototype). */
export type AsteroidChunkID = string;

/** Loaded as one of the [BaseAttackParameters](prototype:BaseAttackParameters) extensions, based on the value of the `type` key. */
export type AttackParameters =
  | ProjectileAttackParameters
  | BeamAttackParameters
  | StreamAttackParameters;

export type AttenuationType =
  | 'none'
  | 'linear'
  | 'logarithmic'
  | 'exponential'
  | 'cosine'
  | 'S-curve';

/** The name of an [AutoplaceControl](prototype:AutoplaceControl). */
export type AutoplaceControlID = string;

/** Determines how sprites/animations should blend with the background. The possible values are listed below.

Note that in most of Factorio it is assumed colors are in alpha pre-multiplied format, see [FFF #172 - Blending and Rendering](https://www.factorio.com/blog/post/fff-172). Sprites get pre-multiplied when loaded, unless `premul_alpha` is set to `false` on the sprite/animation itself. Since generating mipmaps doesn't respect `premul_alpha`, lower mipmap levels will be in pre-multiplied format regardless. */
export type BlendMode =
  | 'normal'
  | 'additive'
  | 'additive-soft'
  | 'multiplicative'
  | 'multiplicative-with-alpha'
  | 'overwrite';

/** BoundingBoxes are typically centered around the position of an entity.

BoundingBoxes are usually specified with the short-hand notation of passing an array of exactly 2 or 3 items.

The first tuple item is left_top, the second tuple item is right_bottom. There is an unused third tuple item, a [float](prototype:float) that represents the orientation.

Positive x goes towards east, positive y goes towards south. This means that the upper-left point is the least dimension in x and y, and lower-right is the greatest. */
export type BoundingBox = _BoundingBox | [MapPosition, MapPosition];

export type BuildMode = 'normal' | 'forced' | 'superforced';

/** The name of a [BurnerUsagePrototype](prototype:BurnerUsagePrototype). */
export type BurnerUsageID = string;

/** Loaded as one of the capsule actions, based on the value of the `type` key. */
export type CapsuleAction =
  | ThrowCapsuleAction
  | ActivateEquipmentCapsuleAction
  | UseOnSelfCapsuleAction
  | DestroyCliffsCapsuleAction
  | ArtilleryRemoteCapsuleAction;

export type CircularProjectileCreationSpecification = [
  RealOrientation,
  Vector,
][];

/** Additional mask which dictates where in the world certain [ProcessionLayers](prototype:ProcessionLayer) are drawn. Origin determined by [EffectRelativeTo](prototype:EffectRelativeTo). */
export type CloudEffectStyle =
  | 'none'
  | 'euclidean'
  | 'manhattan'
  | 'euclidean-outside'
  | 'manhattan-outside'
  | 'horizontal-stripe'
  | 'texture'
  | 'texture-outside';

/** The name of a [CollisionLayerPrototype](prototype:CollisionLayerPrototype). */
export type CollisionLayerID = string;

/** Table of red, green, blue, and alpha float values between 0 and 1. Alternatively, values can be from 0-255, they are interpreted as such if at least one value is `> 1`.

Color allows the short-hand notation of passing an array of exactly 3 or 4 numbers. The array items are r, g, b and optionally a, in that order.

The game usually expects colors to be in pre-multiplied form (color channels are pre-multiplied by alpha). */
export type Color =
  | _Color
  | [number, number, number]
  | [number, number, number, number];

/** A lookup table (LUT) for the color which maps the original color to a position in the sprite where the replacement color is found. The file pointed to by the filename must be a sprite of size 256×16. */
export type ColorLookupTable = FileName | 'identity';

/** A string that specifies how the inputs should be compared. */
export type ComparatorString =
  | '='
  | '>'
  | '<'
  | '≥'
  | '>='
  | '≤'
  | '<='
  | '≠'
  | '!=';

/** Defines which other inputs a [CustomInputPrototype](prototype:CustomInputPrototype) consumes. */
export type ConsumingType = 'none' | 'game-only';

export type ControlPoint = _ControlPoint | [number, number];

/** One of the following values: */
export type CursorBoxType =
  | 'entity'
  | 'multiplayer-entity'
  | 'electricity'
  | 'copy'
  | 'not-allowed'
  | 'pair'
  | 'logistics'
  | 'train-visualization'
  | 'blueprint-snap-rectangle'
  | 'spidertron-remote-selected'
  | 'spidertron-remote-to-be-selected';

export type DamageTypeFilters =
  | _DamageTypeFilters
  | DamageTypeID
  | DamageTypeID[];

/** The name of a [DamageType](prototype:DamageType). */
export type DamageTypeID = string;

/** The first member of the tuple states at which time of the day the LUT should be used. If the current game time is between two values defined in the color lookup that have different LUTs, the color is interpolated to create a smooth transition. (Sharp transition can be achieved by having the two values differing only by a small fraction.)

If there is only one tuple, it means that the LUT will be used all the time, regardless of the value of the first member of the tuple.

The second member of the tuple is a lookup table (LUT) for the color which maps the original color to a position in the sprite where the replacement color is found. */
export type DaytimeColorLookupTable = [number, ColorLookupTable][];

/** The name of a [DecorativePrototype](prototype:DecorativePrototype). */
export type DecorativeID = string;

/** Usually specified by using [defines.direction](runtime:defines.direction). */
export type Direction =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15;

/** One of the 16 directions, specified with a string. */
export type DirectionString =
  | 'north'
  | 'north_north_east'
  | 'north_east'
  | 'east_north_east'
  | 'east'
  | 'east_south_east'
  | 'south_east'
  | 'south_south_east'
  | 'south'
  | 'south_south_west'
  | 'south_west'
  | 'west_south_west'
  | 'west'
  | 'west_north_west'
  | 'north_west'
  | 'north_north_west';

/** Identifies what [CloudEffectStyle](prototype:CloudEffectStyle) refers to. */
export type EffectRelativeTo = 'ground-origin' | 'pod' | 'spawn-origin';

/** A list of [module](prototype:ModulePrototype) effects, or just a single effect. Modules with other effects cannot be used on the machine. This means that both effects from modules and from surrounding beacons are restricted to the listed effects. If `allowed_effects` is an empty array, the machine cannot be affected by modules or beacons. */
export type EffectTypeLimitation =
  | ('speed' | 'productivity' | 'consumption' | 'pollution' | 'quality')
  | ('speed' | 'productivity' | 'consumption' | 'pollution' | 'quality')[];

/** Precision is ignored beyond two decimals - `0.567` results in `0.56` and means 56% etc. Values can range from `-327.68` to `327.67`. Numbers outside of this range will wrap around. */
export type EffectValue = number;

export type EffectVariation = 'lava' | 'wetland-water' | 'oil' | 'water';

/** Used to specify priority of energy usage in the [electric system](https://wiki.factorio.com/Electric_system). */
export type ElectricUsagePriority =
  | 'primary-input'
  | 'primary-output'
  | 'secondary-input'
  | 'secondary-output'
  | 'tertiary'
  | 'solar'
  | 'lamp';

/** If this is loaded as a single ElementImageSetLayer, it gets used as `base`. */
export type ElementImageSet = _ElementImageSet | ElementImageSetLayer;

/** If this is loaded as a Sprite, it gets used as `center`. */
export type ElementImageSetLayer = _ElementImageSetLayer | Sprite;

/** Specifies an amount of electric energy in joules, or electric energy per time in watts.

Internally, the input in `Watt` or `Joule/second` is always converted into `Joule/tick`, where 1 second is equal to 60 ticks. This means it uses the following formula: `Power in Joule/tick = Power in Watt / 60`. See [Power](https://wiki.factorio.com/Units#Power).

Supported Multipliers:

- `k`: 10^3, or 1 000

- `M`: 10^6

- `G`: 10^9

- `T`: 10^12

- `P`: 10^15

- `E`: 10^18

- `Z`: 10^21

- `Y`: 10^24

- `R`: 10^27

- `Q`: 10^30 */
export type Energy = string;

/** Loaded as one of the [BaseEnergySource](prototype:BaseEnergySource) extensions, based on the value of the `type` key. */
export type EnergySource =
  | ElectricEnergySource
  | BurnerEnergySource
  | HeatEnergySource
  | FluidEnergySource
  | VoidEnergySource;

/** The name of an [EntityPrototype](prototype:EntityPrototype). */
export type EntityID = string;

export type EntityIDFilter = _EntityIDFilter | EntityID;

/** An array containing the following values.

If an entity is a [building](runtime:LuaEntityPrototype::is_building) and has the `"player-creation"` flag set, it is considered for multiple enemy/unit behaviors:

- Autonomous enemy attacks (usually triggered by pollution) can only attack within chunks that contain at least one entity that is both a building and a player-creation.

- Enemy expansion considers entities that are both buildings and player-creations as "enemy" entities that may block expansion. */
export type EntityPrototypeFlags = (
  | 'not-rotatable'
  | 'placeable-neutral'
  | 'placeable-player'
  | 'placeable-enemy'
  | 'placeable-off-grid'
  | 'player-creation'
  | 'building-direction-8-way'
  | 'filter-directions'
  | 'get-by-unit-number'
  | 'breaths-air'
  | 'not-repairable'
  | 'not-on-map'
  | 'not-deconstructable'
  | 'not-blueprintable'
  | 'hide-alt-info'
  | 'no-gap-fill-while-building'
  | 'not-flammable'
  | 'no-automated-item-removal'
  | 'no-automated-item-insertion'
  | 'no-copy-paste'
  | 'not-selectable-in-game'
  | 'not-upgradable'
  | 'not-in-kill-statistics'
  | 'building-direction-16-way'
  | 'snap-to-rail-support-spot'
  | 'not-in-made-in'
)[];

export type EntityStatus =
  | 'working'
  | 'normal'
  | 'ghost'
  | 'not-plugged-in-electric-network'
  | 'networks-connected'
  | 'networks-disconnected'
  | 'no-ammo'
  | 'waiting-for-target-to-be-built'
  | 'waiting-for-train'
  | 'no-power'
  | 'low-temperature'
  | 'charging'
  | 'discharging'
  | 'fully-charged'
  | 'no-fuel'
  | 'no-food'
  | 'out-of-logistic-network'
  | 'no-recipe'
  | 'no-ingredients'
  | 'no-input-fluid'
  | 'no-research-in-progress'
  | 'no-minable-resources'
  | 'low-input-fluid'
  | 'low-power'
  | 'not-connected-to-rail'
  | 'cant-divide-segments'
  | 'recharging-after-power-outage'
  | 'no-modules-to-transmit'
  | 'disabled-by-control-behavior'
  | 'opened-by-circuit-network'
  | 'closed-by-circuit-network'
  | 'disabled-by-script'
  | 'disabled'
  | 'turned-off-during-daytime'
  | 'fluid-ingredient-shortage'
  | 'item-ingredient-shortage'
  | 'full-output'
  | 'not-enough-space-in-output'
  | 'full-burnt-result-output'
  | 'marked-for-deconstruction'
  | 'missing-required-fluid'
  | 'missing-science-packs'
  | 'waiting-for-source-items'
  | 'waiting-for-space-in-destination'
  | 'preparing-rocket-for-launch'
  | 'waiting-to-launch-rocket'
  | 'waiting-for-space-in-platform-hub'
  | 'launching-rocket'
  | 'thrust-not-required'
  | 'not-enough-thrust'
  | 'on-the-way'
  | 'waiting-in-orbit'
  | 'waiting-for-rocket-to-arrive'
  | 'no-path'
  | 'broken'
  | 'none'
  | 'frozen'
  | 'paused'
  | 'not-connected-to-hub-or-pad'
  | 'computing-navigation'
  | 'no-filter'
  | 'waiting-at-stop'
  | 'destination-stop-full'
  | 'pipeline-overextended'
  | 'no-spot-seedable-by-inputs'
  | 'waiting-for-plants-to-grow';

/** The name of an [EquipmentCategory](prototype:EquipmentCategory). */
export type EquipmentCategoryID = string;

/** The name of an [EquipmentGridPrototype](prototype:EquipmentGridPrototype). */
export type EquipmentGridID = string;

/** The name of an [EquipmentPrototype](prototype:EquipmentPrototype). */
export type EquipmentID = string;

export type ExplosionDefinition = EntityID | _ExplosionDefinition;

export type Fade = _Fade | AttenuationType;

/** A slash `"/"` is always used as the directory delimiter. A path always begins with the specification of a root, which can be one of three formats:

- **core**: A path starting with `__core__` will access the resources in the data/core directory, these resources are always accessible regardless of mod specifications.

- **base**: A path starting with `__base__` will access the resources in the base mod in data/base directory. These resources are usually available, as long as the base mod isn't removed/deactivated.

- **mod path**: The format `__<mod-name>__` is placeholder for root of any other mod (mods/<mod-name>), and is accessible as long as the mod is active. */
export type FileName = string;

/** A fluid amount. The amount is stored as a fixed-size signed 64 bit integer, with 24 bits reserved for decimal precision, meaning the smallest value step is `1/2^24`. */
export type FluidAmount = number;

export type FluidBoxLinkedConnectionID = number;

/** The name of a [FluidPrototype](prototype:FluidPrototype). */
export type FluidID = string;

export type FootstepTriggerEffectList = FootstepTriggerEffectItem[];

/** One of the following values: */
export type ForceCondition =
  | 'all'
  | 'enemy'
  | 'ally'
  | 'friend'
  | 'not-friend'
  | 'same'
  | 'not-same';

/** The name of a [FuelCategory](prototype:FuelCategory). */
export type FuelCategoryID = string;

export type HorizontalAlign = 'left' | 'center' | 'right';

/** Item or fluid ingredient. */
export type IngredientPrototype =
  | ItemIngredientPrototype
  | FluidIngredientPrototype;

export type ItemCountType = number;

/** The name of an [ItemGroup](prototype:ItemGroup). */
export type ItemGroupID = string;

/** The name of an [ItemPrototype](prototype:ItemPrototype). */
export type ItemID = string;

export type ItemIDFilter = _ItemIDFilter | ItemID;

/** An array containing the following values. */
export type ItemPrototypeFlags = (
  | 'draw-logistic-overlay'
  | 'excluded-from-trash-unrequested'
  | 'always-show'
  | 'hide-from-bonus-gui'
  | 'hide-from-fuel-tooltip'
  | 'not-stackable'
  | 'primary-place-result'
  | 'mod-openable'
  | 'only-in-cursor'
  | 'spawnable'
  | 'spoil-result'
  | 'ignore-spoil-time-modifier'
)[];

export type ItemStackIndex = number;

/** The name of an [ItemSubGroup](prototype:ItemSubGroup). */
export type ItemSubGroupID = string;

export type LayeredSound = _LayeredSound | Sound;

export type LayeredSprite = _LayeredSprite | LayeredSprite[];

export type LayeredSpriteVariations = LayeredSprite[];

/** Specifies a light source. This is loaded either as a single light source or as an array of light sources. */
export type LightDefinition = _LightDefinition | _LightDefinition[];

/** The internal name of a game control (key binding). */
export type LinkedGameControl =
  | 'move-up'
  | 'move-down'
  | 'move-left'
  | 'move-right'
  | 'open-character-gui'
  | 'open-gui'
  | 'confirm-gui'
  | 'toggle-free-cursor'
  | 'mine'
  | 'build'
  | 'build-ghost'
  | 'super-forced-build'
  | 'clear-cursor'
  | 'pipette'
  | 'rotate'
  | 'reverse-rotate'
  | 'flip-horizontal'
  | 'flip-vertical'
  | 'pick-items'
  | 'drop-cursor'
  | 'show-info'
  | 'shoot-enemy'
  | 'shoot-selected'
  | 'next-weapon'
  | 'toggle-driving'
  | 'zoom-in'
  | 'zoom-out'
  | 'use-item'
  | 'alternative-use-item'
  | 'toggle-console'
  | 'copy-entity-settings'
  | 'paste-entity-settings'
  | 'controller-gui-logistics-tab'
  | 'controller-gui-character-tab'
  | 'controller-gui-crafting-tab'
  | 'toggle-rail-layer'
  | 'select-for-blueprint'
  | 'select-for-cancel-deconstruct'
  | 'select-for-super-forced-deconstruct'
  | 'reverse-select'
  | 'alt-reverse-select'
  | 'deselect'
  | 'cycle-blueprint-forwards'
  | 'cycle-blueprint-backwards'
  | 'focus-search'
  | 'larger-terrain-building-area'
  | 'smaller-terrain-building-area'
  | 'remove-pole-cables'
  | 'build-with-obstacle-avoidance'
  | 'add-station'
  | 'add-temporary-station'
  | 'rename-all'
  | 'fast-wait-condition'
  | 'drag-map'
  | 'move-tag'
  | 'place-in-chat'
  | 'place-ping'
  | 'pin'
  | 'activate-tooltip'
  | 'next-surface'
  | 'previous-surface'
  | 'cycle-quality-up'
  | 'cycle-quality-down'
  | 'craft'
  | 'craft-5'
  | 'craft-all'
  | 'cancel-craft'
  | 'cancel-craft-5'
  | 'cancel-craft-all'
  | 'pick-item'
  | 'stack-transfer'
  | 'inventory-transfer'
  | 'fast-entity-transfer'
  | 'cursor-split'
  | 'stack-split'
  | 'inventory-split'
  | 'fast-entity-split'
  | 'toggle-filter'
  | 'open-item'
  | 'copy-inventory-filter'
  | 'paste-inventory-filter'
  | 'show-quick-panel'
  | 'next-quick-panel-page'
  | 'previous-quick-panel-page'
  | 'next-quick-panel-tab'
  | 'previous-quick-panel-tab'
  | 'rotate-active-quick-bars'
  | 'next-active-quick-bar'
  | 'previous-active-quick-bar'
  | 'quick-bar-button-1'
  | 'quick-bar-button-2'
  | 'quick-bar-button-3'
  | 'quick-bar-button-4'
  | 'quick-bar-button-5'
  | 'quick-bar-button-6'
  | 'quick-bar-button-7'
  | 'quick-bar-button-8'
  | 'quick-bar-button-9'
  | 'quick-bar-button-10'
  | 'quick-bar-button-1-secondary'
  | 'quick-bar-button-2-secondary'
  | 'quick-bar-button-3-secondary'
  | 'quick-bar-button-4-secondary'
  | 'quick-bar-button-5-secondary'
  | 'quick-bar-button-6-secondary'
  | 'quick-bar-button-7-secondary'
  | 'quick-bar-button-8-secondary'
  | 'quick-bar-button-9-secondary'
  | 'quick-bar-button-10-secondary'
  | 'action-bar-select-page-1'
  | 'action-bar-select-page-2'
  | 'action-bar-select-page-3'
  | 'action-bar-select-page-4'
  | 'action-bar-select-page-5'
  | 'action-bar-select-page-6'
  | 'action-bar-select-page-7'
  | 'action-bar-select-page-8'
  | 'action-bar-select-page-9'
  | 'action-bar-select-page-10'
  | 'copy'
  | 'cut'
  | 'paste'
  | 'cycle-clipboard-forwards'
  | 'cycle-clipboard-backwards'
  | 'undo'
  | 'redo'
  | 'toggle-menu'
  | 'toggle-map'
  | 'close-menu'
  | 'open-technology-gui'
  | 'production-statistics'
  | 'logistic-networks'
  | 'toggle-blueprint-library'
  | 'open-trains-gui'
  | 'open-factoriopedia'
  | 'back'
  | 'forward'
  | 'pause-game'
  | 'confirm-message'
  | 'previous-technology'
  | 'previous-mod'
  | 'connect-train'
  | 'disconnect-train'
  | 'submit-feedback'
  | 'editor-next-variation'
  | 'editor-previous-variation'
  | 'editor-clone-item'
  | 'editor-delete-item'
  | 'editor-toggle-pause'
  | 'editor-tick-once'
  | 'editor-speed-up'
  | 'editor-speed-down'
  | 'editor-reset-speed'
  | 'editor-set-clone-brush-source'
  | 'editor-set-clone-brush-destination'
  | 'editor-switch-to-surface'
  | 'editor-remove-scripting-object'
  | 'debug-toggle-atlas-gui'
  | 'debug-toggle-gui-visibility'
  | 'debug-toggle-debug-settings'
  | 'debug-toggle-basic'
  | 'debug-reset-zoom'
  | 'debug-reset-zoom-2x'
  | 'toggle-gui-debug'
  | 'toggle-gui-style-view'
  | 'toggle-gui-shadows'
  | 'toggle-gui-glows'
  | 'open-prototypes-gui'
  | 'open-prototype-explorer-gui'
  | 'increase-ui-scale'
  | 'decrease-ui-scale'
  | 'reset-ui-scale'
  | 'slash-editor'
  | 'toggle-entity'
  | 'next-player-in-replay'
  | 'move-blueprint-absolute-grid-up'
  | 'move-blueprint-absolute-grid-down'
  | 'move-blueprint-absolute-grid-left'
  | 'move-blueprint-absolute-grid-right'
  | 'move-blueprint-entities-up'
  | 'move-blueprint-entities-down'
  | 'move-blueprint-entities-left'
  | 'move-blueprint-entities-right'
  | 'play-next-track'
  | 'play-previous-track'
  | 'pause-resume-music';

/** Localised strings are a way to support translation of in-game text. They offer a language-independent code representation of the text that should be shown to players.

It is an array where the first element is the key and the remaining elements are parameters that will be substituted for placeholders in the template designated by the key.

The key identifies the string template. For example, `"gui-alert-tooltip.attack"` (for the template `"__1__ objects are being damaged"`; see the file `data/core/locale/en.cfg`). In the settings and prototype stages, this key cannot be longer than 200 characters.

The template can contain placeholders such as `__1__` or `__2__`. These will be replaced by the respective parameter in the LocalisedString. The parameters themselves can be other localised strings, which will be processed recursively in the same fashion. Localised strings can not be recursed deeper than 20 levels and can not have more than 20 parameters.

There are two special flags for the localised string, indicated by the key being a particular string. First, if the key is the empty string (`""`), then all parameters will be concatenated (after processing, if any are localised strings themselves). Second, if the key is a question mark (`"?"`), then the first valid parameter will be used. A parameter can be invalid if its name doesn't match any string template. If no parameters are valid, the last one is returned. This is useful to implement a fallback for missing locale templates.

Furthermore, when an API function expects a localised string, it will also accept a regular string (i.e. not a table) which will not be translated, as well as a number or boolean, which will be converted to their textual representation.

See [Tutorial:Localisation](https://wiki.factorio.com/Tutorial:Localisation) for more information. */
export type LocalisedString = string | LocalisedString[];

export type LogisticFilterIndex = number;

/** A floating point number specifying an amount.

For backwards compatibility, MapGenSizes can also be specified as one of the following strings, which will be converted to a number:

Each of the values in a triplet (such as "low", "small", and "poor") are synonymous. In-game the values can be set from `0.166` to `6` via the GUI (respective to the percentages), while `0` is used to disable the autoplace control. */
export type MapGenSize =
  | number
  | 'none'
  | 'very-low'
  | 'very-small'
  | 'very-poor'
  | 'low'
  | 'small'
  | 'poor'
  | 'normal'
  | 'medium'
  | 'regular'
  | 'high'
  | 'big'
  | 'good'
  | 'very-high'
  | 'very-big'
  | 'very-good';

/** Coordinates of a tile in a map. Positive x goes towards east, positive y goes towards south, and x is the first dimension in the array format.

The coordinates are stored as a fixed-size 32 bit integer, with 8 bits reserved for decimal precision, meaning the smallest value step is `1/2^8 = 0.00390625` tiles. */
export type MapPosition = _MapPosition | [number, number];

/** `math.huge` represents the maximum possible tick. */
export type MapTick = number;

export type MaterialAmountType = number;

/** A string that represents a math expression. The expression parser recognizes four basic token types (with their regex):

- Whitespace: `[ \n\r\t]*`

- Number: `(0x[0-9a-f]+|([0-9]+\.?[0-9]*|\.[0-9]+)(e-?[0-9]+)?)` (e.g. `3.2`, `100`, `.6`, `4.2e-5`, `0x2a5f`). Supports hexadecimal input and scientific notation for decimal numbers.

- Operator: `+`, `-`, `*`, `/`, `^`, and `()` for brackets, which may be nested.

- Identifier: The functions listed below and any variables listed where the expression is used.

Identifiers are used to name functions and variables, which result in or represent numbers. The following functions are always available:

- `abs(value)`: Returns absolute value of the given argument; i.e. if the argument is negative, it is inverted.

- `log2(value)`: Returns a binary logarithm of the given value.

- `sign(value)`: Returns `-1` for negative numbers, `0` for zero (regardless of sign), `1` for positive numbers

- `max(value1, value2, ...)`: Returns the greater of the given values. Supports between 2 and 255 arguments.

- `min(value1, value2, ...)`: Returns the smaller of the given values. Supports between 2 and 255 arguments.

The property where the expression is used may provide variables. For example in [TechnologyUnit::count_formula](prototype:TechnologyUnit::count_formula) `L` and `l` may be used for the technology level.

The formula is executed following the [BODMAS](https://en.wikipedia.org/wiki/Order_of_operations#Conventional_order) order (also known as PEMDAS). */
export type MathExpression = string;

export type Mirroring =
  | 'horizontal'
  | 'vertical'
  | 'diagonal-pos'
  | 'diagonal-neg';

/** The effect that is applied when a [TechnologyPrototype](prototype:TechnologyPrototype) is researched.

Loaded as one of the [BaseModifier](prototype:BaseModifier) extensions, based on the value of the `type` key. */
export type Modifier =
  | InserterStackSizeBonusModifier
  | BulkInserterCapacityBonusModifier
  | LaboratorySpeedModifier
  | CharacterLogisticTrashSlotsModifier
  | MaximumFollowingRobotsCountModifier
  | WorkerRobotSpeedModifier
  | WorkerRobotStorageModifier
  | TurretAttackModifier
  | AmmoDamageModifier
  | GiveItemModifier
  | GunSpeedModifier
  | UnlockRecipeModifier
  | CharacterCraftingSpeedModifier
  | CharacterMiningSpeedModifier
  | CharacterRunningSpeedModifier
  | CharacterBuildDistanceModifier
  | CharacterItemDropDistanceModifier
  | CharacterReachDistanceModifier
  | CharacterResourceReachDistanceModifier
  | CharacterItemPickupDistanceModifier
  | CharacterLootPickupDistanceModifier
  | CharacterInventorySlotsBonusModifier
  | DeconstructionTimeToLiveModifier
  | MaxFailedAttemptsPerTickPerConstructionQueueModifier
  | MaxSuccessfulAttemptsPerTickPerConstructionQueueModifier
  | CharacterHealthBonusModifier
  | MiningDrillProductivityBonusModifier
  | TrainBrakingForceBonusModifier
  | WorkerRobotBatteryModifier
  | LaboratoryProductivityModifier
  | FollowerRobotLifetimeModifier
  | ArtilleryRangeModifier
  | NothingModifier
  | CharacterLogisticRequestsModifier
  | VehicleLogisticsModifier
  | UnlockSpaceLocationModifier
  | UnlockQualityModifier
  | SpacePlatformsModifier
  | CircuitNetworkModifier
  | CargoLandingPadLimitModifier
  | ChangeRecipeProductivityModifier
  | CliffDeconstructionEnabledModifier
  | MiningWithFluidModifier
  | RailSupportOnDeepOilOceanModifier
  | RailPlannerAllowElevatedRailsModifier
  | BeaconDistributionModifier
  | CreateGhostOnEntityDeathModifier
  | BeltStackSizeBonusModifier;

/** A dictionary of mod names to mod versions of all active mods. It can be used to adjust mod functionality based on the presence of other mods. */
export type Mods = Record<string, string>;

/** The name of a [ModuleCategory](prototype:ModuleCategory). */
export type ModuleCategoryID = string;

export type ModuleTint =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'quaternary'
  | 'none';

/** The name of a [MouseCursor](prototype:MouseCursor). */
export type MouseCursorID = string;

export type NeighbourConnectableConnectionCategory = string;

/** A boolean or double as simple values or a string that represents a math expression. The expression parser recognizes five basic token types (with their regex):

- **Whitespace:** `[ \n\r\t]*`

- **Identifier:** `[a-zA-Z_][a-zA-Z0-9_:]*` (e.g. cat_bar123)

- **Number:** `(0x[0-9a-f]+|([0-9]+\.?[0-9]*|\.[0-9]+)(e-?[0-9]+)?)` (e.g. `3.2`, `100`, `.6`, `4.2e-5`, `0x2a5f`). Supports hexadecimal input and scientific notation for decimal numbers.

- **String:** `("[^"]*"|'[^']*')` (e.g. `"cat bar 123"`, `'control-setting:copper-ore'`)

- **Operator:** See the list below

Identifiers are used to name functions and variables. The built-in functions and variables are documented in the [auxiliary docs](runtime:noise-expressions). Mods can define their own noise expressions which can be used as variables and functions. The entry points for this are [NamedNoiseFunction](prototype:NamedNoiseFunction) and [NamedNoiseExpression](prototype:NamedNoiseExpression) as well as local functions and expressions.

All functions accept both named and positional arguments. To differentiate between these function calls, positional arguments start/end with `(`/`)` and named arguments with `{`/`}`, e.g. `clamp(x, -1, 1)` and `clamp{min = -1, max = 1, value = x}` are the same function call. Because of this, positional arguments can't be mixed with named arguments. A function can't have more than 255 parameters.

The following operators are available, ordered by precedence:

- `x^y`: Exponentiation (fast, inaccurate), equivalent to the built-in `pow(x, y)` noise function

- `+x`, `-x`, `~x`: Unary plus and minus and unary bitwise not

- `x*y`, `x/y`, `x%y`, `x%%y`: Multiplication and division, modulo and remainder.

- `x+y`, `x-y`: Addition and subtraction

- `x<y`, `x<=y`, `x>y`, `x>=y`: Less than, less than or equal, greater than, greater than or equal

- `x==y`, `x~=y`, `x!=y`: Equal to and not equal to (Lua and C++ syntax)

- `x&y`: Bitwise and

- `x~y`: Bitwise xor

- `x|y`: Bitwise or

Modulo is implemented as `x - floor(x / y) * y` and remainder uses C++ [`fmod(x, y)`](https://en.cppreference.com/w/cpp/numeric/math/fmod) function.

The boolean operators (less than, less than or equal, equal, not equal, greater than, greater than or equal) take two numbers and return 0 for false or 1 for true.

The bitwise operators convert single-precision floating-point numbers to signed 32-bit integers before computing the result. */
export type NoiseExpression = string | boolean | number;

/** The order property is a simple `string`. When the game needs to sort prototypes (of the same type), it looks at their order properties and sorts those alphabetically. A prototype with an order string of `"a"` will be listed before other prototypes with order string `"b"` or `"c"`. The `"-"` or `"[]"` structures that can be found in vanilla order strings do *not* have any special meaning.

The alphabetical sorting uses [lexicographical comparison](https://en.wikipedia.org/wiki/Lexicographic_order) to determine if a given prototype is shown before or after another. If the order strings are equal then the game falls back to comparing the prototype names to determine order. */
export type Order = string;

/** The name of a [ParticlePrototype](prototype:ParticlePrototype). */
export type ParticleID = string;

export type PersistentWorldAmbientSoundDefinition =
  | _PersistentWorldAmbientSoundDefinition
  | Sound;

export type PipeConnectionType = 'normal' | 'underground' | 'linked';

/** Defines when controller vibrations should be played. */
export type PlayFor = 'character_actions' | 'everything';

export type PlayerInputMethodFilter =
  | 'all'
  | 'keyboard_and_mouse'
  | 'game_controller';

/** Probabilities of all items must add up to 100. */
export type ProbabilityTable = ProbabilityTableItem[];

/** The first number is the value.

The second number is the probability in percents. It must be in the `(0, 100]` interval. */
export type ProbabilityTableItem = [number, number];

/** Allows a prototype to load variable amount of sounds which may be referenced by index. */
export type ProcessionAudioCatalogue = ProcessionAudioCatalogueItem[];

/** Type of [ProcessionAudioEvent](prototype:ProcessionAudioEvent). */
export type ProcessionAudioEventType =
  | 'play-sound'
  | 'start-looped-sound'
  | 'stop-looped-sound';

/** Types of [ProcessionAudio](prototype:ProcessionAudio). */
export type ProcessionAudioType =
  | 'none'
  | 'sound'
  | 'looped-sound'
  | 'pod-catalogue'
  | 'location-catalogue';

/** Who will hear [ProcessionAudioEvent](prototype:ProcessionAudioEvent). */
export type ProcessionAudioUsage = 'both' | 'passenger' | 'outside';

/** Allows a prototype to load variable amount of sprites which may be referenced by index. */
export type ProcessionGraphicCatalogue = ProcessionGraphicCatalogueItem[];

/** Types of [ProcessionGraphic](prototype:ProcessionGraphic). */
export type ProcessionGraphicType =
  | 'none'
  | 'sprite'
  | 'animation'
  | 'pod-catalogue'
  | 'location-catalogue'
  | 'hatch-location-catalogue-index';

/** The name of a [ProcessionPrototype](prototype:ProcessionPrototype). */
export type ProcessionID = string;

/** Describes one aspect of a procession. Animation and picture are interchangeable for types that require it.

Loaded as one of the procession layers, based on the value of the `type` key. */
export type ProcessionLayer =
  | PodDistanceTraveledProcessionLayer
  | PodMovementProcessionLayer
  | PodOpacityProcessionLayer
  | SingleGraphicProcessionLayer
  | CoverGraphicProcessionLayer
  | TintProcessionLayer
  | PodAnimationProcessionLayer;

/** The name of an [ProcessionLayerInheritanceGroup](prototype:ProcessionLayerInheritanceGroup). */
export type ProcessionLayerInheritanceGroupID = string;

export type ProcessionLayerWithTime = ProcessionLayer;

export type ProductPrototype =
  | ItemProductPrototype
  | FluidProductPrototype
  | ResearchProgressProductPrototype;

/** Specifies how the entity will utilize this fluidbox. `input-output` should only be used for boilers in fluid heating mode. */
export type ProductionType = 'none' | 'input' | 'input-output' | 'output';

/** The name of a [QualityPrototype](prototype:QualityPrototype). */
export type QualityID = string;

/** Define a numerical property in terms of minimum and maximum to be used as a randomly chosen value in that range (inclusively).

The maximum cannot be less than the minimum. */
export type RandomRange = [number, number] | number;

export type RangeMode =
  | 'center-to-center'
  | 'bounding-box-to-bounding-box'
  | 'center-to-bounding-box';

export type RangedValue = [number, number] | number;

/** Specified by a [float](prototype:float) between 0 and 1, including 0 and excluding 1. */
export type RealOrientation = number;

/** The name of a [RecipeCategory](prototype:RecipeCategory). */
export type RecipeCategoryID = string;

/** The name of a [RecipePrototype](prototype:RecipePrototype). */
export type RecipeID = string;

/** The render layer specifies the order of the sprite when rendering, most of the objects have it hardcoded in the source, but some are configurable. The union contains valid values from lowest to highest.

Note: `decals` is used as special marker for [DecorativePrototype::render_layer](prototype:DecorativePrototype::render_layer). When used elsewhere, the sprites will draw over the terrain. */
export type RenderLayer =
  | 'zero'
  | 'background-transitions'
  | 'under-tiles'
  | 'decals'
  | 'above-tiles'
  | 'ground-layer-1'
  | 'ground-layer-2'
  | 'ground-layer-3'
  | 'ground-layer-4'
  | 'ground-layer-5'
  | 'lower-radius-visualization'
  | 'radius-visualization'
  | 'transport-belt-integration'
  | 'resource'
  | 'building-smoke'
  | 'rail-stone-path-lower'
  | 'rail-stone-path'
  | 'rail-tie'
  | 'decorative'
  | 'ground-patch'
  | 'ground-patch-higher'
  | 'ground-patch-higher2'
  | 'rail-chain-signal-metal'
  | 'rail-screw'
  | 'rail-metal'
  | 'remnants'
  | 'floor'
  | 'transport-belt'
  | 'transport-belt-endings'
  | 'floor-mechanics-under-corpse'
  | 'corpse'
  | 'floor-mechanics'
  | 'item'
  | 'transport-belt-reader'
  | 'lower-object'
  | 'transport-belt-circuit-connector'
  | 'lower-object-above-shadow'
  | 'lower-object-overlay'
  | 'object-under'
  | 'object'
  | 'cargo-hatch'
  | 'higher-object-under'
  | 'higher-object-above'
  | 'train-stop-top'
  | 'item-in-inserter-hand'
  | 'above-inserter'
  | 'wires'
  | 'under-elevated'
  | 'elevated-rail-stone-path-lower'
  | 'elevated-rail-stone-path'
  | 'elevated-rail-tie'
  | 'elevated-rail-screw'
  | 'elevated-rail-metal'
  | 'elevated-lower-object'
  | 'elevated-object'
  | 'elevated-higher-object'
  | 'fluid-visualization'
  | 'wires-above'
  | 'entity-info-icon'
  | 'entity-info-icon-above'
  | 'explosion'
  | 'projectile'
  | 'smoke'
  | 'air-object'
  | 'air-entity-info-icon'
  | 'light-effect'
  | 'selection-box'
  | 'higher-selection-box'
  | 'collision-selection-box'
  | 'arrow'
  | 'cursor';

/** Defines the amount of an item required to research one unit of a [technology](prototype:TechnologyPrototype). The first member of the tuple is the name of a [ToolPrototype](prototype:ToolPrototype) and the second is the amount. Amount must not be 0. */
export type ResearchIngredient = [ItemID, number];

/** The name of a [ResourceCategory](prototype:ResourceCategory). */
export type ResourceCategoryID = string;

export type RichTextSetting = 'enabled' | 'disabled' | 'highlight';

/** A map of rotated animations for all 8 directions of the entity. If this is loaded as a single RotatedAnimation, it applies to all directions.

Any direction that is not defined defaults to the rotated animation of the opposite direction. If that is also not defined, it defaults to the north rotated animation. */
export type RotatedAnimation8Way = _RotatedAnimation8Way | RotatedAnimation;

export type RotatedAnimationVariations = RotatedAnimation | RotatedAnimation[];

/** An array containing the following values. */
export type SelectionModeFlags =
  | (
      | 'blueprint'
      | 'deconstruct'
      | 'cancel-deconstruct'
      | 'items'
      | 'trees'
      | 'buildable-type'
      | 'nothing'
      | 'items-to-place'
      | 'any-entity'
      | 'any-tile'
      | 'same-force'
      | 'not-same-force'
      | 'friend'
      | 'enemy'
      | 'upgrade'
      | 'cancel-upgrade'
      | 'downgrade'
      | 'entity-with-health'
      | 'is-military-target'
      | 'entity-with-owner'
      | 'avoid-rolling-stock'
      | 'avoid-vehicle'
      | 'controllable'
      | 'controllable-add'
      | 'controllable-remove'
      | 'entity-ghost'
      | 'tile-ghost'
    )
  | (
      | 'blueprint'
      | 'deconstruct'
      | 'cancel-deconstruct'
      | 'items'
      | 'trees'
      | 'buildable-type'
      | 'nothing'
      | 'items-to-place'
      | 'any-entity'
      | 'any-tile'
      | 'same-force'
      | 'not-same-force'
      | 'friend'
      | 'enemy'
      | 'upgrade'
      | 'cancel-upgrade'
      | 'downgrade'
      | 'entity-with-health'
      | 'is-military-target'
      | 'entity-with-owner'
      | 'avoid-rolling-stock'
      | 'avoid-vehicle'
      | 'controllable'
      | 'controllable-add'
      | 'controllable-remove'
      | 'entity-ghost'
      | 'tile-ghost'
    )[];

export type SemiPersistentWorldAmbientSoundDefinition =
  | _SemiPersistentWorldAmbientSoundDefinition
  | Sound;

export type SendToOrbitMode = 'not-sendable' | 'manual' | 'automated';

/** An axis aligned bounding box.

SimpleBoundingBoxes are usually specified with the short-hand notation of passing an array of exactly 2 numbers. The first position is left_top, the second position is right_bottom.

Positive x goes towards east, positive y goes towards south. This means that the upper-left point is the least dimension in x and y, and lower-right is the greatest. */
export type SimpleBoundingBox = _SimpleBoundingBox | [MapPosition, MapPosition];

export type Sound = _Sound | SoundDefinition[];

export type SoundDefinition = _SoundDefinition | FileName;

export type SoundModifierType =
  | 'game'
  | 'main-menu'
  | 'tips-and-tricks'
  | 'driving'
  | 'elevation'
  | 'space-platform';

/** This defines which slider in the sound settings affects the volume of this sound. Furthermore, some sound types are mixed differently than others, e.g. zoom level effects are applied. */
export type SoundType =
  | 'game-effect'
  | 'gui-effect'
  | 'ambient'
  | 'environment'
  | 'walking'
  | 'alert'
  | 'wind'
  | 'world-ambient'
  | 'weapon'
  | 'explosion'
  | 'enemy';

export type SpaceConnectionAsteroidSpawnDefinition =
  | _SpaceConnectionAsteroidSpawnDefinition
  | [EntityID, SpaceConnectionAsteroidSpawnPoint[]];

/** The name of a [SpaceConnectionPrototype](prototype:SpaceConnectionPrototype). */
export type SpaceConnectionID = string;

/** The name of a [SpaceLocationPrototype](prototype:SpaceLocationPrototype). */
export type SpaceLocationID = string;

/** The definition of a evolution and probability weights for a [spawnable unit](prototype:UnitSpawnDefinition) for a [EnemySpawnerPrototype](prototype:EnemySpawnerPrototype).

It can be specified as a table with named or numbered keys, but not a mix of both. If this is specified as a table with numbered keys then the first value is the evolution factor and the second is the spawn weight. */
export type SpawnPoint = _SpawnPoint | [number, number];

/** Sprites for the 4 major directions of the entity. If this is loaded as a single Sprite, it applies to all directions.

This struct is either loaded as `sheets` or `sheet` or a map of one sprite per direction. For per direction sprites, the sprites are loaded via `north`, `east`, `south` and `west`. */
export type Sprite4Way = _Sprite4Way | Sprite;

/** An array containing the following values. */
export type SpriteFlags = (
  | 'no-crop'
  | 'not-compressed'
  | 'always-compressed'
  | 'mipmap'
  | 'linear-minification'
  | 'linear-magnification'
  | 'linear-mip-level'
  | 'alpha-mask'
  | 'no-scale'
  | 'mask'
  | 'icon'
  | 'gui'
  | 'gui-icon'
  | 'light'
  | 'terrain'
  | 'terrain-effect-map'
  | 'reflection-effect-map'
  | 'shadow'
  | 'smoke'
  | 'decal'
  | 'low-object'
  | 'corpse-decay'
  | 'trilinear-filtering'
  | 'group=none'
  | 'group=terrain'
  | 'group=shadow'
  | 'group=smoke'
  | 'group=decal'
  | 'group=low-object'
  | 'group=gui'
  | 'group=icon'
  | 'group=icon-background'
  | 'group=effect-texture'
)[];

/** This sets the "caching priority" of a sprite, so deciding priority of it being included in VRAM instead of streaming it and is therefore a purely technical value. See [here](https://forums.factorio.com/viewtopic.php?p=437380#p437380) and [here](https://www.factorio.com/blog/post/fff-264). The possible values are listed below. */
export type SpritePriority =
  | 'extra-high-no-scale'
  | 'extra-high'
  | 'high'
  | 'medium'
  | 'low'
  | 'very-low'
  | 'no-atlas';

export type SpriteSizeType = number;

/** Provides hint to sprite atlas system, so it can pack sprites that are related to each other to the same sprite atlas. */
export type SpriteUsageHint =
  | 'any'
  | 'mining'
  | 'tile-artifical'
  | 'corpse-decay'
  | 'enemy'
  | 'player'
  | 'train'
  | 'vehicle'
  | 'explosion'
  | 'rail'
  | 'elevated-rail'
  | 'air'
  | 'remnant'
  | 'decorative';

/** Provides hint to sprite atlas system, so it can try to put sprites that are intended to be used at the same locations to the same sprite atlas. */
export type SpriteUsageSurfaceHint =
  | 'any'
  | 'nauvis'
  | 'vulcanus'
  | 'gleba'
  | 'fulgora'
  | 'aquilo'
  | 'space';

export type SpriteVariations = _SpriteVariations | SpriteSheet | Sprite[];

export type StatelessVisualisations =
  | StatelessVisualisation
  | StatelessVisualisation[];

/** Sets whether a GUI element can be stretched or squashed. */
export type StretchRule = 'on' | 'off' | 'auto' | 'stretch_and_expand';

/** Loaded as one of the [BaseStyleSpecification](prototype:BaseStyleSpecification) extensions, based on the value of the `type` key. */
export type StyleSpecification =
  | ActivityBarStyleSpecification
  | ButtonStyleSpecification
  | CameraStyleSpecification
  | CheckBoxStyleSpecification
  | DropDownStyleSpecification
  | FlowStyleSpecification
  | FrameStyleSpecification
  | GraphStyleSpecification
  | HorizontalFlowStyleSpecification
  | LineStyleSpecification
  | ImageStyleSpecification
  | LabelStyleSpecification
  | ListBoxStyleSpecification
  | ProgressBarStyleSpecification
  | RadioButtonStyleSpecification
  | HorizontalScrollBarStyleSpecification
  | VerticalScrollBarStyleSpecification
  | ScrollPaneStyleSpecification
  | SliderStyleSpecification
  | SwitchStyleSpecification
  | TableStyleSpecification
  | TabStyleSpecification
  | TextBoxStyleSpecification
  | VerticalFlowStyleSpecification
  | TabbedPaneStyleSpecification
  | EmptyWidgetStyleSpecification
  | MinimapStyleSpecification
  | TechnologySlotStyleSpecification
  | GlowStyleSpecification
  | SpeechBubbleStyleSpecification
  | DoubleSliderStyleSpecification;

/** The name of a [SurfacePrototype](prototype:SurfacePrototype). */
export type SurfaceID = string;

/** The name of a [SurfacePropertyPrototype](prototype:SurfacePropertyPrototype). */
export type SurfacePropertyID = string;

/** The name of a [TechnologyPrototype](prototype:TechnologyPrototype). */
export type TechnologyID = string;

/** Loaded as one of the technology triggers, based on the value of the `type` key. */
export type TechnologyTrigger =
  | MineEntityTechnologyTrigger
  | CraftItemTechnologyTrigger
  | CraftFluidTechnologyTrigger
  | SendItemToOrbitTechnologyTrigger
  | CaptureSpawnerTechnologyTrigger
  | BuildEntityTechnologyTrigger
  | CreateSpacePlatformTechnologyTrigger;

export type ThrusterPerformancePoint =
  | _ThrusterPerformancePoint
  | [number, number, number];

/** The name of an [TileEffectDefinition](prototype:TileEffectDefinition). */
export type TileEffectDefinitionID = string;

/** The name of a [TilePrototype](prototype:TilePrototype). */
export type TileID = string;

/** Name of an allowed tile, or a list of two tile names for entities allowed on transitions. */
export type TileIDRestriction = TileID | [TileID, TileID];

/** Coordinates of a tile on a map where each integer `x`/`y` represents a different tile. This uses the same format as [MapPosition](prototype:MapPosition), except it rounds any non-integer `x`/`y` down to whole numbers. It can be specified either with or without explicit keys. */
export type TilePosition = _TilePosition | [number, number];

export type TileRenderLayer =
  | 'zero'
  | 'water'
  | 'water-overlay'
  | 'ground-natural'
  | 'ground-artificial'
  | 'top';

/** This is used by [TipsAndTricksItem](prototype:TipsAndTricksItem) for the initial starting status. One of the following values: */
export type TipStatus =
  | 'locked'
  | 'optional'
  | 'dependencies-not-met'
  | 'unlocked'
  | 'suggested'
  | 'not-to-be-suggested'
  | 'completed-without-tutorial'
  | 'completed';

/** Loaded as one of the tip triggers, based on the value of the `type` key. */
export type TipTrigger =
  | OrTipTrigger
  | AndTipTrigger
  | SequenceTipTrigger
  | DependenciesMetTipTrigger
  | TimeElapsedTipTrigger
  | TimeSinceLastTipActivationTipTrigger
  | ResearchTechnologyTipTrigger
  | ResearchWithSciencePackTipTrigger
  | UnlockRecipeTipTrigger
  | CraftItemTipTrigger
  | BuildEntityTipTrigger
  | ManualTransferTipTrigger
  | ModuleTransferTipTrigger
  | StackTransferTipTrigger
  | EntityTransferTipTrigger
  | DropItemTipTrigger
  | SetRecipeTipTrigger
  | SetFilterTipTrigger
  | LimitChestTipTrigger
  | UsePipetteTipTrigger
  | SetLogisticRequestTipTrigger
  | UseConfirmTipTrigger
  | ToggleShowEntityInfoTipTrigger
  | GeneratingPowerTipTrigger
  | LowPowerTipTrigger
  | PasteEntitySettingsTipTrigger
  | FastReplaceTipTrigger
  | GroupAttackTipTrigger
  | FastBeltBendTipTrigger
  | BeltTraverseTipTrigger
  | PlaceEquipmentTipTrigger
  | ClearCursorTipTrigger
  | RotateEntityTipTrigger
  | FlipEntityTipTrigger
  | AlternativeBuildTipTrigger
  | GateOverRailBuildTipTrigger
  | ManualWireDragTipTrigger
  | ShootTipTrigger
  | ChangeSurfaceTipTrigger
  | ApplyStarterPackTipTrigger
  | MineItemByRobotTipTrigger
  | BuildEntityByRobotTipTrigger
  | PlanTrainPathTipTrigger
  | UseRailPlannerTipTrigger
  | ToggleRailLayerTipTrigger
  | EnterVehicleTipTrigger
  | SendSpidertronTipTrigger
  | ActivatePasteTipTrigger
  | KillTipTrigger;

/** Loaded as one of the [TriggerItem](prototype:TriggerItem) extensions, based on the value of the `type` key. */
export type Trigger =
  | (DirectTriggerItem | AreaTriggerItem | LineTriggerItem | ClusterTriggerItem)
  | (
      | DirectTriggerItem
      | AreaTriggerItem
      | LineTriggerItem
      | ClusterTriggerItem
    )[];

/** Loaded as one of the [TriggerDeliveryItem](prototype:TriggerDeliveryItem) extensions, based on the value of the `type` key. */
export type TriggerDelivery =
  | InstantTriggerDelivery
  | ProjectileTriggerDelivery
  | BeamTriggerDelivery
  | StreamTriggerDelivery
  | ArtilleryTriggerDelivery
  | ChainTriggerDelivery
  | DelayedTriggerDelivery;

/** Loaded as one of the [TriggerEffectItem](prototype:TriggerEffectItem) extensions, based on the value of the `type` key. */
export type TriggerEffect =
  | (
      | DamageTriggerEffectItem
      | CreateEntityTriggerEffectItem
      | CreateExplosionTriggerEffectItem
      | CreateFireTriggerEffectItem
      | CreateSmokeTriggerEffectItem
      | CreateTrivialSmokeEffectItem
      | CreateAsteroidChunkEffectItem
      | CreateParticleTriggerEffectItem
      | CreateStickerTriggerEffectItem
      | CreateDecorativesTriggerEffectItem
      | NestedTriggerEffectItem
      | PlaySoundTriggerEffectItem
      | PushBackTriggerEffectItem
      | DestroyCliffsTriggerEffectItem
      | ShowExplosionOnChartTriggerEffectItem
      | InsertItemTriggerEffectItem
      | ScriptTriggerEffectItem
      | SetTileTriggerEffectItem
      | InvokeTileEffectTriggerEffectItem
      | DestroyDecorativesTriggerEffectItem
      | CameraEffectTriggerEffectItem
      | ActivateImpactTriggerEffectItem
    )
  | (
      | DamageTriggerEffectItem
      | CreateEntityTriggerEffectItem
      | CreateExplosionTriggerEffectItem
      | CreateFireTriggerEffectItem
      | CreateSmokeTriggerEffectItem
      | CreateTrivialSmokeEffectItem
      | CreateAsteroidChunkEffectItem
      | CreateParticleTriggerEffectItem
      | CreateStickerTriggerEffectItem
      | CreateDecorativesTriggerEffectItem
      | NestedTriggerEffectItem
      | PlaySoundTriggerEffectItem
      | PushBackTriggerEffectItem
      | DestroyCliffsTriggerEffectItem
      | ShowExplosionOnChartTriggerEffectItem
      | InsertItemTriggerEffectItem
      | ScriptTriggerEffectItem
      | SetTileTriggerEffectItem
      | InvokeTileEffectTriggerEffectItem
      | DestroyDecorativesTriggerEffectItem
      | CameraEffectTriggerEffectItem
      | ActivateImpactTriggerEffectItem
    )[];

/** An array of names of [TriggerTargetType](prototype:TriggerTargetType). See [Design discussion: Trigger target type](https://forums.factorio.com/71657) and [Blacklist for prototypes turrets shouldn't attack](https://forums.factorio.com/86164). */
export type TriggerTargetMask = string[];

/** The name of a [TrivialSmokePrototype](prototype:TrivialSmokePrototype). */
export type TrivialSmokeID = string;

/** If this is loaded as a single Vector, it is used for all directions. */
export type TurretSpecialEffectCenter = _TurretSpecialEffectCenter | Vector;

export type TurretState =
  | 'folded'
  | 'preparing'
  | 'prepared'
  | 'starting-attack'
  | 'attacking'
  | 'ending-attack'
  | 'rotate-for-folding'
  | 'folding';

/** It can be specified as a table with named or numbered keys, but not a mix of both. If this is specified as a table with numbered keys then the first value is the unit and the second is the spawn points. */
export type UnitSpawnDefinition =
  | _UnitSpawnDefinition
  | [EntityID, SpawnPoint[]];

/** Defines how are individual samples selected and played after each other. */
export type VariableAmbientSoundCompositionMode =
  | 'randomized'
  | 'semi-randomized'
  | 'shuffled'
  | 'layer-controlled';

/** First property is the name of a layer.

Second property is the sample index. */
export type VariableAmbientSoundLayerSample = [string, number];

/** Defines how a transition to next state is triggered. */
export type VariableAmbientSoundNextStateTrigger =
  | 'layers-finished'
  | 'duration';

export type VariableAmbientSoundStateType =
  | 'regular'
  | 'intermezzo'
  | 'final'
  | 'stop';

/** A vector is a two-element array or dictionary containing the x and y components. Positive x goes east, positive y goes south. */
export type Vector = _Vector | [number, number];

/** If this is specified as a three-element array then the array items are x, y and z, in that order. */
export type Vector3D = _Vector3D | [number, number, number];

export type Vector4f = _Vector4f | [number, number, number, number];

export type VerticalAlign = 'top' | 'center' | 'bottom';

/** The name of a [VirtualSignalPrototype](prototype:VirtualSignalPrototype). */
export type VirtualSignalID = string;

/** Weight of an object. The weight is stored as a fixed-size 64 bit integer, with 16 bits reserved for decimal precision, meaning the smallest value step is `1/2^16`. */
export type Weight = number;

/** This type is used to produce sound from in-game entities when they are working/idle. */
export type WorkingSound = _WorkingSound | Sound;

export type WorldAmbientSoundDefinition = _WorldAmbientSoundDefinition | Sound;
