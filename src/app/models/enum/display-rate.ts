import { SelectItem } from 'primeng/api';

import { Rational } from '../rational';

export enum DisplayRate {
  PerSecond = 1,
  PerMinute = 60,
  PerHour = 3600,
}

export const displayRateOptions: SelectItem<DisplayRate>[] = [
  { value: DisplayRate.PerSecond, label: 'options.DisplayRate.PerSecond' },
  { value: DisplayRate.PerMinute, label: 'options.DisplayRate.PerMinute' },
  { value: DisplayRate.PerHour, label: 'options.DisplayRate.PerHour' },
];

export const displayRateVal = {
  [DisplayRate.PerSecond]: new Rational(BigInt(DisplayRate.PerSecond)),
  [DisplayRate.PerMinute]: new Rational(BigInt(DisplayRate.PerMinute)),
  [DisplayRate.PerHour]: new Rational(BigInt(DisplayRate.PerHour)),
};

export const displayRateLabel = {
  [DisplayRate.PerHour]: '/h',
  [DisplayRate.PerMinute]: '/m',
  [DisplayRate.PerSecond]: '/s',
};
