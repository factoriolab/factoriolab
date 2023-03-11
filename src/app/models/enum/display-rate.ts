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

/** Display rate information, nonconfigurable */
export interface DisplayRateInf {
  option: DisplayRate;
  suffix: string;
  itemsLabel: string;
  wagonsLabel: string;
  pollutionLabel: string;
  value: Rational;
}

/** Display rate information data, nonconfigurable */
export const displayRateInf: Record<DisplayRate, DisplayRateInf> = {
  [DisplayRate.PerSecond]: {
    option: DisplayRate.PerSecond,
    suffix: 'options.displayRate.perSecondSuffix',
    itemsLabel: 'options.rateUnit.itemsPerSecond',
    wagonsLabel: 'options.rateUnit.wagonsPerSecond',
    pollutionLabel: 'options.rateUnit.pollutionPerSecond',
    value: Rational.from(DisplayRate.PerSecond),
  },
  [DisplayRate.PerMinute]: {
    option: DisplayRate.PerMinute,
    suffix: 'options.displayRate.perMinuteSuffix',
    itemsLabel: 'options.rateUnit.itemsPerMinute',
    wagonsLabel: 'options.rateUnit.wagonsPerMinute',
    pollutionLabel: 'options.rateUnit.pollutionPerMinute',
    value: Rational.from(DisplayRate.PerMinute),
  },
  [DisplayRate.PerHour]: {
    option: DisplayRate.PerHour,
    suffix: 'options.displayRate.perHourSuffix',
    itemsLabel: 'options.rateUnit.itemsPerHour',
    wagonsLabel: 'options.rateUnit.wagonsPerHour',
    pollutionLabel: 'options.rateUnit.pollutionPerHour',
    value: Rational.from(DisplayRate.PerHour),
  },
};
