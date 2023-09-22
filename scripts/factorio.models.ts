/** Generated file, do not edit. See scripts/factorio-api.ts for generator. */

/**
 * Application: factorio
 * Version: 1.1.91
 * API Version: 4
 */

/** Entity with energy source with specialised animation for charging/discharging. Used for the [accumulator](https://wiki.factorio.com/Accumulator) entity. */
interface _AccumulatorPrototype {
  type: 'accumulator';
  charge_animation?: Animation;
  /** Count of ticks to preserve the animation even when the charging ends. Used to prevent rapid blinking of the accumulator with unstable need to use it. */
  charge_cooldown: number;
  /** Only loaded if `charge_animation` is defined. */
  charge_light?: LightDefinition;
  /** The pictures displayed for circuit connections to this accumulator. */
  circuit_connector_sprites?: CircuitConnectorSprites;
  /** Defines how wires visually connect to this accumulator. */
  circuit_wire_connection_point?: WireConnectionPoint;
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  /** The name of the signal that is the default for when an accumulator is connected to the circuit network. */
  default_output_signal?: SignalIDConnector;
  discharge_animation?: Animation;
  /** How long (in ticks) the animation will last after discharge has been initialized. */
  discharge_cooldown: number;
  /** Only loaded if `discharge_animation` is defined. */
  discharge_light?: LightDefinition;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** The capacity of the energy source buffer specifies the capacity of the accumulator. */
  energy_source: ElectricEnergySource;
  picture: Sprite;
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
  hidden?: boolean;
  /** Path to the icon file.

Mandatory if `icons` is not defined. */
  icon?: FileName;
  /** Icons of reduced size will be used at decreased scale. */
  icon_mipmaps?: IconMipMapType;
  /** The size of the square icon, in pixels, e.g. `32` for a 32px by 32px icon.

Mandatory if `icons` is not defined, or if `icon_size` is not specified for all instances of `icons`. */
  icon_size?: SpriteSizeType;
  /** Can't be an empty array. */
  icons?: IconData[];
  /** Unusable by mods, as this refers to unlocking the achievement through Steam. */
  steam_stats_name?: string;
}

export type AchievementPrototype = _AchievementPrototype &
  Omit<PrototypeBase, keyof _AchievementPrototype>;

export function isAchievementPrototype(
  value: unknown,
): value is AchievementPrototype {
  return (value as { type: string }).type === 'achievement';
}

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

/** This prototype is used to make sound while playing the game. This includes the game's [music](https://store.steampowered.com/app/436090/Factorio__Soundtrack/), composed by Daniel James Taylor. */
export interface AmbientSound {
  /** Unique textual identification of the prototype. */
  name: string;
  /** The sound file and volume. */
  sound: Sound;
  /** Lets the game know in what instances the audio file is played. */
  track_type:
    | 'menu-track'
    | 'main-track'
    | 'early-game'
    | 'late-game'
    | 'interlude';
  /** Specification of the type of the prototype. */
  type: 'ambient-sound';
  weight?: number;
}

export function isAmbientSound(value: unknown): value is AmbientSound {
  return (value as { type: string }).type === 'ambient-sound';
}

/** An ammo category. Each weapon has an ammo category, and can use any ammo with the same ammo category. Ammo categories can also be upgraded by technologies. */
interface _AmmoCategory {
  type: 'ammo-category';
  bonus_gui_order?: Order;
}

export type AmmoCategory = _AmmoCategory &
  Omit<PrototypeBase, keyof _AmmoCategory>;

export function isAmmoCategory(value: unknown): value is AmmoCategory {
  return (value as { type: string }).type === 'ammo-category';
}

/** Ammo used for a gun. */
interface _AmmoItemPrototype {
  type: 'ammo';
  /** When using a plain [AmmoType](prototype:AmmoType) (no array), the ammo type applies to everything (`"default"`).

When using an array of AmmoTypes, they have the additional [AmmoType::source_type](prototype:AmmoType::source_type) property. */
  ammo_type: AmmoType | AmmoType[];
  /** Number of shots before ammo item is consumed. Must be >= `1`. */
  magazine_size?: number;
  /** Amount of extra time (in ticks) it takes to reload the weapon after depleting the magazine. Must be >= `0`. */
  reload_time?: number;
}

export type AmmoItemPrototype = _AmmoItemPrototype &
  Omit<ItemPrototype, keyof _AmmoItemPrototype>;

export function isAmmoItemPrototype(
  value: unknown,
): value is AmmoItemPrototype {
  return (value as { type: string }).type === 'ammo';
}

/** A turret that consumes ammo items. */
interface _AmmoTurretPrototype {
  type: 'ammo-turret';
  automated_ammo_count: ItemCountType;
  /** Shift of the "alt-mode icon" relative to the turret's position. */
  entity_info_icon_shift?: Vector;
  inventory_size: ItemStackIndex;
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
  /** Only loaded if `layers` is not defined. Mandatory if `stripes` is not defined.

The path to the sprite file to use. */
  filename: FileName;
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

Height of one frame in pixels, from 0-8192. */
  height?: SpriteSizeType;
  /** Only loaded if `layers` is not defined.

If this property exists and high resolution sprites are turned on, this is used to load the Animation. */
  hr_version?: Animation;
  /** If this property is present, all Animation definitions have to be placed as entries in the array, and they will all be loaded from there. `layers` may not be an empty table. Each definition in the array may also have the `layers` property.

`animation_speed` and `max_advance` only have to be defined in one layer. All layers will run at the same speed.

If this property is present, all other properties besides `name` and `type` are ignored. */
  layers: Animation[];
  /** Only loaded if `layers` is not defined.

Once the specified number of pictures is loaded, other pictures are loaded on other line. This is to allow having longer animations in matrix, to input files with too high width. The game engine limits the width of any input files to 8192px, so it is compatible with most graphics cards. `0` means that all the pictures are in one horizontal line. */
  line_length?: number;
  /** Only loaded if `layers` is not defined.

Minimal mode is entered when mod loading fails. You are in it when you see the gray box after (part of) the loading screen that tells you a mod error ([Example](https://cdn.discordapp.com/attachments/340530709712076801/532315796626472972/unknown.png)). Modders can ignore this property. */
  load_in_minimal_mode?: boolean;
  /** Only loaded if `layers` is not defined.

If `layers` are used, `max_advance` only has to be defined in one layer. */
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
  run_mode?: 'forward' | 'backward' | 'forward-then-backward';
  /** Only loaded if `layers` is not defined.

Values other than `1` specify the scale of the sprite on default zoom. A scale of `2` means that the picture will be two times bigger on screen (and thus more pixelated). */
  scale?: number;
  /** Only loaded if `layers` is not defined.

The shift in tiles. `util.by_pixel()` can be used to divide the shift by 32 which is the usual pixel height/width of 1 tile in normal resolution. Note that 32 pixel tile height/width is not enforced anywhere - any other tile height or width is also possible. */
  shift?: Vector;
  /** Only loaded if `layers` is not defined.

The width and height of one frame. If this is a tuple, the first member of the tuple is the width and the second is the height. Otherwise the size is both width and height. Width and height may only be in the range of 0-8192. */
  size?: SpriteSizeType | [SpriteSizeType, SpriteSizeType];
  /** Only loaded if `layers` is not defined. */
  stripes?: Stripe[];
  /** Only loaded if `layers` is not defined. */
  tint?: Color;
  type: 'animation';
  /** Only loaded if `layers` is not defined. Mandatory if `size` is not defined.

Width of one frame in pixels, from 0-8192. */
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
  and_symbol_sprites: Sprite4Way;
  divide_symbol_sprites: Sprite4Way;
  left_shift_symbol_sprites: Sprite4Way;
  minus_symbol_sprites: Sprite4Way;
  modulo_symbol_sprites: Sprite4Way;
  multiply_symbol_sprites: Sprite4Way;
  or_symbol_sprites: Sprite4Way;
  plus_symbol_sprites: Sprite4Way;
  power_symbol_sprites: Sprite4Way;
  right_shift_symbol_sprites: Sprite4Way;
  xor_symbol_sprites: Sprite4Way;
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
  /** Name of the [EquipmentGridPrototype](prototype:EquipmentGridPrototype) that this armor has. */
  equipment_grid?: EquipmentGridID;
  /** By how many slots the inventory of the player is expanded when the armor is worn. */
  inventory_size_bonus?: ItemStackIndex;
  /** What amount of damage the armor takes on what type of damage is incoming. */
  resistances?: Resistances;
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
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
}

export type ArrowPrototype = _ArrowPrototype &
  Omit<EntityPrototype, keyof _ArrowPrototype>;

export function isArrowPrototype(value: unknown): value is ArrowPrototype {
  return (value as { type: string }).type === 'arrow';
}

/** The entity spawned by the [artillery targeting remote](https://wiki.factorio.com/Artillery_targeting_remote). */
interface _ArtilleryFlarePrototype {
  type: 'artillery-flare';
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
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
  pictures: AnimationVariations;
  regular_trigger_effect?: TriggerEffect;
  regular_trigger_effect_frequency?: number;
  render_layer?: RenderLayer;
  render_layer_when_on_ground?: RenderLayer;
  /** The entity with the higher number is selectable before the entity with the lower number. When two entities have the same selection priority, the one with the highest [CollisionMask](prototype:CollisionMask) (as determined by the order on that page) is selected. */
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
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
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
  base_shift?: Vector;
  /** Only loaded if `cannon_barrel_recoil_shiftings` is loaded. */
  cannon_barrel_light_direction?: Vector3D;
  cannon_barrel_pictures?: RotatedSprite;
  cannon_barrel_recoil_shiftings?: Vector3D[];
  /** Only loaded if `cannon_barrel_recoil_shiftings` is loaded. */
  cannon_barrel_recoil_shiftings_load_correction_matrix?: Vector3D[];
  cannon_base_pictures?: RotatedSprite;
  cannon_parking_frame_count?: number;
  cannon_parking_speed?: number;
  disable_automatic_firing?: boolean;
  /** Name of a [GunPrototype](prototype:GunPrototype). */
  gun: ItemID;
  /** Must be > 0. */
  inventory_size: ItemStackIndex;
  /** Whether this prototype should be a high priority target for enemy forces. See [Military units and structures](https://wiki.factorio.com/Military_units_and_structures). */
  is_military_target?: boolean;
  /** Must be positive. */
  manual_range_modifier: number;
  rotating_sound?: InterruptibleSound;
  rotating_stopped_sound?: Sound;
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
  cannon_barrel_pictures?: RotatedSprite;
  cannon_barrel_recoil_shiftings?: Vector3D[];
  /** Only loaded if `cannon_barrel_recoil_shiftings` is loaded. */
  cannon_barrel_recoil_shiftings_load_correction_matrix?: Vector3D[];
  cannon_base_pictures?: RotatedSprite;
  /** Must match `cannon_base_pictures` frame count. */
  cannon_base_shiftings?: Vector[];
  cannon_parking_frame_count?: number;
  cannon_parking_speed?: number;
  disable_automatic_firing?: boolean;
  /** Name of a [GunPrototype](prototype:GunPrototype). */
  gun: ItemID;
  /** Must be > 0. */
  inventory_size: ItemStackIndex;
  /** Must be > 0. */
  manual_range_modifier: number;
  rotating_sound?: InterruptibleSound;
  rotating_stopped_sound?: Sound;
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
  /** Shift of the "alt-mode icon" relative to the machine's center. */
  entity_info_icon_shift?: Vector;
  /** The preset recipe of this machine. This machine does not show a recipe selection if this is set. The base game uses this for the [rocket silo](https://wiki.factorio.com/Rocket_silo). */
  fixed_recipe?: RecipeID;
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

/** A setting in the map creation GUI. Used by the [autoplace system](prototype:AutoplaceSpecification::control). */
interface _AutoplaceControl {
  type: 'autoplace-control';
  /** Whether there is an "enable" checkbox for the autoplace control in the map generator GUI. If this is false, the autoplace control cannot be disabled from the GUI. */
  can_be_disabled?: boolean;
  /** Controls in what tab the autoplace is shown in the map generator GUI. */
  category: 'resource' | 'terrain' | 'enemy';
  /** Sets whether this control's richness can be changed. The map generator GUI will only show the richness slider when the `category` is `"resource"`.

If the autoplace control is used to generate ores, you probably want this to be true. */
  richness?: boolean;
}

export type AutoplaceControl = _AutoplaceControl &
  Omit<PrototypeBase, keyof _AutoplaceControl>;

export function isAutoplaceControl(value: unknown): value is AutoplaceControl {
  return (value as { type: string }).type === 'autoplace-control';
}

/** Used by [personal battery](https://wiki.factorio.com/Personal_battery). */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
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

/** Entity with the ability to transfer module's effects to its neighboring entities. */
interface _BeaconPrototype {
  type: 'beacon';
  /** The types of modules that a player can place inside of the beacon. */
  allowed_effects?: EffectTypeLimitation;
  /** Only loaded if `graphics_set` is not defined.

The animation for the beacon, when in use. */
  animation?: Animation;
  /** Only loaded if `graphics_set` is not defined.

The picture of the beacon when it is not on. */
  base_picture?: Sprite;
  /** The multiplier of the module's effects, when shared between neighbors. */
  distribution_effectivity: number;
  energy_source: ElectricEnergySource | VoidEnergySource;
  energy_usage: Energy;
  /** The graphics for the beacon. */
  graphics_set?: BeaconGraphicsSet;
  /** The number of module slots in this beacon and their icon positions. */
  module_specification: ModuleSpecification;
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
  /** Body segment of the beam. Must have at least 1 variation. */
  body: AnimationVariations;
  body_light?: AnimationVariations;
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  /** Damage interval can't be 0. A value of 1 will cause the attack to be applied each tick. */
  damage_interval: number;
  /** End point of the beam. */
  ending?: Animation;
  ending_light?: Animation;
  /** Only loaded if `start_light`, `ending_light`, `head_light`, `tail_light` and `body_light` are not defined. */
  ground_light_animations?: BeamAnimationSet;
  /** Head segment of the beam. */
  head: Animation;
  head_light?: Animation;
  /** Only loaded if `start_light`, `ending_light`, `head_light`, `tail_light` and `body_light` are not defined.

Lights are additively accumulated onto a light-map, which is [multiplicatively rendered](https://forums.factorio.com/viewtopic.php?p=435042#p435042) on the game world. */
  light_animations?: BeamAnimationSet;
  random_end_animation_rotation?: boolean;
  random_target_offset?: boolean;
  /** Start point of the beam. */
  start?: Animation;
  start_light?: Animation;
  /** Tail segment of the beam.

All animations must have the same number of frames: Tail must have same number of frames as start, ending, head, body, start_light, ending_light, head_light, tail_light and body_light. */
  tail: Animation;
  tail_light?: Animation;
  target_offset?: Vector;
  transparent_start_end_animations?: boolean;
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
  /** This property is parsed, but then ignored. */
  alt_entity_filter_mode?: 'whitelist' | 'blacklist';
  /** This property is parsed, but then ignored. */
  alt_entity_filters?: EntityID[];
  /** This property is parsed, but then ignored. */
  alt_entity_type_filters?: string[];
  /** This property is hardcoded to `"blueprint"`. */
  alt_selection_mode?: SelectionModeFlags;
  /** This property is parsed, but then ignored. */
  alt_tile_filter_mode?: 'whitelist' | 'blacklist';
  /** This property is parsed, but then ignored. */
  alt_tile_filters?: TileID[];
  /** This property is hardcoded to `false`. */
  always_include_tiles?: boolean;
  /** Whether the item will draw its label when held in the cursor in place of the item count. */
  draw_label_for_cursor_render?: boolean;
  /** This property is parsed, but then ignored. */
  entity_filter_mode?: 'whitelist' | 'blacklist';
  /** This property is parsed, but then ignored. */
  entity_filters?: EntityID[];
  /** This property is parsed, but then ignored. */
  entity_type_filters?: string[];
  /** This property is hardcoded to `"blueprint"`. */
  selection_mode?: SelectionModeFlags;
  /** Count of items of the same name that can be stored in one inventory slot. Must be 1 when the `"not-stackable"` flag is set. */
  stack_size: 1;
  /** This property is parsed, but then ignored. */
  tile_filter_mode?: 'whitelist' | 'blacklist';
  /** This property is parsed, but then ignored. */
  tile_filters?: TileID[];
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
  /** Animation that is drawn on top of the `structure` when `burning_cooldown` is larger than 1. The animation alpha can be controlled by the energy source light intensity, depending on `fire_flicker_enabled`.

The secondary draw order of this is higher than the secondary draw order of `fire_glow`, so this is drawn above `fire_glow`. */
  fire: BoilerFire;
  /** If this is set to false, `fire` alpha is always 1 instead of being controlled by the light intensity of the energy source. */
  fire_flicker_enabled?: boolean;
  /** Animation that is drawn on top of the `structure` when `burning_cooldown` is larger than 1. The animation alpha can be controlled by the energy source light intensity, depending on `fire_glow_flicker_enabled`.

The secondary draw order of this is lower than the secondary draw order of `fire`, so this is drawn below `fire`. */
  fire_glow: BoilerFireGlow;
  /** If this is set to false, `fire_glow` alpha is always 1 instead of being controlled by the light intensity of the energy source. */
  fire_glow_flicker_enabled?: boolean;
  /** The input fluid box.

If `mode` is `"heat-water-inside"`, the fluid is heated up directly in this fluidbox. */
  fluid_box: FluidBox;
  /** In the `"heat-water-inside"` mode, fluid in the `fluid_box` is continuously heated from the input temperature up to its [FluidPrototype::max_temperature](prototype:FluidPrototype::max_temperature).

In the `"output-to-separate-pipe"` mode, fluid is transferred from the `fluid_box` to the `output_fluid_box` when enough energy is available to [heat](prototype:FluidPrototype::heat_capacity) the input fluid to the `target_temperature`. Setting a filter on the `output_fluid_box` means that instead of the heated input fluid getting moved to the output, it is converted to the filtered fluid in a 1:1 ratio. */
  mode?: 'heat-water-inside' | 'output-to-separate-pipe';
  /** The output fluid box.

If `mode` is `"output-to-separate-pipe"` and this has a [filter](prototype:FluidBox::filter), the heated input fluid is converted to the output fluid that is set in the filter (in a 1:1 ratio).

If `mode` is `"heat-water-inside"`, this fluidbox is unused. */
  output_fluid_box: FluidBox;
  /** Drawn above the `structure`, in the "higher-object-under" [RenderLayer](prototype:RenderLayer). May be useful to correct problems with neighboring pipes overlapping the structure graphics. */
  patch?: BoilerPatch;
  structure: BoilerStructure;
  /** When `mode` is `"output-to-separate-pipe"`, this is the temperature that the input fluid must reach to be moved to the output fluid box.

When `mode` is `"heat-water-inside"` this is unused. Instead, the fluid [max_temperature](prototype:FluidPrototype::max_temperature) is the target temperature for heating the fluid. */
  target_temperature: number;
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
  /** This lets the game know how long into a game, before you can no longer complete the achievement. 0 means infinite time. */
  until_second?: number;
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
  animation: Animation4Way;
  /** The input energy source of the generator. */
  burner: BurnerEnergySource;
  /** The output energy source of the generator. Any emissions specified on this energy source are ignored, they must be specified on `burner`. */
  energy_source: ElectricEnergySource;
  /** Plays when the generator is inactive. Idle animation must have the same frame count as `animation`. */
  idle_animation?: Animation4Way;
  /** How much energy this generator can produce. */
  max_power_output: Energy;
  /** Animation runs at least this fast. */
  min_perceived_performance?: number;
  performance_to_sound_speedup?: number;
}

export type BurnerGeneratorPrototype = _BurnerGeneratorPrototype &
  Omit<EntityWithOwnerPrototype, keyof _BurnerGeneratorPrototype>;

export function isBurnerGeneratorPrototype(
  value: unknown,
): value is BurnerGeneratorPrototype {
  return (value as { type: string }).type === 'burner-generator';
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

/** Entity with specialized properties for acceleration, braking, and turning. */
interface _CarPrototype {
  type: 'car';
  /** Animation speed 1 means 1 frame per tile. */
  animation: RotatedAnimation;
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  consumption: Energy;
  darkness_to_render_light_animation?: number;
  /** Modifies the efficiency of energy transfer from burner output to wheels. */
  effectivity: number;
  /** Must be a burner energy source when using `"burner"`, otherwise it can also be a void energy source. */
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

/** The corpse of a [CharacterPrototype](prototype:CharacterPrototype). */
interface _CharacterCorpsePrototype {
  type: 'character-corpse';
  /** Table of key value pairs, the keys are armor names and the values are numbers. The number is the Animation that is associated with the armor, e.g. using `1` will associate the armor with the first Animation in the pictures table. */
  armor_picture_mapping?: Record<ItemID, number>;
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  /** Mandatory if `pictures` is not defined. */
  picture?: Animation;
  /** Mandatory if `picture` is not defined. */
  pictures?: AnimationVariations;
  render_layer?: RenderLayer;
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
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  /** Names of the crafting categories the character can craft recipes from. The built-in categories can be found [here](https://wiki.factorio.com/Data.raw#recipe-category). See also [RecipeCategory](prototype:RecipeCategory). */
  crafting_categories?: RecipeCategoryID[];
  damage_hit_tint: Color;
  distance_per_frame: number;
  drop_item_distance: number;
  /** The sound played when the character eats (fish for example). */
  eat: Sound;
  /** Must be >= 0. */
  enter_vehicle_distance?: number;
  /** Triggered when the running animation (`animations`) rolls over the frames defined in `right_footprint_frames` and `left_footprint_frames`. */
  footprint_particles?: FootprintParticle[];
  /** Triggered every tick of the running animation. */
  footstep_particle_triggers?: FootstepTriggerEffectList;
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
  cliff_height?: number;
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  grid_offset: Vector;
  grid_size: Vector;
  orientations: OrientedCliffPrototypeSet;
}

export type CliffPrototype = _CliffPrototype &
  Omit<EntityPrototype, keyof _CliffPrototype>;

export function isCliffPrototype(value: unknown): value is CliffPrototype {
  return (value as { type: string }).type === 'cliff';
}

/** This prototype is used for receiving an achievement when the player has a certain robot follower count. */
interface _CombatRobotCountAchievementPrototype {
  type: 'combat-robot-count';
  /** This will trigger the achievement, if player's current robot count is over this amount. */
  count?: number;
}

export type CombatRobotCountAchievementPrototype =
  _CombatRobotCountAchievementPrototype &
    Omit<AchievementPrototype, keyof _CombatRobotCountAchievementPrototype>;

export function isCombatRobotCountAchievementPrototype(
  value: unknown,
): value is CombatRobotCountAchievementPrototype {
  return (value as { type: string }).type === 'combat-robot-count';
}

/** A combat robot. Can attack enemies. */
interface _CombatRobotPrototype {
  type: 'combat-robot';
  attack_parameters: AttackParameters;
  /** Applied when the combat robot expires (runs out of `time_to_live`). */
  destroy_action?: Trigger;
  follows_player?: boolean;
  friction?: number;
  idle: RotatedAnimation;
  in_motion: RotatedAnimation;
  light: LightDefinition;
  range_from_player?: number;
  shadow_idle: RotatedAnimation;
  shadow_in_motion: RotatedAnimation;
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
  activity_led_sprites: Sprite4Way;
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  energy_source: ElectricEnergySource | VoidEnergySource;
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
  sprites: Sprite4Way;
}

export type CombinatorPrototype = _CombinatorPrototype &
  Omit<EntityWithOwnerPrototype, keyof _CombinatorPrototype>;
/** A [constant combinator](https://wiki.factorio.com/Constant_combinator). */
interface _ConstantCombinatorPrototype {
  type: 'constant-combinator';
  activity_led_light?: LightDefinition;
  activity_led_light_offsets: [Vector, Vector, Vector, Vector];
  activity_led_sprites: Sprite4Way;
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
  item_slot_count: number;
  sprites: Sprite4Way;
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

/** A generic container, such as a chest. Can not be rotated. */
interface _ContainerPrototype {
  type: 'container';
  /** The pictures displayed for circuit connections to this container. */
  circuit_connector_sprites?: CircuitConnectorSprites;
  /** Defines how wires visually connect to this container. */
  circuit_wire_connection_point?: WireConnectionPoint;
  /** The maximum circuit wire distance for this container. */
  circuit_wire_max_distance?: number;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** If the inventory limiter (red X) is visible in the chest's GUI. This does not change the inventory itself ([LuaInventory::supports_bar](runtime:LuaInventory::supports_bar) will not change and the bar can still be modified by script). */
  enable_inventory_bar?: boolean;
  /** The number of slots in this container. */
  inventory_size: ItemStackIndex;
  /** Whether the inventory of this container can be filtered (like cargo wagons) or not. */
  inventory_type?: 'with_bar' | 'with_filters_and_bar';
  /** The picture displayed for this entity. */
  picture: Sprite;
  /** If the icons of items shown in alt-mode should be scaled to the containers size. */
  scale_info_icons?: boolean;
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
  /** This property is parsed, but then ignored. */
  alt_entity_filter_mode?: 'whitelist' | 'blacklist';
  /** This property is parsed, but then ignored. */
  alt_entity_filters?: EntityID[];
  /** This property is parsed, but then ignored. */
  alt_entity_type_filters?: string[];
  /** This property is parsed, but then ignored. */
  alt_tile_filter_mode?: 'whitelist' | 'blacklist';
  /** This property is parsed, but then ignored. */
  alt_tile_filters?: TileID[];
  /** This property is hardcoded to `false`. */
  always_include_tiles?: boolean;
  cuts?: boolean;
  /** This property is parsed, but then ignored. */
  entity_filter_mode?: 'whitelist' | 'blacklist';
  /** This property is parsed, but then ignored. */
  entity_filters?: EntityID[];
  /** This property is parsed, but then ignored. */
  entity_type_filters?: string[];
  /** Count of items of the same name that can be stored in one inventory slot. Must be 1 when the `"not-stackable"` flag is set. */
  stack_size: 1;
  /** This property is parsed, but then ignored. */
  tile_filter_mode?: 'whitelist' | 'blacklist';
  /** This property is parsed, but then ignored. */
  tile_filters?: TileID[];
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
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  /** An array of arrays of integers. The inner arrays are called "groups" and must all have the same size. */
  direction_shuffle?: number[][];
  /** Multiplier for `time_before_shading_off` and `time_before_removed`. Must be positive.

Controls the speed of the animation: `1 ÷ dying_speed = duration of the animation` */
  dying_speed?: number;
  final_render_layer?: RenderLayer;
  ground_patch?: AnimationVariations;
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
  /** Controls how long the corpse takes to fade, as in how long it takes to get from no transparency to full transparency/removed. This time is ''not'' added to `time_before_removed`, it is instead subtracted from it. So by default, the corpse starts fading about 15 seconds before it gets removed. */
  time_before_shading_off?: number;
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
  /** Sets the module effects that are allowed to be used on this machine.

Note: If the time to complete a recipe is shorter than one tick, only one craft can be completed per tick, but productivity bonus is applied to the non-limited ''completable'' work. For a simple example, if a recipe were to take half a tick, only one recipe would be completed, but twice the productivity bonus would occur. The surplus production from productivity is **not** limited to one craft per tick. */
  allowed_effects?: EffectTypeLimitation;
  /** Only loaded if `idle_animation` is defined. */
  always_draw_idle_animation?: boolean;
  /** The animation played when crafting. When the crafting machine is idle, the animation will be paused.

When a crafting machine cannot be rotated, only the north rotation of the animation will be used.

The `animation_speed` of the animation is divided by 2 by the game. For example, the default animation speed of 1 means one animation frame per 2 ticks (30 fps) instead of the usual 60 fps. */
  animation?: Animation4Way;
  /** Productivity bonus that this machine always has. */
  base_productivity?: number;
  /** A list of [recipe categories](prototype:RecipeCategory) this crafting machine can use. */
  crafting_categories: RecipeCategoryID[];
  /** How fast this crafting machine can craft. 1 means that for example a 1 second long recipe take 1 second to craft. 0.5 means it takes 2 seconds, and 2 means it takes 0.5 seconds.

Crafting speed has to be positive. */
  crafting_speed: number;
  default_recipe_tint?: DefaultRecipeTint;
  /** Whether the "alt-mode icon" should have a black background. */
  draw_entity_info_icon_background?: boolean;
  /** Defines how the crafting machine is powered.

When using an electric energy source and `drain` is not specified, it will be set to `energy_usage ÷ 30` automatically. */
  energy_source: EnergySource;
  /** Sets how much energy this machine uses while crafting. Energy usage has to be positive. */
  energy_usage: Energy;
  /** Shift of the "alt-mode icon" relative to the machine's center. */
  entity_info_icon_shift?: Vector;
  /** Can have `off_when_no_fluid_recipe` key that has a [bool](prototype:bool) value. `off_when_no_fluid_recipe` defaults to false. `off_when_no_fluid_recipe` is ignored by [FurnacePrototype](prototype:FurnacePrototype) and considered to always be false.

If a crafting machine has fluid boxes *and* `off_when_no_fluid_recipe` is true, the crafting machine can only be rotated when a recipe consuming or producing fluid is set, or it has one of the other properties listed at the top of the page. */
  fluid_boxes?: FluidBox[];
  /** Idle animation must have the same frame count as `animation`. It is used for drawing the machine in the idle state. The animation is frozen on a single frame when the machine is idle.

This is an animation and not just sprite to make it possible for idle state and working state to match their visuals when the machine switches from one state to another.

When a crafting machine cannot be rotated, only the north rotation of the idle animation will be used.

The `animation_speed` of the animation is divided by 2 by the game. For example, the default animation speed of 1 means one animation frame per 2 ticks (30 fps) instead of the usual 60 fps. */
  idle_animation?: Animation4Way;
  /** Whether the speed of the animation and working visualization should be based on the machine's speed (boosted or slowed by modules). */
  match_animation_speed_to_activity?: boolean;
  /** The number of module slots in this machine, and their icon positions. */
  module_specification?: ModuleSpecification;
  /** Controls whether the ingredients of an in-progress recipe are destroyed when mining the machine/changing the recipe. If set to true, the ingredients do not get destroyed. This affects only the ingredients of the recipe that is currently in progress, so those that visually have already been consumed while their resulting product has not yet been produced. */
  return_ingredients_on_change?: boolean;
  /** Whether the "alt-mode icon" should be scaled to the size of the machine. */
  scale_entity_info_icon?: boolean;
  /** Only loaded if `shift_animation_waypoints` is defined. */
  shift_animation_transition_duration?: number;
  /** Only loaded if `shift_animation_waypoints` is defined. */
  shift_animation_waypoint_stop_duration?: number;
  /** Only loaded if one of `shift_animation_waypoint_stop_duration` or `shift_animation_transition_duration` is not 0. */
  shift_animation_waypoints?: ShiftAnimationWaypoints;
  /** Whether the "alt-mode icon" should be drawn at all. */
  show_recipe_icon?: boolean;
  /** Whether the recipe icon should be shown on the map. */
  show_recipe_icon_on_map?: boolean;
  /** Used by [WorkingVisualisation::apply_tint](prototype:WorkingVisualisation::apply_tint). */
  status_colors?: StatusColors;
  /** Used to display different animations when the machine is running, for example tinted based on the current recipe.

The `animation_speed` of the animation is divided by 2 by the game. For example, the default animation speed of 1 means one animation frame per 2 ticks (30 fps) instead of the usual 60 fps. */
  working_visualisations?: WorkingVisualisation[];
}

export type CraftingMachinePrototype = _CraftingMachinePrototype &
  Omit<EntityWithOwnerPrototype, keyof _CraftingMachinePrototype>;
/** A curved rail. */
interface _CurvedRailPrototype {
  type: 'curved-rail';
  bending_type?: 'turn';
}

export type CurvedRailPrototype = _CurvedRailPrototype &
  Omit<RailPrototype, keyof _CurvedRailPrototype>;

export function isCurvedRailPrototype(
  value: unknown,
): value is CurvedRailPrototype {
  return (value as { type: string }).type === 'curved-rail';
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
  /** Sets whether internal game events associated with the same key sequence should be fired or blocked. If they are fired ("none"), then the custom input event will happen before the internal game event. */
  consuming?: ConsumingType;
  /** The alternative controller (game pad) keybinding for this control. See `key_sequence` for the format. */
  controller_alternative_key_sequence?: string;
  /** The controller (game pad) keybinding for this control. See `key_sequence` for the format. */
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
  linked_game_control?: string;
  /** Unique textual identification of the prototype. May not contain a dot, nor exceed a length of 200 characters.

For a list of all names used in vanilla, see [data.raw](https://wiki.factorio.com/Data.raw).

It is also the name for the event that is raised when they key (combination) is pressed and action is `"lua"`, see [Tutorial:Script interfaces](https://wiki.factorio.com/Tutorial:Script_interfaces#Custom_input). */
  name: string;
}

export type CustomInputPrototype = _CustomInputPrototype &
  Omit<PrototypeBase, keyof _CustomInputPrototype>;

export function isCustomInputPrototype(
  value: unknown,
): value is CustomInputPrototype {
  return (value as { type: string }).type === 'custom-input';
}

/** A damage type. This is used in the [damage system](https://wiki.factorio.com/Damage). [A list of built-in damage types can be found here](https://wiki.factorio.com/Damage#Damage_types). */
interface _DamageType {
  type: 'damage-type';
  hidden?: boolean;
}

export type DamageType = _DamageType & Omit<PrototypeBase, keyof _DamageType>;

export function isDamageType(value: unknown): value is DamageType {
  return (value as { type: string }).type === 'damage-type';
}

/** A [decider combinator](https://wiki.factorio.com/Decider_combinator). */
interface _DeciderCombinatorPrototype {
  type: 'decider-combinator';
  equal_symbol_sprites: Sprite4Way;
  greater_or_equal_symbol_sprites: Sprite4Way;
  greater_symbol_sprites: Sprite4Way;
  less_or_equal_symbol_sprites: Sprite4Way;
  less_symbol_sprites: Sprite4Way;
  not_equal_symbol_sprites: Sprite4Way;
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
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
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
  /** This property is parsed, but then ignored. */
  alt_entity_filter_mode?: 'whitelist' | 'blacklist';
  /** This property is parsed, but then ignored. */
  alt_entity_filters?: EntityID[];
  /** This property is parsed, but then ignored. */
  alt_entity_type_filters?: string[];
  /** This property is hardcoded to `"cancel-deconstruct"`. */
  alt_selection_mode?: SelectionModeFlags;
  /** This property is parsed, but then ignored. */
  alt_tile_filter_mode?: 'whitelist' | 'blacklist';
  /** This property is parsed, but then ignored. */
  alt_tile_filters?: TileID[];
  /** This property is hardcoded to `false`. */
  always_include_tiles?: boolean;
  /** Can't be > 255. */
  entity_filter_count?: ItemStackIndex;
  /** This property is parsed, but then ignored. */
  entity_filter_mode?: 'whitelist' | 'blacklist';
  /** This property is parsed, but then ignored. */
  entity_filters?: EntityID[];
  /** This property is parsed, but then ignored. */
  entity_type_filters?: string[];
  /** This property is hardcoded to `"deconstruct"`. */
  selection_mode?: SelectionModeFlags;
  /** Count of items of the same name that can be stored in one inventory slot. Must be 1 when the `"not-stackable"` flag is set. */
  stack_size: 1;
  /** Can't be > 255. */
  tile_filter_count?: ItemStackIndex;
  /** This property is parsed, but then ignored. */
  tile_filter_mode?: 'whitelist' | 'blacklist';
  /** This property is parsed, but then ignored. */
  tile_filters?: TileID[];
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
  collision_mask?: CollisionMask;
  /** Loaded only if `render_layer` = "decals". */
  decal_overdraw_priority?: number;
  grows_through_rail_path?: boolean;
  /** Must contain at least 1 picture. */
  pictures: SpriteVariations;
  render_layer?: RenderLayer;
  /** Mandatory if `render_layer` = "decals". This int16 is converted to a [RenderLayer](prototype:RenderLayer) internally. */
  tile_layer?: number;
  /** Called by [DestroyDecorativesTriggerEffectItem](prototype:DestroyDecorativesTriggerEffectItem). */
  trigger_effect?: TriggerEffect;
  walking_sound?: Sound;
}

export type DecorativePrototype = _DecorativePrototype &
  Omit<PrototypeBase, keyof _DecorativePrototype>;

export function isDecorativePrototype(
  value: unknown,
): value is DecorativePrototype {
  return (value as { type: string }).type === 'optimized-decorative';
}

/** This prototype is used for receiving an achievement, when the player requests and receives enough items using logistic robots. */
interface _DeliverByRobotsAchievementPrototype {
  type: 'deliver-by-robots-achievement';
  /** This will trigger the achievement, when the player receives enough items through logistic robots. */
  amount: MaterialAmountType;
}

export type DeliverByRobotsAchievementPrototype =
  _DeliverByRobotsAchievementPrototype &
    Omit<AchievementPrototype, keyof _DeliverByRobotsAchievementPrototype>;

export function isDeliverByRobotsAchievementPrototype(
  value: unknown,
): value is DeliverByRobotsAchievementPrototype {
  return (value as { type: string }).type === 'deliver-by-robots-achievement';
}

/** This prototype is used for receiving an achievement when the player finishes the game without building a specific entity. */
interface _DontBuildEntityAchievementPrototype {
  type: 'dont-build-entity-achievement';
  amount?: number;
  /** This will disable the achievement, if this entity is placed. If you finish the game without building this entity, you receive the achievement. */
  dont_build: EntityID | EntityID[];
}

export type DontBuildEntityAchievementPrototype =
  _DontBuildEntityAchievementPrototype &
    Omit<AchievementPrototype, keyof _DontBuildEntityAchievementPrototype>;

export function isDontBuildEntityAchievementPrototype(
  value: unknown,
): value is DontBuildEntityAchievementPrototype {
  return (value as { type: string }).type === 'dont-build-entity-achievement';
}

/** This prototype is used for receiving an achievement when the player finishes the game without crafting more than a set amount. */
interface _DontCraftManuallyAchievementPrototype {
  type: 'dont-craft-manually-achievement';
  /** This will disable the achievement, if the player crafts more than this. */
  amount: MaterialAmountType;
}

export type DontCraftManuallyAchievementPrototype =
  _DontCraftManuallyAchievementPrototype &
    Omit<AchievementPrototype, keyof _DontCraftManuallyAchievementPrototype>;

export function isDontCraftManuallyAchievementPrototype(
  value: unknown,
): value is DontCraftManuallyAchievementPrototype {
  return (value as { type: string }).type === 'dont-craft-manually-achievement';
}

/** This prototype is used for receiving an achievement when the player finishes the game without receiving energy from a specific energy source. */
interface _DontUseEntityInEnergyProductionAchievementPrototype {
  type: 'dont-use-entity-in-energy-production-achievement';
  /** This will **not** disable the achievement, if this entity is placed, and you have received any amount of power from it. */
  excluded: EntityID | EntityID[];
  /** This will disable the achievement, if this entity is placed, and you have received any amount of power from it. If you finish the game without receiving power from this entity, you receive the achievement. */
  included: EntityID | EntityID[];
  last_hour_only?: boolean;
  minimum_energy_produced?: Energy;
}

export type DontUseEntityInEnergyProductionAchievementPrototype =
  _DontUseEntityInEnergyProductionAchievementPrototype &
    Omit<
      AchievementPrototype,
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
  connection_points: WireConnectionPoint[];
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** Drawn when the electric pole is connected to an electric network. */
  light?: LightDefinition;
  /** The maximum distance between this pole and any other connected pole - if two poles are farther apart than this, they cannot be connected together directly. Corresponds to "wire reach" in the item tooltip.

Max value is 64. */
  maximum_wire_distance?: number;
  pictures: RotatedSprite;
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

/** A turret that consumes electricity as ammo. */
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

/** Can spawn entities. Used for biter/spitter nests. */
interface _EnemySpawnerPrototype {
  type: 'unit-spawner';
  /** If this is true, this entities `is_military_target property` can be changed runtime (on the entity, not on the prototype itself). */
  allow_run_time_change_of_is_military_target?: false;
  animations: AnimationVariations;
  call_for_help_radius: number;
  dying_sound?: Sound;
  integration?: SpriteVariations;
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
  pollution_absorption_absolute: number;
  pollution_absorption_proportional: number;
  random_animation_offset?: boolean;
  /** Array of the [entities](prototype:EntityPrototype) that this spawner can spawn and their spawn probabilities. The sum of probabilities is expected to be 1.0. The array must not be empty. */
  result_units: UnitSpawnDefinition[];
  /** Decoratives to be created when the spawner is created by the [map generator](https://wiki.factorio.com/Map_generator). Placed when enemies expand if `spawn_decorations_on_expansion` is set to true. */
  spawn_decoration?:
    | CreateDecorativesTriggerEffectItem
    | CreateDecorativesTriggerEffectItem[];
  /** Whether `spawn_decoration` should be spawned when enemies [expand](https://wiki.factorio.com/Enemies#Expansions). */
  spawn_decorations_on_expansion?: boolean;
  /** Ticks for cooldown after unit is spawned */
  spawning_cooldown: [number, number];
  /** How far from the spawner can the units be spawned. */
  spawning_radius: number;
  /** What spaces should be between the spawned units. */
  spawning_spacing: number;
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
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  large_build_sound?: Sound;
  medium_build_sound?: Sound;
}

export type EntityGhostPrototype = _EntityGhostPrototype &
  Omit<EntityPrototype, keyof _EntityGhostPrototype>;

export function isEntityGhostPrototype(
  value: unknown,
): value is EntityGhostPrototype {
  return (value as { type: string }).type === 'entity-ghost';
}

/** Deprecated in 0.18. The type "particle" has been obsoleted and cannot be created. See [ParticlePrototype](prototype:ParticlePrototype) for particles. */
interface _EntityParticlePrototype {
  type: 'particle';
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
}

export type EntityParticlePrototype = _EntityParticlePrototype &
  Omit<EntityPrototype, keyof _EntityParticlePrototype>;

export function isEntityParticlePrototype(
  value: unknown,
): value is EntityParticlePrototype {
  return (value as { type: string }).type === 'particle';
}

/** Abstract base of all entities in the game. Entity is nearly everything that can be on the map(except tiles).

For in game script access to entity, take a look at [LuaEntity](runtime:LuaEntity). */
interface _EntityPrototype {
  /** Names of the entity prototypes this entity prototype can be pasted on to in addition to the standard supported types.

This is used to allow copying between types that aren't compatible on the C++ code side, by allowing mods to receive the [on_entity_settings_pasted](runtime:on_entity_settings_pasted) event for the given entity and do the setting pasting via script. */
  additional_pastable_entities?: EntityID[];
  alert_icon_scale?: number;
  alert_icon_shift?: Vector;
  allow_copy_paste?: boolean;
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
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  /** The effect/trigger that happens when the entity is placed. */
  created_effect?: Trigger;
  /** The smoke that is shown when the entity is placed. */
  created_smoke?: CreateTrivialSmokeEffectItem;
  /** Specification of space needed to see the whole entity. This is used to calculate the correct zoom and positioning in the entity info gui. */
  drawing_box?: BoundingBox;
  /** Amount of emissions created (positive number) or cleaned (negative number) every second by the entity. This is passive, and it is independent concept of the emissions of machines, these are created actively depending on the power consumption. Currently used just for trees. */
  emissions_per_second?: number;
  enemy_map_color?: Color;
  /** This allows you to replace an entity that's already placed, with a different one in your inventory. For example, replacing a burner inserter with a fast inserter. The replacement entity can be a different rotation to the replaced entity and you can replace an entity with the same type.

This is simply a string, so any string can be used here. The entity that should be replaced simply has to use the same string here. */
  fast_replaceable_group?: string;
  flags?: EntityPrototypeFlags;
  friendly_map_color?: Color;
  /** Where beams should hit the entity. Useful if the bounding box only covers part of the entity (e.g. feet of the character) and beams only hitting there would look weird. */
  hit_visualization_box?: BoundingBox;
  /** Path to the icon file.

Either this or `icons` is mandatory for entities that have at least one of these flags active: `"placeable-neutral"`, `"placeable-player`", `"placeable-enemy"`.

Only loaded if `icons` is not defined. */
  icon?: FileName;
  /** Icons of reduced size will be used at decreased scale. */
  icon_mipmaps?: IconMipMapType;
  /** The size of the square icon, in pixels, e.g. `32` for a 32px by 32px icon.

Only loaded if `icons` is not defined, or if `icon_size` is not specified for all instances of `icons`. */
  icon_size?: SpriteSizeType;
  /** This will be used in the electric network statistics, editor building selection, and the bonus gui. Can't be an empty array.

Either this or `icon` is mandatory for entities that have at least one of these flags active: `"placeable-neutral"`, `"placeable-player`", `"placeable-enemy"`. */
  icons?: IconData[];
  map_color?: Color;
  /** Used instead of the collision box during map generation. Allows space entities differently during map generation, for example if the box is bigger, the entities will be placed farther apart. */
  map_generator_bounding_box?: BoundingBox;
  minable?: MinableProperties;
  mined_sound?: Sound;
  mining_sound?: Sound;
  /** Name of the entity that will be automatically selected as the upgrade of this entity when using the [upgrade planner](https://wiki.factorio.com/Upgrade_planner) without configuration.

This entity may not have "not-upgradable" flag set and must be minable. This entity mining result must not contain item product with "hidden" flag set. Mining results with no item products are allowed. The entity may not be a [RollingStockPrototype](prototype:RollingStockPrototype).

The upgrade target entity needs to have the same bounding box, collision mask, and fast replaceable group as this entity. The upgrade target entity must have least 1 item that builds it that isn't hidden. */
  next_upgrade?: EntityID;
  open_sound?: Sound;
  /** Used to order prototypes in inventory, recipes and GUIs. May not exceed a length of 200 characters.

The order string is taken from the items in `placeable_by` if they exist, or from an item that has its [place_result](prototype:ItemPrototype::place_result) set to this entity. */
  order?: Order;
  /** Item that when placed creates this entity. Determines which item is picked when "Q" (smart pipette) is used on the entity, determines which item is needed in a blueprint of this entity.

The item count specified here can't be larger than the stack size of that item. */
  placeable_by?: ItemToPlace | ItemToPlace[];
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

The selection box is usually a little bit bigger than the collision box, for tileable entities (like buildings) it should match the tile size of the building. */
  selection_box?: BoundingBox;
  /** The entity with the higher number is selectable before the entity with the lower number. When two entities have the same selection priority, the one with the highest [collision mask](prototype:CollisionMask) (as determined by the order on that page) is selected. */
  selection_priority?: number;
  /** The cursor size used when shooting at this entity. */
  shooting_cursor_size?: number;
  /** Used to set the area of the entity that can have stickers on it, currently only used for units to specify the area where the green slow down stickers can appear. */
  sticker_box?: BoundingBox;
  /** The name of the [subgroup](prototype:ItemSubGroup) this entity should be sorted into in the map editor building selection. */
  subgroup?: ItemSubGroupID;
  tile_height?: number;
  /** Used to determine how the center of the entity should be positioned when building (unless the off-grid [flag](prototype:EntityPrototypeFlags) is specified).

When the tile width is odd, the center will be in the center of the tile, when it is even, the center is on the tile transition. */
  tile_width?: number;
  /** Defaults to the mask from [UtilityConstants::default_trigger_target_mask_by_type](prototype:UtilityConstants::default_trigger_target_mask_by_type). */
  trigger_target_mask?: TriggerTargetMask;
  /** When playing this sound, the volume is scaled by the speed of the vehicle when colliding with this entity. */
  vehicle_impact_sound?: Sound;
  /** May also be defined inside `graphics_set` instead of directly in the entity prototype. This is useful for entities that use the a `graphics_set` property to define their graphics, because then all graphics can be defined in one place.

[Currently only renders](https://forums.factorio.com/100703) for [EntityWithHealthPrototype](prototype:EntityWithHealthPrototype). */
  water_reflection?: WaterReflectionDefinition;
  /** Will also work on entities that don't actually do work. */
  working_sound?: WorkingSound;
}

export type EntityPrototype = _EntityPrototype &
  Omit<PrototypeBase, keyof _EntityPrototype>;
/** Abstract base of all entities with health in the game. */
interface _EntityWithHealthPrototype {
  alert_when_damaged?: boolean;
  attack_reaction?: AttackReactionItem[];
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
  /** Sprite drawn on ground under the entity to make it feel more integrated into the ground. */
  integration_patch?: Sprite4Way;
  integration_patch_render_layer?: RenderLayer;
  /** The loot is dropped on the ground when the entity is killed. */
  loot?: LootItem[];
  /** The unit health can never go over the maximum. Default health of units on creation is set to max. Must be greater than 0. */
  max_health?: number;
  random_corpse_variation?: boolean;
  repair_sound?: Sound;
  repair_speed_modifier?: number;
  /** See [damage](https://wiki.factorio.com/Damage). */
  resistances?: Resistances;
}

export type EntityWithHealthPrototype = _EntityWithHealthPrototype &
  Omit<EntityPrototype, keyof _EntityWithHealthPrototype>;
/** Abstract base of all entities with a force in the game. These entities have a [LuaEntity::unit_number](runtime:LuaEntity::unit_number) during runtime. Can be high priority [military targets](https://wiki.factorio.com/Military_units_and_structures). */
interface _EntityWithOwnerPrototype {
  /** If this is true, this entity's `is_military_target` property can be changed during runtime (on the entity, not on the prototype itself). */
  allow_run_time_change_of_is_military_target?: boolean;
  /** Whether this prototype should be a high priority target for enemy forces. See [Military units and structures](https://wiki.factorio.com/Military_units_and_structures). */
  is_military_target?: boolean;
}

export type EntityWithOwnerPrototype = _EntityWithOwnerPrototype &
  Omit<EntityWithHealthPrototype, keyof _EntityWithOwnerPrototype>;
/** Defines a category to be available to [equipment](prototype:EquipmentPrototype) and [equipment grids](prototype:EquipmentGridPrototype). */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface _EquipmentCategory {
  type: 'equipment-category';
}

export type EquipmentCategory = _EquipmentCategory &
  Omit<PrototypeBase, keyof _EquipmentCategory>;

export function isEquipmentCategory(
  value: unknown,
): value is EquipmentCategory {
  return (value as { type: string }).type === 'equipment-category';
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
  Omit<PrototypeBase, keyof _EquipmentGridPrototype>;

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
  Omit<PrototypeBase, keyof _EquipmentPrototype>;
/** Used to play an animation and a sound. */
interface _ExplosionPrototype {
  type: 'explosion';
  animations: AnimationVariations;
  beam?: boolean;
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
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

/** This prototype is used for receiving an achievement when the player finishes the game. */
interface _FinishTheGameAchievementPrototype {
  type: 'finish-the-game-achievement';
  /** This lets the game know how long into a game, before you can no longer complete the achievement. 0 means infinite time. */
  until_second?: number;
}

export type FinishTheGameAchievementPrototype =
  _FinishTheGameAchievementPrototype &
    Omit<AchievementPrototype, keyof _FinishTheGameAchievementPrototype>;

export function isFinishTheGameAchievementPrototype(
  value: unknown,
): value is FinishTheGameAchievementPrototype {
  return (value as { type: string }).type === 'finish-the-game-achievement';
}

/** A fire. */
interface _FireFlamePrototype {
  type: 'fire';
  add_fuel_cooldown?: number;
  burnt_patch_alpha_default?: number;
  burnt_patch_alpha_variations?: TileAndAlpha[];
  burnt_patch_lifetime?: number;
  burnt_patch_pictures?: SpriteVariations;
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  damage_multiplier_decrease_per_tick?: number;
  damage_multiplier_increase_per_added_fuel?: number;
  damage_per_tick: DamagePrototype;
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
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  pictures: SpriteVariations;
}

export type FishPrototype = _FishPrototype &
  Omit<EntityWithHealthPrototype, keyof _FishPrototype>;

export function isFishPrototype(value: unknown): value is FishPrototype {
  return (value as { type: string }).type === 'fish';
}

/** Explosion that can deal damage. */
interface _FlameThrowerExplosionPrototype {
  type: 'flame-thrower-explosion';
  damage: DamagePrototype;
  height?: number;
  slow_down_factor: number;
}

export type FlameThrowerExplosionPrototype = _FlameThrowerExplosionPrototype &
  Omit<ExplosionPrototype, keyof _FlameThrowerExplosionPrototype>;

export function isFlameThrowerExplosionPrototype(
  value: unknown,
): value is FlameThrowerExplosionPrototype {
  return (value as { type: string }).type === 'flame-thrower-explosion';
}

/** A fluid. */
interface _FluidPrototype {
  type: 'fluid';
  /** Whether the fluid should be included in the barrel recipes automatically generated by the base mod.

This property is not read by the game engine itself, but the base mod's data-updates.lua script. This means it is not available to read at runtime. */
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
  /** Hides the fluid from the signal selection screen. */
  hidden?: boolean;
  /** Path to the icon file.

Mandatory if `icons` is not defined. */
  icon?: FileName;
  /** Icons of reduced size will be used at decreased scale. */
  icon_mipmaps?: IconMipMapType;
  /** The size of the square icon, in pixels, e.g. `32` for a 32px by 32px icon.

Mandatory if `icons` is not defined, or if `icon_size` is not specified for all instances of `icons`. */
  icon_size?: SpriteSizeType;
  /** Can't be an empty array. */
  icons?: IconData[];
  max_temperature?: number;
  /** The value of this property may not be an empty string. It either has to be nil, or a non-empty string. */
  subgroup?: ItemSubGroupID;
}

export type FluidPrototype = _FluidPrototype &
  Omit<PrototypeBase, keyof _FluidPrototype>;

export function isFluidPrototype(value: unknown): value is FluidPrototype {
  return (value as { type: string }).type === 'fluid';
}

/** Used for example for the handheld flamethrower. */
interface _FluidStreamPrototype {
  type: 'stream';
  /** Action that is triggered every time a particle lands. Not triggered for the first particle if `initial_action` is non-empty. */
  action?: Trigger;
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
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
  special_neutral_target_damage?: DamagePrototype;
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

/** A turret that consumes fluid as ammo. */
interface _FluidTurretPrototype {
  type: 'fluid-turret';
  /** Before an turret that was out of ammo is able to fire again, the `fluid_buffer_size` must fill to this proportion. */
  activation_buffer_ratio: number;
  /** Requires ammo_type in attack_parameters. */
  attack_parameters: StreamAttackParameters;
  attacking_muzzle_animation_shift?: AnimatedVector;
  ending_attack_muzzle_animation_shift?: AnimatedVector;
  enough_fuel_indicator_light?: LightDefinition;
  enough_fuel_indicator_picture?: Sprite4Way;
  fluid_box: FluidBox;
  fluid_buffer_input_flow: number;
  fluid_buffer_size: number;
  folded_muzzle_animation_shift?: AnimatedVector;
  folding_muzzle_animation_shift?: AnimatedVector;
  muzzle_animation?: Animation;
  muzzle_light?: LightDefinition;
  not_enough_fuel_indicator_light?: LightDefinition;
  not_enough_fuel_indicator_picture?: Sprite4Way;
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
  capacity: number;
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
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  /** How much does it cost to move 1 tile. */
  energy_per_move?: Energy;
  energy_per_tick?: Energy;
  /** Whether this prototype should be a high priority target for enemy forces. See [Military units and structures](https://wiki.factorio.com/Military_units_and_structures). */
  is_military_target?: boolean;
  /** How much energy can be stored in the batteries. */
  max_energy?: Energy;
  /** The maximum speed of the robot. Useful to limit the impact of [worker robot speed (research)](https://wiki.factorio.com/Worker_robot_speed_(research)). */
  max_speed?: number;
  /** If the robot has more energy than this, it does not need to charge before stationing. */
  max_to_charge?: number;
  /** The robot will go to charge when it has less energy than this. */
  min_to_charge?: number;
  speed: number;
  /** Some robots simply crash, some slowdown but keep going. 0 means crash. */
  speed_multiplier_when_out_of_energy?: number;
}

export type FlyingRobotPrototype = _FlyingRobotPrototype &
  Omit<EntityWithOwnerPrototype, keyof _FlyingRobotPrototype>;
/** An upwards flying text that disappears after a certain time (setting [LuaEntity::active](runtime:LuaEntity::active) = false stops the flying and the disappearing.) */
interface _FlyingTextPrototype {
  type: 'flying-text';
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  /** How fast the text flies up. Seems to be tiles/tick. */
  speed: number;
  text_alignment?: 'left' | 'center' | 'right';
  /** Time in ticks this flying-text lasts. */
  time_to_live: number;
}

export type FlyingTextPrototype = _FlyingTextPrototype &
  Omit<EntityPrototype, keyof _FlyingTextPrototype>;

export function isFlyingTextPrototype(
  value: unknown,
): value is FlyingTextPrototype {
  return (value as { type: string }).type === 'flying-text';
}

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
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface _FuelCategory {
  type: 'fuel-category';
}

export type FuelCategory = _FuelCategory &
  Omit<PrototypeBase, keyof _FuelCategory>;

export function isFuelCategory(value: unknown): value is FuelCategory {
  return (value as { type: string }).type === 'fuel-category';
}

/** A furnace. Normal furnaces only process "smelting" category recipes, but you can make furnaces that process other [recipe categories](prototype:RecipeCategory). The difference to assembling machines is that furnaces automatically choose their recipe based on input. */
interface _FurnacePrototype {
  type: 'furnace';
  /** The locale key of the message shown when the player attempts to insert an item into the furnace that cannot be processed by that furnace. In-game, the locale is provided the `__1__` parameter, which is the localised name of the item. */
  cant_insert_at_source_message_key?: string;
  /** Shift of the "alt-mode icon" relative to the machine's center. */
  entity_info_icon_shift?: Vector;
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

/** A [gate](https://wiki.factorio.com/Gate). */
interface _GatePrototype {
  type: 'gate';
  activation_distance: number;
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  fadeout_interval?: number;
  horizontal_animation: Animation;
  horizontal_rail_animation_left: Animation;
  horizontal_rail_animation_right: Animation;
  horizontal_rail_base: Animation;
  /** This collision mask is used when the gate is open. */
  opened_collision_mask?: CollisionMask;
  opening_speed: number;
  timeout_to_close: number;
  vertical_animation: Animation;
  vertical_rail_animation_left: Animation;
  vertical_rail_animation_right: Animation;
  vertical_rail_base: Animation;
  wall_patch: Animation;
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
  effectivity: number;
  energy_source: ElectricEnergySource;
  /** This must have a filter if `max_power_output` is not defined. */
  fluid_box: FluidBox;
  /** The number of fluid units the generator uses per tick. */
  fluid_usage_per_tick: number;
  horizontal_animation: Animation;
  /** The power production of the generator is capped to this value. This is also the value that is shown as the maximum power output in the tooltip of the generator.

`fluid_box` must have a filter if this is not defined. */
  max_power_output?: Energy;
  /** The maximum temperature to which the efficiency can increase. At this temperature the generator will run at 100% efficiency. Note: Higher temperature fluid can still be consumed.

Used to calculate the `max_power_output` if it is not defined and `burns_fluid` is false. Then, the max power output is `(min(fluid_max_temp, maximum_temperature) - fluid_default_temp) × fluid_usage_per_tick × fluid_heat_capacity × effectivity`, the fluid is the filter specified on the `fluid_box`. */
  maximum_temperature: number;
  /** Animation runs at least this fast. This corresponds to the sound. */
  min_perceived_performance?: number;
  performance_to_sound_speedup?: number;
  /** Scales the generator's fluid usage to its maximum power output.

Setting this to true prevents the generator from overconsuming fluid, for example when higher than`maximum_temperature` fluid is fed to the generator.

If scale_fluid_usage is false, the generator consumes the full `fluid_usage_per_tick` and any of the extra energy in the fluid (in the form of higher temperature) is wasted. The [steam engine](https://wiki.factorio.com/Steam_engine) exhibits this behavior when fed steam from [heat exchangers](https://wiki.factorio.com/Heat_exchanger). */
  scale_fluid_usage?: boolean;
  smoke?: SmokeSource[];
  vertical_animation: Animation;
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
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  connection_sprites: ConnectableEntityGraphics;
  heat_buffer: HeatBuffer;
  heat_glow_sprites: ConnectableEntityGraphics;
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
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
}

export type HighlightBoxEntityPrototype = _HighlightBoxEntityPrototype &
  Omit<EntityPrototype, keyof _HighlightBoxEntityPrototype>;

export function isHighlightBoxEntityPrototype(
  value: unknown,
): value is HighlightBoxEntityPrototype {
  return (value as { type: string }).type === 'highlight-box';
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
  /** Whether the inserter hand should move to the items it picks up from belts, leading to item chasing behaviour. If this is off, the inserter hand will stay in the center of the belt and any items picked up from the edges of the belt "teleport" to the inserter hand. */
  chases_belt_items?: boolean;
  circuit_connector_sprites?: [
    CircuitConnectorSprites,
    CircuitConnectorSprites,
    CircuitConnectorSprites,
    CircuitConnectorSprites,
  ];
  circuit_wire_connection_points?: [
    WireConnectionPoint,
    WireConnectionPoint,
    WireConnectionPoint,
    WireConnectionPoint,
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
  extension_speed: number;
  /** How many filters this inserter has. Maximum count of filtered items in inserter is 5. */
  filter_count?: number;
  hand_base_picture: Sprite;
  hand_base_shadow: Sprite;
  hand_closed_picture: Sprite;
  hand_closed_shadow: Sprite;
  hand_open_picture: Sprite;
  hand_open_shadow: Sprite;
  /** Used to determine how long the arm of the inserter is when drawing it. Does not affect gameplay. The lower the value, the straighter the arm. Increasing the value will give the inserter a bigger bend due to its longer parts. */
  hand_size?: number;
  insert_position: Vector;
  pickup_position: Vector;
  platform_picture: Sprite4Way;
  rotation_speed: number;
  /** Whether this inserter is considered a stack inserter. Relevant for determining how [inserter capacity bonus (research)](https://wiki.factorio.com/Inserter_capacity_bonus_(research)) applies to the inserter. */
  stack?: boolean;
  /** Stack size bonus that is inherent to the prototype without having to be researched. */
  stack_size_bonus?: number;
  /** Whether the inserter should be able to fish [fish](https://wiki.factorio.com/Raw_fish). */
  use_easter_egg?: boolean;
}

export type InserterPrototype = _InserterPrototype &
  Omit<EntityWithOwnerPrototype, keyof _InserterPrototype>;

export function isInserterPrototype(
  value: unknown,
): value is InserterPrototype {
  return (value as { type: string }).type === 'inserter';
}

/** The entity used for items on the ground. */
interface _ItemEntityPrototype {
  type: 'item-entity';
  /** Item entity collision box has to have same width as height.

Specification of the entity collision boundaries. Empty collision box means no collision and is used for smoke, projectiles, particles, explosions etc.

The `{0,0}` coordinate in the collision box will match the entity position. It should be near the center of the collision box, to keep correct entity drawing order. The bounding box must include the `{0,0}` coordinate.

Note, that for buildings, it is customary to leave 0.1 wide border between the edge of the tile and the edge of the building, this lets the player move between the building and electric poles/inserters etc. */
  collision_box?: BoundingBox;
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
}

export type ItemEntityPrototype = _ItemEntityPrototype &
  Omit<EntityPrototype, keyof _ItemEntityPrototype>;

export function isItemEntityPrototype(
  value: unknown,
): value is ItemEntityPrototype {
  return (value as { type: string }).type === 'item-entity';
}

/** An item group. Item groups are shown above the list of craftable items in the player's inventory. The built-in groups are "logistics", "production", "intermediate-products" and "combat" but mods can define their own.

Items are sorted into item groups by sorting them into a [subgroup](prototype:ItemPrototype::subgroup) which then belongs to a [item group](prototype:ItemSubGroup::group). */
interface _ItemGroup {
  type: 'item-group';
  /** Path to the icon that is shown to represent this item group.

Mandatory if `icons` is not defined. */
  icon?: FileName;
  /** Icons of reduced size will be used at decreased scale. */
  icon_mipmaps?: IconMipMapType;
  /** The size of the square icon, in pixels, e.g. `32` for a 32px by 32px icon.

Mandatory if `icons` is not defined, or if `icon_size` is not specified for all instances of `icons`. */
  icon_size?: SpriteSizeType;
  /** The icon that is shown to represent this item group. Can't be an empty array. */
  icons?: IconData[];
  /** Item ingredients in recipes are ordered by item group. The `order_in_recipe` property can be used to specify the ordering in recipes without affecting the inventory order. */
  order_in_recipe?: Order;
}

export type ItemGroup = _ItemGroup & Omit<PrototypeBase, keyof _ItemGroup>;

export function isItemGroup(value: unknown): value is ItemGroup {
  return (value as { type: string }).type === 'item-group';
}

/** Possible configuration for all items. */
interface _ItemPrototype {
  type: 'item';
  /** The item that is the result when this item gets burned as fuel. */
  burnt_result?: ItemID;
  close_sound?: Sound;
  /** Path to the icon file.

Only loaded if `dark_background_icons` is not defined.

Uses the basic `icon_size` and `icon_mipmaps` properties. */
  dark_background_icon?: FileName;
  /** Inside IconData, the property for the file path is `dark_background_icon` instead of `icon`. Can't be an empty array.

Uses the basic `icon_size` and `icon_mipmaps` properties. */
  dark_background_icons?: IconData[];
  default_request_amount?: ItemCountType;
  /** Specifies some properties of the item. */
  flags?: ItemPrototypeFlags;
  fuel_acceleration_multiplier?: number;
  /** Must exist when a nonzero fuel_value is defined. */
  fuel_category?: FuelCategoryID;
  fuel_emissions_multiplier?: number;
  /** Colors the glow of the burner energy source when this fuel is burned. Can also be used to color the glow of reactors burning the fuel, see [ReactorPrototype::use_fuel_glow_color](prototype:ReactorPrototype::use_fuel_glow_color). */
  fuel_glow_color?: Color;
  fuel_top_speed_multiplier?: number;
  /** Mandatory when `fuel_acceleration_multiplier`, `fuel_top_speed_multiplier` or `fuel_emissions_multiplier` or `fuel_glow_color` are used. Amount of energy it gives when used as fuel. */
  fuel_value?: Energy;
  /** Path to the icon file.

Mandatory if `icons` is not defined. */
  icon?: FileName;
  /** Icons of reduced size will be used at decreased scale.

This definition applies to all icon-type properties, both on here and on any children. */
  icon_mipmaps?: IconMipMapType;
  /** The size of the square icon, in pixels, e.g. `32` for a 32px by 32px icon.

This definition applies to all icon-type properties, both on here and on any children.

Mandatory if `icons` is not defined, or if `icon_size` is not specified for all instances of `icons`. */
  icon_size?: SpriteSizeType;
  /** Can't be an empty array. */
  icons?: IconData[];
  open_sound?: Sound;
  /** Used to give the item multiple different icons so that they look less uniform on belts etc. For inventory icons and similar, `icon/icons` will be used. Maximum number of variations is 16. */
  pictures?: SpriteVariations;
  place_as_tile?: PlaceAsTile;
  /** Name of the [EntityPrototype](prototype:EntityPrototype) that can be built using this item. If this item should be the one that construction bots use to build the specified `place_result`, set the `"primary-place-result"` [item flag](prototype:ItemPrototypeFlags).

The localised name of the entity will be used as the in-game item name. This behavior can be overwritten by specifying `localised_name` on this item, it will be used instead. */
  place_result?: EntityID;
  placed_as_equipment_result?: EquipmentID;
  /** Only loaded if `rocket_launch_products` is not defined. */
  rocket_launch_product?: ItemProductPrototype;
  rocket_launch_products?: ItemProductPrototype[];
  /** Count of items of the same name that can be stored in one inventory slot. Must be 1 when the `"not-stackable"` flag is set. */
  stack_size: ItemCountType;
  /** Empty text of subgroup is not allowed. (You can omit the definition to get the default "other"). */
  subgroup?: ItemSubGroupID;
  /** The number of items needed to connect 2 entities with this as wire. In the base game, [green wire](https://wiki.factorio.com/Green_wire), [red wire](https://wiki.factorio.com/Red_wire) and [copper cable](https://wiki.factorio.com/Copper_cable) have this set to 1. */
  wire_count?: ItemCountType;
}

export type ItemPrototype = _ItemPrototype &
  Omit<PrototypeBase, keyof _ItemPrototype>;

export function isItemPrototype(value: unknown): value is ItemPrototype {
  return (value as { type: string }).type === 'item';
}

/** Entity used to signify that an entity is requesting items, for example modules for an assembling machine after it was blueprinted with modules inside. */
interface _ItemRequestProxyPrototype {
  type: 'item-request-proxy';
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  picture: Sprite;
  use_target_entity_alert_icon_shift?: boolean;
}

export type ItemRequestProxyPrototype = _ItemRequestProxyPrototype &
  Omit<EntityPrototype, keyof _ItemRequestProxyPrototype>;

export function isItemRequestProxyPrototype(
  value: unknown,
): value is ItemRequestProxyPrototype {
  return (value as { type: string }).type === 'item-request-proxy';
}

/** An item subgroup. The built-in subgroups can be found [here](https://wiki.factorio.com/Data.raw#item-subgroup). See [ItemPrototype::subgroup](prototype:ItemPrototype::subgroup). */
interface _ItemSubGroup {
  type: 'item-subgroup';
  /** The item group this subgroup is located in. */
  group: ItemGroupID;
}

export type ItemSubGroup = _ItemSubGroup &
  Omit<PrototypeBase, keyof _ItemSubGroup>;

export function isItemSubGroup(value: unknown): value is ItemSubGroup {
  return (value as { type: string }).type === 'item-subgroup';
}

/** ItemWithEntityData saves data associated with the entity that it represents, for example the content of the equipment grid of a car. */
interface _ItemWithEntityDataPrototype {
  type: 'item-with-entity-data';
  /** Path to the icon file.

Only loaded if `icon_tintables` is not defined.

Uses `icon_size` and `icon_mipmaps` from its [ItemPrototype](prototype:ItemPrototype) parent. */
  icon_tintable?: FileName;
  /** Path to the icon file.

Only loaded if `icon_tintable_masks` is not defined and `icon_tintable` is defined.

Uses `icon_size` and `icon_mipmaps` from its [ItemPrototype](prototype:ItemPrototype) parent. */
  icon_tintable_mask?: FileName;
  /** Inside IconData, the property for the file path is `icon_tintable_mask` instead of `icon`. Can't be an empty array.

Only loaded if `icon_tintable` is defined.

Uses `icon_size` and `icon_mipmaps` from its [ItemPrototype](prototype:ItemPrototype) parent. */
  icon_tintable_masks?: IconData[];
  /** Inside IconData, the property for the file path is `icon_tintable` instead of `icon`. Can't be an empty array.

Only loaded if `icon_tintable` is defined (`icon_tintables` takes precedence over `icon_tintable`).

Uses `icon_size` and `icon_mipmaps` from its [ItemPrototype](prototype:ItemPrototype) parent. */
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
  /** When true, this item-with-inventory will extend the inventory it sits in by default. This is a runtime property on the result item that can be changed through the Lua interface and only determines the initial value. */
  extends_inventory_by_default?: boolean;
  /** The locale key used when the player attempts to put an item that doesn't match the filter rules into the item-with-inventory. */
  filter_message_key?: string;
  /** This determines how filters are applied. If no filters are defined this is automatically set to "none". */
  filter_mode?: 'blacklist' | 'whitelist';
  /** The insertion priority mode for this item. This determines if items are first attempted to be put into this items inventory if the item extends the inventory it sits in when items are put into the parent inventory. */
  insertion_priority_mode?:
    | 'default'
    | 'never'
    | 'always'
    | 'when-manually-filtered';
  /** The inventory size of the item. */
  inventory_size: ItemStackIndex;
  /** A list of explicit item names to be used as filters. */
  item_filters?: ItemID[];
  /** A list of explicit item group names to be used as filters. */
  item_group_filters?: ItemGroupID[];
  /** A list of explicit item subgroup names to be used as filters. */
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
// eslint-disable-next-line @typescript-eslint/no-empty-interface
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
  /** This defines how the player needs to destroy the specific entity. */
  damage_type?: DamageTypeID;
  /** This defines if the player needs to be in a vehicle. */
  in_vehicle?: boolean;
  /** This defines to make sure you are the one driving, for instance, in a tank rather than an automated train. */
  personally?: boolean;
  /** This defines which entity needs to be destroyed in order to receive the achievement. */
  to_kill?: EntityID;
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

/** A [lab](https://wiki.factorio.com/Lab). */
interface _LabPrototype {
  type: 'lab';
  /** Sets the module effects that are allowed to be used on this lab. */
  allowed_effects?: EffectTypeLimitation;
  /** Productivity bonus that this machine always has. */
  base_productivity?: number;
  /** Defines how this lab gets energy. */
  energy_source: EnergySource;
  /** The amount of energy this lab uses. */
  energy_usage: Energy;
  /** Shift of the "alt-mode icon" relative to the lab's center. */
  entity_info_icon_shift?: Vector;
  /** A list of the names of science packs that can be used in this lab.

If a technology requires other types of science packs, it cannot be researched in this lab. */
  inputs: ItemID[];
  light?: LightDefinition;
  /** The number of module slots. */
  module_specification?: ModuleSpecification;
  /** The animation that plays when the lab is idle. */
  off_animation: Animation;
  /** The animation that plays when the lab is active. */
  on_animation: Animation;
  researching_speed?: number;
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
  /** The pictures displayed for circuit connections to this lamp. */
  circuit_connector_sprites?: CircuitConnectorSprites;
  /** Defines how wires visually connect to this lamp. */
  circuit_wire_connection_point?: WireConnectionPoint;
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  /** darkness_for_all_lamps_on must be > darkness_for_all_lamps_off. Values must be between 0 and 1. */
  darkness_for_all_lamps_off?: number;
  /** darkness_for_all_lamps_on must be > darkness_for_all_lamps_off. Values must be between 0 and 1. */
  darkness_for_all_lamps_on?: number;
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
  picture_off: Sprite;
  /** The lamps graphics when it's on. */
  picture_on: Sprite;
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
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  /** Force the landmine to kill itself when exploding. */
  force_die_on_attack?: boolean;
  /** Whether this prototype should be a high priority target for enemy forces. See [Military units and structures](https://wiki.factorio.com/Military_units_and_structures). */
  is_military_target?: boolean;
  /** The sprite of the landmine before it is armed (just after placing). */
  picture_safe: Sprite;
  /** The sprite of the landmine of a friendly force when it is armed. */
  picture_set: Sprite;
  /** The sprite of the landmine of an enemy force when it is armed. */
  picture_set_enemy?: Sprite;
  /** Time between placing and the landmine being armed, in ticks. */
  timeout?: number;
  /** Collision mask that another entity must collide with to make this landmine blow up. */
  trigger_collision_mask?: CollisionMask;
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

/** Deprecated in 0.18. Particles that are exclusively meant for leaves of trees. The type "leaf-particle" has been obsoleted and cannot be created. See [ParticlePrototype](prototype:ParticlePrototype) for particles. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface _LeafParticlePrototype {
  type: 'leaf-particle';
}

export type LeafParticlePrototype = _LeafParticlePrototype &
  Omit<EntityParticlePrototype, keyof _LeafParticlePrototype>;

export function isLeafParticlePrototype(
  value: unknown,
): value is LeafParticlePrototype {
  return (value as { type: string }).type === 'leaf-particle';
}

/** A belt that can be connected to a belt anywhere else, including on a different surface. The linked belts have to be [connected with console commands](https://wiki.factorio.com/Console#Connect_linked_belts) or runtime scripting in mods or scenarios. [LuaEntity::connect_linked_belts](runtime:LuaEntity::connect_linked_belts) and other runtime functions. */
interface _LinkedBeltPrototype {
  type: 'linked-belt';
  allow_blueprint_connection?: boolean;
  allow_clone_connection?: boolean;
  allow_side_loading?: boolean;
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  structure: LinkedBeltStructure;
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
  /** The pictures displayed for circuit connections to this linked container. */
  circuit_connector_sprites?: CircuitConnectorSprites;
  /** Defines how wires visually connect to this linked container. */
  circuit_wire_connection_point?: WireConnectionPoint;
  /** The maximum circuit wire distance for this linked container. */
  circuit_wire_max_distance?: number;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** Players that can access the GUI to change the link ID. */
  gui_mode?: 'all' | 'none' | 'admins';
  /** Must be > 0. */
  inventory_size: ItemStackIndex;
  /** Whether the inventory of this container can be filtered (like cargo wagons) or not. */
  inventory_type?: 'with_bar' | 'with_filters_and_bar';
  picture?: Sprite;
  scale_info_icons?: boolean;
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
// eslint-disable-next-line @typescript-eslint/no-empty-interface
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
// eslint-disable-next-line @typescript-eslint/no-empty-interface
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
  /** Whether this loader can load and unload stationary inventories such as containers and crafting machines. */
  allow_container_interaction?: boolean;
  /** Whether this loader can load and unload [RollingStockPrototype](prototype:RollingStockPrototype). */
  allow_rail_interaction?: boolean;
  /** How long this loader's belt is. Should be the same as belt_distance, which is hardcoded to `0.5` for [Loader1x2Prototype](prototype:Loader1x2Prototype) and to 0 for [Loader1x1Prototype](prototype:Loader1x1Prototype). */
  belt_length?: number;
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  /** The distance between the position of this loader and the tile of the loader's container target. */
  container_distance?: number;
  /** Energy in Joules. Can't be negative. */
  energy_per_item?: Energy;
  energy_source?:
    | ElectricEnergySource
    | HeatEnergySource
    | FluidEnergySource
    | VoidEnergySource;
  /** How many item filters this loader has. Maximum count of filtered items in loader is 5. */
  filter_count: number;
  structure: LoaderStructure;
  structure_render_layer?: RenderLayer;
}

export type LoaderPrototype = _LoaderPrototype &
  Omit<TransportBeltConnectablePrototype, keyof _LoaderPrototype>;
/** A [locomotive](https://wiki.factorio.com/Locomotive). */
interface _LocomotivePrototype {
  type: 'locomotive';
  darkness_to_render_light_animation?: number;
  /** Must be a burner energy source when using "burner", otherwise it can also be a void energy source. */
  energy_source: BurnerEnergySource | VoidEnergySource;
  front_light?: LightDefinition;
  front_light_pictures?: RotatedSprite;
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
  /** The number of request slots this logistics container has. Requester-type containers must have > 0 slots and can have a maximum of 1000 slots. Storage-type containers must have <= 1 slot. */
  max_logistic_slots?: number;
  opened_duration?: number;
  /** The picture displayed for this entity. */
  picture?: Sprite;
  /** Whether the "no network" icon should be rendered on this entity if the entity is not within a logistics network. */
  render_not_in_network_icon?: boolean;
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
export interface MarketPrototype {
  type: 'market';
  /** Whether all forces are allowed to open this market. */
  allow_access_to_all_forces?: boolean;
  picture: Sprite;
}

export function isMarketPrototype(value: unknown): value is MarketPrototype {
  return (value as { type: string }).type === 'market';
}

/** A mining drill for automatically extracting resources from [resource entities](prototype:ResourceEntityPrototype). This prototype type is used by [burner mining drill](https://wiki.factorio.com/Burner_mining_drill), [electric mining drill](https://wiki.factorio.com/Electric_mining_drill) and [pumpjack](https://wiki.factorio.com/Pumpjack) in vanilla. */
interface _MiningDrillPrototype {
  type: 'mining-drill';
  allowed_effects?: EffectTypeLimitation;
  /** Only loaded if `graphics_set` is not defined. */
  animations?: Animation4Way;
  /** Used by the [pumpjack](https://wiki.factorio.com/Pumpjack) to have a static 4 way sprite. */
  base_picture?: Sprite4Way;
  /** Productivity bonus that this machine always has. Values below `0` are allowed, however the sum of the resulting effect together with modules and research is limited to be at least 0%, see [Effect](prototype:Effect). */
  base_productivity?: number;
  base_render_layer?: RenderLayer;
  /** Mandatory if circuit_wire_max_distance  > 0. */
  circuit_connector_sprites?: [
    CircuitConnectorSprites,
    CircuitConnectorSprites,
    CircuitConnectorSprites,
    CircuitConnectorSprites,
  ];
  /** Mandatory if circuit_wire_max_distance  > 0. */
  circuit_wire_connection_points?: [
    WireConnectionPoint,
    WireConnectionPoint,
    WireConnectionPoint,
    WireConnectionPoint,
  ];
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** The energy source of this mining drill. */
  energy_source: EnergySource;
  /** The amount of energy used by the drill while mining. Can't be less than or equal to 0. */
  energy_usage: Energy;
  graphics_set?: MiningDrillGraphicsSet;
  input_fluid_box?: FluidBox;
  /** The speed of this drill. */
  mining_speed: number;
  module_specification?: ModuleSpecification;
  /** When this mining drill is connected to the circuit network, the resource that it is reading (either the entire resource patch, or the resource in the mining area of the drill, depending on circuit network setting), is tinted in this color when mousing over the mining drill. */
  monitor_visualization_tint?: Color;
  output_fluid_box?: FluidBox;
  /** The sprite used to show the range of the mining drill. */
  radius_visualisation_picture?: Sprite;
  /** The names of the [ResourceCategory](prototype:ResourceCategory) that can be mined by this drill. For a list of built-in categories, see [here](https://wiki.factorio.com/Data.raw#resource-category).

Note: Categories containing resources which produce items, fluids, or items+fluids may be combined on the same entity, but may not work as expected. Examples: Miner does not rotate fluid-resulting resources until depletion. Fluid isn't output (fluid resource change and fluidbox matches previous fluid). Miner with no `vector_to_place_result` can't output an item result and halts. */
  resource_categories: ResourceCategoryID[];
  /** The distance from the centre of the mining drill to search for resources in.

This is 2.49 for electric mining drills (a 5x5 area) and 0.99 for burner mining drills (a 2x2 area). The drill searches resource outside its natural boundary box, which is 0.01 (the middle of the entity); making it 2.5 and 1.0 gives it another block radius. */
  resource_searching_radius: number;
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

/** Exists only for migration, cannot be used by mods. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface _MiningToolPrototype {
  type: 'mining-tool';
}

export type MiningToolPrototype = _MiningToolPrototype &
  Omit<ToolPrototype, keyof _MiningToolPrototype>;

export function isMiningToolPrototype(
  value: unknown,
): value is MiningToolPrototype {
  return (value as { type: string }).type === 'mining-tool';
}

/** A module category. The built-in categories can be found [here](https://wiki.factorio.com/Data.raw#module-category). See [ModulePrototype::category](prototype:ModulePrototype::category). */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface _ModuleCategory {
  type: 'module-category';
}

export type ModuleCategory = _ModuleCategory &
  Omit<PrototypeBase, keyof _ModuleCategory>;

export function isModuleCategory(value: unknown): value is ModuleCategory {
  return (value as { type: string }).type === 'module-category';
}

/** A [module](https://wiki.factorio.com/Module). */
interface _ModulePrototype {
  type: 'module';
  /** Chooses with what art style the module is shown inside beacons. See [BeaconModuleVisualizations::art_style](prototype:BeaconModuleVisualizations::art_style). Vanilla uses "vanilla" here. */
  art_style?: string;
  beacon_tint?: BeaconVisualizationTints;
  /** Used when upgrading modules: Ctrl + click modules into an entity and it will replace lower tier modules of the same category with higher tier modules. */
  category: ModuleCategoryID;
  effect: Effect;
  /** Array of recipe names this module can be used on. If empty, the module can be used on all recipes. */
  limitation?: RecipeID[];
  /** Array of recipe names this module can **not** be used on, implicitly allowing its use on all other recipes. This property has no effect if set to an empty table.

Note that the game converts this into a normal list of limitations internally, so reading [LuaItemPrototype::limitations](runtime:LuaItemPrototype::limitations) at runtime will be the product of both ways of defining limitations. */
  limitation_blacklist?: RecipeID[];
  /** The locale key of the message that is shown when the player attempts to use the module on a recipe it can't be used on. The locale key will be prefixed with `item-limitation.` (the "category" of the locale) by the game. */
  limitation_message_key?: string;
  requires_beacon_alt_mode?: boolean;
  /** Tier of the module inside its category. Used when upgrading modules: Ctrl + click modules into an entity and it will replace lower tier modules with higher tier modules if they have the same category. */
  tier: number;
}

export type ModulePrototype = _ModulePrototype &
  Omit<ItemPrototype, keyof _ModulePrototype>;

export function isModulePrototype(value: unknown): value is ModulePrototype {
  return (value as { type: string }).type === 'module';
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

Named noise expressions can be used by [MapGenSettings](prototype:MapGenSettings) and [MapGenPreset](prototype:MapGenPreset) to override which named expression is used to calculate a given property by having an entry in `property_expression_names`, e.g. `elevation = "0.16-elevation"`.

Alternate expressions can be made available in the map generator GUI by setting their `intended_property` to the name of the property they should override.

Named noise expressions can also be used by [noise variables](prototype:NoiseExpression::variable), e.g. `noise.var("my-named-expression")`. */
interface _NamedNoiseExpression {
  type: 'noise-expression';
  /** The noise expression itself. This is where most of the noise magic happens. */
  expression: NoiseExpression;
  /** Names the property that this expression is intended to provide a value for, if any. This will make the expression show up as an option in the map generator GUI, unless it is the only expression with that intended property, in which case it will be hidden and selected by default.

Note that the "Map type" dropdown in the map generation GUI is actually a selector for "elevation" generators. If generators are available for other properties, the "Map type" dropdown in the GUI will be renamed to "elevation" and shown along with selectors for the other selectable properties.

For example if a noise expression is intended to be used as an alternative temperature generator, `intended_property` should be "temperature". The base game uses the intended_properties elevation, temperature, moisture and aux. For how the named noise expression with those intended_properties are used in the base game see the notable named noise expression list on [NoiseExpression::variable](prototype:NoiseExpression::variable). Mods may add any other intended_property or modify the existing noise expressions to change/remove their intended properties. Furthermore, mods may remove the use of those named noise expressions from the map generation code or change what they affect.

**intended_property in the base game:** The base game defines two named noise expressions that have the `intended_property` "elevation" so that are selectable via the "Map type" dropdown (which actually selects elevation generators)

```
local noise = require("noise")
data:extend{
  {
    type = "noise-expression",
    name = "elevation",
    intended_property = "elevation",
    expression = noise.var("0_17-lakes-elevation") -- "0_17-lakes-elevation" is another named noise expression. Noise variables may reference named noise expressions.
  },
  {
    type = "noise-expression",
    name = "0_17-island",
    intended_property = "elevation",
    -- A large island surrounded by an endless ocean
    -- expression =  [...]
  }
}
```

**Mods can define any intended_property with any name**. This examples aims to show what this is useful for.

A [NoiseExpression::variable](prototype:NoiseExpression::variable) can reference a named noise expression, so by defining the "test" named noise expression, `noise.var("test")` may be used in other [noise expressions](prototype:NoiseExpression). Intended_property allows to override what the variable references: With the example, if "more-test" is selected in the dropdown in the map generator GUI, its `expression` (`noise.ridge(noise.var("y"), -10, 6`) will provide the value for the noise variable "test" instead.

For easy demonstration, that value is assigned to the "elevation" named noise expression, so changing the "test" generator changes the `noise.var("test")` which in turn is used by the "elevation" named noise expression. The "elevation" noise variable is used by water generation, so changing the test generators is immediately visible in the map generation preview.

Note that the player can select the "Island" elevation generator in the Elevation dropdown (previously named Map type), which means the 0_17-island named noise expression is selected and `noise.var("test")` isn't used anymore so changing the test generator no longer has an effect.

```
local noise = require("noise")
data:extend{
  {
    type = "noise-expression",
    name = "test",
    intended_property = "test",
    expression = noise.ridge(noise.var("x"), -80, 8),
  },
  {
    type = "noise-expression",
    name = "more-test",
    intended_property = "test", -- override the "test" noise variable when selected by the player
    expression = noise.ridge(noise.var("y"), -10, 6),
  }
}
data.raw["noise-expression"]["elevation"].expression = noise.var("test") -- the noise variable "test"
``` */
  intended_property?: string;
  /** Used to order alternative expressions in the map generator GUI. For a given property (e.g. 'temperature'), the NamedNoiseExpression with that property's name as its `intended_property` with the lowest order will be chosen as the default in the GUI.

If no order is specified, it defaults to "2000" if the property name matches the expression name (making it the 'technical default' generator for the property if none is specified in MapGenSettings), or "3000" otherwise. A generator defined with an order less than "2000" but with a unique name can thereby override the default generator used when creating a new map through the GUI without automatically overriding the 'technical default' generator, which is probably used by existing maps. */
  order?: Order;
}

export type NamedNoiseExpression = _NamedNoiseExpression &
  Omit<PrototypeBase, keyof _NamedNoiseExpression>;

export function isNamedNoiseExpression(
  value: unknown,
): value is NamedNoiseExpression {
  return (value as { type: string }).type === 'noise-expression';
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

/** A noise layer used by the [autoplace system](prototype:AutoplacePeak::noise_layer). For a list of built-in layers, see [here](https://wiki.factorio.com/Data.raw#noise-layer). */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface _NoiseLayer {
  type: 'noise-layer';
}

export type NoiseLayer = _NoiseLayer & Omit<PrototypeBase, keyof _NoiseLayer>;

export function isNoiseLayer(value: unknown): value is NoiseLayer {
  return (value as { type: string }).type === 'noise-layer';
}

/** An [offshore pump](https://wiki.factorio.com/Offshore_pump). */
interface _OffshorePumpPrototype {
  type: 'offshore-pump';
  adjacent_tile_collision_box?: BoundingBox;
  /** Tiles colliding with `adjacent_tile_collision_box` must NOT collide with this collision mask. */
  adjacent_tile_collision_mask?: CollisionMask;
  /** Tiles colliding with `adjacent_tile_collision_box` must collide with this collision mask (unless it's empty). */
  adjacent_tile_collision_test?: CollisionMask;
  /** If false, the offshore pump will not show fluid present (visually) before there is an output connected. The pump will also animate yet not show fluid when the fluid is 100% extracted (e.g. such as with a pump). */
  always_draw_fluid?: boolean;
  /** Tile at placement position must NOT collide with this collision mask. */
  center_collision_mask?: CollisionMask;
  /** If not set (=default), the offshore pump does not collide with tiles if it has none of these collision masks: "water-tile", "ground-tile", "resource-layer", "player-layer", "item-layer", "doodad-layer". If it has at least one of the six collision masks, it does collide with tiles.

If set, this specifies whether collision with tiles should (true) or should not (false) be performed on an offshore pump. */
  check_bounding_box_collides_with_tiles?: boolean;
  /** Mandatory if circuit_wire_max_distance > 0. */
  circuit_connector_sprites?: [
    CircuitConnectorSprites,
    CircuitConnectorSprites,
    CircuitConnectorSprites,
    CircuitConnectorSprites,
  ];
  /** Mandatory if circuit_wire_max_distance > 0. */
  circuit_wire_connection_points?: [
    WireConnectionPoint,
    WireConnectionPoint,
    WireConnectionPoint,
    WireConnectionPoint,
  ];
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** The name of the fluid that is produced by the pump. */
  fluid: FluidID;
  fluid_box: FluidBox;
  fluid_box_tile_collision_test?: CollisionMask;
  graphics_set?: OffshorePumpGraphicsSet;
  /** Animation runs at least this fast. */
  min_perceived_performance?: number;
  /** Mandatory if `graphics_set` is not defined.

Deprecated, use `graphics_set` instead. */
  picture?: Sprite4Way;
  placeable_position_visualization?: Sprite;
  /** How many units of fluid are produced per tick. Must be > 0. */
  pumping_speed: number;
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
  pictures: AnimationVariations;
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
  Omit<PrototypeBase, keyof _ParticlePrototype>;

export function isParticlePrototype(
  value: unknown,
): value is ParticlePrototype {
  return (value as { type: string }).type === 'optimized-particle';
}

/** Creates particles. */
interface _ParticleSourcePrototype {
  type: 'particle-source';
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
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
  pictures: PipePictures;
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
  /** Causes fluid icon to always be drawn, ignoring the usual pair requirement. */
  draw_fluid_icon_override?: boolean;
  fluid_box: FluidBox;
  pictures: PipeToGroundPictures;
}

export type PipeToGroundPrototype = _PipeToGroundPrototype &
  Omit<EntityWithOwnerPrototype, keyof _PipeToGroundPrototype>;

export function isPipeToGroundPrototype(
  value: unknown,
): value is PipeToGroundPrototype {
  return (value as { type: string }).type === 'pipe-to-ground';
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

/** When a character dies, this entity will immediately respawn the character at the entities location, so there is no respawn time. If there are multiple player ports in the world, the character will respawn at the nearest player port to their death location. */
interface _PlayerPortPrototype {
  type: 'player-port';
  animation: Animation;
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  /** Whether this prototype should be a high priority target for enemy forces. See [Military units and structures](https://wiki.factorio.com/Military_units_and_structures). */
  is_military_target?: boolean;
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
  led_off: Sprite;
  led_on: Sprite;
  left_wire_connection_point: WireConnectionPoint;
  overlay_loop: Animation;
  overlay_start: Animation;
  overlay_start_delay: number;
  power_on_animation: Animation;
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
  circuit_connector_sprites?: CircuitConnectorSprites;
  circuit_wire_connection_point?: WireConnectionPoint;
  circuit_wire_max_distance?: number;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  energy_source: ElectricEnergySource | VoidEnergySource;
  energy_usage_per_tick: Energy;
  instruments: ProgrammableSpeakerInstrument[];
  maximum_polyphony: number;
  sprite: Sprite;
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
  animation?: Animation;
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  /** Setting this to true can be used to disable projectile homing behaviour. */
  direction_only?: boolean;
  enable_drawing_with_mask?: boolean;
  /** Executed when the projectile hits something, after `action` and only if the entity that was hit was destroyed. The projectile is destroyed right after the final_action. */
  final_action?: Trigger;
  force_condition?: ForceCondition;
  height?: number;
  /** When true the entity is hit at the position on its collision box the projectile first collides with. When false the entity is hit at its own position. */
  hit_at_collision_position?: boolean;
  hit_collision_mask?: CollisionMask;
  light?: LightDefinition;
  /** Must be greater than or equal to 0. */
  max_speed?: number;
  /** Whenever an entity is hit by the projectile, this number gets reduced by the health of the entity. If the number is then below 0, the `final_action` is applied and the projectile destroyed. Otherwise, the projectile simply continues to its destination. */
  piercing_damage?: number;
  /** Whether the animation of the projectile is rotated to match the direction of travel. */
  rotatable?: boolean;
  shadow?: Animation;
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

/** The abstract base for prototypes. PrototypeBase defines the common features of prototypes, such as localization and order. */
export interface PrototypeBase {
  /** Overwrites the description set in the [locale file](https://wiki.factorio.com/Tutorial:Localisation). The description is usually shown in the tooltip of the prototype. */
  localised_description?: LocalisedString;
  /** Overwrites the name set in the [locale file](https://wiki.factorio.com/Tutorial:Localisation). Can be used to easily set a procedurally-generated name because the LocalisedString format allows to insert parameters into the name directly from the Lua script. */
  localised_name?: LocalisedString;
  /** Unique textual identification of the prototype. May not contain a dot, nor exceed a length of 200 characters.

For a list of all names used in vanilla, see [data.raw](https://wiki.factorio.com/Data.raw). */
  name: string;
  /** Used to order prototypes in inventory, recipes and GUIs. May not exceed a length of 200 characters. */
  order?: Order;
  /** Specifies the kind of prototype this is.

For a list of all types used in vanilla, see [data.raw](https://wiki.factorio.com/Data.raw). */
  type: string;
}
/** The pump is used to transfer fluids between tanks, fluid wagons and pipes. */
interface _PumpPrototype {
  type: 'pump';
  /** The animation for the pump. */
  animations: Animation4Way;
  /** Mandatory if circuit_wire_max_distance  > 0. */
  circuit_connector_sprites?: [
    CircuitConnectorSprites,
    CircuitConnectorSprites,
    CircuitConnectorSprites,
    CircuitConnectorSprites,
  ];
  /** Mandatory if circuit_wire_max_distance  > 0. */
  circuit_wire_connection_points?: [
    WireConnectionPoint,
    WireConnectionPoint,
    WireConnectionPoint,
    WireConnectionPoint,
  ];
  circuit_wire_max_distance?: number;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** The type of energy the pump uses. */
  energy_source: EnergySource;
  /** The amount of energy the pump uses. */
  energy_usage: Energy;
  fluid_animation?: Animation4Way;
  /** The area of the entity where fluid inputs and outputs. */
  fluid_box: FluidBox;
  fluid_wagon_connector_alignment_tolerance?: number;
  fluid_wagon_connector_frame_count?: number;
  fluid_wagon_connector_graphics?: FluidWagonConnectorGraphics;
  fluid_wagon_connector_speed?: number;
  glass_pictures?: Sprite4Way;
  /** The amount of fluid this pump transfers per tick. */
  pumping_speed: number;
}

export type PumpPrototype = _PumpPrototype &
  Omit<EntityWithOwnerPrototype, keyof _PumpPrototype>;

export function isPumpPrototype(value: unknown): value is PumpPrototype {
  return (value as { type: string }).type === 'pump';
}

/** A [radar](https://wiki.factorio.com/Radar). */
interface _RadarPrototype {
  type: 'radar';
  /** The amount of energy the radar has to consume for nearby scan to be performed. This value doesn't have any effect on sector scanning.

Performance warning: nearby scan causes re-charting of many chunks, which is expensive operation. If you want to make a radar that updates map more in real time, you should keep its range low. If you are making radar with high range, you should set this value such that nearby scan is performed once a second or so. For example if you set `energy_usage` to 100kW, setting` energy_per_nearby_scan` to 100kJ will cause nearby scan happen once per second. */
  energy_per_nearby_scan: Energy;
  /** The amount of energy it takes to scan a sector. This value doesn't have any effect on nearby scanning. */
  energy_per_sector: Energy;
  /** The energy source for this radar. */
  energy_source: EnergySource;
  /** The amount of energy this radar uses. */
  energy_usage: Energy;
  /** Whether this prototype should be a high priority target for enemy forces. See [Military units and structures](https://wiki.factorio.com/Military_units_and_structures). */
  is_military_target?: boolean;
  /** The radius of the area constantly revealed by this radar, in chunks. */
  max_distance_of_nearby_sector_revealed: number;
  /** The radius of the area this radar can chart, in chunks. */
  max_distance_of_sector_revealed: number;
  pictures: RotatedSprite;
  radius_minimap_visualisation_color?: Color;
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
  blue_light?: LightDefinition;
  default_blue_output_signal?: SignalIDConnector;
  /** Array of 8 vectors. */
  selection_box_offsets: Vector[];
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
  /** The name of an entity of the type "curved-rail". The first item to place of the rail must be this rail planner. */
  curved_rail: EntityID;
  /** The name of an entity of the type "straight-rail". The first item to place of the rail must be this rail planner. */
  straight_rail: EntityID;
}

export type RailPlannerPrototype = _RailPlannerPrototype &
  Omit<ItemPrototype, keyof _RailPlannerPrototype>;

export function isRailPlannerPrototype(
  value: unknown,
): value is RailPlannerPrototype {
  return (value as { type: string }).type === 'rail-planner';
}

/** The abstract base of both rail prototypes. */
interface _RailPrototype {
  /** Has to be 2 for 2x2 grid. */
  build_grid_size?: 2;
  /** All rail [collision_boxes](prototype:EntityPrototype::collision_box) are hardcoded and cannot be modified. */
  collision_box?: BoundingBox;
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  pictures: RailPictureSet;
  /** Furthermore, the rail [selection_boxes](prototype:EntityPrototype::selection_box) are automatically calculated from the bounding boxes, so effectively also hardcoded. */
  selection_box?: BoundingBox;
  /** Sound played when a character walks over this rail. */
  walking_sound?: Sound;
}

export type RailPrototype = _RailPrototype &
  Omit<EntityWithOwnerPrototype, keyof _RailPrototype>;
/** Used for rail corpses. */
interface _RailRemnantsPrototype {
  type: 'rail-remnants';
  bending_type: 'straight' | 'turn';
  /** Has to be 2 for 2x2 grid. */
  build_grid_size?: 2;
  /** All rail remnant [collision_boxes](prototype:EntityPrototype::collision_box) are hardcoded and cannot be modified. */
  collision_box?: BoundingBox;
  pictures: RailPictureSet;
  /** Furthermore, the rail remnant [selection_boxes](prototype:EntityPrototype::selection_box) are automatically calculated from the bounding boxes, so effectively also hardcoded. */
  selection_box?: BoundingBox;
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
  animation: RotatedAnimation;
  /** Mandatory if circuit_wire_max_distance > 0. */
  circuit_connector_sprites?: CircuitConnectorSprites[];
  /** Mandatory if circuit_wire_max_distance > 0. */
  circuit_wire_connection_points?: WireConnectionPoint[];
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  /** The [collision_box](prototype:EntityPrototype::collision_box) of rail signals is hardcoded to `{{-0.2, -0.2}, {0.2, 0.2}}`. */
  collision_box?: BoundingBox;
  /** Rail signals must collide with each other, this can be achieved by having the "rail-layer" collision mask layer on all rail signals.

Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  default_green_output_signal?: SignalIDConnector;
  default_orange_output_signal?: SignalIDConnector;
  default_red_output_signal?: SignalIDConnector;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** The "placeable-off-grid" flag will be ignored for rail signals. */
  flags?: EntityPrototypeFlags;
  green_light?: LightDefinition;
  orange_light?: LightDefinition;
  rail_piece?: Animation;
  red_light?: LightDefinition;
}

export type RailSignalBasePrototype = _RailSignalBasePrototype &
  Omit<EntityWithOwnerPrototype, keyof _RailSignalBasePrototype>;
/** A [rail signal](https://wiki.factorio.com/Rail_signal). */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
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

/** A [reactor](https://wiki.factorio.com/Reactor). */
interface _ReactorPrototype {
  type: 'reactor';
  /** If defined, number of variations must be at least equal to count of [connections](prototype:HeatBuffer::connections) defined in `heat_buffer`. Each variation represents connected heat buffer connection of corresponding index. */
  connection_patches_connected?: SpriteVariations;
  /** If defined, number of variations must be at least equal to count of [connections](prototype:HeatBuffer::connections) defined in `heat_buffer`. Each variation represents unconnected heat buffer connection of corresponding index. */
  connection_patches_disconnected?: SpriteVariations;
  /** How much energy this reactor can consume (from the input energy source) and then output as heat. */
  consumption: Energy;
  /** When `use_fuel_glow_color` is true, this is the color used as `working_light_picture` tint for fuels that don't have glow color defined. */
  default_fuel_glow_color?: Color;
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
  working_light_picture: Sprite;
}

export type ReactorPrototype = _ReactorPrototype &
  Omit<EntityWithOwnerPrototype, keyof _ReactorPrototype>;

export function isReactorPrototype(value: unknown): value is ReactorPrototype {
  return (value as { type: string }).type === 'reactor';
}

/** A recipe category. The built-in categories can be found [here](https://wiki.factorio.com/Data.raw#recipe-category). See [RecipePrototype::category](prototype:RecipePrototype::category). Recipe categories can be used to specify which [machine](prototype:CraftingMachinePrototype::crafting_categories) can craft which [recipes](prototype:RecipePrototype).

The recipe category with the name "crafting" cannot contain recipes with fluid ingredients or products. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface _RecipeCategory {
  type: 'recipe-category';
}

export type RecipeCategory = _RecipeCategory &
  Omit<PrototypeBase, keyof _RecipeCategory>;

export function isRecipeCategory(value: unknown): value is RecipeCategory {
  return (value as { type: string }).type === 'recipe-category';
}

/** A recipe. It can be a crafting recipe, a smelting recipe, or a custom type of recipe, see [RecipeCategory](prototype:RecipeCategory).

This prototype has two different formats that can be specified. If both `normal` and `expensive` are not defined, the standard properties define this recipe. Otherwise, they are ignored, and the `normal` and `expensive` properties are used exclusively to define this recipe. */
interface _RecipePrototype {
  type: 'recipe';
  /** Whether the recipe can be used as an intermediate recipe in hand-crafting.

Only loaded if neither `normal` nor `expensive` are defined. */
  allow_as_intermediate?: boolean;
  /** Whether this recipe is allowed to be broken down for the recipe tooltip "Total raw" calculations.

Only loaded if neither `normal` nor `expensive` are defined. */
  allow_decomposition?: boolean;
  /** Whether the recipe is allowed to have the extra inserter overload bonus applied (4 * stack inserter stack size).

Only loaded if neither `normal` nor `expensive` are defined. */
  allow_inserter_overload?: boolean;
  /** Whether the recipe is allowed to use intermediate recipes when hand-crafting.

Only loaded if neither `normal` nor `expensive` are defined. */
  allow_intermediates?: boolean;
  /** Whether the "Made in: <Machine>" part of the tool-tip should always be present, and not only when the recipe can't be hand-crafted.

Only loaded if neither `normal` nor `expensive` are defined. */
  always_show_made_in?: boolean;
  /** Whether the products are always shown in the recipe tooltip.

Only loaded if neither `normal` nor `expensive` are defined. */
  always_show_products?: boolean;
  /** Controls which category of machines can craft this recipe.

The built-in categories can be found [here](https://wiki.factorio.com/Data.raw#recipe-category). The base `"crafting"` category can not contain recipes with fluid ingredients or products. */
  category?: RecipeCategoryID;
  /** Used by [CraftingMachinePrototype::working_visualisations](prototype:CraftingMachinePrototype::working_visualisations) to tint certain layers with the recipe color. [WorkingVisualisation::apply_recipe_tint](prototype:WorkingVisualisation::apply_recipe_tint) determines which of the four colors is used for that layer, if any. */
  crafting_machine_tint?: CraftingMachineTint;
  /** Only loaded if neither `normal` nor `expensive` are defined. */
  emissions_multiplier?: number;
  /** This can be `false` to disable the recipe at the start of the game, or `true` to leave it enabled.

If a recipe is unlocked via technology, this should be set to `false`.

Only loaded if neither `normal` nor `expensive` are defined. */
  enabled?: boolean;
  /** The amount of time it takes to make this recipe. Must be `> 0.001`. Equals the number of seconds it takes to craft at crafting speed `1`.

Only loaded if neither `normal` nor `expensive` are defined. */
  energy_required?: number;
  /** Can be set to `false` if the `normal` property is defined. This will disable this difficulty, same as setting `enabled` to `false` would. If it's later enabled (by research, etc.), it will use the data from `normal`.

If this property is not defined while `normal` is, it will mirror its data. */
  expensive?: RecipeData | false;
  /** Hides the recipe from crafting menus.

Only loaded if neither `normal` nor `expensive` are defined. */
  hidden?: boolean;
  /** Hides the recipe from the player's crafting screen. The recipe will still show up for selection in machines.

Only loaded if neither `normal` nor `expensive` are defined. */
  hide_from_player_crafting?: boolean;
  /** Hides the recipe from item/fluid production statistics.

Only loaded if neither `normal` nor `expensive` are defined. */
  hide_from_stats?: boolean;
  /** If given, this determines the recipe's icon. Otherwise, the icon of `main_product` or the singular product is used.

Mandatory if `icons` is not defined for a recipe with more than one product and no `main_product`, or no product. */
  icon?: FileName;
  /** Icons of reduced size will be used at decreased scale. */
  icon_mipmaps?: IconMipMapType;
  /** The size of the square icon, in pixels, e.g. `32` for a 32px by 32px icon.

Mandatory if `icons` is not defined, or if `icon_size` is not specified for all instances of `icons`. */
  icon_size?: SpriteSizeType;
  /** Can't be an empty array. */
  icons?: IconData[];
  /** A table containing ingredient names and counts. Can also contain information about fluid temperature and catalyst amounts. The catalyst amounts are automatically calculated from the recipe, or can be set manually in the IngredientPrototype (see [here](https://factorio.com/blog/post/fff-256)).

The maximum ingredient amount is 65535. Can be set to an empty table to create a recipe that needs no ingredients.

Duplicate ingredients, e.g. two entries with the same name, are *not* allowed. In-game, the item ingredients are ordered by [ItemGroup::order_in_recipe](prototype:ItemGroup::order_in_recipe).

Mandatory if neither `normal` nor `expensive` are defined. */
  ingredients?: IngredientPrototype[];
  /** For recipes with one or more products: Subgroup, localised_name and icon default to the values of the singular/main product, but can be overwritten by the recipe. Setting the main_product to an empty string (`""`) forces the title in the recipe tooltip to use the recipe's name (not that of the product) and shows the products in the tooltip.

If 1) there are multiple products and this property is nil, 2) this property is set to an empty string (`""`), or 3) there are no products, the recipe will use the localised_name, icon, and subgroup of the recipe. icon and subgroup become non-optional.

Only loaded if neither `normal` nor `expensive` are defined. */
  main_product?: string;
  /** Can be set to `false` if the `expensive` property is defined. This will disable this difficulty, same as setting `enabled` to `false` would. If it's later enabled (by research, etc.), it will use the data from `expensive`.

If this property is not defined while `expensive` is, it will mirror its data. */
  normal?: RecipeData | false;
  /** Used to determine how many extra items are put into an assembling machine before it's considered "full enough". See [insertion limits](https://wiki.factorio.com/Inserters#Insertion_limits).

If set to `0`, it instead uses the following formula: `1.166 / (energy_required / the assembler's crafting_speed)`, rounded up, and clamped to be between`2` and `100`. The numbers used in this formula can be changed by the [UtilityConstants](prototype:UtilityConstants) properties `dynamic_recipe_overload_factor`, `minimum_recipe_overload_multiplier`, and `maximum_recipe_overload_multiplier`.

Only loaded if neither `normal` nor `expensive` are defined. */
  overload_multiplier?: number;
  /** Only loaded if neither `normal` nor `expensive` are defined. */
  requester_paste_multiplier?: number;
  /** The item created by this recipe. Must be the name of an [item](prototype:ItemPrototype), such as `"iron-gear-wheel"`.

Only loaded if neither `results`, `normal` nor `expensive` are defined. */
  result?: ItemID;
  /** The number of items created by this recipe.

Only loaded if neither `results`, `normal` nor `expensive` are defined. */
  result_count?: number;
  /** A table containing result names and counts. Can also contain information about fluid temperature and catalyst amounts. The catalyst amounts are automatically calculated from the recipe, or can be set manually in the ProductPrototype (see [here](https://factorio.com/blog/post/fff-256)).

Can be set to an empty table to create a recipe that produces nothing. Duplicate results, e.g. two entries with the same name, are allowed.

Mandatory if neither `normal` nor `expensive` are defined. */
  results?: ProductPrototype[];
  /** Whether the recipe name should have the product amount in front of it, e.g. "2x Transport belt".

Only loaded if neither `normal` nor `expensive` are defined. */
  show_amount_in_title?: boolean;
  /** The subgroup of this recipe. If not specified, it defaults to the subgroup of the product if there is only one, or of the `main_product` if multiple products exist.

Mandatory if multiple products exist and no `main_product` is specified, or if there is no product. */
  subgroup?: ItemSubGroupID;
  /** Whether enabling this recipe unlocks its item products to show in selection lists (item filters, logistic requests, etc.).

Only loaded if neither `normal` nor `expensive` are defined. */
  unlock_results?: boolean;
}

export type RecipePrototype = _RecipePrototype &
  Omit<PrototypeBase, keyof _RecipePrototype>;

export function isRecipePrototype(value: unknown): value is RecipePrototype {
  return (value as { type: string }).type === 'recipe';
}

/** A [repair pack](https://wiki.factorio.com/Repair_pack). */
interface _RepairToolPrototype {
  type: 'repair-tool';
  /** This does nothing, it is never triggered. */
  repair_result?: Trigger;
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

/** A resource category. The built-in categories can be found [here](https://wiki.factorio.com/Data.raw#resource-category). See [ResourceEntityPrototype::category](prototype:ResourceEntityPrototype::category). */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface _ResourceCategory {
  type: 'resource-category';
}

export type ResourceCategory = _ResourceCategory &
  Omit<PrototypeBase, keyof _ResourceCategory>;

export function isResourceCategory(value: unknown): value is ResourceCategory {
  return (value as { type: string }).type === 'resource-category';
}

/** A mineable/gatherable entity. Its [collision_mask](prototype:EntityPrototype::collision_mask) must contain "resource-layer" if it should be minable with a [MiningDrillPrototype](prototype:MiningDrillPrototype). */
interface _ResourceEntityPrototype {
  type: 'resource';
  /** The category for the resource. Available categories in vanilla can be found [here](https://wiki.factorio.com/Data.raw#resource-category). */
  category?: ResourceCategoryID;
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
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
  stages: AnimationVariations;
  /** An effect that can be overlaid above the normal ore graphics. Used in the base game to make [uranium ore](https://wiki.factorio.com/Uranium_ore) glow. */
  stages_effect?: AnimationVariations;
  /** Must be positive when `tree_removal_probability` is set. */
  tree_removal_max_distance?: number;
  /** Must be positive. */
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
  recharging_animation: Animation;
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
  base: Sprite;
  /** The animation played when the roboport is idle. */
  base_animation: Animation;
  base_patch: Sprite;
  /** The distance (in tiles) from the roboport at which robots will wait to charge. Notably, if the robot is already in range, then it will simply wait at its current position. */
  charge_approach_distance: number;
  charging_distance?: number;
  /** The maximum power provided to each charging station. */
  charging_energy: Energy;
  /** The offsets from the center of the roboport at which robots will charge. Only used if `charging_station_count` is equal to 0. */
  charging_offsets?: Vector[];
  /** How many charging points this roboport has. If this is 0, the length of the charging_offsets table is used to calculate the charging station count. */
  charging_station_count?: number;
  charging_station_shift?: Vector;
  /** Unused. */
  charging_threshold_distance?: number;
  circuit_connector_sprites?: CircuitConnectorSprites;
  circuit_wire_connection_point?: WireConnectionPoint;
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  close_door_trigger_effect?: TriggerEffect;
  /** Can't be negative. */
  construction_radius: number;
  default_available_construction_output_signal?: SignalIDConnector;
  default_available_logistic_output_signal?: SignalIDConnector;
  default_total_construction_output_signal?: SignalIDConnector;
  default_total_logistic_output_signal?: SignalIDConnector;
  door_animation_down: Animation;
  door_animation_up: Animation;
  draw_circuit_wires?: boolean;
  draw_construction_radius_visualization?: boolean;
  draw_copper_wires?: boolean;
  draw_logistic_radius_visualization?: boolean;
  /** The roboport's energy source. */
  energy_source: ElectricEnergySource | VoidEnergySource;
  /** The amount of energy the roboport uses when idle. */
  energy_usage: Energy;
  /** Must be >= `logistics_radius`. */
  logistics_connection_distance?: number;
  /** Can't be negative. */
  logistics_radius: number;
  /** The number of repair pack slots in the roboport. */
  material_slots_count: ItemStackIndex;
  open_door_trigger_effect?: TriggerEffect;
  /** Minimum charge that the roboport has to have after a blackout (0 charge/buffered energy) to begin working again. Additionally, freshly placed roboports will have their energy buffer filled with `0.25 × recharge_minimum` energy.

Must be larger than or equal to `energy_usage` otherwise during low power the roboport will toggle on and off every tick. */
  recharge_minimum: Energy;
  /** The animation played at each charging point when a robot is charging there. */
  recharging_animation: Animation;
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
  cargo_centered: Vector;
  /** Applied when the robot expires (runs out of energy and [FlyingRobotPrototype::speed_multiplier_when_out_of_energy](prototype:FlyingRobotPrototype::speed_multiplier_when_out_of_energy) is 0). */
  destroy_action?: Trigger;
  draw_cargo?: boolean;
  /** Only the first frame of the animation is drawn. This means that the graphics for the idle state cannot be animated. */
  idle?: RotatedAnimation;
  /** Only the first frame of the animation is drawn. This means that the graphics for the in_motion state cannot be animated. */
  in_motion?: RotatedAnimation;
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
  arm_01_back_animation: Animation;
  arm_02_right_animation: Animation;
  arm_03_front_animation: Animation;
  base_day_sprite: Sprite;
  base_engine_light?: LightDefinition;
  base_front_sprite: Sprite;
  base_light?: LightDefinition;
  /** Drawn instead of `base_day_sprite` during the night i.e. when [LuaSurface::darkness](runtime:LuaSurface::darkness) is larger than 0.3. */
  base_night_sprite?: Sprite;
  /** Played when switching into the [arms_retract](runtime:defines.rocket_silo_status.arms_retract) state. */
  clamps_off_sound?: Sound;
  /** Applied when switching into the [arms_retract](runtime:defines.rocket_silo_status.arms_retract) state. */
  clamps_off_trigger?: TriggerEffect;
  /** Played when switching into the [arms_advance](runtime:defines.rocket_silo_status.arms_advance) state. */
  clamps_on_sound?: Sound;
  /** Applied when switching into the [arms_advance](runtime:defines.rocket_silo_status.arms_advance) state. */
  clamps_on_trigger?: TriggerEffect;
  door_back_open_offset: Vector;
  door_back_sprite: Sprite;
  door_front_open_offset: Vector;
  door_front_sprite: Sprite;
  /** The inverse of the duration in ticks of [doors_opening](runtime:defines.rocket_silo_status.doors_opening) and [closing](runtime:defines.rocket_silo_status.doors_closing). */
  door_opening_speed: number;
  /** Played when switching into the [doors_opening](runtime:defines.rocket_silo_status.doors_opening) and [doors_closing](runtime:defines.rocket_silo_status.doors_closing) states. */
  doors_sound?: Sound;
  /** Applied when switching into the [doors_opening](runtime:defines.rocket_silo_status.doors_opening) and [doors_closing](runtime:defines.rocket_silo_status.doors_closing) states. */
  doors_trigger?: TriggerEffect;
  /** Played when switching into the [engine_starting](runtime:defines.rocket_silo_status.engine_starting) state. */
  flying_sound?: Sound;
  hole_clipping_box: BoundingBox;
  hole_light_sprite: Sprite;
  hole_sprite: Sprite;
  /** May be 0.

Additional energy used during the night i.e. when [LuaSurface::darkness](runtime:LuaSurface::darkness) is larger than 0.3. */
  lamp_energy_usage: Energy;
  /** The time to wait in the [launch_started](runtime:defines.rocket_silo_status.launch_started) state before switching to [engine_starting](runtime:defines.rocket_silo_status.engine_starting). */
  launch_wait_time?: number;
  /** The inverse of the duration in ticks of [lights_blinking_open](runtime:defines.rocket_silo_status.lights_blinking_open) and [lights_blinking_close](runtime:defines.rocket_silo_status.lights_blinking_close). */
  light_blinking_speed: number;
  /** Played when switching into the [rocket_rising](runtime:defines.rocket_silo_status.rocket_rising) state. */
  raise_rocket_sound?: Sound;
  /** Applied when switching into the [rocket_rising](runtime:defines.rocket_silo_status.rocket_rising) state. */
  raise_rocket_trigger?: TriggerEffect;
  /** Drawn from the start of the [lights_blinking_open](runtime:defines.rocket_silo_status.lights_blinking_open) state until the end of the [lights_blinking_close](runtime:defines.rocket_silo_status.lights_blinking_close) state. */
  red_lights_back_sprites: Sprite;
  /** Drawn from the start of the [lights_blinking_open](runtime:defines.rocket_silo_status.lights_blinking_open) state until the end of the [lights_blinking_close](runtime:defines.rocket_silo_status.lights_blinking_close) state. */
  red_lights_front_sprites: Sprite;
  /** Name of a [RocketSiloRocketPrototype](prototype:RocketSiloRocketPrototype). */
  rocket_entity: EntityID;
  rocket_glow_overlay_sprite: Sprite;
  /** The number of crafts that must complete to produce a rocket. This includes bonus crafts from productivity. Recipe products are ignored. */
  rocket_parts_required: number;
  rocket_result_inventory_size?: ItemStackIndex;
  /** The time to wait in the [doors_opened](runtime:defines.rocket_silo_status.doors_opened) state before switching to [rocket_rising](runtime:defines.rocket_silo_status.rocket_rising). */
  rocket_rising_delay?: number;
  rocket_shadow_overlay_sprite: Sprite;
  satellite_animation: Animation;
  satellite_shadow_animation: Animation;
  shadow_sprite: Sprite;
  silo_fade_out_end_distance: number;
  silo_fade_out_start_distance: number;
  /** How many times the `red_lights_back_sprites` and `red_lights_front_sprites` should blink during [lights_blinking_open](runtime:defines.rocket_silo_status.lights_blinking_open) and [lights_blinking_close](runtime:defines.rocket_silo_status.lights_blinking_close).

Does not affect the duration of the launch sequence. */
  times_to_blink: number;
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
  dying_explosion?: EntityID;
  effects_fade_in_end_distance: number;
  effects_fade_in_start_distance: number;
  engine_starting_speed: number;
  flying_acceleration: number;
  flying_speed: number;
  flying_trigger?: TriggerEffect;
  full_render_layer_switch_distance: number;
  glow_light?: LightDefinition;
  inventory_size: ItemStackIndex;
  rising_speed: number;
  rocket_above_wires_slice_offset_from_center?: number;
  rocket_air_object_slice_offset_from_center?: number;
  rocket_flame_animation: Animation;
  rocket_flame_left_animation: Animation;
  rocket_flame_left_rotation: number;
  rocket_flame_right_animation: Animation;
  rocket_flame_right_rotation: number;
  rocket_glare_overlay_sprite: Sprite;
  rocket_initial_offset?: Vector;
  rocket_launch_offset: Vector;
  rocket_render_layer_switch_distance: number;
  rocket_rise_offset: Vector;
  rocket_shadow_sprite: Sprite;
  rocket_smoke_bottom1_animation: Animation;
  rocket_smoke_bottom2_animation: Animation;
  rocket_smoke_top1_animation: Animation;
  rocket_smoke_top2_animation: Animation;
  rocket_smoke_top3_animation: Animation;
  rocket_sprite: Sprite;
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
// eslint-disable-next-line @typescript-eslint/no-empty-interface
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
  air_resistance: number;
  allow_manual_color?: boolean;
  allow_robot_dispatch_in_automatic_mode?: boolean;
  back_light?: LightDefinition;
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  color?: Color;
  /** The distance between the joint of this rolling stock and its connected rolling stocks joint. */
  connection_distance: number;
  /** Usually a sound to play when the rolling stock drives over a tie. The rolling stock is considered to be driving over a tie every `tie_distance` tiles. */
  drive_over_tie_trigger?: TriggerEffect;
  horizontal_doors?: Animation;
  /** The length between this rolling stocks front and rear joints. Joints are the point where connection_distance is measured from when rolling stock are connected to one another. Wheels sprite are placed based on the joint position.

Maximum joint distance is 15.

Note: There needs to be border at least 0.2 between the [bounding box](prototype:EntityPrototype::collision_box) edge and joint. This means that the collision_box must be at least `{{-0,-0.2},{0,0.2}}`. */
  joint_distance: number;
  /** Maximum speed of the rolling stock in tiles/tick.

In-game, the max speed of a train is `min(all_rolling_stock_max_speeds) × average(all_fuel_modifiers_in_all_locomotives)`. This calculated train speed is then silently capped to 7386.3km/h. */
  max_speed: number;
  pictures: RotatedSprite;
  stand_by_light?: LightDefinition;
  /** In tiles. Used to determine how often `drive_over_tie_trigger` is triggered. */
  tie_distance?: number;
  vertical_doors?: Animation;
  vertical_selection_shift: number;
  wheels?: RotatedSprite;
}

export type RollingStockPrototype = _RollingStockPrototype &
  Omit<VehiclePrototype, keyof _RollingStockPrototype>;
/** Used in the base game as a base for the blueprint item and the deconstruction item. */
interface _SelectionToolPrototype {
  type: 'selection-tool';
  alt_entity_filter_mode?: 'whitelist' | 'blacklist';
  alt_entity_filters?: EntityID[];
  alt_entity_type_filters?: string[];
  alt_reverse_entity_filter_mode?: 'whitelist' | 'blacklist';
  alt_reverse_entity_filters?: EntityID[];
  alt_reverse_entity_type_filters?: string[];
  alt_reverse_selection_color?: Color;
  alt_reverse_selection_count_button_color?: Color;
  /** The type of cursor box used to render selection of entities/tiles when alt-reverse-selecting (using SHIFT + Right mouse button */
  alt_reverse_selection_cursor_box_type?: CursorBoxType;
  /** A list of selection mode flags that define how the selection tool alt-reverse-selects things in-game (using SHIFT + Right mouse button). */
  alt_reverse_selection_mode?: SelectionModeFlags;
  alt_reverse_tile_filter_mode?: 'whitelist' | 'blacklist';
  alt_reverse_tile_filters?: TileID[];
  /** The color of the rectangle used when alt-selection is done in-game. */
  alt_selection_color: Color;
  alt_selection_count_button_color?: Color;
  /** The type of cursor box used to render selection of entities/tiles when alt selecting. */
  alt_selection_cursor_box_type: CursorBoxType;
  /** A list of selection mode flags that define how the selection tool alt-selects things in-game. */
  alt_selection_mode: SelectionModeFlags;
  alt_tile_filter_mode?: 'whitelist' | 'blacklist';
  alt_tile_filters?: TileID[];
  /** If tiles should be included in the selection regardless of entities also being in the selection. This is a visual only setting. */
  always_include_tiles?: boolean;
  chart_alt_reverse_selection_color?: Color;
  chart_alt_selection_color?: Color;
  chart_reverse_selection_color?: Color;
  chart_selection_color?: Color;
  entity_filter_mode?: 'whitelist' | 'blacklist';
  entity_filters?: EntityID[];
  entity_type_filters?: string[];
  mouse_cursor?: MouseCursorID;
  reverse_entity_filter_mode?: 'whitelist' | 'blacklist';
  reverse_entity_filters?: EntityID[];
  reverse_entity_type_filters?: string[];
  reverse_selection_color?: Color;
  reverse_selection_count_button_color?: Color;
  /** The type of cursor box used to render selection of entities/tiles when reverse-selecting. */
  reverse_selection_cursor_box_type?: CursorBoxType;
  /** A list of selection mode flags that define how the selection tool reverse-selects things in-game. */
  reverse_selection_mode?: SelectionModeFlags;
  reverse_tile_filter_mode?: 'whitelist' | 'blacklist';
  reverse_tile_filters?: TileID[];
  /** The color of the rectangle used when standard selection is done in-game. */
  selection_color: Color;
  selection_count_button_color?: Color;
  /** The type of cursor box used to render selection of entities/tiles when standard selecting. */
  selection_cursor_box_type: CursorBoxType;
  /** A list of selection mode flags that define how the selection tool selects things in-game. */
  selection_mode: SelectionModeFlags;
  tile_filter_mode?: 'whitelist' | 'blacklist';
  tile_filters?: TileID[];
}

export type SelectionToolPrototype = _SelectionToolPrototype &
  Omit<ItemWithLabelPrototype, keyof _SelectionToolPrototype>;

export function isSelectionToolPrototype(
  value: unknown,
): value is SelectionToolPrototype {
  return (value as { type: string }).type === 'selection-tool';
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
  /** The icon used when the shortcut is shown in the quickbar, and is not usable.

Note: The scale that can be defined in the sprite may not behave as expected because the game always scales the sprite to fill the GUI slot. */
  disabled_icon?: Sprite;
  /** The icon used in the panel for visible shortcuts, when the shortcut is not usable.

Note: The scale that can be defined in the sprite may not behave as expected because the game always scales the sprite to fill the GUI slot. */
  disabled_small_icon?: Sprite;
  /** Scales to fit a 16x16-pixel square.

Note: The scale that can be defined in the sprite may not behave as expected because the game always scales the sprite to fill the GUI slot. */
  icon: Sprite;
  /** The item to create when clicking on a shortcut with the action set to `"spawn-item"`. The item must have the [spawnable](prototype:ItemPrototypeFlags::spawnable) flag set. */
  item_to_spawn?: ItemID;
  /** Used to order the shortcuts in the [quick panel](https://wiki.factorio.com/Quick_panel), which replaces the shortcut bar when using a controller (game pad). It [is recommended](https://forums.factorio.com/106661) to order modded shortcuts after the vanilla shortcuts. */
  order?: Order;
  /** The icon used in the panel for visible shortcuts, when the shortcut is usable.

Note: The scale that can be defined in the sprite may not behave as expected because the game always scales the sprite to fill the GUI slot. */
  small_icon?: Sprite;
  style?: 'default' | 'blue' | 'red' | 'green';
  /** The technology that must be researched before this shortcut can be used. Once a shortcut is unlocked in one save file, it is unlocked for all future save files. */
  technology_to_unlock?: TechnologyID;
  /** Must be enabled for the Factorio API to be able to set the toggled state on the shortcut button, see [LuaPlayer::set_shortcut_toggled](runtime:LuaPlayer::set_shortcut_toggled). */
  toggleable?: boolean;
}

export type ShortcutPrototype = _ShortcutPrototype &
  Omit<PrototypeBase, keyof _ShortcutPrototype>;

export function isShortcutPrototype(
  value: unknown,
): value is ShortcutPrototype {
  return (value as { type: string }).type === 'shortcut';
}

/** An extremely basic entity with no special functionality. Used for minable rocks. */
interface _SimpleEntityPrototype {
  type: 'simple-entity';
  /** Mandatory if both `picture` and `pictures` are not defined. */
  animations?: AnimationVariations;
  /** Whether this entity should be treated as a rock for the purpose of deconstruction and for [CarPrototype::immune_to_rock_impacts](prototype:CarPrototype::immune_to_rock_impacts). */
  count_as_rock_for_filtered_deconstruction?: boolean;
  /** Mandatory if both `pictures` and `animations` are not defined. Takes priority over `animations`. */
  picture?: Sprite;
  /** Mandatory if both `picture` and `animations` are not defined. Takes priority over `picture` and `animations`. */
  pictures?: SpriteVariations;
  random_animation_offset?: boolean;
  /** Whether a random graphics variation is chosen when placing the entity/creating it via script/creating it via map generation. If this is `false`, the entity will use the first variation instead of a random one. */
  random_variation_on_create?: boolean;
  render_layer?: RenderLayer;
  /** Used to determine render order for entities with the same `render_layer` in the same position. Entities with a higher `secondary_draw_order` are drawn on top. */
  secondary_draw_order?: number;
}

export type SimpleEntityPrototype = _SimpleEntityPrototype &
  Omit<EntityWithHealthPrototype, keyof _SimpleEntityPrototype>;

export function isSimpleEntityPrototype(
  value: unknown,
): value is SimpleEntityPrototype {
  return (value as { type: string }).type === 'simple-entity';
}

/** By default, this entity will be a priority target for units/turrets, who will choose to attack it even if it does not block their path. Use [SimpleEntityWithOwnerPrototype](prototype:SimpleEntityWithOwnerPrototype) for entities that are only attacked when they block enemies. */
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

/** Has a force, but unlike [SimpleEntityWithForcePrototype](prototype:SimpleEntityWithForcePrototype) it is only attacked if the biters get stuck on it (or if [EntityWithOwnerPrototype::is_military_target](prototype:EntityWithOwnerPrototype::is_military_target) set to true to make the two entity types equivalent). */
interface _SimpleEntityWithOwnerPrototype {
  type: 'simple-entity-with-owner';
  /** Mandatory if both `picture` and `pictures` are not defined. */
  animations?: AnimationVariations;
  /** If the entity is not visible to a player, the player cannot select it. */
  force_visibility?: ForceCondition;
  /** Mandatory if both `pictures` and `animations` are not defined. */
  picture?: Sprite;
  /** Mandatory if both `picture` and `animations` are not defined. */
  pictures?: SpriteVariations;
  random_animation_offset?: boolean;
  /** Whether a random graphics variation is chosen when placing the entity/creating it via script/creating it via map generation. If this is false, the entity will use the first variation instead of a random one. */
  random_variation_on_create?: boolean;
  render_layer?: RenderLayer;
  /** Used to determine render order for entities with the same `render_layer` in the same position. Entities with a higher `secondary_draw_order` are drawn on top. */
  secondary_draw_order?: number;
}

export type SimpleEntityWithOwnerPrototype = _SimpleEntityWithOwnerPrototype &
  Omit<EntityWithOwnerPrototype, keyof _SimpleEntityWithOwnerPrototype>;

export function isSimpleEntityWithOwnerPrototype(
  value: unknown,
): value is SimpleEntityWithOwnerPrototype {
  return (value as { type: string }).type === 'simple-entity-with-owner';
}

/** Deprecated in 0.16. The type "simple-smoke" has been obsoleted and cannot be created. Use [TrivialSmokePrototype](prototype:TrivialSmokePrototype) or [SmokeWithTriggerPrototype](prototype:SmokeWithTriggerPrototype) instead. */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface _SimpleSmokePrototype {
  type: 'smoke';
}

export type SimpleSmokePrototype = _SimpleSmokePrototype &
  Omit<SmokePrototype, keyof _SimpleSmokePrototype>;

export function isSimpleSmokePrototype(
  value: unknown,
): value is SimpleSmokePrototype {
  return (value as { type: string }).type === 'smoke';
}

/** Abstract entity that has an animation. */
interface _SmokePrototype {
  /** Smoke always moves randomly unless `movement_slow_down_factor` is 0. If `affected_by_wind` is true, the smoke will also be moved by wind. */
  affected_by_wind?: boolean;
  animation: Animation;
  /** Must have a collision box size of zero. */
  collision_box?: BoundingBox;
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  color?: Color;
  cyclic?: boolean;
  /** May not be 0 if cyclic is true. */
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
  picture: SpriteVariations;
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
  aggregation?: AggregationSpecification;
  allow_random_repeat?: boolean;
  /** Modifies how far a sound can be heard. Must be between `0` and `1` inclusive. */
  audible_distance_modifier?: number;
  category?: SoundType;
  /** Supported sound file formats are `.ogg`, `.wav` and `.voc`.

Only loaded if `variations` is not defined. */
  filename: FileName;
  game_controller_vibration_data?: GameControllerVibrationData;
  /** Must be `>= min_speed`.

Only loaded if `variations` is not defined. Only loaded, and mandatory if `min_speed` is defined. */
  max_speed?: number;
  /** Must be `>= 1 / 64`.

Only loaded if both `variations` and `speed` are not defined. */
  min_speed?: number;
  /** Name of the sound. Can be used as a [SoundPath](runtime:SoundPath) at runtime. */
  name: string;
  /** Only loaded if `variations` is not defined. */
  preload?: boolean;
  /** Speed must be `>= 1 / 64`. This sets both min and max speeds.

Only loaded if `variations` is not defined. */
  speed?: number;
  type: 'sound';
  variations?: SoundDefinition[];
  /** Only loaded if `variations` is not defined. */
  volume?: number;
}

export function isSoundPrototype(value: unknown): value is SoundPrototype {
  return (value as { type: string }).type === 'sound';
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
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
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
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  graphics_set: SpiderLegGraphicsSet;
  initial_movement_speed: number;
  minimal_step_size: number;
  movement_acceleration: number;
  movement_based_position_selection_distance: number;
  /** Must be larger than 0. */
  part_length: number;
  target_position_randomisation_distance: number;
  walking_sound_volume_modifier?: number;
}

export type SpiderLegPrototype = _SpiderLegPrototype &
  Omit<EntityWithHealthPrototype, keyof _SpiderLegPrototype>;

export function isSpiderLegPrototype(
  value: unknown,
): value is SpiderLegPrototype {
  return (value as { type: string }).type === 'spider-leg';
}

/** A [spidertron](https://wiki.factorio.com/Spidertron). */
interface _SpiderVehiclePrototype {
  type: 'spider-vehicle';
  automatic_weapon_cycling: boolean;
  /** This is applied whenever the spider shoots (manual and automatic targeting), `automatic_weapon_cycling` is true and the next gun in line (which is then selected) has ammo. When all of the above is the case, the chain_shooting_cooldown_modifier is a multiplier on the remaining shooting cooldown: `cooldown = (remaining_cooldown × chain_shooting_cooldown_modifier)`.

chain_shooting_cooldown_modifier is intended to be in the range of 0 to 1. This means that setting chain_shooting_cooldown_modifier to 0 reduces the remaining shooting cooldown to 0 while a chain_shooting_cooldown_modifier of 1 does not affect the remaining shooting cooldown at all. */
  chain_shooting_cooldown_modifier: number;
  chunk_exploration_radius: number;
  /** Must be a burner energy source when using "burner", otherwise it can also be a void energy source. */
  energy_source: BurnerEnergySource | VoidEnergySource;
  graphics_set: SpiderVehicleGraphicsSet;
  /** The guns this spider vehicle uses. */
  guns?: ItemID[];
  /** The height of the spider affects the shooting height and the drawing of the graphics and lights. */
  height: number;
  inventory_size: ItemStackIndex;
  movement_energy_consumption: Energy;
  spider_engine: SpiderEnginePrototype;
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

/** The [spidertron remote](https://wiki.factorio.com/Spidertron_remote). This remote can only be connected to entities of type [SpiderVehiclePrototype](prototype:SpiderVehiclePrototype). */
interface _SpidertronRemotePrototype {
  type: 'spidertron-remote';
  /** Path to the icon file.

Mandatory if `icon_color_indicator_masks` is not defined.

Uses `icon_size` and `icon_mipmaps` from its [ItemPrototype](prototype:ItemPrototype) parent. */
  icon_color_indicator_mask?: FileName;
  /** Inside IconData, the property for the file path is `icon_color_indicator_mask` instead of `icon`. Can't be an empty array.

Uses `icon_size` and `icon_mipmaps` from its [ItemPrototype](prototype:ItemPrototype) parent. */
  icon_color_indicator_masks?: IconData[];
  /** Count of items of the same name that can be stored in one inventory slot. Must be 1 when the `"not-stackable"` flag is set. */
  stack_size: 1;
}

export type SpidertronRemotePrototype = _SpidertronRemotePrototype &
  Omit<ItemPrototype, keyof _SpidertronRemotePrototype>;

export function isSpidertronRemotePrototype(
  value: unknown,
): value is SpidertronRemotePrototype {
  return (value as { type: string }).type === 'spidertron-remote';
}

/** A [splitter](https://wiki.factorio.com/Splitter). */
interface _SplitterPrototype {
  type: 'splitter';
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  structure: Animation4Way;
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
  blend_mode?: BlendMode;
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
  /** Only loaded if `layers` is not defined.

The path to the sprite file to use. */
  filename: FileName;
  /** Only loaded if `layers` is not defined. */
  flags?: SpriteFlags;
  /** Only loaded if `layers` is not defined.

Unused. */
  generate_sdf?: boolean;
  /** Only loaded if `layers` is not defined. Mandatory if `size` is not defined.

Height of the picture in pixels, from 0-8192. */
  height?: SpriteSizeType;
  /** Only loaded if `layers` is not defined.

If this property exists and high resolution sprites are turned on, this is used to load the Sprite. */
  hr_version?: Sprite;
  /** If this property is present, all Sprite definitions have to be placed as entries in the array, and they will all be loaded from there. `layers` may not be an empty table. Each definition in the array may also have the `layers` property.

If this property is present, all other properties besides `name` and `type` are ignored. */
  layers?: Sprite[];
  /** Only loaded if `layers` is not defined.

Minimal mode is entered when mod loading fails. You are in it when you see the gray box after (part of) the loading screen that tells you a mod error ([Example](https://cdn.discordapp.com/attachments/340530709712076801/532315796626472972/unknown.png)). Modders can ignore this property. */
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
  /** Only loaded if `layers` is not defined.

Values other than `1` specify the scale of the sprite on default zoom. A scale of `2` means that the picture will be two times bigger on screen (and thus more pixelated). */
  scale?: number;
  /** Only loaded if `layers` is not defined.

The shift in tiles. `util.by_pixel()` can be used to divide the shift by 32 which is the usual pixel height/width of 1 tile in normal resolution. Note that 32 pixel tile height/width is not enforced anywhere - any other tile height or width is also possible. */
  shift?: Vector;
  /** Only loaded if `layers` is not defined.

The width and height of the sprite. If this is a tuple, the first member of the tuple is the width and the second is the height. Otherwise the size is both width and height. Width and height may only be in the range of 0-8192. */
  size?: SpriteSizeType | [SpriteSizeType, SpriteSizeType];
  /** Only loaded if `layers` is not defined.

Number of slices this is sliced into when using the "optimized atlas packing" option. If you are a modder, you can just ignore this property. As an example, if this is `4`, the sprite will be sliced into a `4x4` grid. */
  slice?: SpriteSizeType;
  /** Only loaded if `layers` is not defined.

Same as `slice`, but this specifies only how many slices there are on the x-axis. */
  slice_x?: SpriteSizeType;
  /** Only loaded if `layers` is not defined.

Same as `slice`, but this specifies only how many slices there are on the y-axis. */
  slice_y?: SpriteSizeType;
  /** Only loaded if `layers` is not defined. */
  tint?: Color;
  type: 'sprite';
  /** Only loaded if `layers` is not defined. Mandatory if `size` is not defined.

Width of the picture in pixels, from 0-8192. */
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
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  /** Interval between application of `damage_per_tick`, in ticks. */
  damage_interval?: number;
  /** Applied every `damage_interval` ticks, so may not necessarily be "per tick". */
  damage_per_tick?: DamagePrototype;
  /** Must be > 0. */
  duration_in_ticks: number;
  fire_spread_cooldown?: number;
  fire_spread_radius?: number;
  force_visibility?: ForceCondition;
  /** Using this property marks the sticker as a "selection sticker", meaning that the selection box will be rendered around the entity when the sticker is on it. */
  selection_box_type?: CursorBoxType;
  single_particle?: boolean;
  /** If this is given, this sticker is considered a "fire sticker" for some functions, such as [BaseAttackParameters::fire_penalty](prototype:BaseAttackParameters::fire_penalty) and [EntityPrototypeFlags::not-flammable](prototype:EntityPrototypeFlags::not_flammable). */
  spread_fire_entity?: EntityID;
  stickers_per_square_meter?: number;
  /** Less than 1 to reduce movement speed, more than 1 to increase it. */
  target_movement_modifier?: number;
  /** The modifier value when the sticker is attached. It linearly changes over time to reach `target_movement_modifier_to`. */
  target_movement_modifier_from?: number;
  /** The modifier value when the sticker expires. It linearly changes over time starting from `target_movement_modifier_from`. */
  target_movement_modifier_to?: number;
  vehicle_friction_modifier?: number;
  /** Works similarly to `target_movement_modifier_from`. */
  vehicle_friction_modifier_from?: number;
  /** Works similarly to `target_movement_modifier_to`. */
  vehicle_friction_modifier_to?: number;
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
  /** Mandatory if circuit_wire_max_distance  > 0. */
  circuit_connector_sprites?: [
    CircuitConnectorSprites,
    CircuitConnectorSprites,
    CircuitConnectorSprites,
    CircuitConnectorSprites,
  ];
  /** Mandatory if circuit_wire_max_distance  > 0. */
  circuit_wire_connection_points?: [
    WireConnectionPoint,
    WireConnectionPoint,
    WireConnectionPoint,
    WireConnectionPoint,
  ];
  circuit_wire_max_distance?: number;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  /** Must be positive.

Used for determining the x position inside the `flow_sprite` when drawing the storage tank. Does not affect gameplay.

The x position of the sprite will be `((game.tick % flow_length_in_ticks) ÷ flow_length_in_ticks) × (flow_sprite.width - 32)`. This means, that over `flow_length_in_ticks` ticks, the part of the `flow_sprite` that is drawn in-game is incrementally moved from most-left to most-right inside the actual sprite, that part always has a width of 32px. After `flow_length_in_ticks`, the part of the `flow_sprite` that is drawn will start from the left again. */
  flow_length_in_ticks: number;
  fluid_box: FluidBox;
  pictures: StorageTankPictures;
  /** If the icons of fluids shown in alt-mode should be scaled to the storage tank's size. */
  scale_info_icons?: boolean;
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
  bending_type?: 'straight';
}

export type StraightRailPrototype = _StraightRailPrototype &
  Omit<RailPrototype, keyof _StraightRailPrototype>;

export function isStraightRailPrototype(
  value: unknown,
): value is StraightRailPrototype {
  return (value as { type: string }).type === 'straight-rail';
}

/** A [technology](https://wiki.factorio.com/Technologies).

This prototype has two different formats that can be specified. If both `normal` and `expensive` are not defined, the standard properties define this technology. Otherwise, they are ignored, and the `normal` and `expensive` properties are used exclusively to define this technology. */
interface _TechnologyPrototype {
  type: 'technology';
  /** List of effects of the technology (applied when the technology is researched).

Only loaded if neither `normal` nor `expensive` are defined. */
  effects?: Modifier[];
  /** Only loaded if neither `normal` nor `expensive` are defined. */
  enabled?: boolean;
  /** Can be set to `false` if the `normal` property is defined. This will disable this difficulty, same as setting `enabled` to `false` would. If it's later manually enabled by script, it will use the data from `normal`.

If this property is not defined while `normal` is, it will mirror its data. */
  expensive?: TechnologyData | false;
  /** Hides the technology from the tech screen.

Only loaded if neither `normal` nor `expensive` are defined. */
  hidden?: boolean;
  /** Path to the icon file.

Mandatory if `icons` is not defined. */
  icon?: FileName;
  /** Icons of reduced size will be used at decreased scale. */
  icon_mipmaps?: IconMipMapType;
  /** The size of the square icon, in pixels, e.g. `32` for a 32px by 32px icon.

Mandatory if `icons` is not defined, or if `icon_size` is not specified for all instances of `icons`. */
  icon_size?: SpriteSizeType;
  /** Can't be an empty array. */
  icons?: IconData[];
  /** Controls whether the technology cost ignores the tech cost multiplier set in the [DifficultySettings](runtime:DifficultySettings), e.g. `4` for the default expensive difficulty.

Only loaded if neither `normal` nor `expensive` are defined. */
  ignore_tech_cost_multiplier?: boolean;
  /** `"infinite"` for infinite technologies, otherwise `uint32`.

Defaults to the same level as the technology, which is `0` for non-upgrades, and the level of the upgrade for upgrades.

Only loaded if neither `normal` nor `expensive` are defined. */
  max_level?: number | 'infinite';
  /** If this name ends with `-<number>`, that number is ignored for localization purposes. E.g. if the name is `technology-3`, the game looks for the `technology-name.technology` localization. The technology tree will also show the number on the technology icon. */
  name: string;
  /** Can be set to `false` if the `expensive` property is defined. This will disable this difficulty, same as setting `enabled` to `false` would. If it's later manually enabled by script, it will use the data from `expensive`.

If this property is not defined while `expensive` is, it will mirror its data. */
  normal?: TechnologyData | false;
  /** List of technologies needed to be researched before this one can be researched.

Only loaded if neither `normal` nor `expensive` are defined. */
  prerequisites?: TechnologyID[];
  /** Determines the cost in items and time of the technology.

Mandatory if neither `normal` nor `expensive` are defined. */
  unit?: TechnologyUnit;
  /** When set to true, and the technology contains several levels, only the relevant one is displayed in the technology screen.

Only loaded if neither `normal` nor `expensive` are defined. */
  upgrade?: boolean;
  /** Controls whether the technology is shown in the tech GUI when it is not `enabled`.

Only loaded if neither `normal` nor `expensive` are defined. */
  visible_when_disabled?: boolean;
}

export type TechnologyPrototype = _TechnologyPrototype &
  Omit<PrototypeBase, keyof _TechnologyPrototype>;

export function isTechnologyPrototype(
  value: unknown,
): value is TechnologyPrototype {
  return (value as { type: string }).type === 'technology';
}

/** Used to define the parameters for the water shader. */
export interface TileEffectDefinition {
  animation_scale: number | [number, number];
  animation_speed: number;
  dark_threshold: number | [number, number];
  far_zoom?: number;
  foam_color: Color;
  foam_color_multiplier: number;
  /** Name of the tile-effect. Base game uses "water". */
  name: string;
  near_zoom?: number;
  reflection_threshold: number | [number, number];
  specular_lightness: Color;
  specular_threshold: number | [number, number];
  /** Sprite size must be 512x512. */
  texture: Sprite;
  tick_scale: number;
  type: 'tile-effect';
}

export function isTileEffectDefinition(
  value: unknown,
): value is TileEffectDefinition {
  return (value as { type: string }).type === 'tile-effect';
}

/** The entity used for tile ghosts. */
interface _TileGhostPrototype {
  type: 'tile-ghost';
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
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
  /** Array of tile names that are allowed next to this one. */
  allowed_neighbors?: TileID[];
  autoplace?: AutoplaceSpecification;
  /** If this is loaded as one Sound, it is loaded as the "small" build sound. */
  build_sound?: Sound | TileBuildSound;
  can_be_part_of_blueprint?: boolean;
  /** If set to true, the game will check for collisions with entities before building or mining the tile. If entities are in the way it is not possible to mine/build the tile. */
  check_collision_with_entities?: boolean;
  collision_mask: CollisionMask;
  decorative_removal_probability?: number;
  /** Used only for the `layer_group` default, see above. */
  draw_in_water_layer?: boolean;
  /** Name of a [TileEffectDefinition](prototype:TileEffectDefinition). */
  effect?: string;
  effect_color?: Color;
  /** Used by the [pollution](https://wiki.factorio.com/Pollution) shader. */
  effect_color_secondary?: Color;
  effect_is_opaque?: boolean;
  /** Path to the icon file. If this and `icon` is not set, the `material_background` in `variants` is used as the icon.

Only loaded if `icons` is not defined. */
  icon?: FileName;
  /** Icons of reduced size will be used at decreased scale. */
  icon_mipmaps?: IconMipMapType;
  /** The size of the square icon, in pixels, e.g. `32` for a 32px by 32px icon.

Only loaded if `icons` is not defined, or if `icon_size` is not specified for all instances of `icons`. */
  icon_size?: SpriteSizeType;
  /** Can't be an empty array. If this and `icon` is not set, the `material_background` in `variants` is used as the icon. */
  icons?: IconData[];
  /** Specifies transition drawing priority. */
  layer: number;
  layer_group?: TileRenderLayer;
  map_color: Color;
  /** If you want the tile to not be mineable, don't specify the minable property. Only non-mineable tiles become hidden tiles when placing mineable tiles on top of them. */
  minable?: MinableProperties;
  mined_sound?: Sound;
  /** Whether the tile needs tile correction logic applied when it's generated in the world, to prevent graphical artifacts. The tile correction logic disallows 1-wide stripes of the tile, see [Friday Facts #346](https://factorio.com/blog/post/fff-346). */
  needs_correction?: boolean;
  next_direction?: TileID;
  placeable_by?: ItemToPlace | ItemToPlace[];
  /** Emissions absorbed per second by this tile. Use a negative value if pollution is created instead of removed. */
  pollution_absorption_per_second: number;
  scorch_mark_color?: Color;
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
}

export type TilePrototype = _TilePrototype &
  Omit<PrototypeBase, keyof _TilePrototype>;

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
  image?: FileName;
  /** The tips and tricks entry is indented by `indent`×6 spaces. */
  indent?: number;
  /** Whether the tip title on the left in the tips and tricks GUI should use the "title_tip_item" style (semi bold font). */
  is_title?: boolean;
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
  /** The durability of this tool. Must be positive. Mandatory if <code>infinite</code> is false. Ignored if <code>infinite</code> is true. */
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
  /** Whether this tool has infinite durability. If this is false, <code>durability</code> must be specified. */
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
  /** Mandatory if circuit_wire_max_distance > 0. */
  circuit_connector_sprites?: [
    CircuitConnectorSprites,
    CircuitConnectorSprites,
    CircuitConnectorSprites,
    CircuitConnectorSprites,
  ];
  /** Mandatory if circuit_wire_max_distance > 0. */
  circuit_wire_connection_points?: [
    WireConnectionPoint,
    WireConnectionPoint,
    WireConnectionPoint,
    WireConnectionPoint,
  ];
  circuit_wire_max_distance?: number;
  color?: Color;
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
  animation_speed_coefficient?: number;
  /** This is the preferred way to specify transport belt animations. */
  belt_animation_set?: TransportBeltAnimationSet;
  /** Mandatory if `belt_animation_set` is not defined. */
  belt_horizontal?: Animation;
  /** Mandatory if `belt_animation_set` is not defined. */
  belt_vertical?: Animation;
  /** Transport belt connectable entities must have [collision_box](prototype:EntityPrototype::collision_box) of an appropriate minimal size, they should occupy more than half of every tile the entity covers. */
  collision_box?: BoundingBox;
  /** Transport belt connectable entities must collide with "transport-belt-layer". Transport belt connectable entities must have collision_mask that collides with itself. Transport belt connectable entities cannot have collision mask that collides only with tiles (must collide with entities in some way). */
  collision_mask?: CollisionMask;
  /** Mandatory if `belt_animation_set` is not defined. */
  ending_bottom?: Animation;
  /** Mandatory if `belt_animation_set` is not defined. */
  ending_patch?: Sprite4Way;
  /** Mandatory if `belt_animation_set` is not defined. */
  ending_side?: Animation;
  /** Mandatory if `belt_animation_set` is not defined. */
  ending_top?: Animation;
  ends_with_stopper?: boolean;
  /** Transport belt connectable entities cannot have the "placeable-off-grid" flag specified. */
  flags?: EntityPrototypeFlags;
  /** The speed of the belt: `speed × 480 = x Items/second`.

The raw value is expressed as the number of tiles traveled by each item on the belt per tick, relative to the belt's maximum density - e.g. `x items/second ÷ (4 items/lane × 2 lanes/belt × 60 ticks/second) = <speed> belts/tick` where a "belt" is the size of one tile. See [Transport_belts/Physics](https://wiki.factorio.com/Transport_belts/Physics) for more details.

Must be a positive non-infinite number. The number is a fixed point number with 8 bits reserved for decimal precision, meaning the smallest value step is `1/2^8 = 0.00390625`. In the simple case of a non-curved belt, the rate is multiples of `1.875` items/s, even though the entity tooltip may show a different rate. */
  speed: number;
  /** Mandatory if `belt_animation_set` is not defined. */
  starting_bottom?: Animation;
  /** Mandatory if `belt_animation_set` is not defined. */
  starting_side?: Animation;
  /** Mandatory if `belt_animation_set` is not defined. */
  starting_top?: Animation;
}

export type TransportBeltConnectablePrototype =
  _TransportBeltConnectablePrototype &
    Omit<EntityWithOwnerPrototype, keyof _TransportBeltConnectablePrototype>;
/** A [transport belt](https://wiki.factorio.com/Transport_belt). */
interface _TransportBeltPrototype {
  type: 'transport-belt';
  /** Mandatory if `belt_animation_set` is not defined.

Transport belts must have 12 animations. */
  animations?: RotatedAnimation;
  /** This is the preferred way to specify transport belt animations. */
  belt_animation_set?: TransportBeltAnimationSetWithCorners;
  /** The pictures displayed for circuit connections to this transport belt. */
  circuit_connector_sprites?: CircuitConnectorSprites[];
  /** Defines how wires visually connect to this transport belt. */
  circuit_wire_connection_point?: WireConnectionPoint[];
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  connector_frame_sprites: TransportBeltConnectorFrame;
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
  variation_weights?: number[];
  /** Can't be empty. */
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
  Omit<PrototypeBase, keyof _TrivialSmokePrototype>;

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
  attacking_animation?: RotatedAnimation4Way;
  /** Controls the speed of the attacking_animation: `1 ÷ attacking_speed = duration of the attacking_animation` */
  attacking_speed?: number;
  base_picture?: Animation4Way;
  base_picture_render_layer?: RenderLayer;
  base_picture_secondary_draw_order?: number;
  call_for_help_radius: number;
  /** Specifies the name of the [CorpsePrototype](prototype:CorpsePrototype) to be used when this entity dies. */
  corpse?: EntityID;
  dying_sound?: Sound;
  ending_attack_animation?: RotatedAnimation4Way;
  /** Controls the speed of the ending_attack_animation: `1 ÷ ending_attack_speed = duration of the ending_attack_animation` */
  ending_attack_speed?: number;
  energy_glow_animation?: RotatedAnimation4Way;
  /** The range of the flickering of the alpha of `energy_glow_animation`. Default is range 0.2, so animation alpha can be anywhere between 0.8 and 1.0. */
  energy_glow_animation_flicker_strength?: number;
  folded_animation: RotatedAnimation4Way;
  /** It's randomized whether a particular turret uses the primary or the secondary speed for its animations.

Controls the speed of the folded_animation: `1 ÷ folded_speed = duration of the folded_animation` */
  folded_speed?: number;
  /** It's randomized whether a particular turret uses the primary or the secondary speed for its animations.

Controls the speed of the folded_animation: `1 ÷ folded_speed_secondary = duration of the folded_animation` */
  folded_speed_secondary?: number;
  folding_animation?: RotatedAnimation4Way;
  folding_sound?: Sound;
  /** Controls the speed of the folding_animation: `1 ÷ folding_speed = duration of the folding_animation` */
  folding_speed?: number;
  /** The intensity of light in the form of `energy_glow_animation` drawn on top of `energy_glow_animation`. */
  glow_light_intensity?: number;
  gun_animation_render_layer?: RenderLayer;
  gun_animation_secondary_draw_order?: number;
  ignore_target_mask?: TriggerTargetMask;
  integration?: Sprite;
  /** Whether this prototype should be a high priority target for enemy forces. See [Military units and structures](https://wiki.factorio.com/Military_units_and_structures). */
  is_military_target?: boolean;
  prepare_range?: number;
  prepared_alternative_animation?: RotatedAnimation4Way;
  /** The chance for `prepared_alternative_animation` to be used. */
  prepared_alternative_chance?: number;
  prepared_alternative_sound?: Sound;
  /** It's randomized whether a particular turret uses the primary or the secondary speed for its animations.

Controls the speed of the prepared_alternative_animation: `1 ÷ prepared_alternative_speed = duration of the prepared_alternative_animation` */
  prepared_alternative_speed?: number;
  /** It's randomized whether a particular turret uses the primary or the secondary speed for its animations.

Controls the speed of the prepared_alternative_animation: `1 ÷ prepared_alternative_speed_secondary = duration of the prepared_alternative_animation` */
  prepared_alternative_speed_secondary?: number;
  prepared_animation?: RotatedAnimation4Way;
  prepared_sound?: Sound;
  /** It's randomized whether a particular turret uses the primary or the secondary speed for its animations.

Controls the speed of the prepared_animation: `1 ÷ prepared_speed = duration of the prepared_animation` */
  prepared_speed?: number;
  /** It's randomized whether a particular turret uses the primary or the secondary speed for its animations.

Controls the speed of the prepared_animation: `1 ÷ prepared_speed_secondary = duration of the prepared_animation` */
  prepared_speed_secondary?: number;
  preparing_animation?: RotatedAnimation4Way;
  preparing_sound?: Sound;
  /** Controls the speed of the preparing_animation: `1 ÷ preparing_speed = duration of the preparing_animation` */
  preparing_speed?: number;
  random_animation_offset?: boolean;
  rotation_speed?: number;
  /** Whether the secondary (animation) speeds should always be used. */
  secondary_animation?: boolean;
  shoot_in_prepare_state?: boolean;
  /** Decoratives to be created when the spawner is created by the [map generator](https://wiki.factorio.com/Map_generator). Placed when enemies expand if `spawn_decorations_on_expansion` is set to true. */
  spawn_decoration?:
    | CreateDecorativesTriggerEffectItem
    | CreateDecorativesTriggerEffectItem[];
  /** Whether `spawn_decoration` should be spawned when this turret is created through [enemy expansion](https://wiki.factorio.com/Enemies#Expansions). */
  spawn_decorations_on_expansion?: boolean;
  starting_attack_animation?: RotatedAnimation4Way;
  starting_attack_sound?: Sound;
  /** Controls the speed of the starting_attack_animation: `1 ÷ starting_attack_speed = duration of the starting_attack_animation` */
  starting_attack_speed?: number;
  turret_base_has_direction?: boolean;
}

export type TurretPrototype = _TurretPrototype &
  Omit<EntityWithOwnerPrototype, keyof _TurretPrototype>;

export function isTurretPrototype(value: unknown): value is TurretPrototype {
  return (value as { type: string }).type === 'turret';
}

/** The definition of the tutorial to be used in the tips and tricks, see [TipsAndTricksItem](prototype:TipsAndTricksItem). The actual tutorial code is defined in the tutorials folder, in the folder that has the name of the scenario property. */
interface _TutorialDefinition {
  type: 'tutorial';
  /** Name of the folder for this tutorial in the tutorials folder. */
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
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  max_distance: number;
  structure: UndergroundBeltStructure;
  underground_remove_belts_sprite?: Sprite;
  underground_sprite: Sprite;
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
  affected_by_tiles?: boolean;
  ai_settings?: UnitAISettings;
  /** If this is true, this entities `is_military_target property` can be changed runtime (on the entity, not on the prototype itself). */
  allow_run_time_change_of_is_military_target?: false;
  alternative_attacking_frame_sequence?: UnitAlternativeFrameSequence;
  /** Requires animation in attack_parameters. Requires ammo_type in attack_parameters. */
  attack_parameters: AttackParameters;
  can_open_gates?: boolean;
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
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
  /** The amount of pollution that has to be absorbed by the unit's spawner before the unit will leave the spawner and attack the source of the pollution. */
  pollution_to_join_attack: number;
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
}

export type UnitPrototype = _UnitPrototype &
  Omit<EntityWithOwnerPrototype, keyof _UnitPrototype>;

export function isUnitPrototype(value: unknown): value is UnitPrototype {
  return (value as { type: string }).type === 'unit';
}

/** An [upgrade planner](https://wiki.factorio.com/Upgrade_planner). */
interface _UpgradeItemPrototype {
  type: 'upgrade-item';
  /** This property is parsed, but then ignored. */
  alt_entity_filter_mode?: 'whitelist' | 'blacklist';
  /** This property is parsed, but then ignored. */
  alt_entity_filters?: EntityID[];
  /** This property is parsed, but then ignored. */
  alt_entity_type_filters?: string[];
  /** This property is hardcoded to `"cancel-upgrade"`. */
  alt_selection_mode?: SelectionModeFlags;
  /** This property is parsed, but then ignored. */
  alt_tile_filter_mode?: 'whitelist' | 'blacklist';
  /** This property is parsed, but then ignored. */
  alt_tile_filters?: TileID[];
  /** This property is hardcoded to `false`. */
  always_include_tiles?: boolean;
  /** This property is parsed, but then ignored. */
  entity_filter_mode?: 'whitelist' | 'blacklist';
  /** This property is parsed, but then ignored. */
  entity_filters?: EntityID[];
  /** This property is parsed, but then ignored. */
  entity_type_filters?: string[];
  /** Can't be > 255. */
  mapper_count?: ItemStackIndex;
  /** This property is hardcoded to `"upgrade"`. */
  selection_mode?: SelectionModeFlags;
  /** Count of items of the same name that can be stored in one inventory slot. Must be 1 when the `"not-stackable"` flag is set. */
  stack_size: 1;
  /** This property is parsed, but then ignored. */
  tile_filter_mode?: 'whitelist' | 'blacklist';
  /** This property is parsed, but then ignored. */
  tile_filters?: TileID[];
}

export type UpgradeItemPrototype = _UpgradeItemPrototype &
  Omit<SelectionToolPrototype, keyof _UpgradeItemPrototype>;

export function isUpgradeItemPrototype(
  value: unknown,
): value is UpgradeItemPrototype {
  return (value as { type: string }).type === 'upgrade-item';
}

/** Constants used by the game that are not specific to certain prototypes. See [utility-constants.lua](https://github.com/wube/factorio-data/blob/master/core/prototypes/utility-constants.lua) for the values used by the base game. */
interface _UtilityConstants {
  type: 'utility-constants';
  artillery_range_visualization_color: Color;
  /** The base game uses more entries here that are applied via the [ammo categories](https://github.com/wube/factorio-data/blob/master/base/prototypes/categories/ammo-category.lua#L72-L76). */
  bonus_gui_ordering: BonusGuiOrdering;
  building_buildable_tint: Color;
  building_buildable_too_far_tint: Color;
  building_ignorable_tint: Color;
  building_no_tint: Color;
  building_not_buildable_tint: Color;
  capsule_range_visualization_color: Color;
  /** Chart = map + minimap. */
  chart: ChartUtilityConstants;
  checkerboard_black: Color;
  checkerboard_white: Color;
  clipboard_history_size: number;
  color_filters: ColorFilterData[];
  count_button_size: number;
  daytime_color_lookup: DaytimeColorLookupTable;
  deconstruct_mark_tint: Color;
  default_alert_icon_scale: number;
  default_alert_icon_scale_by_type?: Record<string, number>;
  default_alert_icon_shift_by_type?: Record<string, Vector>;
  default_enemy_force_color: Color;
  default_other_force_color: Color;
  default_player_force_color: Color;
  default_scorch_mark_color: Color;
  /** The strings are entity types. */
  default_trigger_target_mask_by_type?: Record<string, TriggerTargetMask>;
  disabled_recipe_slot_background_tint: Color;
  disabled_recipe_slot_tint: Color;
  dynamic_recipe_overload_factor: number;
  enabled_recipe_slot_tint: Color;
  entity_button_background_color: Color;
  entity_renderer_search_box_limits: EntityRendererSearchBoxLimits;
  equipment_default_background_border_color: Color;
  equipment_default_background_color: Color;
  equipment_default_grabbed_background_color: Color;
  filter_outline_color: Color;
  /** Must be >= 1 */
  flying_text_ttl: number;
  forced_enabled_recipe_slot_background_tint: Color;
  ghost_tint: Color;
  gui_remark_color: Color;
  icon_shadow_color: Color;
  icon_shadow_inset: number;
  icon_shadow_radius: number;
  icon_shadow_sharpness: number;
  /** Must be in range [1, 100]. */
  inventory_width: number;
  item_outline_color: Color;
  item_outline_inset: number;
  item_outline_radius: number;
  item_outline_sharpness: number;
  /** Can be set to anything from range 0 to 255, but larger values will be clamped to 160. Setting it to larger values can have performance impact (growing geometrically). */
  light_renderer_search_distance_limit: number;
  main_menu_background_image_location: FileName;
  main_menu_background_vignette_intensity: number;
  main_menu_background_vignette_sharpness: number;
  /** The strings represent the names of the simulations. */
  main_menu_simulations: Record<string, SimulationDefinition>;
  manual_rail_building_reach_modifier: number;
  map_editor: MapEditorConstants;
  max_terrain_building_size: number;
  maximum_recipe_overload_multiplier: number;
  medium_area_size: number;
  medium_blueprint_area_size: number;
  minimum_recipe_overload_multiplier: number;
  missing_preview_sprite_location: FileName;
  /** Must be in range [1, 100]. */
  module_inventory_width: number;
  /** Must be >= 1. */
  normalised_achievement_icon_size: number;
  /** The table with `name = "default"` must exist and be the first member of the array. */
  player_colors: PlayerColorData[];
  rail_planner_count_button_color: Color;
  rail_segment_colors: Color[];
  recipe_step_limit: number;
  script_command_console_chat_color: Color;
  /** Must be in range [1, 100]. */
  select_group_row_count: number;
  /** Must be in range [1, 100]. */
  select_slot_row_count: number;
  server_command_console_chat_color: Color;
  small_area_size: number;
  small_blueprint_area_size: number;
  tile_ghost_tint: Color;
  /** Must be >= 1. */
  tooltip_monitor_edge_border: number;
  train_button_hovered_tint: Color;
  train_destination_full_color: Color;
  train_inactivity_wait_condition_default: number;
  train_no_path_color: Color;
  train_path_finding: TrainPathFinderConstants;
  train_temporary_stop_wait_time: number;
  train_time_wait_condition_default: number;
  tree_leaf_distortion_distortion_far: Vector;
  tree_leaf_distortion_distortion_near: Vector;
  tree_leaf_distortion_speed_far: Vector;
  tree_leaf_distortion_speed_near: Vector;
  tree_leaf_distortion_strength_far: Vector;
  tree_leaf_distortion_strength_near: Vector;
  tree_shadow_roughness: number;
  tree_shadow_speed: number;
  turret_range_visualization_color: Color;
  /** Must be >= 1. */
  tutorial_notice_icon_size: number;
  unit_group_max_pursue_distance: number;
  unit_group_pathfind_resolution: number;
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
  blueprint_selection_ended: Sound;
  blueprint_selection_started: Sound;
  build_blueprint_large: Sound;
  build_blueprint_medium: Sound;
  build_blueprint_small: Sound;
  build_large: Sound;
  build_medium: Sound;
  build_small: Sound;
  cancel_deconstruction_selection_ended: Sound;
  cancel_deconstruction_selection_started: Sound;
  cannot_build: Sound;
  clear_cursor: Sound;
  confirm: Sound;
  console_message: Sound;
  copy_activated: Sound;
  crafting_finished: Sound;
  cut_activated: Sound;
  deconstruct_big: Sound;
  deconstruct_medium: Sound;
  deconstruct_robot: Sound;
  deconstruct_small: Sound;
  deconstruction_selection_ended: Sound;
  deconstruction_selection_started: Sound;
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
  rotated_big: Sound;
  rotated_medium: Sound;
  rotated_small: Sound;
  scenario_message: Sound;
  smart_pipette: Sound;
  switch_gun: Sound;
  tutorial_notice: Sound;
  undo: Sound;
  upgrade_selection_ended: Sound;
  upgrade_selection_started: Sound;
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
  achievement_label_failed: Sprite;
  achievement_label_locked: Sprite;
  achievement_label_unlocked: Sprite;
  achievement_label_unlocked_off: Sprite;
  add: Sprite;
  alert_arrow: Sprite;
  ammo_damage_modifier_constant?: Sprite;
  ammo_damage_modifier_icon: Sprite;
  ammo_icon: Sprite;
  and_or: Sprite;
  area_icon: Sprite;
  arrow_button: Animation;
  artillery_range_modifier_constant?: Sprite;
  artillery_range_modifier_icon: Sprite;
  bar_gray_pip: Sprite;
  battery: Sprite;
  bookmark: Sprite;
  brush_circle_shape: Sprite;
  brush_icon: Sprite;
  brush_square_shape: Sprite;
  cable_editor_icon: Sprite;
  center: Sprite;
  change_recipe: Sprite;
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
  character_logistic_slots_modifier_constant?: Sprite;
  character_logistic_slots_modifier_icon: Sprite;
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
  circuit_network_panel_black: Sprite;
  circuit_network_panel_white: Sprite;
  cliff_editor_icon: Sprite;
  clock: Sprite;
  clone: Sprite;
  clone_editor_icon: Sprite;
  close_black: Sprite;
  close_fat: Sprite;
  close_map_preview: Sprite;
  close_white: Sprite;
  clouds: Animation;
  collapse: Sprite;
  collapse_dark: Sprite;
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
  copy: Sprite;
  covered_chunk: Sprite;
  crafting_machine_recipe_not_unlocked: Sprite;
  cross_select: Sprite;
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
  destroyed_icon: Sprite;
  down_arrow: Sprite;
  downloaded: Sprite;
  downloaded_white: Sprite;
  downloading: Sprite;
  downloading_white: Sprite;
  dropdown: Sprite;
  editor_pause: Sprite;
  editor_play: Sprite;
  editor_selection: Sprite;
  editor_speed_down: Sprite;
  editor_speed_up: Sprite;
  electricity_icon: Sprite;
  electricity_icon_unplugged: Sprite;
  enemy_force_icon: Sprite;
  enter: Sprite;
  entity_editor_icon: Sprite;
  entity_info_dark_background: Sprite;
  equipment_collision: Sprite;
  equipment_grid: Sprite;
  equipment_slot: Sprite;
  expand: Sprite;
  expand_dark: Sprite;
  expand_dots: Sprite;
  expand_dots_white: Sprite;
  explosion_chart_visualization: Animation;
  export: Sprite;
  export_slot: Sprite;
  favourite_server_icon: Sprite;
  fluid_icon: Sprite;
  fluid_indication_arrow: Sprite;
  fluid_indication_arrow_both_ways: Sprite;
  follower_robot_lifetime_modifier_constant?: Sprite;
  follower_robot_lifetime_modifier_icon: Sprite;
  force_editor_icon: Sprite;
  fuel_icon: Sprite;
  game_stopped_visualization: Sprite;
  ghost_bar_pip: Sprite;
  ghost_cursor: Sprite;
  ghost_time_to_live_modifier_constant?: Sprite;
  ghost_time_to_live_modifier_icon: Sprite;
  give_item_modifier_constant?: Sprite;
  give_item_modifier_icon: Sprite;
  go_to_arrow: Sprite;
  gps_map_icon: Sprite;
  gradient: Sprite;
  green_circle: Sprite;
  green_dot: Sprite;
  green_wire: Sprite;
  green_wire_hightlight: Sprite;
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
  laboratory_productivity_modifier_constant?: Sprite;
  laboratory_productivity_modifier_icon: Sprite;
  laboratory_speed_modifier_constant?: Sprite;
  laboratory_speed_modifier_icon: Sprite;
  left_arrow: Sprite;
  light_cone: Sprite;
  light_medium: Sprite;
  light_small: Sprite;
  line_icon: Sprite;
  list_view: Sprite;
  logistic_network_panel_black: Sprite;
  logistic_network_panel_white: Sprite;
  logistic_radius_visualization: Sprite;
  lua_snippet_tool_icon: Sprite;
  map: Sprite;
  map_exchange_string: Sprite;
  max_failed_attempts_per_tick_per_construction_queue_modifier_constant?: Sprite;
  max_failed_attempts_per_tick_per_construction_queue_modifier_icon: Sprite;
  max_successful_attempts_per_tick_per_construction_queue_modifier_constant?: Sprite;
  max_successful_attempts_per_tick_per_construction_queue_modifier_icon: Sprite;
  maximum_following_robots_count_modifier_constant?: Sprite;
  maximum_following_robots_count_modifier_icon: Sprite;
  medium_gui_arrow: Sprite;
  mining_drill_productivity_bonus_modifier_constant?: Sprite;
  mining_drill_productivity_bonus_modifier_icon: Sprite;
  missing_icon: Sprite;
  missing_mod_icon: Sprite;
  mod_dependency_arrow: Sprite;
  mouse_cursor: Sprite;
  multiplayer_waiting_icon: Sprite;
  nature_icon: Sprite;
  neutral_force_icon: Sprite;
  no_building_material_icon: Sprite;
  no_nature_icon: Sprite;
  no_storage_space_icon: Sprite;
  none_editor_icon: Sprite;
  not_available: Sprite;
  not_enough_construction_robots_icon: Sprite;
  not_enough_repair_packs_icon: Sprite;
  not_played_yet_dark_green: Sprite;
  not_played_yet_green: Sprite;
  nothing_modifier_constant?: Sprite;
  nothing_modifier_icon: Sprite;
  notification: Sprite;
  output_console_gradient: Sprite;
  paint_bucket_icon: Sprite;
  pause: Sprite;
  placement_indicator_leg: Sprite;
  play: Sprite;
  played_dark_green: Sprite;
  played_green: Sprite;
  player_force_icon: Sprite;
  preset: Sprite;
  pump_cannot_connect_icon: Sprite;
  questionmark: Sprite;
  rail_path_not_possible: Sprite;
  rail_planner_indication_arrow: Sprite;
  rail_planner_indication_arrow_too_far: Sprite;
  rail_signal_placement_indicator: Sprite;
  reassign: Sprite;
  recharge_icon: Sprite;
  red_wire: Sprite;
  red_wire_hightlight: Sprite;
  reference_point: Sprite;
  refresh: Sprite;
  refresh_white: Animation;
  rename_icon_normal: Sprite;
  rename_icon_small_black: Sprite;
  rename_icon_small_white: Sprite;
  reset: Sprite;
  reset_white: Sprite;
  resource_editor_icon: Sprite;
  right_arrow: Sprite;
  robot_slot: Sprite;
  scripting_editor_icon: Sprite;
  search_black: Sprite;
  search_icon: Sprite;
  search_white: Sprite;
  select_icon_black: Sprite;
  select_icon_white: Sprite;
  set_bar_slot: Sprite;
  shield_bar_pip: Sprite;
  shoot_cursor_green: Sprite;
  shoot_cursor_red: Sprite;
  short_indication_line: Sprite;
  short_indication_line_green: Sprite;
  show_electric_network_in_map_view: Sprite;
  show_electric_network_in_map_view_black: Sprite;
  show_logistics_network_in_map_view: Sprite;
  show_logistics_network_in_map_view_black: Sprite;
  show_player_names_in_map_view: Sprite;
  show_player_names_in_map_view_black: Sprite;
  show_pollution_in_map_view: Sprite;
  show_pollution_in_map_view_black: Sprite;
  show_rail_signal_states_in_map_view: Sprite;
  show_rail_signal_states_in_map_view_black: Sprite;
  show_recipe_icons_in_map_view: Sprite;
  show_recipe_icons_in_map_view_black: Sprite;
  show_tags_in_map_view: Sprite;
  show_tags_in_map_view_black: Sprite;
  show_train_station_names_in_map_view: Sprite;
  show_train_station_names_in_map_view_black: Sprite;
  show_turret_range_in_map_view: Sprite;
  show_turret_range_in_map_view_black: Sprite;
  show_worker_robots_in_map_view: Sprite;
  show_worker_robots_in_map_view_black: Sprite;
  shuffle: Sprite;
  side_menu_achievements_hover_icon: Sprite;
  side_menu_achievements_icon: Sprite;
  side_menu_blueprint_library_hover_icon: Sprite;
  side_menu_blueprint_library_icon: Sprite;
  side_menu_bonus_hover_icon: Sprite;
  side_menu_bonus_icon: Sprite;
  side_menu_logistic_network_hover_icon: Sprite;
  side_menu_map_hover_icon: Sprite;
  side_menu_map_icon: Sprite;
  side_menu_menu_hover_icon: Sprite;
  side_menu_menu_icon: Sprite;
  side_menu_production_hover_icon: Sprite;
  side_menu_production_icon: Sprite;
  side_menu_technology_hover_icon: Sprite;
  side_menu_train_hover_icon: Sprite;
  side_menu_train_icon: Sprite;
  side_menu_tutorials_hover_icon: Sprite;
  side_menu_tutorials_icon: Sprite;
  slot: Sprite;
  slot_icon_ammo: Sprite;
  slot_icon_ammo_black: Sprite;
  slot_icon_armor: Sprite;
  slot_icon_armor_black: Sprite;
  slot_icon_fuel: Sprite;
  slot_icon_fuel_black: Sprite;
  slot_icon_gun: Sprite;
  slot_icon_gun_black: Sprite;
  slot_icon_inserter_hand: Sprite;
  slot_icon_inserter_hand_black: Sprite;
  slot_icon_module: Sprite;
  slot_icon_module_black: Sprite;
  slot_icon_resource: Sprite;
  slot_icon_resource_black: Sprite;
  slot_icon_result: Sprite;
  slot_icon_result_black: Sprite;
  slot_icon_robot: Sprite;
  slot_icon_robot_black: Sprite;
  slot_icon_robot_material: Sprite;
  slot_icon_robot_material_black: Sprite;
  small_gui_arrow: Sprite;
  spawn_flag: Sprite;
  speed_down: Sprite;
  speed_up: Sprite;
  spray_icon: Sprite;
  stack_inserter_capacity_bonus_modifier_constant?: Sprite;
  stack_inserter_capacity_bonus_modifier_icon: Sprite;
  station_name: Sprite;
  status_not_working: Sprite;
  status_working: Sprite;
  status_yellow: Sprite;
  stop: Sprite;
  surface_editor_icon: Sprite;
  sync_mods: Sprite;
  technology_black: Sprite;
  technology_white: Sprite;
  tick_custom: Sprite;
  tick_once: Sprite;
  tick_sixty: Sprite;
  tile_editor_icon: Sprite;
  tile_ghost_cursor: Sprite;
  time_editor_icon: Sprite;
  too_far: Sprite;
  too_far_from_roboport_icon: Sprite;
  track_button: Sprite;
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
  underground_pipe_connection: Sprite;
  underground_remove_belts: Sprite;
  underground_remove_pipes: Sprite;
  unlock_recipe_modifier_constant?: Sprite;
  unlock_recipe_modifier_icon: Sprite;
  upgrade_blueprint: Sprite;
  upgrade_mark: Sprite;
  variations_tool_icon: Sprite;
  warning: Sprite;
  warning_icon: Sprite;
  warning_white: Sprite;
  white_mask: Sprite;
  white_square: Sprite;
  wire_shadow: Sprite;
  worker_robot_battery_modifier_constant?: Sprite;
  worker_robot_battery_modifier_icon: Sprite;
  worker_robot_speed_modifier_constant?: Sprite;
  worker_robot_speed_modifier_icon: Sprite;
  worker_robot_storage_modifier_constant?: Sprite;
  worker_robot_storage_modifier_icon: Sprite;
  zoom_to_world_blueprint_enabled_modifier_constant?: Sprite;
  zoom_to_world_blueprint_enabled_modifier_icon: Sprite;
  zoom_to_world_deconstruction_planner_enabled_modifier_constant?: Sprite;
  zoom_to_world_deconstruction_planner_enabled_modifier_icon: Sprite;
  zoom_to_world_enabled_modifier_constant?: Sprite;
  zoom_to_world_enabled_modifier_icon: Sprite;
  zoom_to_world_ghost_building_enabled_modifier_constant?: Sprite;
  zoom_to_world_ghost_building_enabled_modifier_icon: Sprite;
  zoom_to_world_selection_tool_enabled_modifier_constant?: Sprite;
  zoom_to_world_selection_tool_enabled_modifier_icon: Sprite;
  zoom_to_world_upgrade_planner_enabled_modifier_constant?: Sprite;
  zoom_to_world_upgrade_planner_enabled_modifier_icon: Sprite;
}

export type UtilitySprites = _UtilitySprites &
  Omit<PrototypeBase, keyof _UtilitySprites>;

export function isUtilitySprites(value: unknown): value is UtilitySprites {
  return (value as { type: string }).type === 'utility-sprites';
}

/** Abstract base of all vehicles. */
interface _VehiclePrototype {
  /** Determines whether this vehicle accepts passengers. This includes both drivers and gunners, if applicable. */
  allow_passengers?: boolean;
  /** Must be positive. There is no difference between the two ways to set braking power/force. */
  braking_power: Energy | number;
  /** Two entities can collide only if they share a layer from the collision mask. */
  collision_mask?: CollisionMask;
  crash_trigger?: TriggerEffect;
  /** The (movement) energy used per hit point (1 hit point = 1 health damage) taken and dealt for this vehicle during collisions. The smaller the number, the more damage this vehicle and the rammed entity take during collisions: `damage = energy / energy_per_hit_point`. */
  energy_per_hit_point: number;
  /** The name of the [EquipmentGridPrototype](prototype:EquipmentGridPrototype) this vehicle has. */
  equipment_grid?: EquipmentGridID;
  /** Must be positive. There is no difference between the two ways to set friction force. */
  friction: number;
  /** The sprite that represents this vehicle on the map/minimap. */
  minimap_representation?: Sprite;
  /** The sprite that represents this vehicle on the map/minimap when it is selected. */
  selected_minimap_representation?: Sprite;
  /** Must be positive. Sound is scaled by speed. */
  sound_minimum_speed?: number;
  /** Must be positive. Sound is scaled by speed. */
  sound_scaling_ratio?: number;
  stop_trigger?: TriggerEffect;
  stop_trigger_speed?: number;
  /** Must be in the [0, 1] interval. */
  terrain_friction_modifier?: number;
  /** Must be positive. Weight of the entity used for physics calculation when car hits something. */
  weight: number;
}

export type VehiclePrototype = _VehiclePrototype &
  Omit<EntityWithOwnerPrototype, keyof _VehiclePrototype>;
/** A [virtual signal](https://wiki.factorio.com/Circuit_network#Virtual_signals). */
interface _VirtualSignalPrototype {
  type: 'virtual-signal';
  /** Path to the icon file that is used to represent this virtual signal.

Mandatory if `icons` is not defined. */
  icon?: FileName;
  /** Icons of reduced size will be used at decreased scale. */
  icon_mipmaps?: IconMipMapType;
  /** The size of the square icon, in pixels, e.g. `32` for a 32px by 32px icon.

Mandatory if `icons` is not defined, or if `icon_size` is not specified for all instances of `icons`. */
  icon_size?: SpriteSizeType;
  /** The icon that is used to represent this virtual signal. Can't be an empty array. */
  icons?: IconData[];
  /** The name of a [ItemSubGroup](prototype:ItemSubGroup). */
  subgroup?: ItemSubGroupID;
}

export type VirtualSignalPrototype = _VirtualSignalPrototype &
  Omit<PrototypeBase, keyof _VirtualSignalPrototype>;

export function isVirtualSignalPrototype(
  value: unknown,
): value is VirtualSignalPrototype {
  return (value as { type: string }).type === 'virtual-signal';
}

/** A [wall](https://wiki.factorio.com/Wall). */
interface _WallPrototype {
  type: 'wall';
  circuit_connector_sprites?: CircuitConnectorSprites;
  circuit_wire_connection_point?: WireConnectionPoint;
  /** The maximum circuit wire distance for this entity. */
  circuit_wire_max_distance?: number;
  connected_gate_visualization?: Sprite;
  default_output_signal?: SignalIDConnector;
  draw_circuit_wires?: boolean;
  draw_copper_wires?: boolean;
  pictures: WallPictures;
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

/** A wind sound. */
export interface WindSound {
  /** Unique textual identification of the prototype. */
  name: string;
  /** The sound file and volume. */
  sound: Sound;
  /** Specification of the type of the prototype. */
  type: 'wind-sound';
}

export function isWindSound(value: unknown): value is WindSound {
  return (value as { type: string }).type === 'wind-sound';
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

interface _ActivityBarStyleSpecification {
  bar?: Sprite;
  bar_background?: Sprite;
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

export interface AdvancedMapGenSettings {
  difficulty_settings?: MapGenPresetDifficultySettings;
  enemy_evolution?: MapGenPresetEnemyEvolutionSettings;
  enemy_expansion?: MapGenPresetEnemyExpansionSettings;
  pollution?: MapGenPresetPollutionSettings;
}
export interface AggregationSpecification {
  /** If `true`, already playing sounds are taken into account when checking `max_count`. */
  count_already_playing?: boolean;
  max_count: number;
  /** If `count_already_playing` is `true`, this will determine maximum progress when instance is counted toward playing sounds. */
  progress_threshold?: number;
  remove: boolean;
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
  /** Name of a [AmmoCategory](prototype:AmmoCategory). Defines whether the attack will be affected by upgrades. */
  category: AmmoCategoryID;
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
  /** Only loaded if `layers` is not defined. Mandatory if `stripes` is not defined.

The path to the sprite file to use. */
  filename: FileName;
  /** Only loaded if `layers` is not defined.

If this property exists and high resolution sprites are turned on, this is used to load the Animation. */
  hr_version?: Animation;
  /** If this property is present, all Animation definitions have to be placed as entries in the array, and they will all be loaded from there. `layers` may not be an empty table. Each definition in the array may also have the `layers` property.

`animation_speed` and `max_advance` only have to be defined in one layer. All layers will run at the same speed.

If this property is present, all other properties, including those inherited from AnimationParameters, are ignored. */
  layers: Animation[];
  /** Only loaded if `layers` is not defined. */
  stripes?: Stripe[];
}

export type Animation = _Animation &
  Omit<AnimationParameters, keyof _Animation>;
/** If this is loaded as a single Animation, it applies to all directions. */
interface _Animation4Way {
  /** Defaults to the north animation. */
  east?: Animation;
  north: Animation;
  /** Defaults to the north animation. */
  south?: Animation;
  /** Defaults to the east animation. */
  west?: Animation;
}
export interface AnimationElement {
  always_draw?: boolean;
  animation?: Animation;
  apply_tint?: boolean;
  draw_as_light?: boolean;
  draw_as_sprite?: boolean;
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

Height of one frame in pixels, from 0-8192. */
  height?: SpriteSizeType;
  /** Specifies how many pictures are on each horizontal line in the image file. `0` means that all the pictures are in one horizontal line. Once the specified number of pictures are loaded from a line, the pictures from the next line are loaded. This is to allow having longer animations loaded in to Factorio's graphics matrix than the game engine's width limit of 8192px per input file. The restriction on input files is to be compatible with most graphics cards. */
  line_length?: number;
  max_advance?: number;
  /** Only loaded if this is an icon, that is it has the flag `"group=icon"` or `"group=gui"`.

Note that `mipmap_count` doesn't make sense in an animation, as it is not possible to layout mipmaps in a way that would load both the animation and the mipmaps correctly (besides animations with just one frame). See [here](https://forums.factorio.com/viewtopic.php?p=549058#p549058). */
  mipmap_count?: number;
  /** How many times to repeat the animation to complete an animation cycle. E.g. if one layer is 10 frames, a second layer of 1 frame would need `repeat_count = 10` to match the complete cycle. */
  repeat_count?: number;
  run_mode?: 'forward' | 'backward' | 'forward-then-backward';
  /** The width and height of one frame. If this is a tuple, the first member of the tuple is the width and the second is the height. Otherwise the size is both width and height. Width and height may only be in the range of 0-8192. */
  size?: SpriteSizeType | [SpriteSizeType, SpriteSizeType];
  /** Mandatory if `size` is not defined.

Width of one frame in pixels, from 0-8192. */
  width?: SpriteSizeType;
}

export type AnimationParameters = _AnimationParameters &
  Omit<SpriteParameters, keyof _AnimationParameters>;
interface _AnimationSheet {
  frame_count?: number;
  /** If this property exists and high resolution sprites are turned on, this is used to load the AnimationSheet. */
  hr_version?: AnimationSheet;
  line_length?: number;
  variation_count: number;
}

export type AnimationSheet = _AnimationSheet &
  Omit<AnimationParameters, keyof _AnimationSheet>;
interface _AnimationVariations {
  /** The variations are arranged vertically in the file, one row for each variation. */
  sheet: AnimationSheet;
  /** Only loaded if `sheet` is not defined. */
  sheets: AnimationSheet[];
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

export interface AttackReactionItem {
  action?: Trigger;
  damage_type?: DamageTypeID;
  range: number;
  reaction_modifier?: number;
}
export interface AutoplacePeak {
  /** Distance from the optimal parameters that get influence of -1.

Only loaded if `aux_optimal` is defined. */
  aux_max_range?: number;
  /** Optimal value of aux. If aux is close to this value, peak influence is 1.

aux corresponds to the `aux` [noise expression](prototype:BaseNamedNoiseExpressions). */
  aux_optimal?: number;
  /** Distance from the optimal parameters that is still considered optimal.

Only loaded if `aux_optimal` is defined. */
  aux_range?: number;
  /** Limit distance from the optimum on a single (positive) side. This is pure magic.

Only loaded if `aux_optimal` is defined. */
  aux_top_property_limit?: number;
  /** Distance from the optimal parameters that get influence of -1.

Only loaded if `distance_optimal` is defined. */
  distance_max_range?: number;
  /** Optimal value of distance. If distance is close to this value, peak influence is 1.

distance corresponds to the `distance` [noise expression](prototype:BaseNamedNoiseExpressions). */
  distance_optimal?: number;
  /** Distance from the optimal parameters that is still considered optimal.

Only loaded if `distance_optimal` is defined. */
  distance_range?: number;
  /** Limit distance from the optimum on a single (positive) side. This is pure magic.

Only loaded if `distance_optimal` is defined. */
  distance_top_property_limit?: number;
  /** Distance from the optimal parameters that get influence of -1.

Only loaded if `elevation_optimal` is defined. */
  elevation_max_range?: number;
  /** Optimal value of elevation. If elevation is close to this value, peak influence is 1.

elevation corresponds to the `elevation` [noise expression](prototype:BaseNamedNoiseExpressions). */
  elevation_optimal?: number;
  /** Distance from the optimal parameters that is still considered optimal.

Only loaded if `elevation_optimal` is defined. */
  elevation_range?: number;
  /** Limit distance from the optimum on a single (positive) side. This is pure magic.

Only loaded if `elevation_optimal` is defined. */
  elevation_top_property_limit?: number;
  /** Influence multiplier.

Influence is calculated as a sum of influences of peaks. Influence of a peak is obtained by calculating a distance from each of its dimensions and sum of these individual distances is used as a distance from optimal conditions. Based on this distance a peak gets influence between -1 and 1. This is then multiplied by the noise function, if it is specified, and by the `influence` constant (or by `influence` + `richness_influence` if calculating richness). Finally this value is clamped to a range between `min_influence` and `max_influence`.

When [AutoplaceSpecification::starting_area_amount](prototype:AutoplaceSpecification::starting_area_amount) is non-zero a position in starting area is selected and a blob is placed centered on this position. Influence is then a maximum of the default calculated value and a value obtained from this blob. */
  influence?: number;
  /** Maximal influence (after all calculations) of current peak. See `influence`. */
  max_influence?: number;
  /** Minimal influence (after all calculations) of current peak. See `influence`. */
  min_influence?: number;
  /** Name of [NoiseLayer](prototype:NoiseLayer) to use for this peak. If empty, then no noise is added to this peak.

A peak may have a noise multiplied with its influence. Intended use is to have noise layers separate for different types of objects that might appear (trees-12 vs enemy-base). */
  noise_layer?: NoiseLayerID;
  /** Difference between number of octaves of the world and of the noise. */
  noise_octaves_difference?: number;
  /** Must be between 0 and 1. Persistence of the noise. */
  noise_persistence?: number;
  noise_scale?: number;
  /** Bonus for influence multiplier when calculating richness. See `influence`. */
  richness_influence?: number;
  /** Distance from the optimal parameters that get influence of -1.

Only loaded if `starting_area_weight_optimal` is defined. */
  starting_area_weight_max_range?: number;
  /** Optimal value of starting_area_weight. If starting_area_weight is close to this value, peak influence is 1.

starting_area_weight corresponds to the `starting_area_weight` [noise expression](prototype:BaseNamedNoiseExpressions). */
  starting_area_weight_optimal?: number;
  /** Distance from the optimal parameters that is still considered optimal.

Only loaded if `starting_area_weight_optimal` is defined. */
  starting_area_weight_range?: number;
  /** Limit distance from the optimum on a single (positive) side. This is pure magic.

Only loaded if `starting_area_weight_optimal` is defined. */
  starting_area_weight_top_property_limit?: number;
  /** Distance from the optimal parameters that get influence of -1.

Only loaded if `temperature_optimal` is defined. */
  temperature_max_range?: number;
  /** Optimal value of temperature. If temperature is close to this value, peak influence is 1.

temperature corresponds to the `temperature` [noise expression](prototype:BaseNamedNoiseExpressions). */
  temperature_optimal?: number;
  /** Distance from the optimal parameters that is still considered optimal.

Only loaded if `temperature_optimal` is defined. */
  temperature_range?: number;
  /** Limit distance from the optimum on a single (positive) side. This is pure magic.

Only loaded if `temperature_optimal` is defined. */
  temperature_top_property_limit?: number;
  /** Distance from the optimal parameters that get influence of -1.

Only loaded if `tier_from_start_optimal` is defined. */
  tier_from_start_max_range?: number;
  /** Optimal value of tier_from_start. If tier_from_start is close to this value, peak influence is 1.

tier_from_start corresponds to the `tier_from_start` [noise expression](prototype:BaseNamedNoiseExpressions). */
  tier_from_start_optimal?: number;
  /** Distance from the optimal parameters that is still considered optimal.

Only loaded if `tier_from_start_optimal` is defined. */
  tier_from_start_range?: number;
  /** Limit distance from the optimum on a single (positive) side. This is pure magic.

Only loaded if `tier_from_start_optimal` is defined. */
  tier_from_start_top_property_limit?: number;
  /** Distance from the optimal parameters that get influence of -1.

Only loaded if `water_optimal` is defined. */
  water_max_range?: number;
  /** Optimal value of water. If water is close to this value, peak influence is 1.

water corresponds to the `moisture` [noise expression](prototype:BaseNamedNoiseExpressions). */
  water_optimal?: number;
  /** Distance from the optimal parameters that is still considered optimal.

Only loaded if `water_optimal` is defined. */
  water_range?: number;
  /** Limit distance from the optimum on a single (positive) side. This is pure magic.

Only loaded if `water_optimal` is defined. */
  water_top_property_limit?: number;
}
export interface AutoplaceSettings {
  /** Overrides the FrequencySizeRichness provided to the [AutoplaceSpecification](prototype:AutoplaceSpecification) of the entity/tile/decorative. Takes priority over the FrequencySizeRichness set in the [autoplace control](prototype:AutoplaceSpecification::control). */
  settings?: Record<EntityID | TileID | DecorativeID, FrequencySizeRichness>;
  /** Whether missing autoplace names for this type should be default enabled. */
  treat_missing_as_default?: boolean;
}
/** Autoplace specification is used to determine which entities are placed when generating map. Currently it is used for enemy bases, tiles, resources and other entities (trees, fishes, etc.).

Autoplace specification describe conditions for placing tiles, entities, and decoratives during surface generation. Autoplace specification defines probability of placement on any given tile and richness, which has different meaning depending on the thing being placed.

There are two entirely separate ways to specify the probability and richness:

- The newer noise expression-based system using `probability_expression` and `richness_expression`.

- The older peaks-based system using `peaks` and the properties listed below it. */
interface _AutoplaceSpecification {
  /** Name of the [AutoplaceControl](prototype:AutoplaceControl) (row in the map generator GUI) that applies to this entity. */
  control?: AutoplaceControlID;
  /** Sets a fraction of surface that should be covered by this item. */
  coverage?: number;
  /** Indicates whether the thing should be placed even if [MapGenSettings](runtime:MapGenSettings) do not provide frequency/size/richness for it. (either for the specific prototype or for the control named by AutoplaceSpecification.control).

If true, normal frequency/size/richness (`value=1`) are used in that case.  Otherwise it is treated as if 'none' were selected. */
  default_enabled?: boolean;
  /** Force of the placed entity. Can be a custom force name. Only relevant for [EntityWithOwnerPrototype](prototype:EntityWithOwnerPrototype). */
  force?: 'enemy' | 'player' | 'neutral' | string;
  /** Multiplier for output of the sharpness filter.

Probability is calculated as `max_probability * sharpness_filter(sum of influences and size modifier from GUI) - random(0, random_probability_penalty)`. */
  max_probability?: number;
  /** Order for placing the entity (has no effect when placing tiles). Entities whose order compares less are placed earlier (this influences placing multiple entities which collide with itself), from entities with equal order string only one with the highest probability is placed. */
  order?: Order;
  peaks?: AutoplacePeak[];
  /** For entities and decoratives, how many times to attempt to place on each tile. Probability and collisions are taken into account each attempt. */
  placement_density?: number;
  /** If specified, provides a noise expression that will be evaluated at every point on the map to determine probability.

If left blank, probability is determined by the `peaks` system based on the properties listed below. */
  probability_expression?: NoiseExpression;
  /** A random value between `0` and this number is subtracted from a probability after sharpness filter. Only works for entities. */
  random_probability_penalty?: number;
  /** Base Richness. It is calculated as `sum of influences * (richness_multiplier + distance * richness_multiplier_distance_bonus) + richness_base`.

Note, that when calculating richness, influences of individual peaks use [AutoplacePeak::richness_influence](prototype:AutoplacePeak::richness_influence) bonus. */
  richness_base?: number;
  /** If specified, provides a noise expression that will be evaluated to determine richness.

If probability_expression is specified and `richness_expression` is not, then `probability_expression` will be used as the richness expression.

If neither are specified, then probability and richness are both determined by the `peaks` system based on the properties listed below. */
  richness_expression?: NoiseExpression;
  /** See `richness_base`. */
  richness_multiplier?: number;
  /** Bonus to richness multiplier per tile of distance from starting point. See `richness_base`. */
  richness_multiplier_distance_bonus?: number;
  /** Parameter of the sharpness filter for post-processing probability of entity placement. Value of `0` disables the filter, with value `1`, the filter is a step function centered around `0.5`. */
  sharpness?: number;
  /** If this value is non zero, influence of this entity will be calculated differently in starting area: For each entity with this parameter a position in starting area is selected and a blob is placed centered on this position. The central tile of this blob will have approximately amount of resources selected by this value.

See [AutoplacePeak::influence](prototype:AutoplacePeak::influence) for the general influence calculation. */
  starting_area_amount?: number;
  /** See `starting_area_amount`. Controls approximate radius of the blob in tiles. */
  starting_area_size?: number;
  /** Restricts tiles or tile transitions the entity can appear on. */
  tile_restriction?: TileIDRestriction[];
}
/** The abstract base of all [AttackParameters](prototype:AttackParameters). */
export interface BaseAttackParameters {
  /** Used in tooltips to set the tooltip category. It is also used to get the locale keys for activation instructions and speed of the action for the tooltip.

For example, an activation_type of "throw" will result in the tooltip category "thrown" and the tooltip locale keys "gui.instruction-to-throw" and "description.throwing-speed". */
  activation_type?: 'shoot' | 'throw' | 'consume' | 'activate';
  ammo_categories?: AmmoCategoryID[];
  /** Mandatory if both `ammo_type` and `ammo_categories` are not defined. */
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
  cyclic_sound: CyclicSound;
  damage_modifier?: number;
  /** Used when searching for the nearest enemy, when this is > 0, enemies that aren't burning are preferred over burning enemies. Definition of "burning" for this: Entity has sticker attached to it, and the sticker has a [spread_fire_entity](prototype:StickerPrototype::spread_fire_entity) set. */
  fire_penalty?: number;
  /** A higher penalty will discourage turrets from targeting units with higher health. A negative penalty will encourage turrets to target units with higher health. */
  health_penalty?: number;
  /** Setting this to anything but zero causes homing projectiles to aim for the predicted location based on enemy movement instead of the current enemy location. */
  lead_target_for_projectile_speed?: number;
  /** If less than `range`, the entity will choose a random distance between `range` and `min_attack_distance` and attack from that distance. */
  min_attack_distance?: number;
  /** The minimum distance (in tiles) between an entity and target. If a unit's target is less than this, the unit will attempt to move away before attacking. A [flamethrower turret](https://wiki.factorio.com/Flamethrower_turret) does not move, but has a minimum range. Less than this, it is unable to target an enemy. */
  min_range?: number;
  movement_slow_down_cooldown?: number;
  movement_slow_down_factor?: number;
  /** Before an entity can attack, the distance (in tiles) between the entity and target must be less than or equal to this. */
  range: number;
  range_mode?: 'center-to-center' | 'bounding-box-to-bounding-box';
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
  emissions_per_minute?: number;
  /** Whether to render the "no network" icon if the entity is not connected to an electric network. */
  render_no_network_icon?: boolean;
  /** Whether to render the "no power" icon if the entity is low on power. Also applies to the "no fuel" icon when using burner energy sources. */
  render_no_power_icon?: boolean;
}
/** The abstract base of all [Modifiers](prototype:Modifier). */
export interface BaseModifier {
  /** Path to the icon file.

Only loaded if `icons` is not defined. */
  icon?: FileName;
  /** Icons of reduced size will be used at decreased scale. */
  icon_mipmaps?: IconMipMapType;
  /** The size of the square icon, in pixels, e.g. `32` for a 32px by 32px icon.

Only loaded if `icons` is not defined, or if `icon_size` is not specified for all instances of `icons`. */
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
export interface BeaconGraphicsSet {
  animation_layer?: RenderLayer;
  animation_list?: AnimationElement[];
  animation_progress?: number;
  /** Which tint set in [ModulePrototype::beacon_tint](prototype:ModulePrototype::beacon_tint) should be applied to this, if any. */
  apply_module_tint?: ModuleTint;
  /** Which tint set in [ModulePrototype::beacon_tint](prototype:ModulePrototype::beacon_tint) should be applied to the light, if any. */
  apply_module_tint_to_light?: ModuleTint;
  base_layer?: RenderLayer;
  draw_animation_when_idle?: boolean;
  draw_light_when_idle?: boolean;
  light?: LightDefinition;
  max_animation_progress?: number;
  min_animation_progress?: number;
  module_icons_suppressed?: boolean;
  module_tint_mode?: 'single-module' | 'mix';
  /** The visualisations available for displaying the modules in the beacon. The visualisation is chosen based on art style, see [BeaconModuleVisualizations::art_style](prototype:BeaconModuleVisualizations::art_style) and [ModulePrototype::art_style](prototype:ModulePrototype::art_style). */
  module_visualisations?: BeaconModuleVisualizations[];
  no_modules_tint?: Color;
  random_animation_offset?: boolean;
  top_layer?: RenderLayer;
}
export interface BeaconModuleVisualization {
  /** Which tint set in [ModulePrototype::beacon_tint](prototype:ModulePrototype::beacon_tint) should be applied to this, if any. */
  apply_module_tint?: ModuleTint;
  draw_as_light?: boolean;
  draw_as_sprite?: boolean;
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
  body?: AnimationVariations;
  ending?: Animation;
  head?: Animation;
  start?: Animation;
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

interface _BeamTriggerDelivery {
  add_to_shooter?: boolean;
  /** Name of a [BeamPrototype](prototype:BeamPrototype). */
  beam: EntityID;
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

export interface BeltTraverseTipTrigger {
  count?: number;
  type: 'belt-traverse';
}

export function isBeltTraverseTipTrigger(
  value: unknown,
): value is BeltTraverseTipTrigger {
  return (value as { type: string }).type === 'belt-traverse';
}

/** The table itself is required, but it can be empty. */
export interface BoilerFire {
  east?: Animation;
  north?: Animation;
  south?: Animation;
  west?: Animation;
}
/** The table itself is required, but it can be empty. */
export interface BoilerFireGlow {
  east?: Animation;
  north?: Animation;
  south?: Animation;
  west?: Animation;
}
export interface BoilerPatch {
  east?: Sprite;
  north?: Sprite;
  south?: Sprite;
  west?: Sprite;
}
export interface BoilerStructure {
  east: Animation;
  north: Animation;
  south: Animation;
  west: Animation;
}
export interface BonusGuiOrdering {
  artillery_range: Order;
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
/** A cursor box, for use in [UtilitySprites](prototype:UtilitySprites). */
export interface BoxSpecification {
  /** Whether this is a complete box or just the top left corner. If this is true, `side_length` and `side_height` must be present. Otherwise `max_side_length` must be present. */
  is_whole_box?: boolean;
  /** Only read if `is_whole_box` is false. */
  max_side_length: number;
  /** Only read if `is_whole_box` is true. */
  side_height: number;
  /** Only read if `is_whole_box` is true. */
  side_length: number;
  sprite: Sprite;
}
export interface BuildEntityTipTrigger {
  build_by_dragging?: boolean;
  build_in_line?: boolean;
  /** Building is considered consecutive when the built entity is the same as the last built entity. */
  consecutive?: boolean;
  count?: number;
  entity?: EntityID;
  linear_power_pole_line?: boolean;
  match_type_only?: boolean;
  type: 'build-entity';
}

export function isBuildEntityTipTrigger(
  value: unknown,
): value is BuildEntityTipTrigger {
  return (value as { type: string }).type === 'build-entity';
}

interface _BurnerEnergySource {
  burnt_inventory_size?: ItemStackIndex;
  /** `1` means 100% effectivity. Must be greater than `0`. Multiplier of the energy output. */
  effectivity?: number;
  /** The energy source can be used with fuel from these [fuel categories](prototype:FuelCategory). */
  fuel_categories?: FuelCategoryID[];
  /** The energy source can be used with fuel from this [fuel category](prototype:FuelCategory). For a list of built-in categories, see [here](https://wiki.factorio.com/Data.raw#fuel-category).

Only loaded if `fuel_categories` is not defined. */
  fuel_category?: FuelCategoryID;
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
  /** Required, read by the game and then immediately discarded. In short: Does nothing. */
  effect: string;
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

/** The data for one variation of character animations. [CharacterPrototype::animations](prototype:CharacterPrototype::animations). */
export interface CharacterArmorAnimation {
  /** The names of the armors this animation data is used for. Don't define this if you want the animations to be used for the player without armor. */
  armors?: ItemID[];
  /** flipped_shadow_running_with_gun must be nil or contain exactly 18 directions, so all of the combination of gun direction and moving direction can be covered. Some of these variations are used in reverse to save space. You can use the character animation in the base game for reference. `flipped_shadow_running_with_gun` has to have same frame count as `running_with_gun`. */
  flipped_shadow_running_with_gun?: RotatedAnimation;
  idle: RotatedAnimation;
  idle_with_gun: RotatedAnimation;
  mining_with_tool: RotatedAnimation;
  running: RotatedAnimation;
  /** Must contain exactly 18 directions, so all of the combination of gun direction and moving direction can be covered. Some of these variations are used in reverse to save space. You can use the character animation in the base game for reference. */
  running_with_gun: RotatedAnimation;
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

export interface ChartUtilityConstants {
  artillery_range_color: Color;
  blue_signal_color: Color;
  chart_construction_robot_color: Color;
  chart_deconstruct_tint: Color;
  chart_logistic_robot_color: Color;
  chart_mobile_construction_robot_color: Color;
  chart_personal_construction_robot_color: Color;
  chart_train_stop_disabled_text_color: Color;
  chart_train_stop_full_text_color: Color;
  chart_train_stop_text_color: Color;
  custom_tag_scale?: number;
  custom_tag_selected_overlay_tint: Color;
  /** The strings are entity types. */
  default_color_by_type?: Record<string, Color>;
  default_enemy_color: Color;
  default_friendly_color: Color;
  /** The strings are entity types. */
  default_friendly_color_by_type?: Record<string, Color>;
  electric_line_minimum_absolute_width: number;
  electric_line_width: number;
  electric_lines_color: Color;
  electric_lines_color_switch_disabled: Color;
  electric_lines_color_switch_enabled: Color;
  electric_power_pole_color: Color;
  entity_ghost_color: Color;
  explosion_visualization_duration: number;
  green_signal_color: Color;
  pollution_color: Color;
  rail_color: Color;
  red_signal_color: Color;
  resource_outline_selection_color: Color;
  switch_color: Color;
  train_current_path_outline_color: Color;
  train_path_color: Color;
  train_preview_path_outline_color: Color;
  turret_range_color: Color;
  vehicle_inner_color: Color;
  vehicle_outer_color: Color;
  vehicle_outer_color_selected: Color;
  vehicle_wagon_connection_color: Color;
  yellow_signal_color: Color;
  zoom_threshold_to_draw_spider_path?: number;
}
interface _CheckBoxStyleSpecification {
  checkmark?: Sprite;
  disabled_checkmark?: Sprite;
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
export interface ClearCursorTipTrigger {
  count?: number;
  type: 'clear-cursor';
}

export function isClearCursorTipTrigger(
  value: unknown,
): value is ClearCursorTipTrigger {
  return (value as { type: string }).type === 'clear-cursor';
}

export interface CliffPlacementSettings {
  /** Elevation at which the first row of cliffs is placed. Can not be set from the map generation GUI. */
  cliff_elevation_0?: number;
  /** Elevation difference between successive rows of cliffs. This is inversely proportional to 'frequency' in the map generation GUI. Specifically, when set from the GUI the value is `40 / frequency`. */
  cliff_elevation_interval?: number;
  /** Name of the [CliffPrototype](prototype:CliffPrototype). */
  name?: EntityID;
  /** Corresponds to 'continuity' in the GUI. This value is not used directly, but is used by the 'cliffiness' noise expression, which in combination with elevation and the two cliff elevation properties drives cliff placement (cliffs are placed when elevation crosses the elevation contours defined by `cliff_elevation_0` and `cliff_elevation_interval` when 'cliffiness' is greater than `0.5`). The default 'cliffiness' expression interprets this value such that larger values result in longer unbroken walls of cliffs, and smaller values (between `0` and `1`) result in larger gaps in cliff walls. */
  richness?: MapGenSize;
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

/** Table of red, green, blue, and alpha float values between 0 and 1.Alternatively, values can be from 0-255, they are interpreted as such if at least one value is `> 1`.

Color allows the short-hand notation of passing an array of exactly 3 or 4 numbers.

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
export interface ColumnWidth {
  /** Column index. */
  column: number;
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
export interface CraftItemTipTrigger {
  /** Can only be used when `event_type` is `"crafting-finished"`. */
  consecutive?: boolean;
  count?: number;
  event_type:
    | 'crafting-of-single-item-ordered'
    | 'crafting-of-multiple-items-ordered'
    | 'crafting-finished';
  item?: ItemID;
  type: 'craft-item';
}

export function isCraftItemTipTrigger(
  value: unknown,
): value is CraftItemTipTrigger {
  return (value as { type: string }).type === 'craft-item';
}

/** If no tint is specified, the crafting machine falls back to [CraftingMachinePrototype::default_recipe_tint](prototype:CraftingMachinePrototype::default_recipe_tint). */
export interface CraftingMachineTint {
  primary?: Color;
  quaternary?: Color;
  secondary?: Color;
  tertiary?: Color;
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
  check_buildability?: boolean;
  /** The name of the entity that should be created. */
  entity_name: EntityID;
  offset_deviation?: BoundingBox;
  /** If multiple offsets are specified, multiple entities are created. The projectile of the [Distractor capsule](https://wiki.factorio.com/Distractor_capsule) uses this property to spawn three Distractors. */
  offsets?: Vector[];
  show_in_tooltip?: boolean;
  /** Entity creation will not occur if any tile matches the collision condition. Defaults to no collisions. */
  tile_collision_mask?: CollisionMask;
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

interface _CreateParticleTriggerEffectItem {
  frame_speed?: number;
  frame_speed_deviation?: number;
  initial_height: number;
  initial_height_deviation?: number;
  initial_vertical_speed?: number;
  initial_vertical_speed_deviation?: number;
  offset_deviation?: BoundingBox;
  offsets?: Vector[];
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
  tile_collision_mask?: CollisionMask;
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
  starting_frame_speed?: number;
  starting_frame_speed_deviation?: number;
  type: 'create-smoke';
}

export type CreateSmokeTriggerEffectItem = _CreateSmokeTriggerEffectItem &
  Omit<CreateEntityTriggerEffectItem, keyof _CreateSmokeTriggerEffectItem>;

export function isCreateSmokeTriggerEffectItem(
  value: unknown,
): value is CreateSmokeTriggerEffectItem {
  return (value as { type: string }).type === 'create-smoke';
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
  starting_frame_speed?: number;
  starting_frame_speed_deviation?: number;
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
  not_allowed: BoxSpecification[];
  pair: BoxSpecification[];
  regular: BoxSpecification[];
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
/** A property type, NOT a prototype. Used to specify what type of damage and how much damage something deals. */
export interface DamagePrototype {
  amount: number;
  /** The type of damage. See [here](https://wiki.factorio.com/Data.raw#damage-type) for a list of built-in types, and [DamageType](prototype:DamageType) for creating custom types. */
  type: DamageTypeID;
}
interface _DamageTriggerEffectItem {
  apply_damage_to_trees?: boolean;
  damage: DamagePrototype;
  lower_damage_modifier?: number;
  lower_distance_threshold?: number;
  type: 'damage';
  upper_damage_modifier?: number;
  upper_distance_threshold?: number;
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

export interface DefaultRecipeTint {
  primary?: Color;
  quaternary?: Color;
  secondary?: Color;
  tertiary?: Color;
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
  explosion?: EntityID;
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
  /** A [defines.difficulty_settings.recipe_difficulty](runtime:defines.difficulty_settings.recipe_difficulty). */
  recipe_difficulty: number;
  research_queue_setting?: 'always' | 'after-victory' | 'never';
  /** A [defines.difficulty_settings.technology_difficulty](runtime:defines.difficulty_settings.technology_difficulty). */
  technology_difficulty: number;
  /** Optional, defaults to 1. - Must be >= 0.001 and <= 1000. */
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
export interface DistanceFromNearestPointArguments {
  maximum_distance?: ConstantNoiseNumber;
  points: NoiseArrayConstruction;
  x: NoiseNumber;
  y: NoiseNumber;
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

/** When applied to modules, the resulting effect is a sum of all module affects, multiplied through calculations: `(1 + sum module effects)` or, for productivity `(0 + sum)`. */
export interface Effect {
  /** Multiplier to energy used during operation (not idle/drain use). The minimum possible sum is -80%. */
  consumption?: EffectValue;
  /** Multiplier to the pollution factor of an entity's pollution during use. The minimum possible sum is -80%. */
  pollution?: EffectValue;
  /** Multiplied against work completed, adds to the bonus results of operating. E.g. an extra crafted recipe or immediate research bonus. The minimum possible sum is 0%. */
  productivity?: EffectValue;
  /** Modifier to crafting speed, research speed, etc. The minimum possible sum is -80%. */
  speed?: EffectValue;
}
export interface EffectValue {
  /** Precision is ignored beyond two decimals - 17.567 results in 17.56 etc. */
  bonus?: number;
}
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
export interface EntityTransferTipTrigger {
  count?: number;
  transfer?: 'in' | 'out';
  type: 'entity-transfer';
}

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
export interface FactorioBasisNoiseArguments {
  /** `x` and `y` will be multiplied by this value before sampling. */
  input_scale?: ConstantNoiseNumber;
  /** The output will be multiplied by this value before returning. */
  output_scale?: ConstantNoiseNumber;
  /** Integer between 0 and 4'294'967'295 (inclusive) used to populate the backing random noise. */
  seed0: ConstantNoiseNumber;
  /** Integer between 0 and 255 (inclusive) used to provide extra randomness when sampling. */
  seed1: ConstantNoiseNumber;
  x: NoiseNumber;
  y: NoiseNumber;
}
export interface FactorioMultioctaveNoiseArguments {
  /** `x` and `y` will be multiplied by this value before sampling. */
  input_scale?: ConstantNoiseNumber;
  /** How many layers of noise at different scales to sum. */
  octaves: ConstantNoiseNumber;
  /** The output will be multiplied by this value before returning. */
  output_scale?: ConstantNoiseNumber;
  /** How strong is each layer compared to the next larger one. */
  persistence: ConstantNoiseNumber;
  /** Integer between 0 and 4'294'967'295 (inclusive) used to populate the backing random noise. */
  seed0: ConstantNoiseNumber;
  /** Integer between 0 and 255 (inclusive) used to provide extra randomness when sampling. */
  seed1: ConstantNoiseNumber;
  x: NoiseNumber;
  y: NoiseNumber;
}
export interface FactorioQuickMultioctaveNoiseArguments {
  input_scale?: ConstantNoiseNumber;
  octave_input_scale_multiplier?: ConstantNoiseNumber;
  octave_output_scale_multiplier?: ConstantNoiseNumber;
  octave_seed0_shift?: ConstantNoiseNumber;
  octaves: ConstantNoiseNumber;
  output_scale?: ConstantNoiseNumber;
  seed0: ConstantNoiseNumber;
  seed1: ConstantNoiseNumber;
  x: NoiseNumber;
  y: NoiseNumber;
}
export interface FastBeltBendTipTrigger {
  count?: number;
  type: 'fast-belt-bend';
}

export function isFastBeltBendTipTrigger(
  value: unknown,
): value is FastBeltBendTipTrigger {
  return (value as { type: string }).type === 'fast-belt-bend';
}

export interface FastReplaceTipTrigger {
  count?: number;
  match_type_only?: boolean;
  source?: EntityID;
  target?: EntityID;
  type: 'fast-replace';
}

export function isFastReplaceTipTrigger(
  value: unknown,
): value is FastReplaceTipTrigger {
  return (value as { type: string }).type === 'fast-replace';
}

interface _FlameThrowerExplosionTriggerDelivery {
  direction_deviation?: number;
  /** Name of a [FlameThrowerExplosionPrototype](prototype:FlameThrowerExplosionPrototype). */
  explosion: EntityID;
  projectile_starting_speed?: number;
  speed_deviation?: number;
  starting_distance: number;
  starting_frame_fraciton_deviation?: number;
  type: 'flame-thrower';
}

export type FlameThrowerExplosionTriggerDelivery =
  _FlameThrowerExplosionTriggerDelivery &
    Omit<TriggerDeliveryItem, keyof _FlameThrowerExplosionTriggerDelivery>;

export function isFlameThrowerExplosionTriggerDelivery(
  value: unknown,
): value is FlameThrowerExplosionTriggerDelivery {
  return (value as { type: string }).type === 'flame-thrower';
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
  /** Must be greater than `0`. The total fluid capacity of the fluid box is `base_area × height × 100`. */
  base_area?: number;
  /** Base level is the elevation of the invisible fluid box. `0` is ground level.

`-1` puts the top of the fluid box at the bottom of a pipe connection (base_level `0`, height `1`), so fluid "falls" in to it, and can't get out.

`1` puts the bottom of the fluid box at the top of a pipe connection, so fluid "falls" out of it, but fluids already outside cannot get into it.

In other words:

- `1` = output only (and will attempt to empty as fast as possible)

- `-1` = input only (and will attempt to fill as fast as possible)

- `0` means fluids can freely flow in and out (and like a pipe, will balance to the level of the pipe next to it)

Having a `-1` or `1` improperly set on an output or input, respectively, will cause issues like output fluid not leaving the building, or input fluid not entering, regardless of fluid levels in the pipe or fluid box. */
  base_level?: number;
  /** Can be used to specify which fluid is allowed to enter this fluid box. See [here](https://forums.factorio.com/viewtopic.php?f=28&t=46302). */
  filter?: FluidID;
  /** Must be greater than `0`. The total fluid capacity of the fluid box is `base_area × height × 100`. */
  height?: number;
  /** Hides the blue input/output arrows and icons at each connection point. */
  hide_connection_info?: boolean;
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
  pipe_picture?: Sprite4Way;
  production_type?: ProductionType;
  render_layer?: RenderLayer;
  /** Set the secondary draw order for all orientations. Used to determine render order for sprites with the same `render_layer` in the same position. Sprites with a higher `secondary_draw_order` are drawn on top. */
  secondary_draw_order?: number;
  /** Set the secondary draw order for each orientation. Used to determine render order for sprites with the same `render_layer` in the same position. Sprites with a higher `secondary_draw_order` are drawn on top. */
  secondary_draw_orders?: FluidBoxSecondaryDrawOrders;
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
  /** All standard fluid box configurations are acceptable, but the type must be `"input"` or `"input-output"` to function correctly. `scale_fluid_usage`, `fluid_usage_per_tick`, or a filter on the fluidbox must be set to be able to calculate the fluid usage of the energy source. */
  fluid_box: FluidBox;
  /** The number of fluid units the energy source uses per tick. If used with `scale_fluid_usage`, this specifies the maximum. If this value is not set, `scale_energy_usage` is `false` and a fluid box filter is set, the game will attempt to calculate this value from the fluid box filter's fluid's `fuel_value` or `heat_capacity` and the entity's `energy_usage`. If `burns_fluid` is `false`, `maximum_temperature` will also be used. If the attempt of the game to calculate this value fails (`scale_energy_usage` is `false` and a fluid box filter is set), then `scale_energy_usage` will be forced to `true`, to prevent the energy source from being an infinite fluid sink. More context [on the forums](https://forums.factorio.com/90613). */
  fluid_usage_per_tick?: number;
  light_flicker?: LightFlickeringDefinition;
  /** `0` means unlimited maximum temperature. If specified while `scale_fluid_usage` is `false` and `fluid_usage_per_tick` is not specified, the game will use this value to calculate `fluid_usage_per_tick`. */
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
  /** Can not be `< 0`. */
  amount: number;
  /** Amount of this ingredient that should not be included in the fluid consumption statistics. Usually used together with an equal catalyst amount on the "product" of the catalyst in the recipe.

If this FluidIngredientPrototype is used in a recipe, the `catalyst_amount` is calculated automatically based on the [RecipePrototype::ingredients](prototype:RecipePrototype::ingredients) and [RecipePrototype::results](prototype:RecipePrototype::results). See [here](https://factorio.com/blog/post/fff-256). */
  catalyst_amount?: number;
  /** Used to specify which [CraftingMachinePrototype::fluid_boxes](prototype:CraftingMachinePrototype::fluid_boxes) this ingredient should use. It will use this one fluidbox. */
  fluidbox_index?: number;
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
  amount?: number;
  /** Only loaded if `amount` is not defined.

If set to a number that is less than `amount_min`, the game will use `amount_min` instead. */
  amount_max: MaterialAmountType;
  /** Only loaded if `amount` is not defined.

Can not be `< 0`. */
  amount_min: MaterialAmountType;
  /** Amount that should not be affected by productivity modules (not yielded from bonus production) and should not be included in the fluid production statistics.

If this FluidProductPrototype is used in a recipe, the `catalyst_amount` is calculated automatically based on the [RecipePrototype::ingredients](prototype:RecipePrototype::ingredients) and [RecipePrototype::results](prototype:RecipePrototype::results). See [here](https://factorio.com/blog/post/fff-256). */
  catalyst_amount?: number;
  /** Used to specify which [CraftingMachinePrototype::fluid_boxes](prototype:CraftingMachinePrototype::fluid_boxes) this product should use. It will use this one fluidbox. */
  fluidbox_index?: number;
  /** The name of a [FluidPrototype](prototype:FluidPrototype). */
  name: FluidID;
  /** Value between 0 and 1, `0` for 0% chance and `1` for 100% chance. */
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
  flow_style?: FlowStyleSpecification;
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
export interface GameControllerVibrationData {
  /** Duration in milliseconds. */
  duration?: number;
  /** Vibration intensity must be between 0 and 1. */
  high_frequency_vibration_intensity?: number;
  /** Vibration intensity must be between 0 and 1. */
  low_frequency_vibration_intensity?: number;
  play_for?: PlayFor;
}
export interface GateOverRailBuildTipTrigger {
  count?: number;
  type: 'gate-over-rail-build';
}

export function isGateOverRailBuildTipTrigger(
  value: unknown,
): value is GateOverRailBuildTipTrigger {
  return (value as { type: string }).type === 'gate-over-rail-build';
}

interface _GhostTimeToLiveModifier {
  type: 'ghost-time-to-live';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type GhostTimeToLiveModifier = _GhostTimeToLiveModifier &
  Omit<SimpleModifier, keyof _GhostTimeToLiveModifier>;

export function isGhostTimeToLiveModifier(
  value: unknown,
): value is GhostTimeToLiveModifier {
  return (value as { type: string }).type === 'ghost-time-to-live';
}

interface _GiveItemModifier {
  /** Must be `> 0`. */
  count?: ItemCountType;
  item: ItemID;
  type: 'give-item';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type GiveItemModifier = _GiveItemModifier &
  Omit<BaseModifier, keyof _GiveItemModifier>;

export function isGiveItemModifier(value: unknown): value is GiveItemModifier {
  return (value as { type: string }).type === 'give-item';
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

export interface GroupAttackTipTrigger {
  count?: number;
  type: 'group-attack';
}

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

/** Icon layering follows the following rules:

- The rendering order of the individual icons follows the array order: Later added icons (higher index) are drawn on top of previously added icons (lower index).

- Only the first icon layer will display a shadow.

- When the final icon is displayed with transparency (e.g. a faded out alert), the icon layer overlap may look [undesirable](https://forums.factorio.com/viewtopic.php?p=575844#p575844).

- The final combination of icons will always be resized in GUI based on the first icon layer's size, but won't be resized when displayed on machines in alt-mode. For example: recipe first icon layer is size 128, scale 1, the icon group will be displayed at resolution /4 to fit the 32px GUI boxes, but will be displayed 4 times as large on buildings.

- Shift values are based on final size (`icon_size * scale`) of the first icon layer. */
export interface IconData {
  /** Path to the icon file. */
  icon: FileName;
  /** Icons of reduced size will be used at decreased scale. */
  icon_mipmaps?: IconMipMapType;
  /** The size of the square icon, in pixels, e.g. `32` for a 32px by 32px icon.

Mandatory if `icon_size` is not specified outside of `icons`. */
  icon_size: SpriteSizeType;
  /** Defaults to `32/icon_size` for items and recipes, and `256/icon_size` for technologies.

Specifies the scale of the icon on the GUI scale. A scale of `2` means that the icon will be two times bigger on screen (and thus more pixelated). */
  scale?: number;
  /** Used to offset the icon "layer" from the overall icon. The shift is applied from the center (so negative shifts are left and up, respectively). Shift values are based on final size (`icon_size * scale`) of the first icon. */
  shift?: Vector;
  /** The tint to apply to the icon. */
  tint?: Color;
}
interface _ImageStyleSpecification {
  graphical_set?: ElementImageSet;
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
  count?: number;
  /** Name of the [ItemPrototype](prototype:ItemPrototype) that should be created. */
  item: ItemID;
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
  sound: Sound;
}
interface _InvokeTileEffectTriggerEffectItem {
  tile_collision_mask?: CollisionMask;
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

/** An item ingredient definition. It can be specified as a table with named or numbered keys, but not a mix of both. */
interface _ItemIngredientPrototype {
  amount: number;
  /** Amount of this ingredient that should not be included in the item consumption statistics. Usually used together with an equal catalyst amount on the "product" of the catalyst in the recipe.

If this fluid is used in a recipe, the `catalyst_amount` is calculated automatically based on the [RecipePrototype::ingredients](prototype:RecipePrototype::ingredients) and [RecipePrototype::results](prototype:RecipePrototype::results). See [here](https://factorio.com/blog/post/fff-256). */
  catalyst_amount?: number;
  name: ItemID;
  type?: 'item';
}
/** An item product definition. It can be specified as a table with named or numbered keys, but not a mix of both. */
interface _ItemProductPrototype {
  amount?: number;
  /** Only loaded if `amount` is not defined.

If set to a number that is less than `amount_min`, the game will use `amount_min` instead. */
  amount_max: number;
  /** Only loaded if `amount` is not defined. */
  amount_min: number;
  /** Amount that should not be affected by productivity modules (not yielded from bonus production) and should not be included in the item production statistics.

If this item is used in a recipe, the `catalyst_amount` is calculated automatically based on the [RecipePrototype::ingredients](prototype:RecipePrototype::ingredients) and [RecipePrototype::results](prototype:RecipePrototype::results). See [here](https://factorio.com/blog/post/fff-256). */
  catalyst_amount?: number;
  /** The name of an [ItemPrototype](prototype:ItemPrototype). */
  name: ItemID;
  /** Value between 0 and 1, `0` for 0% chance and `1` for 100% chance.

The effect of probability is no product, or a linear distribution on [min, max]. For a recipe with probability `p`, amount_min `min`, and amount_max `max`, the Expected Value of this product can be expressed as `p * (0.5 * (max + min))`. This is what will be shown in a recipe tooltip. The effect of `catalyst_amount` on the product is not shown.

When `amount_min` and `amount_max` are not provided, `amount` applies as min and max. The Expected Value simplifies to `p * amount`, providing `0` product, or `amount` product, on recipe completion. */
  probability?: number;
  /** When hovering over a recipe in the crafting menu the recipe tooltip will be shown. An additional item tooltip will be shown for every product, as a separate tooltip, if the item tooltip has a description and/or properties to show and if `show_details_in_recipe_tooltip` is `true`. */
  show_details_in_recipe_tooltip?: boolean;
  type?: 'item';
}
/** Item that when placed creates this entity/tile. */
export interface ItemToPlace {
  /** How many items are used to place one of this entity. Can't be larger than the stack size of the item. */
  count: number;
  /** The item used to place this entity. */
  item: ItemID;
}
interface _LabelStyleSpecification {
  clicked_font_color?: Color;
  disabled_font_color?: Color;
  /** Name of a [FontPrototype](prototype:FontPrototype). */
  font?: string;
  font_color?: Color;
  game_controller_hovered_font_color?: Color;
  hovered_font_color?: Color;
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
/** Specifies a light source. This is loaded either as a single light source or as an array of light sources. */
interface _LightDefinition {
  add_perspective?: boolean;
  /** Color of the light. */
  color?: Color;
  /** Brightness of the light in the range `[0, 1]`, where `0` is no light and `1` is the maximum light. */
  intensity: number;
  minimum_darkness?: number;
  /** Only loaded if `type` is `"oriented"`. */
  picture: Sprite;
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
  /** Brightness of the light in the range [0, 1] where 0 is no light and 1 is the maximum light. */
  maximum_intensity?: number;
  /** Brightness of the light in the range [0, 1] where 0 is no light and 1 is the maximum light. */
  minimum_intensity?: number;
  /** The radius of the light in tiles. Note, that the light gets darker near the edges, so the effective size of the light seems to be smaller. */
  minimum_light_size?: number;
}
export interface LimitChestTipTrigger {
  count?: number;
  type: 'limit-chest';
}

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
  direction_in: Sprite4Way;
  direction_in_side_loading?: Sprite4Way;
  direction_out: Sprite4Way;
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
  direction_in: Sprite4Way;
  direction_out: Sprite4Way;
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
export interface LowPowerTipTrigger {
  count?: number;
  type: 'low-power';
}

export function isLowPowerTipTrigger(
  value: unknown,
): value is LowPowerTipTrigger {
  return (value as { type: string }).type === 'low-power';
}

export interface ManualTransferTipTrigger {
  count?: number;
  type: 'manual-transfer';
}

export function isManualTransferTipTrigger(
  value: unknown,
): value is ManualTransferTipTrigger {
  return (value as { type: string }).type === 'manual-transfer';
}

export interface ManualWireDragTipTrigger {
  count?: number;
  type: 'manual-wire-drag';
}

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
export interface MapGenPresetDifficultySettings {
  /** A [defines.difficulty_settings.recipe_difficulty](runtime:defines.difficulty_settings.recipe_difficulty). */
  recipe_difficulty?: number;
  research_queue_setting?: 'always' | 'after-victory' | 'never';
  /** A [defines.difficulty_settings.technology_difficulty](runtime:defines.difficulty_settings.technology_difficulty). */
  technology_difficulty?: number;
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
  /** Must be >= 0.1. Also known as dissipation rate. */
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
  /** Height of the map in tiles. Silently limited to 2'000'000, ie. +/- 1 million tiles from the center in both directions. */
  height?: number;
  peaceful_mode?: boolean;
  /** Map of property name (e.g. "elevation") to name of noise expression that will provide it. Entries may be omitted. A notable usage is changing autoplace behavior of an entity based on the preset, which cannot be read from a noise expression. */
  property_expression_names?: Record<string, string | boolean | number>;
  /** Read by the game, but not used or set in the GUI. */
  seed?: number;
  /** Size of the starting area. The starting area only effects enemy placement, and has no effect on resources. */
  starting_area?: MapGenSize;
  /** Array of the positions of the starting areas. */
  starting_points?: MapPosition[];
  /** This is the inverse of "water scale" in the map generator GUI. So a water scale that shows as 50% in the GUI is a value of `1/0.5 = 2` for `terrain_segmentation`. */
  terrain_segmentation?: MapGenSize;
  /** Shown as water coverage in the map generator GUI. */
  water?: MapGenSize;
  /** Width of the map in tiles. Silently limited to 2'000'000, ie. +/- 1 million tiles from the center in both directions. */
  width?: number;
}
/** Coordinates of a tile in a map. Positive x goes towards east, positive y goes towards south, and x is the first dimension in the array format.

The coordinates are saved as a fixed-size 32 bit integer, with 8 bits reserved for decimal precision, meaning the smallest value step is `1/2^8 = 0.00390625` tiles. */
interface _MapPosition {
  x: number;
  y: number;
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
  fluid_amount?: number;
  /** Name of a [ParticlePrototype](prototype:ParticlePrototype). Which set of particles to use. */
  mining_particle?: ParticleID;
  /** How many seconds are required to mine this object at 1 mining speed. */
  mining_time: number;
  mining_trigger: Trigger;
  /** Name of a [FluidPrototype](prototype:FluidPrototype). The fluid that is used up when this object is mined. */
  required_fluid: FluidID;
  /** Only loaded if `results` is not defined.

Which item is dropped when this is mined. Cannot be empty. If you want the entity to not be minable, don't specify the minable properties, if you want it to be minable with no result item, don't specify the result at all. */
  result?: ItemID;
  /** The items that are returned when this object is mined. */
  results?: ProductPrototype[];
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
export interface MiningDrillGraphicsSet {
  /** Only loaded if `idle_animation` is defined. */
  always_draw_idle_animation?: boolean;
  animation?: Animation4Way;
  animation_progress?: number;
  /** Render layer(s) for all directions of the circuit connectors. */
  circuit_connector_layer?: RenderLayer | CircuitConnectorLayer;
  /** Secondary draw order(s) for all directions of the circuit connectors. */
  circuit_connector_secondary_draw_order?:
    | number
    | CircuitConnectorSecondaryDrawOrder;
  default_recipe_tint?: DefaultRecipeTint;
  drilling_vertical_movement_duration?: number;
  /** Idle animation must have the same frame count as animation. */
  idle_animation?: Animation4Way;
  max_animation_progress?: number;
  min_animation_progress?: number;
  /** Only loaded if `shift_animation_waypoints` is defined. */
  shift_animation_transition_duration?: number;
  /** Only loaded if `shift_animation_waypoints` is defined. */
  shift_animation_waypoint_stop_duration?: number;
  /** Only loaded if one of `shift_animation_waypoint_stop_duration` or `shift_animation_transition_duration` is not `0`. */
  shift_animation_waypoints?: ShiftAnimationWaypoints;
  /** Used by [WorkingVisualisation::apply_tint](prototype:WorkingVisualisation::apply_tint). */
  status_colors?: StatusColors;
  working_visualisations?: WorkingVisualisation[];
}
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

/** The number of module slots in this entity, and their icon positions. */
export interface ModuleSpecification {
  module_info_icon_scale?: number;
  module_info_icon_shift?: Vector;
  module_info_max_icon_rows?: number;
  module_info_max_icons_per_row?: number;
  module_info_multi_row_initial_height_modifier?: number;
  module_info_separation_multiplier?: number;
  /** The number of module slots in this entity. */
  module_slots?: ItemStackIndex;
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

/** `value_expressions` property should be a list of numeric expressions, each of which will be evaluated to come up with the corresponding numeric value in the resulting array.

Used to construct map positions (`{x, y}`) and map position lists (`{{x0,y0}, {y1,y1}, [...]}`) for [offset-points](prototype:NoiseFunctionOffsetPoints) and [distance-from-nearest-point](prototype:NoiseFunctionDistanceFromNearestPoint) functions. */
export interface NoiseArrayConstruction {
  type: 'array-construction';
  value_expressions: NoiseExpression[];
}

export function isNoiseArrayConstruction(
  value: unknown,
): value is NoiseArrayConstruction {
  return (value as { type: string }).type === 'array-construction';
}

/** Takes a single argument and returns its absolute value. Ie. if the argument is negative, it is inverted. */
export interface NoiseFunctionAbsoluteValue {
  arguments: [NoiseNumber];
  function_name: 'absolute-value';
  type: 'function-application';
}

export function isNoiseFunctionAbsoluteValue(
  value: unknown,
): value is NoiseFunctionAbsoluteValue {
  return (value as { type: string }).type === 'function-application';
}

/** Takes between 0 and 32 numbers and adds them up. */
export interface NoiseFunctionAdd {
  arguments: NoiseNumber[];
  function_name: 'add';
  type: 'function-application';
}

export function isNoiseFunctionAdd(value: unknown): value is NoiseFunctionAdd {
  return (value as { type: string }).type === 'function-application';
}

/** Returns the arc tangent of y/x using the signs of arguments to determine the correct quadrant. */
export interface NoiseFunctionAtan2 {
  /** The first argument is y and the second is x. */
  arguments: [NoiseNumber, NoiseNumber];
  function_name: 'atan2';
  type: 'function-application';
}

export function isNoiseFunctionAtan2(
  value: unknown,
): value is NoiseFunctionAtan2 {
  return (value as { type: string }).type === 'function-application';
}

export interface NoiseFunctionAutoplaceProbability {
  arguments: [NoiseLiteralObject];
  function_name: 'autoplace-probability';
  type: 'function-application';
}

export function isNoiseFunctionAutoplaceProbability(
  value: unknown,
): value is NoiseFunctionAutoplaceProbability {
  return (value as { type: string }).type === 'function-application';
}

export interface NoiseFunctionAutoplaceRichness {
  arguments: [NoiseLiteralObject];
  function_name: 'autoplace-richness';
  type: 'function-application';
}

export function isNoiseFunctionAutoplaceRichness(
  value: unknown,
): value is NoiseFunctionAutoplaceRichness {
  return (value as { type: string }).type === 'function-application';
}

/** Casts between 0 and 32 numbers to 32-bit integers and performs a bitwise AND on them. */
export interface NoiseFunctionBitwiseAnd {
  arguments: NoiseNumber[];
  function_name: 'bitwise-and';
  type: 'function-application';
}

export function isNoiseFunctionBitwiseAnd(
  value: unknown,
): value is NoiseFunctionBitwiseAnd {
  return (value as { type: string }).type === 'function-application';
}

/** Casts the single argument to a 32-bit integer and performs bitwise negates it. */
export interface NoiseFunctionBitwiseNot {
  arguments: [NoiseNumber];
  function_name: 'bitwise-not';
  type: 'function-application';
}

export function isNoiseFunctionBitwiseNot(
  value: unknown,
): value is NoiseFunctionBitwiseNot {
  return (value as { type: string }).type === 'function-application';
}

/** Casts between 0 and 32 numbers to 32-bit integers and performs a bitwise OR on them. */
export interface NoiseFunctionBitwiseOr {
  arguments: NoiseNumber[];
  function_name: 'bitwise-or';
  type: 'function-application';
}

export function isNoiseFunctionBitwiseOr(
  value: unknown,
): value is NoiseFunctionBitwiseOr {
  return (value as { type: string }).type === 'function-application';
}

/** Casts between 0 and 32 numbers to 32-bit integers and performs a bitwise EXCLUSIVE OR on them. */
export interface NoiseFunctionBitwiseXor {
  arguments: NoiseNumber[];
  function_name: 'bitwise-xor';
  type: 'function-application';
}

export function isNoiseFunctionBitwiseXor(
  value: unknown,
): value is NoiseFunctionBitwiseXor {
  return (value as { type: string }).type === 'function-application';
}

/** Takes a single argument and returns its ceil. */
export interface NoiseFunctionCeil {
  arguments: [NoiseNumber];
  function_name: 'ceil';
  type: 'function-application';
}

export function isNoiseFunctionCeil(
  value: unknown,
): value is NoiseFunctionCeil {
  return (value as { type: string }).type === 'function-application';
}

/** The first argument is clamped to be between the second and third. The second is treated as a lower limit and the third the upper limit. */
export interface NoiseFunctionClamp {
  arguments: [NoiseNumber, NoiseNumber, NoiseNumber];
  function_name: 'clamp';
  type: 'function-application';
}

export function isNoiseFunctionClamp(
  value: unknown,
): value is NoiseFunctionClamp {
  return (value as { type: string }).type === 'function-application';
}

/** Prints between 0 and 32 arguments to the [log file](https://wiki.factorio.com/Log_file) when the expression is compiled. For that it needs to part of another expression that is compiled. The last argument of the `compile-time-log` is returned as the "result" of the `compile-time-log`. */
export interface NoiseFunctionCompileTimeLog {
  arguments: NoiseExpression[];
  function_name: 'compile-time-log';
  type: 'function-application';
}

export function isNoiseFunctionCompileTimeLog(
  value: unknown,
): value is NoiseFunctionCompileTimeLog {
  return (value as { type: string }).type === 'function-application';
}

/** Takes a single argument and returns its cosine. */
export interface NoiseFunctionCos {
  arguments: [NoiseNumber];
  function_name: 'cos';
  type: 'function-application';
}

export function isNoiseFunctionCos(value: unknown): value is NoiseFunctionCos {
  return (value as { type: string }).type === 'function-application';
}

/** Computes the [euclidean distance](https://en.wikipedia.org/wiki/Euclidean_distance) of the position `{x, y}` to all position listed in points and returns the shortest distance. The returned distance can be `maximum_distance` at most. */
export interface NoiseFunctionDistanceFromNearestPoint {
  arguments: DistanceFromNearestPointArguments;
  function_name: 'distance-from-nearest-point';
  type: 'function-application';
}

export function isNoiseFunctionDistanceFromNearestPoint(
  value: unknown,
): value is NoiseFunctionDistanceFromNearestPoint {
  return (value as { type: string }).type === 'function-application';
}

/** Takes two arguments and divides the first by the second. */
export interface NoiseFunctionDivide {
  arguments: [NoiseNumber, NoiseNumber];
  function_name: 'divide';
  type: 'function-application';
}

export function isNoiseFunctionDivide(
  value: unknown,
): value is NoiseFunctionDivide {
  return (value as { type: string }).type === 'function-application';
}

/** Returns the result of first argument == second argument as a literal number that is `0` for false and `1` for true. */
export interface NoiseFunctionEquals {
  arguments: [NoiseNumber, NoiseNumber];
  function_name: 'equals';
  type: 'function-application';
}

export function isNoiseFunctionEquals(
  value: unknown,
): value is NoiseFunctionEquals {
  return (value as { type: string }).type === 'function-application';
}

/** Takes two arguments and raises the first to the second power. */
export interface NoiseFunctionExponentiate {
  arguments: [NoiseNumber, NoiseNumber];
  function_name: 'exponentiate';
  type: 'function-application';
}

export function isNoiseFunctionExponentiate(
  value: unknown,
): value is NoiseFunctionExponentiate {
  return (value as { type: string }).type === 'function-application';
}

/** Scaling input and output can be accomplished other ways, but are done so commonly as to be built into this function for performance reasons. */
export interface NoiseFunctionFactorioBasisNoise {
  arguments: FactorioBasisNoiseArguments;
  function_name: 'factorio-basis-noise';
  type: 'function-application';
}

export function isNoiseFunctionFactorioBasisNoise(
  value: unknown,
): value is NoiseFunctionFactorioBasisNoise {
  return (value as { type: string }).type === 'function-application';
}

export interface NoiseFunctionFactorioMultioctaveNoise {
  arguments: FactorioMultioctaveNoiseArguments;
  function_name: 'factorio-multioctave-noise';
  type: 'function-application';
}

export function isNoiseFunctionFactorioMultioctaveNoise(
  value: unknown,
): value is NoiseFunctionFactorioMultioctaveNoise {
  return (value as { type: string }).type === 'function-application';
}

export interface NoiseFunctionFactorioQuickMultioctaveNoise {
  arguments: FactorioQuickMultioctaveNoiseArguments;
  function_name: 'factorio-quick-multioctave-noise';
  type: 'function-application';
}

export function isNoiseFunctionFactorioQuickMultioctaveNoise(
  value: unknown,
): value is NoiseFunctionFactorioQuickMultioctaveNoise {
  return (value as { type: string }).type === 'function-application';
}

/** Takes a single argument and returns its floor. */
export interface NoiseFunctionFloor {
  arguments: [NoiseNumber];
  function_name: 'floor';
  type: 'function-application';
}

export function isNoiseFunctionFloor(
  value: unknown,
): value is NoiseFunctionFloor {
  return (value as { type: string }).type === 'function-application';
}

/** Returns the result of first argument <= second argument as a literal number that is `0` for false and `1` for true. */
export interface NoiseFunctionLessOrEqual {
  arguments: [NoiseNumber, NoiseNumber];
  function_name: 'less-or-equal';
  type: 'function-application';
}

export function isNoiseFunctionLessOrEqual(
  value: unknown,
): value is NoiseFunctionLessOrEqual {
  return (value as { type: string }).type === 'function-application';
}

/** Returns the result of first argument < second argument as a literal number that is `0` for false and `1` for true. */
export interface NoiseFunctionLessThan {
  arguments: [NoiseNumber, NoiseNumber];
  function_name: 'less-than';
  type: 'function-application';
}

export function isNoiseFunctionLessThan(
  value: unknown,
): value is NoiseFunctionLessThan {
  return (value as { type: string }).type === 'function-application';
}

export interface NoiseFunctionLog2 {
  arguments: [NoiseNumber];
  function_name: 'log2';
  type: 'function-application';
}

export function isNoiseFunctionLog2(
  value: unknown,
): value is NoiseFunctionLog2 {
  return (value as { type: string }).type === 'function-application';
}

/** Takes two arguments and divides the first by the second and returns the remainder. This is implemented using [fmod(double, double)](https://en.cppreference.com/w/cpp/numeric/math/fmod). */
export interface NoiseFunctionModulo {
  arguments: [NoiseNumber, NoiseNumber];
  function_name: 'modulo';
  type: 'function-application';
}

export function isNoiseFunctionModulo(
  value: unknown,
): value is NoiseFunctionModulo {
  return (value as { type: string }).type === 'function-application';
}

/** Takes between 0 and 32 numbers and multiplies them. */
export interface NoiseFunctionMultiply {
  arguments: NoiseNumber[];
  function_name: 'multiply';
  type: 'function-application';
}

export function isNoiseFunctionMultiply(
  value: unknown,
): value is NoiseFunctionMultiply {
  return (value as { type: string }).type === 'function-application';
}

export interface NoiseFunctionNoiseLayerNameToID {
  arguments: [NoiseLiteralString];
  function_name: 'noise-layer-name-to-id';
  type: 'function-application';
}

export function isNoiseFunctionNoiseLayerNameToID(
  value: unknown,
): value is NoiseFunctionNoiseLayerNameToID {
  return (value as { type: string }).type === 'function-application';
}

/** The first argument represents a vector of how the positions should be shifted, and the second argument lists the positions that should be shifted. */
export interface NoiseFunctionOffsetPoints {
  arguments: [NoiseArrayConstruction, NoiseArrayConstruction];
  function_name: 'offset-points';
  type: 'function-application';
}

export function isNoiseFunctionOffsetPoints(
  value: unknown,
): value is NoiseFunctionOffsetPoints {
  return (value as { type: string }).type === 'function-application';
}

/** Subtracts a random value in the `[0, amplitude)` range from `source` if `source` is larger than `0`. */
export interface NoiseFunctionRandomPenalty {
  arguments: RandomPenaltyArguments;
  function_name: 'random-penalty';
  type: 'function-application';
}

export function isNoiseFunctionRandomPenalty(
  value: unknown,
): value is NoiseFunctionRandomPenalty {
  return (value as { type: string }).type === 'function-application';
}

/** Similar to [clamp](prototype:NoiseFunctionClamp), where the first argument is folded back across the third and second limits until it lies between them. */
export interface NoiseFunctionRidge {
  /** The first argument is the  number to be ridged, the second is the lower limit and the third is the upper limit. */
  arguments: [NoiseNumber, NoiseNumber, NoiseNumber];
  function_name: 'ridge';
  type: 'function-application';
}

export function isNoiseFunctionRidge(
  value: unknown,
): value is NoiseFunctionRidge {
  return (value as { type: string }).type === 'function-application';
}

/** Takes a single argument and returns its sine. */
export interface NoiseFunctionSin {
  arguments: [NoiseNumber];
  function_name: 'sin';
  type: 'function-application';
}

export function isNoiseFunctionSin(value: unknown): value is NoiseFunctionSin {
  return (value as { type: string }).type === 'function-application';
}

/** Generates random conical spots. The map is divided into square regions, and within each region, candidate points are chosen at random and target density, spot quantity, and radius are calculated for each point (or one of every `skip_span` candidate points) by configured expressions. Each spot contributes a quantity to a regional target total (which is the average of sampled target densities times the area of the region) until the total has been reached or a maximum spot count is hit. The output value of the function is the maximum height of any spot at a given point.

The parameters that provide expressions to be evaluated for each point (all named something_expression) need to actually return expression objects.

The quantity of the spot is assumed to be the same as its volume. Since the volume of a cone is `pi * radius^2 * height / 3`, the height ('peak value') of any given spot is calculated as `3 * quantity / (pi * radius^2)`

The infinite series of candidate points (of which `candidate_point_count` are actually considered) generated by `spot-noise` expressions with the same `seed0`, `seed1`, `region_size`, and `suggested_minimum_candidate_point_spacing` will be identical. This allows multiple spot-noise expressions (e.g. for different ore patches) to avoid overlap by using different points from the same list, determined by `skip_span` and `skip_offset`. */
export interface NoiseFunctionSpotNoise {
  arguments: SpotNoiseArguments;
  function_name: 'spot-noise';
  type: 'function-application';
}

export function isNoiseFunctionSpotNoise(
  value: unknown,
): value is NoiseFunctionSpotNoise {
  return (value as { type: string }).type === 'function-application';
}

/** Takes two arguments and subtracts the second from the first. */
export interface NoiseFunctionSubtract {
  arguments: [NoiseNumber, NoiseNumber];
  function_name: 'subtract';
  type: 'function-application';
}

export function isNoiseFunctionSubtract(
  value: unknown,
): value is NoiseFunctionSubtract {
  return (value as { type: string }).type === 'function-application';
}

/** The first argument is the value to be terraced. The second argument is the offset, the third the width, and the fourth the strength. */
export interface NoiseFunctionTerrace {
  arguments: [
    NoiseNumber,
    ConstantNoiseNumber,
    ConstantNoiseNumber,
    NoiseNumber,
  ];
  function_name: 'terrace';
  type: 'function-application';
}

export function isNoiseFunctionTerrace(
  value: unknown,
): value is NoiseFunctionTerrace {
  return (value as { type: string }).type === 'function-application';
}

/** Has an `arguments` property that is a list of condition-result expression pairs followed by a default result expression, like so:

```
{
  type = "if-else-chain",
  arguments = {
    condition1, result1,
    condition2, result2,
    ...
    defaultResult
  }
}
```

The result of the if-else-chain is the value of the first result expression whose condition expression evaluated to true, or the value of the default result ('else') expression. */
export interface NoiseIfElseChain {
  arguments: NoiseExpression[];
  type: 'if-else-chain';
}

export function isNoiseIfElseChain(value: unknown): value is NoiseIfElseChain {
  return (value as { type: string }).type === 'if-else-chain';
}

/** Evaluates to the same boolean value (true or false) every time, given by the `literal_value` property. May be used as a number value, evaluates to `1` for true and `0` for false. */
export interface NoiseLiteralBoolean {
  literal_value: boolean;
  type: 'literal-boolean';
}

export function isNoiseLiteralBoolean(
  value: unknown,
): value is NoiseLiteralBoolean {
  return (value as { type: string }).type === 'literal-boolean';
}

/** Returns the expression represented by its `literal_value` property. Useful mostly for passing expressions (to be evaluated later) to the [spot-noise](prototype:NoiseFunctionSpotNoise) function. */
export interface NoiseLiteralExpression {
  literal_value: NoiseExpression;
  type: 'literal-expression';
}

export function isNoiseLiteralExpression(
  value: unknown,
): value is NoiseLiteralExpression {
  return (value as { type: string }).type === 'literal-expression';
}

/** Evaluates to the same number every time, given by the `literal_value` property. All numbers are treated as [float](prototype:float) internally unless otherwise specified. May be used as a boolean value, evaluates to true for numbers bigger than zero, anything else evaluates to false. */
export interface NoiseLiteralNumber {
  literal_value: number;
  type: 'literal-number';
}

export function isNoiseLiteralNumber(
  value: unknown,
): value is NoiseLiteralNumber {
  return (value as { type: string }).type === 'literal-number';
}

/** Evaluates to the same object every time, given by the `literal_value` property. Since the noise generation runtime has no notion of objects or use for them, this is useful only in constant contexts, such as the argument of the `autoplace-probability` function (where the 'literal object' is an [AutoplaceSpecification](prototype:AutoplaceSpecification)). */
export interface NoiseLiteralObject {
  literal_value: AutoplaceSpecification;
  type: 'literal-object';
}

export function isNoiseLiteralObject(
  value: unknown,
): value is NoiseLiteralObject {
  return (value as { type: string }).type === 'literal-object';
}

/** Evaluates to the same string every time, given by the `literal_value` property. Since the noise generation runtime has no notion of strings or use for them, this is useful only in constant contexts. */
export interface NoiseLiteralString {
  literal_value: string;
  type: 'literal-string';
}

export function isNoiseLiteralString(
  value: unknown,
): value is NoiseLiteralString {
  return (value as { type: string }).type === 'literal-string';
}

/** Evaluates and returns the value of its expression property, which is itself an expression.

This hints to the compiler that it should break the subexpression into its own procedure so that the result can be re-used in multiple places. For instance if you want to re-use the same multioctave noise for determining probability of multiple tiles/entities, wrap the multioctave noise expression in a procedure-delimiter. Alternatively, make the noise its own [NamedNoiseExpression](prototype:NamedNoiseExpression) and reference it by name, using a [NoiseVariable](prototype:NoiseVariable). */
export interface NoiseProcedureDelimiter {
  expression: NoiseExpression;
  type: 'procedure-delimiter';
}

export function isNoiseProcedureDelimiter(
  value: unknown,
): value is NoiseProcedureDelimiter {
  return (value as { type: string }).type === 'procedure-delimiter';
}

/** Variables referencing named noise expressions may have their reference overridden by other named noise expression if their `intended_property` is the variable name and it is selected by the user in the map generator GUI. See the second example on [NamedNoiseExpression::intended_property](prototype:NamedNoiseExpression::intended_property). */
export interface NoiseVariable {
  type: 'variable';
  /** A string referring to a pre-defined variable, constant, or [NamedNoiseExpression](prototype:NamedNoiseExpression).

The `"x"` or `"y"` variables refer to the current coordinates of the map position being evaluated.

The constants refer to a set of values mostly defined by [MapGenSettings](prototype:MapGenSettings).

The named noise expressions refer to one of the notable [BaseNamedNoiseExpressions](prototype:BaseNamedNoiseExpressions), or any other existing one by name. */
  variable_name:
    | 'x'
    | 'y'
    | NoiseVariableConstants
    | BaseNamedNoiseExpressions
    | string;
}

export function isNoiseVariable(value: unknown): value is NoiseVariable {
  return (value as { type: string }).type === 'variable';
}

interface _NothingModifier {
  effect_description?: LocalisedString;
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type NothingModifier = _NothingModifier &
  Omit<BaseModifier, keyof _NothingModifier>;
export interface OffshorePumpGraphicsSet {
  /** Rendered in "object" layer, with secondary draw order 0. */
  animation: Animation4Way;
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
  fill_volume: number;
  pictures: SpriteVariations;
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
export interface PasteEntitySettingsTipTrigger {
  count?: number;
  match_type_only?: boolean;
  source?: EntityID;
  target?: EntityID;
  type: 'paste-entity-settings';
}

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
export interface PipeConnectionDefinition {
  /** `0` means not underground. */
  max_underground_distance?: number;
  /** Where pipes can connect to this fluidbox regardless the directions of entity. */
  position?: Vector;
  /** Only loaded if `position` is not defined.

Where pipes can connect to this fluidbox, depending on the entity direction.

Table must have 4 members, which are 4 explicit positions corresponding to the 4 directions of entity. Positions must correspond to directions going one after another. */
  positions: Vector[];
  type?: 'input' | 'input-output' | 'output';
}
export interface PipePictures {
  corner_down_left: Sprite;
  corner_down_right: Sprite;
  corner_up_left: Sprite;
  corner_up_right: Sprite;
  cross: Sprite;
  ending_down: Sprite;
  ending_left: Sprite;
  ending_right: Sprite;
  ending_up: Sprite;
  fluid_background: Sprite;
  gas_flow: Animation;
  high_temperature_flow: Sprite;
  horizontal_window_background: Sprite;
  low_temperature_flow: Sprite;
  middle_temperature_flow: Sprite;
  straight_horizontal: Sprite;
  straight_horizontal_window: Sprite;
  straight_vertical: Sprite;
  straight_vertical_single: Sprite;
  straight_vertical_window: Sprite;
  t_down: Sprite;
  t_left: Sprite;
  t_right: Sprite;
  t_up: Sprite;
  vertical_window_background: Sprite;
}
export interface PipeToGroundPictures {
  down: Sprite;
  left: Sprite;
  right: Sprite;
  up: Sprite;
}
export interface PlaceAsTile {
  condition: CollisionMask;
  condition_size: number;
  result: TileID;
}
export interface PlaceEquipmentTipTrigger {
  count?: number;
  equipment?: EquipmentID;
  type: 'place-equipment';
}

export function isPlaceEquipmentTipTrigger(
  value: unknown,
): value is PlaceEquipmentTipTrigger {
  return (value as { type: string }).type === 'place-equipment';
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
/** The pollution settings, the values are for 60 ticks (1 second). */
export interface PollutionSettings {
  /** Constant modifier a percentage of 1; the pollution eaten by a chunks tiles. */
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
export interface ProgrammableSpeakerInstrument {
  name: string;
  notes: ProgrammableSpeakerNote[];
}
export interface ProgrammableSpeakerNote {
  name: string;
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
  /** When used with `projectile_creation_parameters`, this offsets what the turret's sprite looks at. Setting to `{0,1}` will cause the turret to aim one tile up from the target but the projectile will still aim for the entity. Can be used to give the illusion of height but can also confuse aim logic when set too high.

When used without `projectile_creation_parameters`, this sets the turret's rotation axis. */
  projectile_center?: Vector;
  projectile_creation_distance?: number;
  /** Used to shoot projectiles from arbitrary points. Used by worms and multi-barreled weapons. Use multiple points with the same angle to cause the turret to shoot from multiple barrels. If not set then the launch positions are calculated using `projectile_center` and `projectile_creation_distance`. */
  projectile_creation_parameters?: CircularProjectileCreationSpecification;
  /** Used to shoot from different sides of the turret. Setting to `0.25` shoots from the right side, `0.5` shoots from the back, and `0.75` shoots from the left. The turret will look at the enemy as normal but the bullet will spawn from the offset position. Can be used to create right-handed weapons. */
  projectile_orientation_offset?: number;
  /** Used to show bullet shells/casings being ejected from the gun, e.g. [artillery shell casings](https://factorio.com/blog/post/fff-345). */
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
export interface RailPictureSet {
  curved_rail_horizontal_left_bottom: RailPieceLayers;
  curved_rail_horizontal_left_top: RailPieceLayers;
  curved_rail_horizontal_right_bottom: RailPieceLayers;
  curved_rail_horizontal_right_top: RailPieceLayers;
  curved_rail_vertical_left_bottom: RailPieceLayers;
  curved_rail_vertical_left_top: RailPieceLayers;
  curved_rail_vertical_right_bottom: RailPieceLayers;
  curved_rail_vertical_right_top: RailPieceLayers;
  rail_endings: Sprite8Way;
  straight_rail_diagonal_left_bottom: RailPieceLayers;
  straight_rail_diagonal_left_top: RailPieceLayers;
  straight_rail_diagonal_right_bottom: RailPieceLayers;
  straight_rail_diagonal_right_top: RailPieceLayers;
  straight_rail_horizontal: RailPieceLayers;
  straight_rail_vertical: RailPieceLayers;
}
/** Used for graphics by [RailPrototype](prototype:RailPrototype) and [RailRemnantsPrototype](prototype:RailRemnantsPrototype). */
export interface RailPieceLayers {
  /** Must have same number of variations as `metals`. */
  backplates: SpriteVariations;
  /** Must have between 1 and 4 variations. */
  metals: SpriteVariations;
  segment_visualisation_continuing_back?: Sprite;
  segment_visualisation_continuing_front?: Sprite;
  segment_visualisation_ending_back?: Sprite;
  segment_visualisation_ending_front?: Sprite;
  segment_visualisation_middle?: Sprite;
  /** Must have between 1 and 4 variations. */
  stone_path: SpriteVariations;
  /** Must have less or equal than 4 variations. */
  stone_path_background?: SpriteVariations;
  /** Must have between 1 and 4 variations. */
  ties: SpriteVariations;
}
export interface RandomPenaltyArguments {
  amplitude?: ConstantNoiseNumber;
  /** Integer used to seed the random generator. */
  seed?: ConstantNoiseNumber;
  /** Number that the penalty is applied to. */
  source: NoiseNumber;
  /** Number used to seed the random generator. */
  x: NoiseNumber;
  /** Number used to seed the random generator. */
  y: NoiseNumber;
}
/** Used when defining a [RecipePrototype](prototype:RecipePrototype) that uses difficulty. For a recipe without difficulty, these same properties are defined on the prototype itself. */
export interface RecipeData {
  /** Whether the recipe can be used as an intermediate recipe in hand-crafting. */
  allow_as_intermediate?: boolean;
  /** Whether this recipe is allowed to be broken down for the recipe tooltip "Total raw" calculations. */
  allow_decomposition?: boolean;
  /** Whether the recipe is allowed to have the extra inserter overload bonus applied (4 * stack inserter stack size). */
  allow_inserter_overload?: boolean;
  /** Whether the recipe is allowed to use intermediate recipes when hand-crafting. */
  allow_intermediates?: boolean;
  /** Whether the "Made in: <Machine>" part of the tool-tip should always be present, and not only when the recipe can't be hand-crafted. */
  always_show_made_in?: boolean;
  /** Whether the products are always shown in the recipe tooltip. */
  always_show_products?: boolean;
  emissions_multiplier?: number;
  /** This can be `false` to disable the recipe at the start of the game, or `true` to leave it enabled.

If a recipe is unlocked via technology, this should be set to `false`. */
  enabled?: boolean;
  /** The amount of time it takes to make this recipe. Must be `> 0.001`. Equals the number of seconds it takes to craft at crafting speed `1`. */
  energy_required?: number;
  /** Hides the recipe from crafting menus. */
  hidden?: boolean;
  /** Hides the recipe from the player's crafting screen. The recipe will still show up for selection in machines. */
  hide_from_player_crafting?: boolean;
  /** Hides the recipe from item/fluid production statistics. */
  hide_from_stats?: boolean;
  /** A table containing ingredient names and counts. Can also contain information about fluid temperature and catalyst amounts. The catalyst amounts are automatically calculated from the recipe, or can be set manually in the IngredientPrototype (see [here](https://factorio.com/blog/post/fff-256)).

The maximum ingredient amount is 65535. Can be set to an empty table to create a recipe that needs no ingredients.

Duplicate ingredients, e.g. two entries with the same name, are *not* allowed. In-game, the item ingredients are ordered by [ItemGroup::order_in_recipe](prototype:ItemGroup::order_in_recipe). */
  ingredients: IngredientPrototype[];
  /** For recipes with one or more products: Subgroup, localised_name and icon default to the values of the singular/main product, but can be overwritten by the recipe. Setting the main_product to an empty string (`""`) forces the title in the recipe tooltip to use the recipe's name (not that of the product) and shows the products in the tooltip.

If 1) there are multiple products and this property is nil, 2) this property is set to an empty string (`""`), or 3) there are no products, the recipe will use the localised_name, icon, and subgroup of the recipe. icon and subgroup become non-optional. */
  main_product?: string;
  /** Used to determine how many extra items are put into an assembling machine before it's considered "full enough". See [insertion limits](https://wiki.factorio.com/Inserters#Insertion_limits).

If set to `0`, it instead uses the following formula: `1.166 / (energy_required / the assembler's crafting_speed)`, rounded up, and clamped to be between`2` and `100`. The numbers used in this formula can be changed by the [UtilityConstants](prototype:UtilityConstants) properties `dynamic_recipe_overload_factor`, `minimum_recipe_overload_multiplier`, and `maximum_recipe_overload_multiplier`. */
  overload_multiplier?: number;
  requester_paste_multiplier?: number;
  /** The item created by this recipe. Must be the name of an [item](prototype:ItemPrototype), such as `"iron-gear-wheel"`.

Only loaded if `results` is not defined. */
  result?: ItemID;
  /** The number of items created by this recipe.

Only loaded if `results` is not defined. */
  result_count?: number;
  /** A table containing result names and counts. Can also contain information about fluid temperature and catalyst amounts. The catalyst amounts are automatically calculated from the recipe, or can be set manually in the ProductPrototype (see [here](https://factorio.com/blog/post/fff-256)).

Can be set to an empty table to create a recipe that produces nothing. Duplicate results, e.g. two entries with the same name, are allowed. */
  results: ProductPrototype[];
  /** Whether the recipe name should have the product amount in front of it, e.g. "2x Transport belt" */
  show_amount_in_title?: boolean;
  /** Whether enabling this recipe unlocks its item products to show in selection lists (item filters, logistic requests, etc.). */
  unlock_results?: boolean;
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

/** Resistances to certain types of attacks from enemy, and physical damage. See [Damage](https://wiki.factorio.com/Damage). */
export interface Resistances {
  /** The [flat resistance](https://wiki.factorio.com/Damage#Decrease.2C_or_.22flat.22_resistance) to the given damage type. (Higher is better) */
  decrease?: number;
  /** The [percentage resistance](https://wiki.factorio.com/Damage#Percentage_resistance) to the given damage type. (Higher is better) */
  percent?: number;
  type: DamageTypeID;
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
  direction_count: number;
  /** Only loaded if `layers`, `stripes`, and `filenames` are not defined.

The path to the sprite file to use. */
  filename: FileName;
  /** Only loaded if both `layers` and `stripes` are not defined. */
  filenames?: FileName[];
  /** Only loaded if `layers` is not defined.

If this property exists and high resolution sprites are turned on, this is used to load the animation. */
  hr_version?: RotatedAnimation;
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
/** A map of rotated animations for all 4 directions of the entity. If this is loaded as a single RotatedAnimation, it applies to all directions. */
interface _RotatedAnimation4Way {
  /** Defaults to the north animation. */
  east?: RotatedAnimation;
  north: RotatedAnimation;
  /** Defaults to the north animation. */
  south?: RotatedAnimation;
  /** Defaults to the east animation. */
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
  /** Count of direction (frames) specified. */
  direction_count: number;
  /** Only loaded if `layers` is not defined.

The path to the sprite file to use. */
  filename?: FileName;
  /** Only loaded if both `layers` and `filename` are not defined. */
  filenames: FileName[];
  /** Only loaded if `layers` is not defined.

Unused. */
  generate_sdf?: boolean;
  /** Only loaded if `layers` is not defined.

If this property exists and high resolution sprites are turned on, this is used to load the sprite. */
  hr_version?: RotatedSprite;
  /** If this property is present, all RotatedSprite definitions have to be placed as entries in the array, and they will all be loaded from there. `layers` may not be an empty table. Each definition in the array may also have the `layers` property.

If this property is present, all other properties, including those inherited from SpriteParameters, are ignored. */
  layers?: RotatedSprite[];
  /** Only loaded if `layers` is not defined.

Once the specified number of pictures is loaded, other pictures are loaded on other line. This is to allow having more sprites in matrix, to input files with too high width. The game engine limits the width of any input files to 8192px, so it is compatible with most graphics cards. 0 means that all the pictures are in one horizontal line. */
  line_length?: number;
  /** Only loaded if `layers` is not defined. Mandatory if `filenames` is defined. */
  lines_per_file?: number;
  /** Only loaded if `layers` is not defined.

Number of slices this is sliced into when using the "optimized atlas packing" option. If you are a modder, you can just ignore this property. As an example, if this is `4`, the sprite will be sliced into a `4x4` grid. */
  slice?: SpriteSizeType;
  /** Only loaded if `layers` is not defined.

Same as `slice`, but this specifies only how many slices there are on the x-axis. */
  slice_x?: SpriteSizeType;
  /** Only loaded if `layers` is not defined.

Same as `slice`, but this specifies only how many slices there are on the y-axis. */
  slice_y?: SpriteSizeType;
}

export type RotatedSprite = _RotatedSprite &
  Omit<SpriteParameters, keyof _RotatedSprite>;
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

export interface SetFilterTipTrigger {
  consecutive?: boolean;
  count?: number;
  entity?: EntityID;
  match_type_only?: boolean;
  type: 'set-filter';
}

export function isSetFilterTipTrigger(
  value: unknown,
): value is SetFilterTipTrigger {
  return (value as { type: string }).type === 'set-filter';
}

export interface SetLogisticRequestTipTrigger {
  count?: number;
  logistic_chest_only?: boolean;
  type: 'set-logistic-request';
}

export function isSetLogisticRequestTipTrigger(
  value: unknown,
): value is SetLogisticRequestTipTrigger {
  return (value as { type: string }).type === 'set-logistic-request';
}

export interface SetRecipeTipTrigger {
  consecutive?: boolean;
  machine?: EntityID;
  recipe?: RecipeID;
  type: 'set-recipe';
  uses_fluid?: boolean;
}

export function isSetRecipeTipTrigger(
  value: unknown,
): value is SetRecipeTipTrigger {
  return (value as { type: string }).type === 'set-recipe';
}

interface _SetTileTriggerEffectItem {
  apply_projection?: boolean;
  radius: number;
  tile_collision_mask?: CollisionMask;
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

export interface ShiftAnimationWaypoints {
  east: Vector[];
  north: Vector[];
  south: Vector[];
  west: Vector[];
}
export interface ShiftBuildTipTrigger {
  count?: number;
  type: 'shift-build';
}

export function isShiftBuildTipTrigger(
  value: unknown,
): value is ShiftBuildTipTrigger {
  return (value as { type: string }).type === 'shift-build';
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

export interface SignalColorMapping {
  color: Color;
  /** Name of the signal that shows this color. */
  name: VirtualSignalID | ItemID | FluidID;
  type: 'virtual' | 'item' | 'fluid';
}
export interface SignalIDConnector {
  /** Name of the signal that shows this color. */
  name: VirtualSignalID | ItemID | FluidID;
  type: 'virtual' | 'item' | 'fluid';
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
game.activate_rail_planner{position=position,ghost_mode=bool}
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
game.smart_belt_building [W]
player.drag_start_position [W]
player.raw_build_from_cursor{ghost_mode=bool,created_by_moving=bool,position=position}
surface.create_entities_from_blueprint_string{string=string,position=position,force=force,direction=defines.direction,flip_horizonal=bool,flip_vertical=bool,by_player=player}
``` */
export interface SimulationDefinition {
  /** If this is true, the map of the simulation is set to be a lab-tile checkerboard in the area of `{{-20, -15},{20, 15}}` when the scenario is first initialized (before init/init_file run). */
  checkboard?: boolean;
  /** If `save` is not given and this is true, a map gets generated by the game for use in the simulation. */
  generate_map?: boolean;
  /** Only loaded if `init_file` is not defined.

This code is run as a (silent) console command inside the simulation when it is first initialized. Since this is run as a console command, the restrictions of console commands apply, e.g. `require` is not available, see [here](runtime:libraries). */
  init?: string;
  /** This code is run as a (silent) console command inside the simulation when it is first initialized. Since this is run as a console command, the restrictions of console commands apply, e.g. `require` is not available, see [here](runtime:libraries). */
  init_file?: FileName;
  /** Amount of ticks that this simulation should run for before the simulation is shown to the player. These updates happen after init/init_file has been run and at the highest possible rate (> 60 UPS). */
  init_update_count?: number;
  /** How long this simulation takes. In the main menu simulations, another simulation will start after this simulation ends. */
  length?: number;
  /** If true, overrides the simulation volume set by the player in the sound settings, simply setting the volume modifier to `1`. */
  override_volume?: boolean;
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
  deviation?: MapPosition;
  east_position?: Vector;
  /** Can't be negative, NaN or infinite. */
  frequency: number;
  height?: number;
  height_deviation?: number;
  name: TrivialSmokeID;
  north_position?: Vector;
  offset?: number;
  position?: Vector;
  slow_down_factor?: number;
  south_position?: Vector;
  starting_frame?: number;
  starting_frame_deviation?: number;
  starting_frame_speed?: number;
  starting_frame_speed_deviation?: number;
  starting_vertical_speed?: number;
  starting_vertical_speed_deviation?: number;
  /** A value between `0` and `1`. */
  vertical_speed_slowdown?: number;
  west_position?: Vector;
}
interface _Sound {
  aggregation?: AggregationSpecification;
  allow_random_repeat?: boolean;
  /** Modifies how far a sound can be heard. Must be between `0` and `1` inclusive. */
  audible_distance_modifier?: number;
  /** Supported sound file formats are `.ogg`, `.wav` and `.voc`.

Only loaded if `variations` is not defined. */
  filename: FileName;
  game_controller_vibration_data?: GameControllerVibrationData;
  /** Must be `>= min_speed`.

Only loaded if `variations` is not defined. Only loaded, and mandatory if `min_speed` is defined. */
  max_speed?: number;
  /** Must be `>= 1 / 64`.

Only loaded if both `variations` and `speed` are not defined. */
  min_speed?: number;
  /** Only loaded if `variations` is not defined. */
  preload?: boolean;
  /** Speed must be `>= 1 / 64`. This sets both min and max speeds.

Only loaded if `variations` is not defined. */
  speed?: number;
  variations?: SoundDefinition[];
  /** Only loaded if `variations` is not defined. */
  volume?: number;
}
export interface SoundDefinition {
  /** Supported sound file formats are `.ogg`, `.wav` and `.voc`. */
  filename: FileName;
  /** Only loaded, and mandatory, if `min_speed` is defined.

Must be `>= min_speed`. */
  max_speed?: number;
  /** Only loaded if `speed` is not defined.

Must be `>= 1 / 64`. */
  min_speed?: number;
  preload?: boolean;
  /** Speed must be `>= 1 / 64`. This sets both min and max speeds. */
  speed?: number;
  volume?: number;
}
/** The definition of a evolution and probability weights for a [spawnable unit](prototype:UnitSpawnDefinition) for a [EnemySpawnerPrototype](prototype:EnemySpawnerPrototype).

It can be specified as a table with named or numbered keys, but not a mix of both. */
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
export interface SpiderEnginePrototype {
  legs: SpiderLegSpecification | SpiderLegSpecification[];
  /** The string content is irrelevant, if it is present at all then the [SpiderVehiclePrototype](prototype:SpiderVehiclePrototype) is considered to have [EntityWithOwnerPrototype::is_military_target](prototype:EntityWithOwnerPrototype::is_military_target) set to true. This gets enemies interested in attacking the spider vehicle even when nobody is in it. */
  military_target?: string;
}
export interface SpiderLegGraphicsSet {
  joint?: Sprite;
  joint_shadow?: Sprite;
  joint_turn_offset?: number;
  lower_part?: SpiderLegPart;
  lower_part_shadow?: SpiderLegPart;
  lower_part_water_reflection?: SpiderLegPart;
  upper_part?: SpiderLegPart;
  upper_part_shadow?: SpiderLegPart;
  upper_part_water_reflection?: SpiderLegPart;
}
export interface SpiderLegPart {
  bottom_end?: Sprite;
  bottom_end_length?: number;
  middle?: Sprite;
  middle_offset_from_bottom?: number;
  middle_offset_from_top?: number;
  top_end?: Sprite;
  top_end_length?: number;
}
/** Used by [SpiderEnginePrototype](prototype:SpiderEnginePrototype) for [SpiderVehiclePrototype](prototype:SpiderVehiclePrototype). */
export interface SpiderLegSpecification {
  /** The 1-based indices of the legs that should block this leg's movement. */
  blocking_legs: number[];
  ground_position: Vector;
  /** Name of a [SpiderLegPrototype](prototype:SpiderLegPrototype). */
  leg: EntityID;
  /** For triggers, the source and target is the leg entity. Certain effects may not raise as desired, e.g. `"push-back"` does nothing, and `"script"` has `leg` as the source and target of the event. */
  leg_hit_the_ground_trigger?: TriggerEffect;
  mount_position: Vector;
}
/** Used to specify the graphics for [SpiderVehiclePrototype](prototype:SpiderVehiclePrototype). */
export interface SpiderVehicleGraphicsSet {
  animation?: RotatedAnimation;
  autopilot_destination_on_map_visualisation?: Animation;
  autopilot_destination_queue_on_map_visualisation?: Animation;
  autopilot_destination_queue_visualisation?: Animation;
  autopilot_destination_visualisation?: Animation;
  autopilot_destination_visualisation_render_layer?: RenderLayer;
  autopilot_path_visualisation_line_width?: number;
  autopilot_path_visualisation_on_map_line_width?: number;
  base_animation?: RotatedAnimation;
  base_render_layer?: RenderLayer;
  /** Placed in multiple positions, as determined by `light_positions`. */
  eye_light?: LightDefinition;
  light?: LightDefinition;
  /** Defines where each `eye_light` is placed. One array per eye and each of those arrays should contain one position per body direction. */
  light_positions?: Vector[][];
  render_layer?: RenderLayer;
  shadow_animation?: RotatedAnimation;
  shadow_base_animation?: RotatedAnimation;
}
export interface SpotNoiseArguments {
  basement_value: ConstantNoiseNumber;
  /** Integer. How many candidate points to generate. */
  candidate_point_count?: ConstantNoiseNumber;
  /** Integer. An alternative to `candidate_point_count`: number of spots to generate: `candidate_spot_count = X` is equivalent to `candidate_point_count / skip_span = X` */
  candidate_spot_count?: ConstantNoiseNumber;
  comment: NoiseLiteralString;
  /** A numeric expression that will be evaluated for each candidate spot to calculate density at that point. */
  density_expression: NoiseLiteralExpression;
  /** Whether to place a hard limit on the total quantity in each region by reducing the size of any spot (which will be the last spot chosen) that would put it over the limit. */
  hard_region_target_quantity?: ConstantNoiseBoolean;
  maximum_spot_basement_radius: ConstantNoiseNumber;
  /** Integer. The width and height of each region. */
  region_size?: ConstantNoiseNumber;
  /** Integer. First random seed, usually the map seed is used. */
  seed0: ConstantNoiseNumber;
  /** Integer. Second random seed, usually chosen to identify the noise layer. */
  seed1: ConstantNoiseNumber;
  /** Integer. Offset of the first candidate point to use. */
  skip_offset?: ConstantNoiseNumber;
  /** Integer. Number of candidate points to skip over after each one used as a spot, including the used one. */
  skip_span?: ConstantNoiseNumber;
  /** A numeric expression that will be evaluated for each candidate spot to calculate the spot's favorability. Spots with higher favorability will be considered first when building the final list of spots for a region. */
  spot_favorability_expression: NoiseLiteralExpression;
  /** A numeric expression that will be evaluated for each candidate spot to calculate the spot's quantity. */
  spot_quantity_expression: NoiseLiteralExpression;
  /** A numeric expression that will be evaluated for each candidate spot to calculate the spot's radius. This, together with quantity, will determine the spots peak value. */
  spot_radius_expression: NoiseLiteralExpression;
  /** The minimum spacing to *try* to achieve while randomly picking points. Spot noise may end up placing spots closer than this in crowded regions. */
  suggested_minimum_candidate_point_spacing?: ConstantNoiseNumber;
  x: NoiseNumber;
  y: NoiseNumber;
}
/** Specifies one picture that can be used in the game.

When there is more than one sprite or [Animation](prototype:Animation) frame with the same source file and dimensions/position in the game, they all share the same memory. */
interface _Sprite {
  /** Only loaded if `layers` is not defined.

If this property exists and high resolution sprites are turned on, this is used to load the Sprite. */
  hr_version?: Sprite;
  /** If this property is present, all Sprite definitions have to be placed as entries in the array, and they will all be loaded from there. `layers` may not be an empty table. Each definition in the array may also have the `layers` property.

If this property is present, all other properties, including those inherited from SpriteParameters, are ignored. */
  layers?: Sprite[];
  /** Only loaded if `layers` is not defined.

Number of slices this is sliced into when using the "optimized atlas packing" option. If you are a modder, you can just ignore this property. As an example, if this is `4`, the sprite will be sliced into a `4x4` grid. */
  slice?: SpriteSizeType;
  /** Only loaded if `layers` is not defined.

Same as `slice`, but this specifies only how many slices there are on the x-axis. */
  slice_x?: SpriteSizeType;
  /** Only loaded if `layers` is not defined.

Same as `slice`, but this specifies only how many slices there are on the y-axis. */
  slice_y?: SpriteSizeType;
}

export type Sprite = _Sprite & Omit<SpriteParameters, keyof _Sprite>;
/** A map of sprites for all 4 directions of the entity.  If this is loaded as a single Sprite, it applies to all directions. */
interface _Sprite4Way {
  /** Only loaded if both `sheets` and `sheet` are not defined. */
  east: Sprite;
  /** Only loaded if both `sheets` and `sheet` are not defined. */
  north: Sprite;
  /** Only loaded if `sheets` is not defined. */
  sheet?: SpriteNWaySheet;
  sheets?: SpriteNWaySheet;
  /** Only loaded if both `sheets` and `sheet` are not defined. */
  south: Sprite;
  /** Only loaded if both `sheets` and `sheet` are not defined. */
  west: Sprite;
}
/** A map of sprites for all 8 directions of the entity. */
export interface Sprite8Way {
  /** Only loaded if both `sheets` and `sheet` are not defined. */
  east: Sprite;
  /** Only loaded if both `sheets` and `sheet` are not defined. */
  north: Sprite;
  /** Only loaded if both `sheets` and `sheet` are not defined. */
  north_east: Sprite;
  /** Only loaded if both `sheets` and `sheet` are not defined. */
  north_west: Sprite;
  /** Only loaded if `sheets` is not defined. */
  sheet?: SpriteNWaySheet;
  sheets?: SpriteNWaySheet;
  /** Only loaded if both `sheets` and `sheet` are not defined. */
  south: Sprite;
  /** Only loaded if both `sheets` and `sheet` are not defined. */
  south_east: Sprite;
  /** Only loaded if both `sheets` and `sheet` are not defined. */
  south_west: Sprite;
  /** Only loaded if both `sheets` and `sheet` are not defined. */
  west: Sprite;
}
interface _SpriteNWaySheet {
  /** Specifies how many of the directions of the SpriteNWay are filled up with this sheet. */
  frames?: number;
  /** Unused. */
  generate_sdf?: boolean;
  /** If this property exists and high resolution sprites are turned on, this is used to load the Sheet. */
  hr_version?: SpriteNWaySheet;
}

export type SpriteNWaySheet = _SpriteNWaySheet &
  Omit<SpriteParameters, keyof _SpriteNWaySheet>;
export interface SpriteParameters {
  apply_runtime_tint?: boolean;
  blend_mode?: BlendMode;
  /** Only one of `draw_as_shadow`, `draw_as_glow` and `draw_as_light` can be true. This takes precedence over `draw_as_light`.

Draws first as a normal sprite, then again as a light layer. See [https://forums.factorio.com/91682](https://forums.factorio.com/91682). */
  draw_as_glow?: boolean;
  /** Only one of `draw_as_shadow`, `draw_as_glow` and `draw_as_light` can be true. */
  draw_as_light?: boolean;
  /** Only one of `draw_as_shadow`, `draw_as_glow` and `draw_as_light` can be true. This takes precedence over `draw_as_glow` and `draw_as_light`. */
  draw_as_shadow?: boolean;
  /** The path to the sprite file to use. */
  filename: FileName;
  flags?: SpriteFlags;
  /** This property is only used by sprites used in [UtilitySprites](prototype:UtilitySprites) that have the `"icon"` flag set.

If this is set to `true`, the game will generate an icon shadow (using signed distance fields) for the sprite. */
  generate_sdf?: boolean;
  /** Mandatory if `size` is not defined.

Height of the picture in pixels, from 0-8192. */
  height?: SpriteSizeType;
  /** Minimal mode is entered when mod loading fails. You are in it when you see the gray box after (part of) the loading screen that tells you a mod error ([Example](https://cdn.discordapp.com/attachments/340530709712076801/532315796626472972/unknown.png)). Modders can ignore this property. */
  load_in_minimal_mode?: boolean;
  /** Only loaded if this is an icon, that is it has the flag `"group=icon"` or `"group=gui"`. */
  mipmap_count?: number;
  /** Loaded only when `x` and `y` are both `0`. The first member of the tuple is `x` and the second is `y`. */
  position?: [SpriteSizeType, SpriteSizeType];
  /** Whether alpha should be pre-multiplied. */
  premul_alpha?: boolean;
  priority?: SpritePriority;
  /** Values other than `1` specify the scale of the sprite on default zoom. A scale of `2` means that the picture will be two times bigger on screen (and thus more pixelated). */
  scale?: number;
  /** The shift in tiles. `util.by_pixel()` can be used to divide the shift by 32 which is the usual pixel height/width of 1 tile in normal resolution. Note that 32 pixel tile height/width is not enforced anywhere - any other tile height or width is also possible. */
  shift?: Vector;
  /** The width and height of the sprite. If this is a tuple, the first member of the tuple is the width and the second is the height. Otherwise the size is both width and height. Width and height may only be in the range of 0-8192. */
  size?: SpriteSizeType | [SpriteSizeType, SpriteSizeType];
  tint?: Color;
  /** Mandatory if `size` is not defined.

Width of the picture in pixels, from 0-8192. */
  width?: SpriteSizeType;
  /** Horizontal position of the sprite in the source file in pixels. */
  x?: SpriteSizeType;
  /** Vertical position of the sprite in the source file in pixels. */
  y?: SpriteSizeType;
}
interface _SpriteSheet {
  /** Only loaded if `layers` is not defined.

If this property exists and high resolution sprites are turned on, this is used to load the SpriteSheet. */
  hr_version?: SpriteSheet;
  /** If this property is present, all SpriteSheet definitions have to be placed as entries in the array, and they will all be loaded from there. `layers` may not be an empty table. Each definition in the array may also have the `layers` property.

If this property is present, all other properties, including those inherited from SpriteParameters, are ignored. */
  layers?: SpriteSheet[];
  line_length?: number;
  repeat_count?: number;
  variation_count?: number;
}

export type SpriteSheet = _SpriteSheet &
  Omit<SpriteParameters, keyof _SpriteSheet>;
interface _SpriteVariations {
  sheet: SpriteSheet;
}
interface _StackInserterCapacityBonusModifier {
  /** If set to `false`, use the icon from [UtilitySprites](prototype:UtilitySprites) for this technology effect icon. */
  infer_icon?: boolean;
  type: 'stack-inserter-capacity-bonus';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type StackInserterCapacityBonusModifier =
  _StackInserterCapacityBonusModifier &
    Omit<SimpleModifier, keyof _StackInserterCapacityBonusModifier>;

export function isStackInserterCapacityBonusModifier(
  value: unknown,
): value is StackInserterCapacityBonusModifier {
  return (value as { type: string }).type === 'stack-inserter-capacity-bonus';
}

export interface StackTransferTipTrigger {
  count?: number;
  transfer?: 'stack' | 'inventory' | 'whole-inventory';
  type: 'stack-transfer';
}

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
  flow_sprite: Sprite;
  fluid_background: Sprite;
  gas_flow: Animation;
  picture: Sprite4Way;
  window_background: Sprite;
}
interface _StreamAttackParameters {
  fluid_consumption?: number;
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
  default_graphical_set?: ElementImageSet;
  disabled_badge_font_color?: Color;
  disabled_badge_graphical_set?: ElementImageSet;
  disabled_font_color?: Color;
  disabled_graphical_set?: ElementImageSet;
  draw_grayscale_picture?: boolean;
  /** Name of a [FontPrototype](prototype:FontPrototype). */
  font?: string;
  game_controller_selected_hover_graphical_set?: ElementImageSet;
  hover_badge_graphical_set?: ElementImageSet;
  hover_graphical_set?: ElementImageSet;
  left_click_sound?: Sound;
  left_edge_selected_graphical_set?: ElementImageSet;
  override_graphics_on_edges?: boolean;
  press_badge_graphical_set?: ElementImageSet;
  press_graphical_set?: ElementImageSet;
  right_edge_selected_graphical_set?: ElementImageSet;
  selected_badge_font_color?: Color;
  selected_badge_graphical_set?: ElementImageSet;
  selected_font_color?: Color;
  selected_graphical_set?: ElementImageSet;
  type: 'tab_style';
}

export type TabStyleSpecification = _TabStyleSpecification &
  Omit<BaseStyleSpecification, keyof _TabStyleSpecification>;

export function isTabStyleSpecification(
  value: unknown,
): value is TabStyleSpecification {
  return (value as { type: string }).type === 'tab_style';
}

interface _TabbedPaneStyleSpecification {
  tab_container?: HorizontalFlowStyleSpecification;
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
  column_widths?: ColumnWidth[];
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
}

export type TableStyleSpecification = _TableStyleSpecification &
  Omit<BaseStyleSpecification, keyof _TableStyleSpecification>;

export function isTableStyleSpecification(
  value: unknown,
): value is TableStyleSpecification {
  return (value as { type: string }).type === 'table_style';
}

/** Used when defining a [TechnologyPrototype](prototype:TechnologyPrototype) that uses difficulty. For a technology without difficulty, these same properties are defined on the prototype itself. */
export interface TechnologyData {
  /** List of effects of the technology (applied when the technology is researched). */
  effects?: Modifier[];
  enabled?: boolean;
  /** Hides the technology from the tech screen. */
  hidden?: boolean;
  /** Controls whether the technology cost ignores the tech cost multiplier set in the [DifficultySettings](runtime:DifficultySettings), e.g. `4` for the default expensive difficulty. */
  ignore_tech_cost_multiplier?: boolean;
  /** `"infinite"` for infinite technologies, otherwise `uint32`.

Defaults to the same level as the technology, which is `0` for non-upgrades, and the level of the upgrade for upgrades. */
  max_level?: number | 'infinite';
  /** List of technologies needed to be researched before this one can be researched. */
  prerequisites?: TechnologyID[];
  /** Determines the cost in items and time of the technology. */
  unit: TechnologyUnit;
  /** When set to true, and the technology contains several levels, only the relevant one is displayed in the technology screen. */
  upgrade?: boolean;
  /** Controls whether the technology is shown in the tech GUI when it is not `enabled`. */
  visible_when_disabled?: boolean;
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

The formula is executed following the BODMAS order (also known as PEMDAS). It supports these operators and characters:

- `+`: Addition

- `-`: Subtraction

- `*`: Multiplication

- `^`: Exponentiation

- `()`: Brackets for order of operations; supports nested brackets

- `l` or `L`: The current level of the technology

- Digits: Treated as numbers

- `.`: Decimal point in numbers

- `SPACE`: Spaces are ignored

Note that this formula can also be used at [runtime](runtime:LuaGameScript::evaluate_expression). */
  count_formula?: string;
  /** List of ingredients needed for one unit of research. The items must all be [ToolPrototypes](prototype:ToolPrototype). */
  ingredients: IngredientPrototype[];
  /** How much time one unit takes to research. In a lab with a crafting speed of `1`, it corresponds to the number of seconds. */
  time: number;
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

export interface TileAndAlpha {
  alpha: number;
  tile: TileID;
}
export interface TileBuildSound {
  large?: Sound;
  medium?: Sound;
  small?: Sound;
}
/** Used by [TilePrototype](prototype:TilePrototype). */
export interface TileSprite {
  /** Frame count. */
  count: number;
  /** If this property exists and high resolution sprites are turned on, its contents are used to load the tile sprite. */
  hr_version?: TileSprite;
  /** Once the specified number of pictures is loaded, other pictures are loaded on other line. This is to allow having longer animations in matrix, to input files with too high width. The game engine limits the width of any input files to 8192px, so it is compatible with most graphics cards. 0 means that all the pictures are in one horizontal line. */
  line_length?: number;
  picture: FileName;
  scale?: number;
  /** Horizontal position of the sprite in the source file in pixels. */
  x?: SpriteSizeType;
  /** Vertical position of the sprite in the source file in pixels. */
  y?: SpriteSizeType;
}
interface _TileSpriteWithProbability {
  /** Probability of 1x1 (size = 1) version of tile must be 1. */
  probability?: number;
  /** Only powers of 2 from 1 to 128 can be used. Square size of the tile arrangement this sprite is used for. Used to calculate the `width` and `height` of the sprite which cannot be set directly. (width or height) = size * 32 / scale. */
  size: number;
  weights?: number[];
}

export type TileSpriteWithProbability = _TileSpriteWithProbability &
  Omit<TileSprite, keyof _TileSpriteWithProbability>;
export interface TileTransitionSprite {
  /** Frame count. */
  count: number;
  /** If this property exists and high resolution sprites are turned on, its contents are used to load the tile transition sprite. */
  hr_version?: TileTransitionSprite;
  picture: FileName;
  scale?: number;
  /** If this is true, the shift of the tile transition sprite is set to `{0, 0.5}`. */
  tall?: boolean;
  /** Horizontal position of the sprite in the source file in pixels. */
  x?: SpriteSizeType;
  /** Vertical position of the sprite in the source file in pixels. */
  y?: SpriteSizeType;
}
/** Used for [TilePrototype](prototype:TilePrototype) graphics. */
export interface TileTransitions {
  apply_effect_color_to_overlay?: boolean;
  background_layer_group?: TileRenderLayer;
  background_layer_offset?: number;
  effect_mask?: Animation;
  empty_transitions?: boolean;
  /** This or inner_corner_mask needs to be specified if `empty_transitions` is not true. */
  inner_corner: TileTransitionSprite;
  inner_corner_background?: TileTransitionSprite;
  inner_corner_background_mask?: TileTransitionSprite;
  inner_corner_effect_map?: TileTransitionSprite;
  /** This or inner_corner needs to be specified if `empty_transitions` is not true. */
  inner_corner_mask: TileTransitionSprite;
  inner_corner_weights?: number[];
  layer?: number;
  masked_background_layer_offset?: number;
  masked_overlay_layer_offset?: number;
  o_transition?: TileSprite;
  o_transition_background?: TileSprite;
  o_transition_background_mask?: TileSprite;
  o_transition_effect_map?: TileSprite;
  o_transition_mask?: TileSprite;
  offset_background_layer_by_tile_layer?: boolean;
  /** This or outer_corner_mask needs to be specified if `empty_transitions` is not true. */
  outer_corner: TileTransitionSprite;
  outer_corner_background?: TileTransitionSprite;
  outer_corner_background_mask?: TileTransitionSprite;
  outer_corner_effect_map?: TileTransitionSprite;
  /** This or outer_corner needs to be specified if `empty_transitions` is not true. */
  outer_corner_mask: TileTransitionSprite;
  outer_corner_weights?: number[];
  overlay_layer_group?: TileRenderLayer;
  overlay_layer_offset?: number;
  /** This or side_mask needs to be specified if `empty_transitions` is not true. */
  side: TileTransitionSprite;
  side_background?: TileTransitionSprite;
  side_background_mask?: TileTransitionSprite;
  side_effect_map?: TileTransitionSprite;
  /** This or side needs to be specified if `empty_transitions` is not true. */
  side_mask: TileTransitionSprite;
  side_weights?: number[];
  u_transition?: TileTransitionSprite;
  u_transition_background?: TileTransitionSprite;
  u_transition_background_mask?: TileTransitionSprite;
  u_transition_effect_map?: TileTransitionSprite;
  u_transition_mask?: TileTransitionSprite;
  u_transition_weights?: number[];
  water_patch?: Sprite;
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
interface _TileTransitionsVariants {
  main: TileSpriteWithProbability[];
  /** Width and height are given by the game, setting them will not have an effect. Width and height are calculated from the expected size (32) and the scale. So, for HR tiles at a size of 64x64, the scale needs to be 0.5. */
  material_background?: TileSprite;
}

export type TileTransitionsVariants = _TileTransitionsVariants &
  Omit<TileTransitions, keyof _TileTransitionsVariants>;
export interface TimeElapsedTipTrigger {
  ticks: number;
  type: 'time-elapsed';
}

export function isTimeElapsedTipTrigger(
  value: unknown,
): value is TimeElapsedTipTrigger {
  return (value as { type: string }).type === 'time-elapsed';
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
export interface TransportBeltAnimationSet {
  animation_set: RotatedAnimation;
  east_index?: number;
  ending_east_index?: number;
  ending_north_index?: number;
  ending_patch?: Sprite4Way;
  ending_south_index?: number;
  ending_west_index?: number;
  ends_with_stopper?: boolean;
  north_index?: number;
  south_index?: number;
  starting_east_index?: number;
  starting_north_index?: number;
  starting_south_index?: number;
  starting_west_index?: number;
  west_index?: number;
}
interface _TransportBeltAnimationSetWithCorners {
  east_to_north_index?: number;
  east_to_south_index?: number;
  north_to_east_index?: number;
  north_to_west_index?: number;
  south_to_east_index?: number;
  south_to_west_index?: number;
  west_to_north_index?: number;
  west_to_south_index?: number;
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
  frame_shadow: AnimationVariations;
}
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
  /** Shadow must have 1 less `frame_count` than `leaves`. */
  shadow?: Animation;
  /** If `shadow` is not specified, this has to have one more frame than `leaves`. */
  trunk: Animation;
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
/** The abstract base of all [Triggers](prototype:Trigger). */
export interface TriggerItem {
  action_delivery?: TriggerDelivery | TriggerDelivery[];
  /** Only prototypes with these collision masks are affected by the trigger item. */
  collision_mask?: CollisionMask;
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

export interface UndergroundBeltStructure {
  back_patch?: Sprite4Way;
  direction_in: Sprite4Way;
  direction_in_side_loading?: Sprite4Way;
  direction_out: Sprite4Way;
  direction_out_side_loading?: Sprite4Way;
  front_patch?: Sprite4Way;
}
/** Used by [UnitPrototype](prototype:UnitPrototype). */
export interface UnitAISettings {
  /** If enabled, units that have nothing else to do will attempt to return to a spawner. */
  allow_try_return_to_spawner?: boolean;
  /** If enabled, units that repeatedly fail to succeed at commands will be destroyed. */
  destroy_when_commands_fail?: boolean;
  /** If enabled, units will try to separate themselves from nearby friendly units. */
  do_separation?: boolean;
  /** Must be between -8 and 8. */
  path_resolution_modifier?: number;
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
/** It can be specified as a table with named or numbered keys, but not a mix of both. */
interface _UnitSpawnDefinition {
  /** Array of evolution and probability info, with the following conditions:

- The `evolution_factor` must be ascending from entry to entry.

- The last entry's weight will be used when the `evolution_factor` is larger than the last entry.

- Weights are linearly interpolated between entries.

- Individual weights are scaled linearly so that the cumulative weight is `1`. */
  spawn_points: SpawnPoint[];
  unit: EntityID;
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

export interface UseConfirmTipTrigger {
  count?: number;
  type: 'use-confirm';
}

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

export interface UsePipetteTipTrigger {
  count?: number;
  type: 'use-pipette';
}

export function isUsePipetteTipTrigger(
  value: unknown,
): value is UsePipetteTipTrigger {
  return (value as { type: string }).type === 'use-pipette';
}

interface _Vector3D {
  x: number;
  y: number;
  z: number;
}
export interface VectorRotation {
  /** The size of all `frames` must be the same. */
  frames: Vector[];
  render_layer?: RenderLayer;
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
  corner_left_down: SpriteVariations;
  corner_right_down: SpriteVariations;
  ending_left: SpriteVariations;
  ending_right: SpriteVariations;
  filling?: SpriteVariations;
  gate_connection_patch?: Sprite4Way;
  single: SpriteVariations;
  straight_horizontal: SpriteVariations;
  straight_vertical: SpriteVariations;
  t_up: SpriteVariations;
  water_connection_patch?: Sprite4Way;
}
/** Entity water reflection. [Currently only renders](https://forums.factorio.com/100703) for [EntityWithHealthPrototype](prototype:EntityWithHealthPrototype). */
export interface WaterReflectionDefinition {
  orientation_to_variation?: boolean;
  pictures?: SpriteVariations;
  rotate?: boolean;
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
interface _WorkingSound {
  /** Might not work with all entities that use working_sound. */
  activate_sound?: Sound;
  apparent_volume?: number;
  /** Modifies how far a sound can be heard. Can only be 1 or lower, has to be a positive number. */
  audible_distance_modifier?: number;
  /** Might not work with all entities that use working_sound. */
  deactivate_sound?: Sound;
  /** Can't be used when `match_progress_to_activity` is true. */
  fade_in_ticks?: number;
  /** Can't be used when `match_progress_to_activity` is true. */
  fade_out_ticks?: number;
  /** The sound to be played when the entity is idle. Might not work with all entities that use working_sound. */
  idle_sound?: Sound;
  match_progress_to_activity?: boolean;
  match_speed_to_activity?: boolean;
  match_volume_to_activity?: boolean;
  max_sounds_per_type?: number;
  persistent?: boolean;
  /** Modifies how often the sound is played. */
  probability?: number;
  /** The sound to be played when the entity is working. */
  sound: Sound;
  use_doppler_shift?: boolean;
}
/** Used by crafting machines to display different graphics when the machine is running. */
export interface WorkingVisualisation {
  align_to_waypoint?: boolean;
  always_draw?: boolean;
  animated_shift?: boolean;
  animation: Animation;
  /** Used by [CraftingMachinePrototype](prototype:CraftingMachinePrototype). */
  apply_recipe_tint?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'quaternary'
    | 'none';
  /** Used by [CraftingMachinePrototype](prototype:CraftingMachinePrototype) ("status" only) and [MiningDrillPrototype](prototype:MiningDrillPrototype).

For "status" on CraftingMachine, the colors are specified via [CraftingMachinePrototype::status_colors](prototype:CraftingMachinePrototype::status_colors). For "status" on MiningDrill, the colors are specified via [MiningDrillGraphicsSet::status_colors](prototype:MiningDrillGraphicsSet::status_colors). For "resource-color", the colors are specified via [ResourceEntityPrototype::mining_visualisation_tint](prototype:ResourceEntityPrototype::mining_visualisation_tint). */
  apply_tint?:
    | 'resource-color'
    | 'input-fluid-base-color'
    | 'input-fluid-flow-color'
    | 'status'
    | 'none';
  /** Whether the animations are always played at the same speed, not adjusted to the machine speed. */
  constant_speed?: boolean;
  draw_as_light?: boolean;
  draw_as_sprite?: boolean;
  /** Only loaded if `animation` is not defined. */
  east_animation?: Animation;
  east_position?: Vector;
  effect?: 'flicker' | 'uranium-glow' | 'none';
  fadeout?: boolean;
  light?: LightDefinition;
  /** Only loaded if `animation` is not defined. */
  north_animation?: Animation;
  north_position?: Vector;
  render_layer?: RenderLayer;
  /** Used to determine render order for sprites with the same `render_layer` in the same position. Sprites with a higher `secondary_draw_order` are drawn on top. */
  secondary_draw_order?: number;
  /** Only loaded if `animation` is not defined. */
  south_animation?: Animation;
  south_position?: Vector;
  synced_fadeout?: boolean;
  /** Only loaded if `animation` is not defined. */
  west_animation?: Animation;
  west_position?: Vector;
}
interface _ZoomToWorldBlueprintEnabledModifier {
  type: 'zoom-to-world-blueprint-enabled';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type ZoomToWorldBlueprintEnabledModifier =
  _ZoomToWorldBlueprintEnabledModifier &
    Omit<BoolModifier, keyof _ZoomToWorldBlueprintEnabledModifier>;

export function isZoomToWorldBlueprintEnabledModifier(
  value: unknown,
): value is ZoomToWorldBlueprintEnabledModifier {
  return (value as { type: string }).type === 'zoom-to-world-blueprint-enabled';
}

interface _ZoomToWorldDeconstructionPlannerEnabledModifier {
  type: 'zoom-to-world-deconstruction-planner-enabled';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type ZoomToWorldDeconstructionPlannerEnabledModifier =
  _ZoomToWorldDeconstructionPlannerEnabledModifier &
    Omit<BoolModifier, keyof _ZoomToWorldDeconstructionPlannerEnabledModifier>;

export function isZoomToWorldDeconstructionPlannerEnabledModifier(
  value: unknown,
): value is ZoomToWorldDeconstructionPlannerEnabledModifier {
  return (
    (value as { type: string }).type ===
    'zoom-to-world-deconstruction-planner-enabled'
  );
}

interface _ZoomToWorldEnabledModifier {
  type: 'zoom-to-world-enabled';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type ZoomToWorldEnabledModifier = _ZoomToWorldEnabledModifier &
  Omit<BoolModifier, keyof _ZoomToWorldEnabledModifier>;

export function isZoomToWorldEnabledModifier(
  value: unknown,
): value is ZoomToWorldEnabledModifier {
  return (value as { type: string }).type === 'zoom-to-world-enabled';
}

interface _ZoomToWorldGhostBuildingEnabledModifier {
  type: 'zoom-to-world-ghost-building-enabled';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type ZoomToWorldGhostBuildingEnabledModifier =
  _ZoomToWorldGhostBuildingEnabledModifier &
    Omit<BoolModifier, keyof _ZoomToWorldGhostBuildingEnabledModifier>;

export function isZoomToWorldGhostBuildingEnabledModifier(
  value: unknown,
): value is ZoomToWorldGhostBuildingEnabledModifier {
  return (
    (value as { type: string }).type === 'zoom-to-world-ghost-building-enabled'
  );
}

interface _ZoomToWorldSelectionToolEnabledModifier {
  type: 'zoom-to-world-selection-tool-enabled';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type ZoomToWorldSelectionToolEnabledModifier =
  _ZoomToWorldSelectionToolEnabledModifier &
    Omit<BoolModifier, keyof _ZoomToWorldSelectionToolEnabledModifier>;

export function isZoomToWorldSelectionToolEnabledModifier(
  value: unknown,
): value is ZoomToWorldSelectionToolEnabledModifier {
  return (
    (value as { type: string }).type === 'zoom-to-world-selection-tool-enabled'
  );
}

interface _ZoomToWorldUpgradePlannerEnabledModifier {
  type: 'zoom-to-world-upgrade-planner-enabled';
  /** If `false`, do not draw the small "constant" icon over the technology effect icon. */
  use_icon_overlay_constant?: boolean;
}

export type ZoomToWorldUpgradePlannerEnabledModifier =
  _ZoomToWorldUpgradePlannerEnabledModifier &
    Omit<BoolModifier, keyof _ZoomToWorldUpgradePlannerEnabledModifier>;

export function isZoomToWorldUpgradePlannerEnabledModifier(
  value: unknown,
): value is ZoomToWorldUpgradePlannerEnabledModifier {
  return (
    (value as { type: string }).type === 'zoom-to-world-upgrade-planner-enabled'
  );
}

/** The name of an [AmmoCategory](prototype:AmmoCategory). */
export type AmmoCategoryID = string;

/** Used to allow specifying different ammo effects depending on which kind of entity the ammo is used in.

If ammo is used in an entity that isn't covered by the defined source_types, e.g. only `"player"` and `"vehicle"` are defined and the ammo is used by a turret, the first defined AmmoType in the [AmmoItemPrototype::ammo_type](prototype:AmmoItemPrototype::ammo_type) array is used. */
export type AmmoSourceType = 'default' | 'player' | 'turret' | 'vehicle';

/** If this is loaded as a single Animation, it applies to all directions. */
export type Animation4Way = _Animation4Way | Animation;

/** This is a list of 1-based frame indices into the spritesheet. The actual length of the animation will then be the length of the frame_sequence (times `repeat_count`, times two if `run_mode` is `"forward-then-backward"`). There is a limit for (actual) animation length of 255 frames.

Indices can be used in any order, repeated or not used at all. Unused frames are not loaded into VRAM at all, frames referenced multiple times are loaded just once, see [here](https://forums.factorio.com/53202). */
export type AnimationFrameSequence = number[];

export type AnimationVariations =
  | _AnimationVariations
  | Animation
  | Animation[];

/** Loaded as one of the [BaseAttackParameters](prototype:BaseAttackParameters) extensions, based on the value of the `type` key. */
export type AttackParameters =
  | ProjectileAttackParameters
  | BeamAttackParameters
  | StreamAttackParameters;

/** The name of an [AutoplaceControl](prototype:AutoplaceControl). */
export type AutoplaceControlID = string;

/** Autoplace specification is used to determine which entities are placed when generating map. Currently it is used for enemy bases, tiles, resources and other entities (trees, fishes, etc.).

Autoplace specification describe conditions for placing tiles, entities, and decoratives during surface generation. Autoplace specification defines probability of placement on any given tile and richness, which has different meaning depending on the thing being placed.

There are two entirely separate ways to specify the probability and richness:

- The newer noise expression-based system using `probability_expression` and `richness_expression`.

- The older peaks-based system using `peaks` and the properties listed below it. */
export type AutoplaceSpecification = _AutoplaceSpecification | AutoplacePeak;

/** A list of notable [NamedNoiseExpressions](prototype:NamedNoiseExpression) defined in the base game. A list of all named noise expression defined in the base game can be found [here](https://wiki.factorio.com/Data.raw#noise-expression).

Note that the named noise expressions are all defined in Lua, so mods may remove or change the notable expressions listed here, or change how they are used in the map generation. */
export type BaseNamedNoiseExpressions =
  | 'distance'
  | 'tier_from_start'
  | 'tier'
  | 'starting_area_weight'
  | 'moisture'
  | 'aux'
  | 'temperature'
  | 'elevation'
  | 'cliffiness'
  | 'enemy-base-intensity'
  | 'enemy-base-frequency'
  | 'enemy-base-radius';

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

The first position is leftTop, the second position is rightBottom. There is an unused third member, a [float](prototype:float) that represents the orientation.

Positive x goes towards east, positive y goes towards south. This means that the upper-left point is the least dimension in x and y, and lower-right is the greatest. */
export type BoundingBox = [MapPosition, MapPosition];

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

/** Every entry in the array is a specification of one layer the object collides with or a special collision option. Supplying an empty table means that no layers and no collision options are set.

The default collision masks of all entity types can be found [here](prototype:EntityPrototype::collision_mask). The base game provides common collision mask functions in a Lua file in the core [lualib](https://github.com/wube/factorio-data/blob/master/core/lualib/collision-mask-util.lua).

Supplying an empty array means that no layers and no collision options are set.

The three options in addition to the standard layers are not collision masks, instead they control other aspects of collision. */
export type CollisionMask = (
  | CollisionMaskLayer
  | 'not-colliding-with-itself'
  | 'consider-tile-transitions'
  | 'colliding-with-tiles-only'
)[];

/** A string specifying a collision mask layer.

In addition to the listed layers, there is `"layer-13"` through `"layer-55"`. These layers are currently unused by the game but may change. If a mod is going to use one of the unused layers it's recommended to use the `collision_mask_util.get_first_unused_layer()` method from the vanilla [library](https://github.com/wube/factorio-data/blob/master/core/lualib/collision-mask-util.lua). When not using the library, mods should start at the higher layers because the base game will take from the lower ones. */
export type CollisionMaskLayer =
  | 'ground-tile'
  | 'water-tile'
  | 'resource-layer'
  | 'doodad-layer'
  | 'floor-layer'
  | 'item-layer'
  | 'ghost-layer'
  | 'object-layer'
  | 'player-layer'
  | 'train-layer'
  | 'rail-layer'
  | 'transport-belt-layer';

/** Table of red, green, blue, and alpha float values between 0 and 1.Alternatively, values can be from 0-255, they are interpreted as such if at least one value is `> 1`.

Color allows the short-hand notation of passing an array of exactly 3 or 4 numbers.

The game usually expects colors to be in pre-multiplied form (color channels are pre-multiplied by alpha). */
export type Color =
  | _Color
  | [number, number, number]
  | [number, number, number, number];

/** A constant boolean noise expression, such as a literal boolean. When using a constant number,  it evaluates to true for numbers bigger than zero, anything else evaluates to false. */
export type ConstantNoiseBoolean = NoiseLiteralBoolean | ConstantNoiseNumber;

/** A constant numeric noise expression, such as a literal number, the result of addition of constants or multioctave noise that uses only constant arguments. */
export type ConstantNoiseNumber = NoiseNumber;

/** Defines which other inputs a [CustomInputPrototype](prototype:CustomInputPrototype) consumes. */
export type ConsumingType = 'none' | 'game-only';

/** One of the following values: */
export type CursorBoxType =
  | 'entity'
  | 'electricity'
  | 'copy'
  | 'not-allowed'
  | 'pair'
  | 'logistics'
  | 'train-visualization'
  | 'blueprint-snap-rectangle';

export type DamageTypeFilters =
  | _DamageTypeFilters
  | DamageTypeID
  | DamageTypeID[];

/** The name of a [DamageType](prototype:DamageType). */
export type DamageTypeID = string;

/** The first member of the tuple states at which time of the day the LUT should be used. If the current game time is between two values defined in the color lookup that have different LUTs, the color is interpolated to create a smooth transition. (Sharp transition can be achieved by having the two values differing only by a small fraction.)

If there is only one tuple, it means that the LUT will be used all the time, regardless of the value of the first member of the tuple.

The second member of the tuple is a lookup table (LUT) for the color which maps the original color to a position in the sprite where is the replacement color is found. The file pointed to by the filename must be a sprite of size 256×16 or 16×256. */
export type DaytimeColorLookupTable = [number, FileName | 'identity'][];

/** The name of a [DecorativePrototype](prototype:DecorativePrototype). */
export type DecorativeID = string;

export type Direction = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** A list of module effects, or just a single effect. Modules with other effects cannot be used on the machine. This means that both effects from modules and from surrounding beacons are restricted to the listed effects. If `allowed_effects` is set to `nil`, the machine cannot be affected by modules or beacons. */
export type EffectTypeLimitation =
  | ('speed' | 'productivity' | 'consumption' | 'pollution')
  | ('speed' | 'productivity' | 'consumption' | 'pollution')[];

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

Internally, the input in `Watt` or `Joule/second` is always converted into `Joule/tick` or `Joule/(1/60)second`, using the following formula: `Power in Joule/tick = Power in Watt / 60`. See [Power](https://wiki.factorio.com/Units#Power).

Supported Multipliers:

- `k/K`: 10^3, or 1'000

- `M`: 10^6

- `G`: 10^9

- `T`: 10^12

- `P`: 10^15

- `E`: 10^18

- `Z`: 10^21

- `Y`: 10^24 */
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

/** An array containing the following values. */
export type EntityPrototypeFlags = (
  | 'not-rotatable'
  | 'placeable-neutral'
  | 'placeable-player'
  | 'placeable-enemy'
  | 'placeable-off-grid'
  | 'player-creation'
  | 'building-direction-8-way'
  | 'filter-directions'
  | 'fast-replaceable-no-build-while-moving'
  | 'breaths-air'
  | 'not-repairable'
  | 'not-on-map'
  | 'not-deconstructable'
  | 'not-blueprintable'
  | 'hidden'
  | 'hide-alt-info'
  | 'fast-replaceable-no-cross-type-while-moving'
  | 'no-gap-fill-while-building'
  | 'not-flammable'
  | 'no-automated-item-removal'
  | 'no-automated-item-insertion'
  | 'no-copy-paste'
  | 'not-selectable-in-game'
  | 'not-upgradable'
  | 'not-in-kill-statistics'
  | 'not-in-made-in'
)[];

/** The name of an [EquipmentCategory](prototype:EquipmentCategory). */
export type EquipmentCategoryID = string;

/** The name of an [EquipmentGridPrototype](prototype:EquipmentGridPrototype). */
export type EquipmentGridID = string;

/** The name of an [EquipmentPrototype](prototype:EquipmentPrototype). */
export type EquipmentID = string;

export type ExplosionDefinition = EntityID | _ExplosionDefinition;

/** A slash `"/"` is always used as the directory delimiter. A path always begins with the specification of a root, which can be one of three formats:

- **core**: A path starting with `__core__` will access the resources in the data/core directory, these resources are always accessible regardless of mod specifications.

- **base**: A path starting with __base__ will access the resources in the base mod in data/base directory. These resources are usually available, as long as the base mod isn't removed/deactivated.

- **mod path**: The format `__<mod-name>__` is placeholder for root of any other mod (mods/<mod-name>), and is accessible as long as the mod is active. */
export type FileName = string;

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

/** Icons of reduced size will be used at decreased scale. 0 or 1 mipmaps is a single image. The file must contain half-size images with a geometric-ratio, for each mipmap level. Each next level is aligned to the upper-left corner. Example sequence: `128x128@(0,0)`, `64x64@(128,0)`, `32x32@(196,0)` is three mipmaps.

See [here](https://factorio.com/blog/post/fff-291) for more about the visual effects of icon mipmaps. */
export type IconMipMapType = number;

/** Defaults to loading ingredients as items. */
export type IngredientPrototype =
  | ItemIngredientPrototype
  | FluidIngredientPrototype;

export type ItemCountType = number;

/** The name of an [ItemGroup](prototype:ItemGroup). */
export type ItemGroupID = string;

/** The name of an [ItemPrototype](prototype:ItemPrototype). */
export type ItemID = string;

/** An item ingredient definition. It can be specified as a table with named or numbered keys, but not a mix of both. */
export type ItemIngredientPrototype =
  | _ItemIngredientPrototype
  | [ItemID, number];

/** An item product definition. It can be specified as a table with named or numbered keys, but not a mix of both. */
export type ItemProductPrototype = _ItemProductPrototype | [ItemID, number];

/** An array containing the following values. */
export type ItemPrototypeFlags = (
  | 'draw-logistic-overlay'
  | 'hidden'
  | 'always-show'
  | 'hide-from-bonus-gui'
  | 'hide-from-fuel-tooltip'
  | 'not-stackable'
  | 'can-extend-inventory'
  | 'primary-place-result'
  | 'mod-openable'
  | 'only-in-cursor'
  | 'spawnable'
)[];

export type ItemStackIndex = number;

/** The name of an [ItemSubGroup](prototype:ItemSubGroup). */
export type ItemSubGroupID = string;

export type LayeredSound = _LayeredSound | Sound;

/** Specifies a light source. This is loaded either as a single light source or as an array of light sources. */
export type LightDefinition = _LightDefinition | _LightDefinition[];

/** Localised strings are a way to support translation of in-game text. They offer a language-independent code representation of the text that should be shown to players.

It is an array where the first element is the key and the remaining elements are parameters that will be substituted for placeholders in the template designated by the key.

The key identifies the string template. For example, `"gui-alert-tooltip.attack"` (for the template `"__1__ objects are being damaged"`; see the file `data/core/locale/en.cfg`). In the settings and prototype stages, this key cannot be longer than 200 characters.

The template can contain placeholders such as `__1__` or `__2__`. These will be replaced by the respective parameter in the LocalisedString. The parameters themselves can be other localised strings, which will be processed recursively in the same fashion. Localised strings can not be recursed deeper than 20 levels and can not have more than 20 parameters.

There are two special flags for the localised string, indicated by the key being a particular string. First, if the key is the empty string (`""`), then all parameters will be concatenated (after processing, if any are localised strings themselves). Second, if the key is a question mark (`"?"`), then the first valid parameter will be used. A parameter can be invalid if its name doesn't match any string template. If no parameters are valid, the last one is returned. This is useful to implement a fallback for missing locale templates.

Furthermore, when an API function expects a localised string, it will also accept a regular string (i.e. not a table) which will not be translated, as well as a number or boolean, which will be converted to their textual representation.

See [Tutorial:Localisation](https://wiki.factorio.com/Tutorial:Localisation) for more information. */
export type LocalisedString = string | boolean | LocalisedString[];

/** A floating point number specifying an amount.

For backwards compatibility, MapGenSizes can also be specified as one of the following strings, which will be converted to a number (when queried, a number will always be returned):

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

The coordinates are saved as a fixed-size 32 bit integer, with 8 bits reserved for decimal precision, meaning the smallest value step is `1/2^8 = 0.00390625` tiles. */
export type MapPosition = _MapPosition | [number, number];

export type MaterialAmountType = number;

/** The effect that is applied when a [TechnologyPrototype](prototype:TechnologyPrototype) is researched.

Loaded as one of the [BaseModifier](prototype:BaseModifier) extensions, based on the value of the `type` key. */
export type Modifier =
  | InserterStackSizeBonusModifier
  | StackInserterCapacityBonusModifier
  | LaboratorySpeedModifier
  | LaboratoryProductivityModifier
  | MaximumFollowingRobotsCountModifier
  | WorkerRobotSpeedModifier
  | WorkerRobotStorageModifier
  | WorkerRobotBatteryModifier
  | FollowerRobotLifetimeModifier
  | GhostTimeToLiveModifier
  | DeconstructionTimeToLiveModifier
  | TurretAttackModifier
  | AmmoDamageModifier
  | ArtilleryRangeModifier
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
  | CharacterHealthBonusModifier
  | CharacterLogisticRequestsModifier
  | CharacterLogisticTrashSlotsModifier
  | MaxFailedAttemptsPerTickPerConstructionQueueModifier
  | MaxSuccessfulAttemptsPerTickPerConstructionQueueModifier
  | MiningDrillProductivityBonusModifier
  | TrainBrakingForceBonusModifier
  | ZoomToWorldEnabledModifier
  | ZoomToWorldGhostBuildingEnabledModifier
  | ZoomToWorldBlueprintEnabledModifier
  | ZoomToWorldDeconstructionPlannerEnabledModifier
  | ZoomToWorldUpgradePlannerEnabledModifier
  | ZoomToWorldSelectionToolEnabledModifier
  | NothingModifier;

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

/** Loaded as one of the noise expressions listed in this union, based on the value of the `type` key.

A fragment of a functional program used to generate coherent noise, probably for purposes related to terrain generation.

Noise expressions can be provided as table literals or built using functions in the built-in [noise library](https://github.com/wube/factorio-data/blob/master/core/lualib/noise.lua). The built-in noise library allows writing much more concise code, so its usage will be shown in most examples on this page.

[noise.define_noise_function](https://github.com/wube/factorio-data/blob/master/core/lualib/noise.lua#L272) allows noise expressions to be defined using a shorthand that's a subset of Lua (see the example for details).

See [here](https://togos.github.io/togos-example-noise-programs/) for a tutorial on authoring noise expressions. */
export type NoiseExpression =
  | NoiseVariable
  | NoiseFunctionApplication
  | NoiseLiteralBoolean
  | NoiseLiteralNumber
  | NoiseLiteralString
  | NoiseLiteralObject
  | NoiseLiteralExpression
  | NoiseArrayConstruction
  | NoiseProcedureDelimiter
  | NoiseIfElseChain;

/** Loaded as one of the NoiseFunctions listed in this union, based on the value of the `function_name` key.

Apply a function to a list or associative array of arguments. Some functions expect arguments to be named and some expect them not to be.

Function calls are their own class of expression (as opposed to every function just being its own expression type) because function calls all have similar properties -- arguments are themselves expressions, a function call with all-constant arguments can be constant-folded (due to [referential transparency](http://en.wikipedia.org/wiki/Referential_transparency)), etc. */
export type NoiseFunctionApplication =
  | NoiseFunctionAdd
  | NoiseFunctionSubtract
  | NoiseFunctionMultiply
  | NoiseFunctionDivide
  | NoiseFunctionExponentiate
  | NoiseFunctionAbsoluteValue
  | NoiseFunctionClamp
  | NoiseFunctionCompileTimeLog
  | NoiseFunctionDistanceFromNearestPoint
  | NoiseFunctionRidge
  | NoiseFunctionTerrace
  | NoiseFunctionModulo
  | NoiseFunctionFloor
  | NoiseFunctionCeil
  | NoiseFunctionBitwiseAnd
  | NoiseFunctionBitwiseOr
  | NoiseFunctionBitwiseXor
  | NoiseFunctionBitwiseNot
  | NoiseFunctionSin
  | NoiseFunctionCos
  | NoiseFunctionAtan2
  | NoiseFunctionLessThan
  | NoiseFunctionLessOrEqual
  | NoiseFunctionEquals
  | NoiseFunctionFactorioBasisNoise
  | NoiseFunctionFactorioQuickMultioctaveNoise
  | NoiseFunctionRandomPenalty
  | NoiseFunctionLog2
  | NoiseFunctionNoiseLayerNameToID
  | NoiseFunctionAutoplaceProbability
  | NoiseFunctionAutoplaceRichness
  | NoiseFunctionOffsetPoints
  | NoiseFunctionFactorioMultioctaveNoise
  | NoiseFunctionSpotNoise;

/** The name of a [NoiseLayer](prototype:NoiseLayer). */
export type NoiseLayerID = string;

/** A numeric noise expression, such as a literal number, the result of addition, or multioctave noise.

This encompasses all [NoiseExpressions](prototype:NoiseExpression), except for [NoiseLiteralBoolean](prototype:NoiseLiteralBoolean), [NoiseLiteralString](prototype:NoiseLiteralString), [NoiseLiteralObject](prototype:NoiseLiteralObject), [NoiseLiteralExpression](prototype:NoiseLiteralExpression), [NoiseArrayConstruction](prototype:NoiseArrayConstruction), and [NoiseFunctionOffsetPoints](prototype:NoiseFunctionOffsetPoints). */
export type NoiseNumber =
  | NoiseVariable
  | NoiseFunctionApplication
  | NoiseLiteralNumber
  | NoiseProcedureDelimiter
  | NoiseIfElseChain
  | NoiseFunctionAdd
  | NoiseFunctionSubtract
  | NoiseFunctionMultiply
  | NoiseFunctionDivide
  | NoiseFunctionExponentiate
  | NoiseFunctionFactorioQuickMultioctaveNoise
  | NoiseFunctionFactorioMultioctaveNoise
  | NoiseFunctionDistanceFromNearestPoint
  | NoiseFunctionFactorioBasisNoise
  | NoiseFunctionAbsoluteValue
  | NoiseFunctionClamp
  | NoiseFunctionRidge
  | NoiseFunctionTerrace
  | NoiseFunctionSpotNoise
  | NoiseFunctionRandomPenalty
  | NoiseFunctionLog2
  | NoiseFunctionModulo
  | NoiseFunctionFloor
  | NoiseFunctionCeil
  | NoiseFunctionBitwiseAnd
  | NoiseFunctionBitwiseOr
  | NoiseFunctionBitwiseXor
  | NoiseFunctionBitwiseNot
  | NoiseFunctionSin
  | NoiseFunctionAtan2
  | NoiseFunctionCos
  | NoiseFunctionLessThan
  | NoiseFunctionLessOrEqual
  | NoiseFunctionEquals
  | NoiseFunctionCompileTimeLog
  | NoiseFunctionNoiseLayerNameToID
  | NoiseFunctionAutoplaceProbability
  | NoiseFunctionAutoplaceRichness;

/** A set of constants largely determined by [MapGenSettings](prototype:MapGenSettings). */
export type NoiseVariableConstants =
  | string
  | 'map_seed'
  | 'map_width'
  | 'map_height'
  | 'water_level'
  | 'finite_water_level'
  | 'wlc_elevation_minimum'
  | 'wlc_elevation_offset'
  | 'cliff_elevation_offset'
  | 'cliff_elevation_interval'
  | 'control-setting:cliffs:richness:multiplier'
  | 'terrace_elevation_offset'
  | 'terrace_elevation_interval'
  | 'starting_area_radius'
  | 'starting_positions'
  | 'starting_lake_positions'
  | 'peaceful_mode';

/** The order property is a simple `string`. When the game needs to sort prototypes (of the same type), it looks at their order properties and sorts those alphabetically. A prototype with an order string of `"a"` will be listed before other prototypes with order string `"b"` or `"c"`. The `"-"` or `"[]"` structures that can be found in vanilla order strings do *not* have any special meaning.

The alphabetical sorting uses [lexicographical comparison](https://en.wikipedia.org/wiki/Lexicographic_order) to determine if a given prototype is shown before or after another. If the order strings are equal then the game falls back to comparing the prototype names to determine order. */
export type Order = string;

/** The name of a [ParticlePrototype](prototype:ParticlePrototype). */
export type ParticleID = string;

/** Defines when controller vibrations should be played. */
export type PlayFor = 'character_actions' | 'everything';

export type PlayerInputMethodFilter =
  | 'all'
  | 'keyboard_and_mouse'
  | 'game_controller';

/** Defaults to loading products as items. */
export type ProductPrototype = ItemProductPrototype | FluidProductPrototype;

export type ProductionType =
  | 'None'
  | 'none'
  | 'input'
  | 'input-output'
  | 'output';

/** Specified by a [float](prototype:float) between 0 and 1, including 0 and excluding 1. */
export type RealOrientation = number;

/** The name of a [RecipeCategory](prototype:RecipeCategory). */
export type RecipeCategoryID = string;

/** The name of a [RecipePrototype](prototype:RecipePrototype). */
export type RecipeID = string;

/** The render layer specifies the order of the sprite when rendering, most of the objects have it hardcoded in the source, but some are configurable. The union contains valid values from lowest to highest. */
export type RenderLayer =
  | 'water-tile'
  | 'ground-tile'
  | 'tile-transition'
  | 'decals'
  | 'lower-radius-visualization'
  | 'radius-visualization'
  | 'transport-belt-integration'
  | 'resource'
  | 'building-smoke'
  | 'decorative'
  | 'ground-patch'
  | 'ground-patch-higher'
  | 'ground-patch-higher2'
  | 'remnants'
  | 'floor'
  | 'transport-belt'
  | 'transport-belt-endings'
  | 'transport-belt-circuit-connector'
  | 'floor-mechanics-under-corpse'
  | 'corpse'
  | 'floor-mechanics'
  | 'item'
  | 'lower-object'
  | 'lower-object-above-shadow'
  | 'object'
  | 'higher-object-under'
  | 'higher-object-above'
  | 'item-in-inserter-hand'
  | 'wires'
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

/** The name of a [ResourceCategory](prototype:ResourceCategory). */
export type ResourceCategoryID = string;

export type RichTextSetting = 'enabled' | 'disabled' | 'highlight';

/** A map of rotated animations for all 4 directions of the entity. If this is loaded as a single RotatedAnimation, it applies to all directions. */
export type RotatedAnimation4Way = _RotatedAnimation4Way | RotatedAnimation;

export type RotatedAnimationVariations = RotatedAnimation | RotatedAnimation[];

/** An array containing the following values. */
export type SelectionModeFlags = (
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
  | 'entity-with-force'
  | 'is-military-target'
  | 'entity-with-owner'
  | 'avoid-rolling-stock'
  | 'entity-ghost'
  | 'tile-ghost'
)[];

export type Sound = _Sound | SoundDefinition[];

/** This defines which slider in the sound settings affects the volume of this sound. Furthermore, some sound types are mixed differently than others, e.g. zoom level effects are applied. */
export type SoundType =
  | 'game-effect'
  | 'gui-effect'
  | 'ambient'
  | 'environment'
  | 'walking'
  | 'alert'
  | 'wind';

/** The definition of a evolution and probability weights for a [spawnable unit](prototype:UnitSpawnDefinition) for a [EnemySpawnerPrototype](prototype:EnemySpawnerPrototype).

It can be specified as a table with named or numbered keys, but not a mix of both. */
export type SpawnPoint = _SpawnPoint | [number, number];

/** A map of sprites for all 4 directions of the entity.  If this is loaded as a single Sprite, it applies to all directions. */
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
  | 'shadow'
  | 'smoke'
  | 'decal'
  | 'low-object'
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
  | 'compressed'
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

export type SpriteVariations = _SpriteVariations | SpriteSheet | Sprite[];

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

/** The name of a [TechnologyPrototype](prototype:TechnologyPrototype). */
export type TechnologyID = string;

/** The name of a [TilePrototype](prototype:TilePrototype). */
export type TileID = string;

/** Name of an allowed tile, or a list of two tile names for entities allowed on transitions. */
export type TileIDRestriction = TileID | [TileID, TileID];

export type TileRenderLayer =
  | 'zero'
  | 'water'
  | 'water-overlay'
  | 'ground'
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
  | ResearchTechnologyTipTrigger
  | UnlockRecipeTipTrigger
  | CraftItemTipTrigger
  | BuildEntityTipTrigger
  | ManualTransferTipTrigger
  | StackTransferTipTrigger
  | EntityTransferTipTrigger
  | SetRecipeTipTrigger
  | SetFilterTipTrigger
  | LimitChestTipTrigger
  | UsePipetteTipTrigger
  | SetLogisticRequestTipTrigger
  | UseConfirmTipTrigger
  | LowPowerTipTrigger
  | PasteEntitySettingsTipTrigger
  | FastReplaceTipTrigger
  | GroupAttackTipTrigger
  | FastBeltBendTipTrigger
  | BeltTraverseTipTrigger
  | PlaceEquipmentTipTrigger
  | ClearCursorTipTrigger
  | ShiftBuildTipTrigger
  | GateOverRailBuildTipTrigger
  | ManualWireDragTipTrigger;

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
  | FlameThrowerExplosionTriggerDelivery
  | BeamTriggerDelivery
  | StreamTriggerDelivery
  | ArtilleryTriggerDelivery;

/** Loaded as one of the [TriggerEffectItem](prototype:TriggerEffectItem) extensions, based on the value of the `type` key. */
export type TriggerEffect =
  | (
      | DamageTriggerEffectItem
      | CreateEntityTriggerEffectItem
      | CreateExplosionTriggerEffectItem
      | CreateFireTriggerEffectItem
      | CreateSmokeTriggerEffectItem
      | CreateTrivialSmokeEffectItem
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
    )
  | (
      | DamageTriggerEffectItem
      | CreateEntityTriggerEffectItem
      | CreateExplosionTriggerEffectItem
      | CreateFireTriggerEffectItem
      | CreateSmokeTriggerEffectItem
      | CreateTrivialSmokeEffectItem
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
    )[];

/** An array of names of [TriggerTargetType](prototype:TriggerTargetType). See [Design discussion: Trigger target type](https://forums.factorio.com/71657) and [Blacklist for prototypes turrets shouldn't attack](https://forums.factorio.com/86164). */
export type TriggerTargetMask = string[];

/** The name of a [TrivialSmokePrototype](prototype:TrivialSmokePrototype). */
export type TrivialSmokeID = string;

/** It can be specified as a table with named or numbered keys, but not a mix of both. */
export type UnitSpawnDefinition =
  | _UnitSpawnDefinition
  | [EntityID, SpawnPoint[]];

/** A vector is a two-element array containing the x and y components. Unlike Positions, vectors don't use the x, y keys. Positive x goes east, positive y goes south. See also: [Runtime Vector](runtime:Vector). */
export type Vector = [number, number];

export type Vector3D = _Vector3D | [number, number, number];

export type VerticalAlign = 'top' | 'center' | 'bottom';

/** The name of a [VirtualSignalPrototype](prototype:VirtualSignalPrototype). */
export type VirtualSignalID = string;

/** This type is used to produce sound from in-game entities when they are working/idle. */
export type WorkingSound = _WorkingSound | Sound;
