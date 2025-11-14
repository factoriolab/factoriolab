import { Rational, rational } from '~/rational/rational';

import { BeaconSettings } from '../beacon-settings';
import { CostSettings } from './cost-settings';
import { DisplayRate } from './display-rate';
import { MaximizeType } from './maximize-type';
import { Preset } from './preset';
import { researchBonusValue } from './research-bonus';

export interface SettingsState {
  modId?: string;
  checkedObjectiveIds: Set<string>;
  maximizeType: MaximizeType;
  requireMachinesOutput: boolean;
  displayRate: DisplayRate;
  excludedItemIds: Set<string>;
  checkedItemIds: Set<string>;
  beltId?: string;
  pipeId?: string;
  cargoWagonId?: string;
  fluidWagonId?: string;
  flowRate: Rational;
  stack?: Rational;
  excludedRecipeIds?: Set<string>;
  checkedRecipeIds: Set<string>;
  netProductionOnly: boolean;
  preset: number;
  machineRankIds?: string[];
  fuelRankIds?: string[];
  moduleRankIds?: string[];
  beacons?: BeaconSettings[];
  overclock?: Rational;
  beaconReceivers?: Rational;
  proliferatorSprayId: string;
  miningBonus: Rational;
  researchBonus: Rational;
  researchedTechnologyIds?: Set<string>;
  locationIds?: Set<string>;
  costs: CostSettings;
}

export type PartialSettingsState = Partial<Omit<SettingsState, 'costs'>> & {
  costs?: Partial<CostSettings>;
};

export const initialSettingsState: SettingsState = {
  checkedObjectiveIds: new Set(),
  preset: Preset.Minimum,
  maximizeType: MaximizeType.Ratio,
  requireMachinesOutput: false,
  displayRate: DisplayRate.PerMinute,
  excludedItemIds: new Set(),
  checkedItemIds: new Set(),
  flowRate: rational(1200n),
  checkedRecipeIds: new Set(),
  netProductionOnly: false,
  proliferatorSprayId: '',
  miningBonus: rational.zero,
  researchBonus: researchBonusValue.speed6,
  costs: {
    factor: rational.one,
    machine: rational.one,
    footprint: rational.one,
    unproduceable: rational(1000000000000n),
    excluded: rational.zero,
    surplus: rational.zero,
    maximize: rational(-1000000000n),
    recycling: rational(1000n),
  },
};
