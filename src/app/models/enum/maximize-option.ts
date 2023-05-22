import { SelectItem } from 'primeng/api';

export enum MaximizeType {
  Weight,
  Ratio,
}

export const maximizeTypeOptions: SelectItem<MaximizeType>[] = [
  { value: MaximizeType.Weight, label: 'options.maximizeType.weight' },
  { value: MaximizeType.Ratio, label: 'options.maximizeType.ratio' },
];
