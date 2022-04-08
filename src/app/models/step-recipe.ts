import { Rational } from './rational';

export interface StepRecipe {
  id: string;
  factories: Rational;
  beacons: Rational;
  power: Rational;
  pollution: Rational;
}
