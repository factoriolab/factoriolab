import { IdName } from '../id-name';
import { DisplayRate, DisplayRateLabel } from './display-rate';

export enum RateType {
  Items,
  Belts,
  Wagons,
  Factories,
}

export function rateTypeOptions(
  displayRate: DisplayRate,
  isDsp: boolean
): IdName<RateType>[] {
  const result = [
    { id: RateType.Items, name: `Items${DisplayRateLabel[displayRate]}` },
    { id: RateType.Belts, name: 'Belts' },
    { id: RateType.Wagons, name: `Wagons${DisplayRateLabel[displayRate]}` },
    { id: RateType.Factories, name: 'Factories' },
  ];

  if (isDsp) {
    return result.filter((i) => i.id !== RateType.Wagons);
  }

  return result;
}
