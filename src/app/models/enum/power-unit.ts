import { SelectItem } from 'primeng/api';

export enum PowerUnit {
  Auto,
  kW,
  MW,
  GW,
}

export const powerUnitOptions: SelectItem<PowerUnit>[] = [
  { label: 'Auto', value: PowerUnit.Auto },
  { label: 'kW', value: PowerUnit.kW },
  { label: 'MW', value: PowerUnit.MW },
  { label: 'GW', value: PowerUnit.GW },
];
