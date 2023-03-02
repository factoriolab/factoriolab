import { SelectItem } from 'primeng/api';

import { DisplayRateInfo } from './display-rate';
import { Game } from './game';

export type RateType = 'items' | 'belts' | 'wagons';

export const rateTypes: RateType[] = ['items', 'belts', 'wagons'];

export function rateTypeOptions(
  dispRateInfo: DisplayRateInfo,
  game: Game
): SelectItem<RateType>[] {
  const result: SelectItem<RateType>[] = [
    { value: 'items', label: dispRateInfo.itemsLabel },
    { value: 'belts', label: 'options.rateType.belts' },
    { value: 'wagons', label: dispRateInfo.wagonsLabel },
  ];

  if (game === Game.DysonSphereProgram || game === Game.CaptainOfIndustry) {
    return result.filter((i) => i.value !== 'wagons');
  }

  return result;
}
