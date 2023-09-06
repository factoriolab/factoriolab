import { Rational } from '../rational';
import { Beacon, BeaconRational } from './beacon';
import { Belt, BeltRational } from './belt';
import { CargoWagon, CargoWagonRational } from './cargo-wagon';
import { FluidWagon, FluidWagonRational } from './fluid-wagon';
import { Fuel, FuelRational } from './fuel';
import { Machine, MachineRational } from './machine';
import { Module, ModuleRational } from './module';
import { Technology } from './technology';

export interface Item {
  id: string;
  name: string;
  category: string;
  row: number;
  stack?: number;
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
}

export class ItemRational {
  id: string;
  name: string;
  category: string;
  row: number;
  stack?: Rational;
  beacon?: BeaconRational;
  belt?: BeltRational;
  pipe?: BeltRational;
  machine?: MachineRational;
  module?: ModuleRational;
  fuel?: FuelRational;
  cargoWagon?: CargoWagonRational;
  fluidWagon?: FluidWagonRational;
  technology?: Technology;
  /** Used to link the item to an alternate icon id */
  icon?: string;
  /** Used to add extra text to an already defined icon */
  iconText?: string;

  constructor(obj: Item) {
    this.id = obj.id;
    this.name = obj.name;
    this.category = obj.category;
    this.row = Math.round(obj.row);

    if (obj.stack) {
      this.stack = Rational.fromNumber(obj.stack);
    }

    if (obj.beacon) {
      this.beacon = new BeaconRational(obj.beacon);
    }

    if (obj.belt) {
      this.belt = new BeltRational(obj.belt);
    }

    if (obj.pipe) {
      this.pipe = new BeltRational(obj.pipe);
    }

    if (obj.machine) {
      this.machine = new MachineRational(obj.machine);
    }

    if (obj.module) {
      this.module = new ModuleRational(obj.module);
    }

    if (obj.fuel) {
      this.fuel = new FuelRational(obj.fuel);
    }

    if (obj.cargoWagon) {
      this.cargoWagon = new CargoWagonRational(obj.cargoWagon);
    }

    if (obj.fluidWagon) {
      this.fluidWagon = new FluidWagonRational(obj.fluidWagon);
    }

    this.technology = obj.technology;
    this.icon = obj.icon;
    this.iconText = obj.iconText;
  }
}
