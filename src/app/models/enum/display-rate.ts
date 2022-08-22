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
  label: string;
  value: Rational;
}

export const displayRateInfo: Record<DisplayRate, DisplayRateInfo> = {
  [DisplayRate.PerSecond]: {
    option: DisplayRate.PerSecond,
    label: '/s',
    value: Rational.from(DisplayRate.PerSecond),
  },
  [DisplayRate.PerMinute]: {
    option: DisplayRate.PerMinute,
    label: '/m',
    value: Rational.from(DisplayRate.PerMinute),
  },
  [DisplayRate.PerHour]: {
    option: DisplayRate.PerHour,
    label: '/h',
    value: Rational.from(DisplayRate.PerHour),
  },
};
