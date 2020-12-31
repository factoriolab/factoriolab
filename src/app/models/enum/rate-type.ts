import { Entities } from '../entities';

export enum RateType {
  Items,
  Belts,
  Wagons,
  Factories,
}

export const RateTypeOptions: Entities = {
  [RateType.Items]: 'Items',
  [RateType.Belts]: 'Belts',
  [RateType.Wagons]: 'Wagons',
  [RateType.Factories]: 'Factories',
};
