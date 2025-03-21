import { Flag } from '../flags';
import { Option } from '../option';
import { DisplayRateInfo } from './display-rate';

export enum ObjectiveUnit {
  Items = 0,
  Belts = 1,
  Wagons = 2,
  Machines = 3,
}

export function objectiveUnitOptions(
  dispRateInfo: DisplayRateInfo,
  flags: Set<Flag>,
): Option<ObjectiveUnit>[] {
  const result: Option<ObjectiveUnit>[] = [
    { value: ObjectiveUnit.Items, label: dispRateInfo.itemsLabel },
    { value: ObjectiveUnit.Belts, label: 'options.objectiveUnit.belts' },
    { value: ObjectiveUnit.Wagons, label: dispRateInfo.wagonsLabel },
    { value: ObjectiveUnit.Machines, label: 'options.objectiveUnit.machines' },
  ];

  if (!flags.has('wagons'))
    return result.filter((i) => i.value !== ObjectiveUnit.Wagons);

  return result;
}
