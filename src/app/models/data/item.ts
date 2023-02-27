import { Rational } from '../rational';
import { Beacon, RationalBeacon } from './beacon';
import { Belt, RationalBelt } from './belt';
import { CargoWagon, RationalCargoWagon } from './cargo-wagon';
import { FluidWagon, RationalFluidWagon } from './fluid-wagon';
import { Fuel, RationalFuel } from './fuel';
import { Machine, RationalMachine } from './machine';
import { Module, RationalModule } from './module';

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

export class RationalItem {
  id: string;
  name: string;
  category: string;
  row: number;
  stack?: Rational;
  beacon?: RationalBeacon;
  belt?: RationalBelt;
  pipe?: RationalBelt;
  machine?: RationalMachine;
  module?: RationalModule;
  fuel?: RationalFuel;
  cargoWagon?: RationalCargoWagon;
  fluidWagon?: RationalFluidWagon;
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
      this.beacon = new RationalBeacon(obj.beacon);
    }
    if (obj.belt) {
      this.belt = new RationalBelt(obj.belt);
    }
    if (obj.pipe) {
      this.pipe = new RationalBelt(obj.pipe);
    }
    if (obj.machine) {
      this.machine = new RationalMachine(obj.machine);
    }
    if (obj.module) {
      this.module = new RationalModule(obj.module);
    }
    if (obj.fuel) {
      this.fuel = new RationalFuel(obj.fuel);
    }
    if (obj.cargoWagon) {
      this.cargoWagon = new RationalCargoWagon(obj.cargoWagon);
    }
    if (obj.fluidWagon) {
      this.fluidWagon = new RationalFluidWagon(obj.fluidWagon);
    }
    if (obj.icon) {
      this.icon = obj.icon;
    }
    if (obj.iconText) {
      this.iconText = obj.iconText;
    }
  }
}
