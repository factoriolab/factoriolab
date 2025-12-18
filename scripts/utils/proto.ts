import { BeaconJson } from '~/data/schema/beacon';
import { BeltJson } from '~/data/schema/belt';
import { CargoWagonJson } from '~/data/schema/cargo-wagon';
import { EnergyType } from '~/data/schema/energy-type';
import { FluidWagonJson } from '~/data/schema/fluid-wagon';
import { InserterJson } from '~/data/schema/inserter';
import { ModuleEffect } from '~/data/schema/module';
import { SiloJson } from '~/data/schema/silo';

import * as M from '../factorio.models';
import * as D from '../factorio-build.models';
import { getDisallowedEffects } from './data';
import { getPowerInKw } from './power';

export function getBeacon(proto: M.BeaconPrototype): BeaconJson {
  return {
    effectivity: proto.distribution_effectivity,
    modules: proto.module_slots,
    range: proto.supply_area_distance,
    type:
      proto.energy_source.type === 'electric' ? EnergyType.Electric : undefined,
    usage: getPowerInKw(proto.energy_usage),
    disallowedEffects: getDisallowedEffects(proto.allowed_effects, true),
    size: getEntitySize(proto),
    profile: proto.profile,
  };
}

export function getBelt(proto: M.TransportBeltPrototype): BeltJson {
  return { speed: proto.speed * 480 };
}

export function getPipe(proto: M.PumpPrototype): BeltJson {
  return { speed: proto.pumping_speed * 60 };
}

export function getCargoWagon(proto: M.CargoWagonPrototype): CargoWagonJson {
  return { size: proto.inventory_size };
}

export function getFluidWagon(proto: M.FluidWagonPrototype): FluidWagonJson {
  return { capacity: proto.capacity };
}

export function getInserter(proto: M.InserterPrototype): InserterJson {
  const speed = proto.rotation_speed * 360 * 60;
  const inserter: InserterJson = {
    speed,
    stack: proto.stack_size_bonus,
  };
  if (proto.bulk) inserter.category = 'bulk';
  if (proto.uses_inserter_stack_size_bonus === false)
    inserter.ignoresBonus = true;
  return inserter;
}

export function getMachineDisallowedEffects(
  proto: D.MachineProto,
): ModuleEffect[] | undefined {
  if (
    M.isBoilerPrototype(proto) ||
    M.isOffshorePumpPrototype(proto) ||
    M.isReactorPrototype(proto) ||
    M.isAsteroidCollectorPrototype(proto) ||
    M.isContainerPrototype(proto) ||
    M.isAgriculturalTowerPrototype(proto)
  )
    return undefined;

  return getDisallowedEffects(proto.allowed_effects);
}

export function getMachineDrain(proto: D.MachineProto): number | undefined {
  if (
    M.isOffshorePumpPrototype(proto) ||
    M.isContainerPrototype(proto) ||
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

export function getMachineModules(proto: D.MachineProto): number | undefined {
  if (
    M.isBoilerPrototype(proto) ||
    M.isOffshorePumpPrototype(proto) ||
    M.isReactorPrototype(proto) ||
    M.isAsteroidCollectorPrototype(proto) ||
    M.isAgriculturalTowerPrototype(proto)
  )
    return undefined;

  return proto.module_slots || undefined;
}

export function getMachinePollution(proto: D.MachineProto): number | undefined {
  if (M.isOffshorePumpPrototype(proto) || M.isContainerPrototype(proto))
    return undefined;

  // TODO: Support multiple pollutants
  return proto.energy_source.emissions_per_minute?.['pollution'];
}

export function getMachineSilo(proto: D.MachineProto): SiloJson | undefined {
  if (M.isRocketSiloPrototype(proto)) {
    return {
      parts: proto.rocket_parts_required,
      launch: 0,
    };
  }

  return undefined;
}

export function getEntitySize(
  proto: D.MachineProto | M.BeaconPrototype,
): [number, number] {
  if (proto.collision_box === undefined) return [0, 0];

  // MapPositions can be arrays or objects
  let left = 0,
    top = 0,
    right = 0,
    bottom = 0;
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

export function getMachineSpeed(proto: D.MachineProto): number {
  if (
    M.isReactorPrototype(proto) ||
    M.isAsteroidCollectorPrototype(proto) ||
    M.isAgriculturalTowerPrototype(proto)
  )
    return 1;

  let speed: number;
  if (M.isBoilerPrototype(proto))
    speed = getPowerInKw(proto.energy_consumption) ?? 1;
  else if (M.isLabPrototype(proto)) speed = proto.researching_speed ?? 1;
  else if (M.isMiningDrillPrototype(proto)) speed = proto.mining_speed;
  else if (M.isOffshorePumpPrototype(proto))
    speed = 1; // Speed is set on recipe instead of pump
  else speed = proto.crafting_speed;

  return speed;
}

export function getMachineType(proto: D.MachineProto): EnergyType | undefined {
  if (M.isOffshorePumpPrototype(proto) || M.isContainerPrototype(proto))
    return undefined;

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

export function getMachineUsage(proto: D.MachineProto): number | undefined {
  if (
    M.isOffshorePumpPrototype(proto) ||
    M.isAsteroidCollectorPrototype(proto) ||
    M.isContainerPrototype(proto)
  )
    return undefined;
  else if (M.isBoilerPrototype(proto))
    return getPowerInKw(proto.energy_consumption);
  else if (M.isReactorPrototype(proto)) return getPowerInKw(proto.consumption);

  return getPowerInKw(proto.energy_usage);
}

export function getMachineBaseEffect(
  proto: D.MachineProto,
): Partial<Record<ModuleEffect, number>> | undefined {
  if (
    M.isBoilerPrototype(proto) ||
    M.isOffshorePumpPrototype(proto) ||
    M.isReactorPrototype(proto) ||
    M.isAsteroidCollectorPrototype(proto) ||
    M.isAgriculturalTowerPrototype(proto) ||
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

export function getMachineHideRate(proto: D.MachineProto): boolean | undefined {
  if (M.isAsteroidCollectorPrototype(proto)) return true;
  return undefined;
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
