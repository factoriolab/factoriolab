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
    itemsLabel: 'options.rateType.itemsPerSecond',
    wagonsLabel: 'options.rateType.wagonsPerSecond',
    pollutionLabel: 'options.rateType.pollutionPerSecond',
    value: Rational.from(DisplayRate.PerSecond),
  },
  [DisplayRate.PerMinute]: {
    option: DisplayRate.PerMinute,
    suffix: 'options.displayRate.perMinuteSuffix',
    itemsLabel: 'options.rateType.itemsPerMinute',
    wagonsLabel: 'options.rateType.wagonsPerMinute',
    pollutionLabel: 'options.rateType.pollutionPerMinute',
    value: Rational.from(DisplayRate.PerMinute),
  },
  [DisplayRate.PerHour]: {
    option: DisplayRate.PerHour,
    suffix: 'options.displayRate.perHourSuffix',
    itemsLabel: 'options.rateType.itemsPerHour',
    wagonsLabel: 'options.rateType.wagonsPerHour',
    pollutionLabel: 'options.rateType.pollutionPerHour',
    value: Rational.from(DisplayRate.PerHour),
  },
};
