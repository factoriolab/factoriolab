import { SelectItem } from 'primeng/api';

import { DisplayRateInfo } from './display-rate';
import { Game } from './game';

export type AmountType = 'items' | 'belts' | 'wagons';

export function amountTypeOptions(
  dispRateInfo: DisplayRateInfo,
  game: Game
): SelectItem<AmountType>[] {
  const result: SelectItem<AmountType>[] = [
    { value: 'items', label: dispRateInfo.itemsLabel },
    { value: 'belts', label: 'options.rateType.belts' },
    { value: 'wagons', label: dispRateInfo.wagonsLabel },
  ];

  if (game === Game.DysonSphereProgram || game === Game.CaptainOfIndustry) {
    return result.filter((i) => i.value !== 'wagons');
  }

  return result;
}
