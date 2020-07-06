import { Rational } from '../rational';
import { Belt, RationalBelt } from './belt';
import { Factory, RationalFactory } from './factory';
import { Module, RationalModule } from './module';

export interface Item {
  id: string;
  name: string;
  category: string;
  row: number;
  stack?: number;
  belt?: Belt;
  factory?: Factory;
  module?: Module;
  /** Fuel value in MJ */
  fuel?: number;
}

export class RationalItem {
  id: string;
  name: string;
  category: string;
  row: number;
  stack?: Rational;
  belt?: RationalBelt;
  factory?: RationalFactory;
  module?: RationalModule;
  /** Fuel value in MJ */
  fuel?: Rational;

  constructor(data: Item) {
    this.id = data.id;
    this.name = data.name;
    this.category = data.category;
    this.row = Math.round(data.row);
    if (data.stack) {
      this.stack = Rational.fromNumber(data.stack);
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
      this.fuel = Rational.fromNumber(data.fuel);
    }
  }
}
