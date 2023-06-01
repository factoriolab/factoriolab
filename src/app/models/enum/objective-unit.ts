import { SelectItem } from 'primeng/api';

import { DisplayRateInfo } from './display-rate';
import { Game } from './game';

export enum ObjectiveUnit {
  Items,
  Belts,
  Wagons,
  Machines,
}

export function objectiveUnitOptions(
  dispRateInfo: DisplayRateInfo,
  game: Game
): SelectItem<ObjectiveUnit>[] {
  const result: SelectItem<ObjectiveUnit>[] = [
    { value: ObjectiveUnit.Items, label: dispRateInfo.itemsLabel },
    { value: ObjectiveUnit.Belts, label: 'options.objectiveUnit.belts' },
    { value: ObjectiveUnit.Wagons, label: dispRateInfo.wagonsLabel },
    { value: ObjectiveUnit.Machines, label: 'options.objectiveUnit.machines' },
  ];

  if (game === Game.DysonSphereProgram || game === Game.CaptainOfIndustry) {
    return result.filter((i) => i.value !== ObjectiveUnit.Wagons);
  }

  return result;
}
