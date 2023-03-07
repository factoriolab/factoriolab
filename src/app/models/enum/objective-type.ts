import { SelectItem } from 'primeng/api';

export enum ObjectiveType {
  Output,
  Input,
  Maximize,
  Limit,
}

export const objectiveTypeOptions: SelectItem<ObjectiveType>[] = [
  { value: ObjectiveType.Output, label: 'options.objectiveType.output' },
  { value: ObjectiveType.Input, label: 'options.objectiveType.input' },
  { value: ObjectiveType.Maximize, label: 'options.objectiveType.maximize' },
  { value: ObjectiveType.Limit, label: 'options.objectiveType.limit' },
];
