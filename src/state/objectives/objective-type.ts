import { Option } from '~/option/option';

export enum ObjectiveType {
  Output = 0,
  Input = 1,
  Maximize = 2,
  Limit = 3,
}

export const objectiveTypeOptions: Option<ObjectiveType>[] = [
  {
    value: ObjectiveType.Output,
    label: 'options.objectiveType.output',
    tooltip: 'options.objectiveType.outputTooltip',
  },
  {
    value: ObjectiveType.Input,
    label: 'options.objectiveType.input',
    tooltip: 'options.objectiveType.inputTooltip',
  },
  {
    value: ObjectiveType.Maximize,
    label: 'options.objectiveType.maximize',
    tooltip: 'options.objectiveType.maximizeTooltip',
  },
  {
    value: ObjectiveType.Limit,
    label: 'options.objectiveType.limit',
    tooltip: 'options.objectiveType.limitTooltip',
  },
];
