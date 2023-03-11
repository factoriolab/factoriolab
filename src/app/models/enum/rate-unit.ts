import { SelectItem } from 'primeng/api';

import { DisplayRateInf } from './display-rate';
import { Game } from './game';

export enum RateUnit {
  Items,
  Belts,
  Wagons,
}

export function rateUnitOptions(
  dispRateInfo: DisplayRateInf,
  game: Game
): SelectItem<RateUnit>[] {
  const result: SelectItem<RateUnit>[] = [
    { value: RateUnit.Items, label: dispRateInfo.itemsLabel },
    { value: RateUnit.Belts, label: 'options.rateUnit.belts' },
    { value: RateUnit.Wagons, label: dispRateInfo.wagonsLabel },
  ];

  if (game === Game.DysonSphereProgram || game === Game.CaptainOfIndustry) {
    return result.filter((i) => i.value !== RateUnit.Wagons);
  }

  return result;
}
