import { SelectItem } from 'primeng/api';

export enum PowerUnit {
  Auto = 0,
  kW = 1,
  MW = 2,
  GW = 3,
}

export const powerUnitOptions: SelectItem<PowerUnit>[] = [
  { label: 'options.powerUnit.auto', value: PowerUnit.Auto },
  { label: 'options.powerUnit.kW', value: PowerUnit.kW },
  { label: 'options.powerUnit.MW', value: PowerUnit.MW },
  { label: 'options.powerUnit.GW', value: PowerUnit.GW },
];
