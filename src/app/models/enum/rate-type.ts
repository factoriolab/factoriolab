import { SelectItem } from 'primeng/api';

import { DisplayRate, displayRateLabel } from './display-rate';
import { Game } from './game';

export enum RateType {
  Items,
  Belts,
  Wagons,
  Factories,
}

export function rateTypeOptions(
  displayRate: DisplayRate,
  game: Game
): SelectItem<RateType>[] {
  const result = [
    { value: RateType.Items, label: `Items${displayRateLabel[displayRate]}` },
    { value: RateType.Belts, label: 'Belts' },
    { value: RateType.Wagons, label: `Wagons${displayRateLabel[displayRate]}` },
    { value: RateType.Factories, label: 'Factories' },
  ];

  if (game === Game.DysonSphereProgram || game === Game.CaptainOfIndustry) {
    return result.filter((i) => i.value !== RateType.Wagons);
  }

  return result;
}
