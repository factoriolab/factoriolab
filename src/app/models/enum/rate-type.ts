import { SelectItem } from 'primeng/api';

import { DisplayRateInfo } from './display-rate';
import { Game } from './game';

export enum RateType {
  Items,
  Belts,
  Wagons,
}

export function rateTypeOptions(
  dispRateInfo: DisplayRateInfo,
  game: Game
): SelectItem<RateType>[] {
  const result = [
    { value: RateType.Items, label: dispRateInfo.itemsLabel },
    { value: RateType.Belts, label: 'options.rateType.belts' },
    { value: RateType.Wagons, label: dispRateInfo.wagonsLabel },
  ];

  if (game === Game.DysonSphereProgram || game === Game.CaptainOfIndustry) {
    return result.filter((i) => i.value !== RateType.Wagons);
  }

  return result;
}
