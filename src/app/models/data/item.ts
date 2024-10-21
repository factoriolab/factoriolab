import { Quality } from '../enum/quality';
import { Rational, rational } from '../rational';
import { Beacon, BeaconJson, parseBeacon } from './beacon';
import { Belt, BeltJson, parseBelt } from './belt';
import { CargoWagon, CargoWagonJson, parseCargoWagon } from './cargo-wagon';
import { FluidWagon, FluidWagonJson, parseFluidWagon } from './fluid-wagon';
import { Fuel, FuelJson, parseFuel } from './fuel';
import { Machine, MachineJson, parseMachine } from './machine';
import { Module, ModuleJson, parseModule } from './module';
import { Technology } from './technology';

export interface ItemJson {
  id: string;
  name: string;
  category: string;
  row: number;
  stack?: number;
  beacon?: BeaconJson;
  belt?: BeltJson;
  pipe?: BeltJson;
  machine?: MachineJson;
  module?: ModuleJson;
  fuel?: FuelJson;
  cargoWagon?: CargoWagonJson;
  fluidWagon?: FluidWagonJson;
  technology?: Technology;
  /** Used to link the item to an alternate icon id */
  icon?: string;
  /** Used to add extra text to an already defined icon */
  iconText?: string;
}

export interface Item {
  id: string;
  name: string;
  category: string;
  row: number;
  stack?: Rational;
  beacon?: Beacon;
  belt?: Belt;
  pipe?: Belt;
  machine?: Machine;
  module?: Module;
  fuel?: Fuel;
  cargoWagon?: CargoWagon;
  fluidWagon?: FluidWagon;
  technology?: Technology;
  /** Used to link the item to an alternate icon id */
  icon?: string;
  /** Used to add extra text to an already defined icon */
  iconText?: string;
  quality?: Quality;
}

export function parseItem(json: ItemJson): Item {
  return {
    id: json.id,
    name: json.name,
    category: json.category,
    row: json.row,
    stack: rational(json.stack),
    beacon: parseBeacon(json.beacon),
    belt: parseBelt(json.belt),
    pipe: parseBelt(json.pipe),
    machine: parseMachine(json.machine),
    module: parseModule(json.module),
    fuel: parseFuel(json.fuel),
    cargoWagon: parseCargoWagon(json.cargoWagon),
    fluidWagon: parseFluidWagon(json.fluidWagon),
    technology: json.technology,
    icon: json.icon,
    iconText: json.iconText,
  };
}
