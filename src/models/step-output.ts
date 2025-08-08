import { Rational } from './rational';
import { Step } from './step';

export interface StepOutput {
  inputs?: boolean;
  value: Rational;
  step?: Step;
}
