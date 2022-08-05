import { SelectItem } from 'primeng/api';

export enum InserterCapacity {
  Capacity0,
  Capacity2,
  Capacity7,
}

export const inserterCapacityOptions: SelectItem<InserterCapacity>[] = [
  {
    label: 'options.InserterCapacity.Capacity0',
    value: InserterCapacity.Capacity0,
  },
  {
    label: 'options.InserterCapacity.Capacity2',
    value: InserterCapacity.Capacity2,
  },
  {
    label: 'options.InserterCapacity.Capacity7',
    value: InserterCapacity.Capacity7,
  },
];
