import { Rational } from './rational';

export interface Module {
  speed: number;
  productivity: number;
  energy: number;
}

export class RationalModule {
  speed: Rational;
  productivity: Rational;
  energy: Rational;

  constructor(data: Module) {
    this.speed = Rational.fromNumber(data.speed);
    this.productivity = Rational.fromNumber(data.productivity);
    this.energy = Rational.fromNumber(data.energy);
  }
}
