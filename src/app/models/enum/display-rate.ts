import { IdName } from '../id-name';
import { Rational } from '../rational';

export enum DisplayRate {
  PerSecond = 1,
  PerMinute = 60,
  PerHour = 3600,
}

export const DisplayRateOptions: IdName<DisplayRate>[] = [
  { id: DisplayRate.PerSecond, name: 'Units per second' },
  { id: DisplayRate.PerMinute, name: 'Units per minute' },
  { id: DisplayRate.PerHour, name: 'Units per hour' },
];

export const DisplayRateVal = {
  [DisplayRate.PerSecond]: new Rational(BigInt(DisplayRate.PerSecond)),
  [DisplayRate.PerMinute]: new Rational(BigInt(DisplayRate.PerMinute)),
  [DisplayRate.PerHour]: new Rational(BigInt(DisplayRate.PerHour)),
};

export const DisplayRateLabel = {
  [DisplayRate.PerHour]: '/h',
  [DisplayRate.PerMinute]: '/m',
  [DisplayRate.PerSecond]: '/s',
};
