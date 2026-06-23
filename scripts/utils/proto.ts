import { BeaconJson } from '~/data/schema/beacon';
import { BeltJson } from '~/data/schema/belt';
import { CargoWagonJson } from '~/data/schema/cargo-wagon';
import { EnergyType } from '~/data/schema/energy-type';
import { FluidWagonJson } from '~/data/schema/fluid-wagon';
import { InserterJson } from '~/data/schema/inserter';
import { ModuleEffect } from '~/data/schema/module';
import { SiloJson } from '~/data/schema/silo';
import { rational } from '~/rational/rational';
import { clamp } from '~/utils/number';

import * as M from '../factorio.models';
import * as D from '../factorio-build.models';
import { getDisallowedEffects } from './data';
import { getPowerInKw } from './power';

export function getBeacon(
  proto: M.BeaconPrototype,
  abnormalQualities: M.QualityPrototype[],
): BeaconJson {
  const usage = getPowerInKw(proto.energy_usage);
  const beacon: BeaconJson = {
    effectivity: proto.distribution_effectivity,
    modules: proto.module_slots,
    range: proto.supply_area_distance,
    type:
      proto.energy_source.type === 'electric' ? EnergyType.Electric : undefined,
    usage,
    disallowedEffects: getDisallowedEffects(proto.allowed_effects, true),
    size: getEntitySize(proto),
    profile: proto.profile,
  };

  if (abnormalQualities.length) {
    const qualityRecord: Record<string, Partial<BeaconJson>> = {};
    for (const quality of abnormalQualities) {
      const variant: Partial<BeaconJson> = {};

      if (proto.distribution_effectivity_bonus_per_quality_level) {
        const qEffectivity =
          proto.distribution_effectivity +
          quality.level *
            proto.distribution_effectivity_bonus_per_quality_level;
        if (qEffectivity !== beacon.effectivity)
          variant.effectivity = qEffectivity;
      }

      if (proto.quality_affects_module_slots) {
        const multiplier = quality.beacon_module_slots_bonus ?? quality.level;
        const qModules = proto.module_slots + multiplier;
        if (qModules !== beacon.modules) variant.modules = qModules;
      }

      if (proto.quality_affects_supply_area_distance) {
        const multiplier =
          quality.beacon_supply_area_distance_bonus ??
          clamp(quality.level, 0, 64);
        const qRange = proto.supply_area_distance + multiplier;
        if (qRange !== beacon.range) variant.range = qRange;
      }

      if (quality.beacon_power_usage_multiplier && usage) {
        const qUsage = usage * quality.beacon_power_usage_multiplier;
        if (qUsage !== beacon.usage) variant.usage = qUsage;
      }

      if (Object.keys(variant).length) qualityRecord[quality.name] = variant;
    }

    if (Object.keys(qualityRecord).length) beacon.qualityRecord = qualityRecord;
  }

  return beacon;
}

export function getBelt(proto: M.TransportBeltPrototype): BeltJson {
  return { speed: proto.speed * 480 };
}

export function getPipe(
  proto: M.PumpPrototype,
  abnormalQualities: M.QualityPrototype[],
): BeltJson {
  const speed = proto.pumping_speed * 60;
  const belt: BeltJson = { speed };

  if (abnormalQualities.length) {
    const qualityRecord: Record<string, Partial<BeltJson>> = {};

    for (const quality of abnormalQualities) {
      const variant: Partial<BeltJson> = {};

      const qSpeed = speed * getDefaultMultiplier(quality);
      if (qSpeed !== belt.speed) variant.speed = qSpeed;

      if (Object.keys(variant).length) qualityRecord[quality.name] = variant;
    }

    if (Object.keys(qualityRecord).length) belt.qualityRecord = qualityRecord;
  }

  return belt;
}

export function getCargoWagon(proto: M.CargoWagonPrototype): CargoWagonJson {
  return { size: proto.inventory_size };
}

export function getFluidWagon(proto: M.FluidWagonPrototype): FluidWagonJson {
  return { capacity: proto.capacity };
}

export function getInserter(
  proto: M.InserterPrototype,
  abnormalQualities: M.QualityPrototype[],
): InserterJson {
  // const speed = proto.rotation_speed * 360 * 60;
  const ticksPerRotation = rational(
    Math.floor(1 / proto.rotation_speed / 2) * 2,
  );
  const rotationsPerSec = ticksPerRotation.reciprocal().mul(rational(60n));
  const degreesPerSec = rotationsPerSec.mul(rational(360n));
  const inserter: InserterJson = {
    speed: degreesPerSec.toString(),
    stack: proto.stack_size_bonus,
  };
  if (proto.bulk) inserter.category = 'bulk';
  if (proto.uses_inserter_stack_size_bonus === false)
    inserter.ignoresBonus = true;

  if (abnormalQualities.length) {
    const qualityRecord: Record<string, Partial<InserterJson>> = {};

    for (const quality of abnormalQualities) {
      const variant: Partial<InserterJson> = {};

      const qSpeed = degreesPerSec.mul(
        rational(
          quality.inserter_speed_multiplier ?? getDefaultMultiplier(quality),
        ),
      );
      if (!qSpeed.eq(degreesPerSec)) variant.speed = qSpeed.toString();

      if (Object.keys(variant).length) qualityRecord[quality.name] = variant;
    }

    if (Object.keys(qualityRecord).length)
      inserter.qualityRecord = qualityRecord;
  }

  return inserter;
}

export function getMachineDisallowedEffects(
  proto: D.MachineProto,
): ModuleEffect[] | undefined {
  if (
    M.isBoilerPrototype(proto) ||
    M.isOffshorePumpPrototype(proto) ||
    M.isReactorPrototype(proto)
  )
    return undefined;

  return getDisallowedEffects(proto.allowed_effects);
}

export function getMachineDrain(proto: D.MachineProto): number | undefined {
  if (
    M.isOffshorePumpPrototype(proto) ||
    proto.energy_source.type !== 'electric'
  )
    return undefined;

  if (proto.energy_source.drain != null)
    return getPowerInKw(proto.energy_source.drain);

  if (
    M.isAssemblingMachinePrototype(proto) ||
    M.isRocketSiloPrototype(proto) ||
    M.isFurnacePrototype(proto)
  ) {
    const usage = getMachineUsage(proto);
    if (usage != null) return usage / 30;
  }

  return undefined;
}

export function getMachineModules(
  proto: D.MachineProto,
  quality?: M.QualityPrototype,
): number | undefined {
  if (
    M.isBoilerPrototype(proto) ||
    M.isOffshorePumpPrototype(proto) ||
    M.isReactorPrototype(proto) ||
    proto.module_slots == null
  )
    return undefined;

  let modules = proto.module_slots;

  if (quality) {
    if (quality && proto.quality_affects_module_slots) {
      if (M.isLabPrototype(proto)) {
        if (quality.lab_module_slots_bonus)
          modules += quality.lab_module_slots_bonus;
      } else if (M.isMiningDrillPrototype(proto)) {
        if (quality.mining_drill_module_slots_bonus)
          modules += quality.mining_drill_module_slots_bonus;
      } else {
        const module_slots_quality_bonus =
          proto.module_slots_quality_bonus?.[quality.name];
        if (module_slots_quality_bonus) {
          modules += module_slots_quality_bonus;
        } else {
          modules +=
            quality.crafting_machine_module_slots_bonus ?? quality.level;
        }
      }
    }
  }

  return modules;
}

export function getMachinePollution(
  proto: D.MachineProto,
  quality?: M.QualityPrototype,
): number | undefined {
  if (M.isOffshorePumpPrototype(proto)) return undefined;

  // TODO: Support multiple pollutants
  let pollution = proto.energy_source.emissions_per_minute?.['pollution'];

  if (
    pollution &&
    quality &&
    (M.isBoilerPrototype(proto) || M.isReactorPrototype(proto))
  )
    pollution *= getDefaultMultiplier(quality);

  return pollution;
}

export function getMachineSilo(
  proto: D.MachineProto,
  dataRaw: D.DataRawDump,
): SiloJson | undefined {
  if (M.isRocketSiloPrototype(proto)) {
    return {
      parts: proto.rocket_parts_required,
      launch: getRocketLaunchTime(proto, dataRaw),
      buffered: true,
    };
  }

  return undefined;
}

export function getEntitySize(
  proto: D.MachineProto | M.BeaconPrototype,
): [number, number] {
  if (proto.collision_box === undefined) return [0, 0];

  // MapPositions can be arrays or objects
  let left: number, top: number, right: number, bottom: number;
  if (Array.isArray(proto.collision_box)) {
    const [topLeft, bottomRight] = proto.collision_box;
    [left, top] = Array.isArray(topLeft) ? topLeft : [topLeft.x, topLeft.y];
    [right, bottom] = Array.isArray(bottomRight)
      ? bottomRight
      : [bottomRight.x, bottomRight.y];
  } else {
    const leftTop = proto.collision_box.left_top;
    [left, top] = Array.isArray(leftTop) ? leftTop : [leftTop.x, leftTop.y];
    const rightBottom = proto.collision_box.right_bottom;
    [right, bottom] = Array.isArray(rightBottom)
      ? rightBottom
      : [rightBottom.x, rightBottom.y];
  }

  if (proto.flags?.includes('placeable-off-grid'))
    return [right - left, bottom - top];

  // tile_width and tile_height default to collision box dimensions rounded up.
  // Only their parities (odd/even) matter
  const widthEven = ((proto.tile_width ?? Math.ceil(right - left)) & 1) === 0;
  const heightEven = ((proto.tile_height ?? Math.ceil(bottom - top)) & 1) === 0;
  // Count tile centers occluded by collision box
  let tileWidth, tileHeight;
  if (widthEven) {
    // Box origin is offset 0.5 from tile centers
    tileWidth = Math.floor(0.5 - left) + Math.floor(0.5 + right);
  } else {
    // Add 1 for the box's {0, 0}
    tileWidth = 1 + Math.floor(-left) + Math.floor(right);
  }

  if (heightEven) tileHeight = Math.floor(0.5 - top) + Math.floor(0.5 + bottom);
  else tileHeight = 1 + Math.floor(-top) + Math.floor(bottom);

  return [tileWidth, tileHeight];
}

export function getMachineSpeed(
  proto: D.MachineProto,
  quality?: M.QualityPrototype,
): number {
  let speed: number;
  if (M.isReactorPrototype(proto) || M.isOffshorePumpPrototype(proto)) {
    speed = 1;

    if (quality) speed *= getDefaultMultiplier(quality);
  } else if (M.isBoilerPrototype(proto)) {
    speed = getPowerInKw(proto.energy_consumption) ?? 1;

    if (quality) speed *= getDefaultMultiplier(quality);
  } else if (M.isLabPrototype(proto)) {
    speed = proto.researching_speed ?? 1;

    if (quality) {
      const multiplier =
        quality.lab_research_speed_multiplier ?? getDefaultMultiplier(quality);
      speed *= multiplier;
    }
  } else if (M.isMiningDrillPrototype(proto)) speed = proto.mining_speed;
  else {
    speed = proto.crafting_speed;

    if (quality) {
      const crafting_speed_quality_multiplier =
        proto.crafting_speed_quality_multiplier?.[quality.name];
      if (crafting_speed_quality_multiplier)
        speed *= crafting_speed_quality_multiplier;
      else
        speed *=
          quality.crafting_machine_speed_multiplier ??
          getDefaultMultiplier(quality);
    }
  }

  return speed;
}

export function getMachineType(proto: D.MachineProto): EnergyType | undefined {
  if (M.isOffshorePumpPrototype(proto)) return undefined;

  switch (proto.energy_source.type) {
    case 'burner':
    case 'fluid':
      return EnergyType.Burner;
    case 'electric':
      return EnergyType.Electric;
    default:
      return undefined;
  }
}

export function getMachineUsage(
  proto: D.MachineProto,
  quality?: M.QualityPrototype,
): number | undefined {
  let usage: number | undefined;
  if (M.isOffshorePumpPrototype(proto)) usage = undefined;
  else if (M.isBoilerPrototype(proto)) {
    usage = getPowerInKw(proto.energy_consumption);
    if (usage && quality) usage *= getDefaultMultiplier(quality);
  } else if (M.isReactorPrototype(proto)) {
    usage = getPowerInKw(proto.consumption);
    if (usage && quality) usage *= getDefaultMultiplier(quality);
  } else usage = getPowerInKw(proto.energy_usage);

  return usage;
}

export function getMachineBaseEffect(
  proto: D.MachineProto,
): Partial<Record<ModuleEffect, number>> | undefined {
  if (
    M.isBoilerPrototype(proto) ||
    M.isOffshorePumpPrototype(proto) ||
    M.isReactorPrototype(proto) ||
    proto.effect_receiver?.base_effect == null
  )
    return undefined;

  const eff = proto.effect_receiver.base_effect;
  const result: Partial<Record<ModuleEffect, number>> = {};
  if (eff.consumption) result.consumption = eff.consumption;
  if (eff.pollution) result.pollution = eff.pollution;
  if (eff.productivity) result.productivity = eff.productivity;
  if (eff.quality) result.quality = eff.quality;
  if (eff.speed) result.speed = eff.speed;
  return result;
}

export function getMachineIngredientUsage(
  proto: D.MachineProto,
): number | undefined {
  if (
    M.isLabPrototype(proto) &&
    proto.science_pack_drain_rate_percent &&
    proto.science_pack_drain_rate_percent !== 100
  )
    return proto.science_pack_drain_rate_percent / 100;

  return undefined;
}

export function getRecipeDisallowedEffects(
  proto: M.RecipePrototype,
): ModuleEffect[] | undefined {
  const disallowedEffects: ModuleEffect[] = [];

  if (proto.allow_consumption === false) disallowedEffects.push('consumption');
  if (proto.allow_pollution === false) disallowedEffects.push('pollution');
  if (proto.allow_quality === false) disallowedEffects.push('quality');
  if (proto.allow_speed === false) disallowedEffects.push('speed');

  if (!proto.allow_productivity) disallowedEffects.push('productivity');

  if (disallowedEffects.length) return disallowedEffects;
  return undefined;
}

export function getDefaultMultiplier(proto: M.QualityPrototype): number {
  return proto.default_multiplier ?? 1 + 0.3 * proto.level;
}

export function getRocketLaunchTime(
  proto: M.RocketSiloPrototype,
  dataRaw: D.DataRawDump,
): number {
  const rocket = dataRaw['rocket-silo-rocket'][proto.rocket_entity];

  let launch = 0;
  // Lights blinking open
  launch += 1 / proto.light_blinking_speed + 1;
  // Doors opening
  launch += 1 / proto.door_opening_speed + 1;
  // Doors opened
  launch += (proto.rocket_rising_delay ?? 30) + 1;
  // Rocket rising
  launch += 1 / rocket.rising_speed + 1;
  // Rocket ready
  launch += 14; // Estimate for satellite inserter swing time
  // Launch started
  launch += (proto.launch_wait_time ?? 120) + 1;
  // Engine starting
  launch += 1 / rocket.engine_starting_speed + 1;
  // Rocket flying
  const rocketFlightThreshold = 0.5;
  launch +=
    Math.log(
      1 +
        (rocketFlightThreshold * rocket.flying_acceleration) /
          rocket.flying_speed,
    ) / Math.log(1 + rocket.flying_acceleration);
  // Lights blinking close
  launch += 1 / proto.light_blinking_speed + 1;
  // Doors closing
  launch += 1 / proto.door_opening_speed + 1;

  launch = Math.floor(launch + 0.5);

  return launch;
}
