import { IdName } from '../id-name';

export enum RateType {
  Items,
  Belts,
  Wagons,
  Factories,
}

export const RateTypeOptions: IdName[] = [
  { id: RateType.Items, name: 'Items' },
  { id: RateType.Belts, name: 'Belts' },
  { id: RateType.Wagons, name: 'Wagons' },
  { id: RateType.Factories, name: 'Factories' },
];
