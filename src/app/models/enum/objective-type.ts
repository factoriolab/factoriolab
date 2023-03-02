import { SelectItem } from 'primeng/api';

export type ObjectiveType = 'output' | 'input' | 'maximize' | 'limit';

export const objectiveTypeOptions: SelectItem<ObjectiveType>[] = [
  { value: 'output', label: 'options.objectiveType.output' },
  { value: 'input', label: 'options.objectiveType.input' },
  { value: 'maximize', label: 'options.objectiveType.maximize' },
  { value: 'limit', label: 'options.objectiveType.limit' },
];
