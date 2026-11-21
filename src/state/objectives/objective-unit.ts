import { Option } from '~/option/option';

import { Dataset } from '../settings/dataset';
import { DisplayRateInfo } from '../settings/display-rate';

export enum ObjectiveUnit {
  Items = 0,
  Belts = 1,
  Wagons = 2,
  Machines = 3,
}

export const ObjectivePowerUnitMap: Partial<Record<ObjectiveUnit, string>> = {
  [ObjectiveUnit.Items]: 'options.powerUnit.kW',
  [ObjectiveUnit.Belts]: 'options.powerUnit.MW',
  [ObjectiveUnit.Wagons]: 'options.powerUnit.GW',
};

export function objectiveUnitOptions(
  dispRateInfo: DisplayRateInfo,
  data: Dataset,
): Option<ObjectiveUnit>[] {
  const result: Option<ObjectiveUnit>[] = [
    { value: ObjectiveUnit.Items, label: dispRateInfo.itemsLabel },
    { value: ObjectiveUnit.Belts, label: 'options.objectiveUnit.belts' },
    { value: ObjectiveUnit.Wagons, label: dispRateInfo.wagonsLabel },
    { value: ObjectiveUnit.Machines, label: 'options.objectiveUnit.machines' },
  ];

  if (data.wagonIds.length === 0)
    return result.filter((i) => i.value !== ObjectiveUnit.Wagons);

  return result;
}
