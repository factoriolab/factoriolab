import { Rational } from '../rational';
import { Beacon, RationalBeacon } from './beacon';
import { Belt, RationalBelt } from './belt';
import { CargoWagon, RationalCargoWagon } from './cargo-wagon';
import { Factory, RationalFactory } from './factory';
import { FluidWagon, RationalFluidWagon } from './fluid-wagon';
import { Fuel, RationalFuel } from './fuel';
import { Module, RationalModule } from './module';

export interface Item {
  id: string;
  name: string;
  category: string;
  row: number;
  stack?: number;
  beacon?: Beacon;
  belt?: Belt;
  factory?: Factory;
  module?: Module;
  fuel?: Fuel;
  cargoWagon?: CargoWagon;
  fluidWagon?: FluidWagon;
}

export class RationalItem {
  id: string;
  name: string;
  category: string;
  row: number;
  stack?: Rational;
  beacon?: RationalBeacon;
  belt?: RationalBelt;
  factory?: RationalFactory;
  module?: RationalModule;
  fuel?: RationalFuel;
  cargoWagon?: RationalCargoWagon;
  fluidWagon?: RationalFluidWagon;

  constructor(data: Item) {
    this.id = data.id;
    this.name = data.name;
    this.category = data.category;
    this.row = Math.round(data.row);
    if (data.stack) {
      this.stack = Rational.fromNumber(data.stack);
    }
    if (data.beacon) {
      this.beacon = new RationalBeacon(data.beacon);
    }
    if (data.belt) {
      this.belt = new RationalBelt(data.belt);
    }
    if (data.factory) {
      this.factory = new RationalFactory(data.factory);
    }
    if (data.module) {
      this.module = new RationalModule(data.module);
    }
    if (data.fuel) {
      this.fuel = new RationalFuel(data.fuel);
    }
    if (data.cargoWagon) {
      this.cargoWagon = new RationalCargoWagon(data.cargoWagon);
    }
    if (data.fluidWagon) {
      this.fluidWagon = new RationalFluidWagon(data.fluidWagon);
    }
  }
}
