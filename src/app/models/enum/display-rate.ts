import { SelectItem } from 'primeng/api';

import { Rational } from '../rational';

export enum DisplayRate {
  PerSecond = 1,
  PerMinute = 60,
  PerHour = 3600,
}

export const displayRateOptions: SelectItem<DisplayRate>[] = [
  { value: DisplayRate.PerSecond, label: 'options.displayRate.perSecond' },
  { value: DisplayRate.PerMinute, label: 'options.displayRate.perMinute' },
  { value: DisplayRate.PerHour, label: 'options.displayRate.perHour' },
];

export interface DisplayRateInfo {
  option: DisplayRate;
  suffix: string;
  itemsLabel: string;
  wagonsLabel: string;
  pollutionLabel: string;
  value: Rational;
}

export const displayRateInfo: Record<DisplayRate, DisplayRateInfo> = {
  [DisplayRate.PerSecond]: {
    option: DisplayRate.PerSecond,
    suffix: 'options.displayRate.perSecondSuffix',
    itemsLabel: 'options.objectiveUnit.itemsPerSecond',
    wagonsLabel: 'options.objectiveUnit.wagonsPerSecond',
    pollutionLabel: 'options.objectiveUnit.pollutionPerSecond',
    value: Rational.from(DisplayRate.PerSecond),
  },
  [DisplayRate.PerMinute]: {
    option: DisplayRate.PerMinute,
    suffix: 'options.displayRate.perMinuteSuffix',
    itemsLabel: 'options.objectiveUnit.itemsPerMinute',
    wagonsLabel: 'options.objectiveUnit.wagonsPerMinute',
    pollutionLabel: 'options.objectiveUnit.pollutionPerMinute',
    value: Rational.from(DisplayRate.PerMinute),
  },
  [DisplayRate.PerHour]: {
    option: DisplayRate.PerHour,
    suffix: 'options.displayRate.perHourSuffix',
    itemsLabel: 'options.objectiveUnit.itemsPerHour',
    wagonsLabel: 'options.objectiveUnit.wagonsPerHour',
    pollutionLabel: 'options.objectiveUnit.pollutionPerHour',
    value: Rational.from(DisplayRate.PerHour),
  },
};
