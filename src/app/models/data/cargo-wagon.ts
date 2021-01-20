import { Rational } from '../rational';

export interface CargoWagon {
  inventorySize: number;
}

export class RationalCargoWagon {
  inventorySize: Rational;

  constructor(data: CargoWagon) {
    this.inventorySize = Rational.fromNumber(data.inventorySize);
  }
}
