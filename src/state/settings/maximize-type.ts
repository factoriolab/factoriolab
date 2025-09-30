import { Option } from '~/option/option';

export enum MaximizeType {
  Weight = 0,
  Ratio = 1,
}

export const maximizeTypeOptions: Option<MaximizeType>[] = [
  { value: MaximizeType.Ratio, label: 'options.maximizeType.ratio' },
  { value: MaximizeType.Weight, label: 'options.maximizeType.weight' },
];
