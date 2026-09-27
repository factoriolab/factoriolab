import { Rational, rational } from '~/rational/rational';
import { asSet } from '~/utils/coercion';
import { coalesce } from '~/utils/nullish';

import { BaseJson } from './base';
import { Beacon, BeaconJson, parseBeacon } from './beacon';
import { Belt, BeltJson, parseBelt } from './belt';
import { Fuel, FuelJson, parseFuel } from './fuel';
import { Inserter, InserterJson, parseInserter } from './inserter';
import { Machine, MachineJson, parseMachine } from './machine';
import { Module, ModuleJson, parseModule } from './module';
import { Quality } from './quality';
import { parseTechnology, Technology, TechnologyJson } from './technology';
import { parseWagon, Wagon, WagonJson } from './wagon';

export interface ItemJson extends BaseJson {
  types?: string[];
  category?: string;
  row?: number;
  stack?: number;
  rocketCapacity?: number;
  beacon?: BeaconJson;
  belt?: BeltJson;
  machine?: MachineJson;
  module?: ModuleJson;
  fuel?: FuelJson;
  wagon?: WagonJson;
  technology?: TechnologyJson;
  inserter?: InserterJson;
}

export interface Item extends BaseJson {
  types?: Set<string>;
  category?: string;
  row: number;
  stack?: Rational;
  rocketCapacity?: Rational;
  beacon?: Beacon;
  belt?: Belt;
  machine?: Machine;
  module?: Module;
  fuel?: Fuel;
  wagon?: Wagon;
  technology?: Technology;
  inserter?: Inserter;
  quality?: Quality;
}

export function parseItem(json: ItemJson): Item {
  return {
    id: json.id,
    name: json.name,
    types: asSet(json.types),
    category: json.category,
    row: coalesce(json.row, 0),
    stack: rational(json.stack),
    rocketCapacity: rational(json.rocketCapacity),
    beacon: parseBeacon(json.beacon),
    belt: parseBelt(json.belt),
    machine: parseMachine(json.machine),
    module: parseModule(json.module),
    fuel: parseFuel(json.fuel),
    wagon: parseWagon(json.wagon),
    technology: parseTechnology(json.technology),
    inserter: parseInserter(json.inserter),
    icon: json.icon,
    iconText: json.iconText,
  };
}

export function itemHasQuality(item: Item | ItemJson): boolean {
  return item.technology == null && item.stack != null;
}
