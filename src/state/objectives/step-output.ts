import { Rational } from '~/rational/rational';
import { Step } from '~/solver/step';

export interface StepOutput {
  inputs?: boolean;
  value: Rational;
  step?: Step;
}
