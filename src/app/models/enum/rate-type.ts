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
    { value: RateType.Items, label: 'items' },
    { value: RateType.Belts, label: 'belts' },
    { value: RateType.Wagons, label: 'wagons' },
    { value: RateType.Factories, label: 'factories' },
  ];

  if (game === Game.DysonSphereProgram || game === Game.CaptainOfIndustry) {
    return result.filter((i) => i.value !== RateType.Wagons);
  }

  return result;
}
