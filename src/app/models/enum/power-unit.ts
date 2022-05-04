import { IdName } from '../';

export enum PowerUnit {
  Auto,
  kW,
  MW,
  GW,
}

export const PowerUnitOptions: IdName<PowerUnit>[] = [
  { id: PowerUnit.Auto, name: 'Auto' },
  { id: PowerUnit.kW, name: 'kW' },
  { id: PowerUnit.MW, name: 'MW' },
  { id: PowerUnit.GW, name: 'GW' },
];
