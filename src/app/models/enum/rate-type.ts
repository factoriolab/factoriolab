import { SelectItem } from 'primeng/api';

import { DisplayRateInfo } from './display-rate';
import { Game } from './game';

export enum RateType {
  Items,
  Belts,
  Wagons,
  Factories,
}

export function rateTypeOptions(
  dispRateInfo: DisplayRateInfo,
  game: Game
): SelectItem<RateType>[] {
  const result = [
    { value: RateType.Items, label: `Items${dispRateInfo.label}` },
    { value: RateType.Belts, label: 'Belts' },
    { value: RateType.Wagons, label: `Wagons${dispRateInfo.label}` },
    { value: RateType.Factories, label: 'Factories' },
  ];

  if (game === Game.DysonSphereProgram || game === Game.CaptainOfIndustry) {
    return result.filter((i) => i.value !== RateType.Wagons);
  }

  return result;
}
