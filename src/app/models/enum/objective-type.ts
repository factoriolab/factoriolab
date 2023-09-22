import { SelectItem } from 'primeng/api';

export enum ObjectiveType {
  Output = 0,
  Input = 1,
  Maximize = 2,
  Limit = 3,
}

export const objectiveTypeOptions: SelectItem<ObjectiveType>[] = [
  { value: ObjectiveType.Output, label: 'options.objectiveType.output' },
  { value: ObjectiveType.Input, label: 'options.objectiveType.input' },
  { value: ObjectiveType.Maximize, label: 'options.objectiveType.maximize' },
  { value: ObjectiveType.Limit, label: 'options.objectiveType.limit' },
];
