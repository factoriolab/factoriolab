import Fraction from 'fraction.js';

export interface Step {
  itemId: string;
  items: Fraction;
  belt?: string;
  lanes?: Fraction;
  factory?: string;
  factories?: Fraction;
  modules?: string[];
  beaconType?: string;
  beaconCount?: number;
}
