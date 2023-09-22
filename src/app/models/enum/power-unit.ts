import { SelectItem } from 'primeng/api';

export enum PowerUnit {
  Auto = 0,
  kW = 1,
  MW = 2,
  GW = 3,
}

export const powerUnitOptions: SelectItem<PowerUnit>[] = [
  { label: 'Auto', value: PowerUnit.Auto },
  { label: 'kW', value: PowerUnit.kW },
  { label: 'MW', value: PowerUnit.MW },
  { label: 'GW', value: PowerUnit.GW },
];
