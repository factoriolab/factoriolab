import { SelectItem } from 'primeng/api';

import { DisplayRateInfo } from './display-rate';
import { Game } from './game';

export type RateUnit = 'items' | 'belts' | 'wagons';

export const rateUnits: RateUnit[] = ['items', 'belts', 'wagons'];

export function rateUnitOptions(
  dispRateInfo: DisplayRateInfo,
  game: Game
): SelectItem<RateUnit>[] {
  const result: SelectItem<RateUnit>[] = [
    { value: 'items', label: dispRateInfo.itemsLabel },
    { value: 'belts', label: 'options.rateUnit.belts' },
    { value: 'wagons', label: dispRateInfo.wagonsLabel },
  ];

  if (game === Game.DysonSphereProgram || game === Game.CaptainOfIndustry) {
    return result.filter((i) => i.value !== 'wagons');
  }

  return result;
}
