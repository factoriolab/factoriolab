import { SelectItem } from 'primeng/api';

import { Flag } from '../flags';
import { DisplayRateInfo } from './display-rate';

export enum ObjectiveUnit {
  Items = 0,
  Belts = 1,
  Wagons = 2,
  Machines = 3,
  Power = 4,
}

export function objectiveUnitOptions(
  dispRateInfo: DisplayRateInfo,
  flags: Set<Flag>,
): SelectItem<ObjectiveUnit>[] {
  const result: SelectItem<ObjectiveUnit>[] = [
    { value: ObjectiveUnit.Items, label: dispRateInfo.itemsLabel },
    { value: ObjectiveUnit.Belts, label: 'options.objectiveUnit.belts' },
    { value: ObjectiveUnit.Wagons, label: dispRateInfo.wagonsLabel },
    { value: ObjectiveUnit.Machines, label: 'options.objectiveUnit.machines' },
    { value: ObjectiveUnit.Power, label: 'options.objectiveUnit.power' },
  ];

  return result.filter((i) => {
    if (i.value === ObjectiveUnit.Wagons && !flags.has('wagons')) return false;
    if (i.value === ObjectiveUnit.Power && !flags.has('power')) return false;
    return true;
  });
}
