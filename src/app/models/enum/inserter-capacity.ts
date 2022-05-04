import { IdName } from '../id-name';

export enum InserterCapacity {
  Capacity0,
  Capacity2,
  Capacity7,
}

export const InserterCapacityOptions: IdName<InserterCapacity>[] = [
  { id: InserterCapacity.Capacity0, name: 'options.InserterCapacity.Capacity0' },
  { id: InserterCapacity.Capacity2, name: 'options.InserterCapacity.Capacity2' },
  { id: InserterCapacity.Capacity7, name: 'options.InserterCapacity.Capacity7' },
];
