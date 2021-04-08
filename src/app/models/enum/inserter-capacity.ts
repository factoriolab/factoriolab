import { IdName } from '../id-name';

export enum InserterCapacity {
  Capacity0,
  Capacity2,
  Capacity7,
}

export const InserterCapacityOptions: IdName<InserterCapacity>[] = [
  { id: InserterCapacity.Capacity0, name: 'No capacity bonus' },
  { id: InserterCapacity.Capacity2, name: 'Capacity bonus 2' },
  { id: InserterCapacity.Capacity7, name: 'Capacity bonus 7' },
];
