import { IdName } from '../id-name';
import { Rational } from '../rational';

export enum DisplayRate {
  PerSecond = 1,
  PerMinute = 60,
  PerHour = 3600,
}

export const DisplayRateOptions: IdName[] = [
  { id: DisplayRate.PerSecond, name: '#/sec' },
  { id: DisplayRate.PerMinute, name: '#/min' },
  { id: DisplayRate.PerHour, name: '#/hr' },
];

export const DisplayRateVal = {
  [DisplayRate.PerSecond]: new Rational(BigInt(DisplayRate.PerSecond)),
  [DisplayRate.PerMinute]: new Rational(BigInt(DisplayRate.PerMinute)),
  [DisplayRate.PerHour]: new Rational(BigInt(DisplayRate.PerHour)),
};
