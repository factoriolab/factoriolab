import { Rational } from '../rational';
import { Beacon, BeaconRtl } from './beacon';
import { Belt, BeltRtl } from './belt';
import { CargoWagon, CargoWagonRtl } from './cargo-wagon';
import { FluidWagon, FluidWagonRtl } from './fluid-wagon';
import { Fuel, FuelRtl } from './fuel';
import { Machine, MachineRtl } from './machine';
import { Module, ModuleRtl } from './module';

/** Item data */
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
  /** Used to link the item to an alternate icon id */
  icon?: string;
  /** Used to add extra text to an already defined icon */
  iconText?: string;
}

/** Rational item data */
export class ItemRtl {
  id: string;
  name: string;
  category: string;
  row: number;
  stack?: Rational;
  beacon?: BeaconRtl;
  belt?: BeltRtl;
  pipe?: BeltRtl;
  machine?: MachineRtl;
  module?: ModuleRtl;
  fuel?: FuelRtl;
  cargoWagon?: CargoWagonRtl;
  fluidWagon?: FluidWagonRtl;
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
      this.beacon = new BeaconRtl(obj.beacon);
    }
    if (obj.belt) {
      this.belt = new BeltRtl(obj.belt);
    }
    if (obj.pipe) {
      this.pipe = new BeltRtl(obj.pipe);
    }
    if (obj.machine) {
      this.machine = new MachineRtl(obj.machine);
    }
    if (obj.module) {
      this.module = new ModuleRtl(obj.module);
    }
    if (obj.fuel) {
      this.fuel = new FuelRtl(obj.fuel);
    }
    if (obj.cargoWagon) {
      this.cargoWagon = new CargoWagonRtl(obj.cargoWagon);
    }
    if (obj.fluidWagon) {
      this.fluidWagon = new FluidWagonRtl(obj.fluidWagon);
    }
    if (obj.icon) {
      this.icon = obj.icon;
    }
    if (obj.iconText) {
      this.iconText = obj.iconText;
    }
  }
}
