import { Rational } from '~/rational/rational';
import { Step } from '~/solver/step';

export interface ItemSource {
  isInput?: boolean;
  value: Rational;
  step?: Step;
}
