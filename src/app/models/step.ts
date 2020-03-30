import Fraction from 'fraction.js';

export interface Step {
  itemId: string;
  items: Fraction;
  belt?: string;
  belts?: Fraction;
  factory?: string;
  factories?: Fraction;
  modules?: string[];
  beacons?: [string, Fraction];
}
