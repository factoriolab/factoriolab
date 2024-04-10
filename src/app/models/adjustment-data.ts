import { Rational } from './rational';

export interface AdjustmentData {
  proliferatorSprayId: string;
  miningBonus: Rational;
  researchBonus: Rational;
  netProductionOnly: boolean;
}
