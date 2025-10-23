import { Rational } from '~/rational/rational';
import { Step } from '~/solver/step';

export interface StepOutput {
  isInput?: boolean;
  value: Rational;
  step?: Step;
}
