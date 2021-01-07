import { IdName } from '../id-name';

export enum InserterCapacity {
  Capacity0,
  Capacity2,
  Capacity7,
}

export const InserterCapacityOptions: IdName[] = [
  { id: InserterCapacity.Capacity0, name: 'No Capacity Bonus' },
  { id: InserterCapacity.Capacity2, name: 'Capacity Bonus 2' },
  { id: InserterCapacity.Capacity7, name: 'Capacity Bonus 7' },
];
