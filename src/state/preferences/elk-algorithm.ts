import { Option } from '~/option/option';

export type ElkAlgorithm = 'layered' | 'force' | 'stress';

export const elkAlgorithmOptions: Option<ElkAlgorithm>[] = [
  { label: 'options.elkAlgorithm.layered', value: 'layered' },
  { label: 'options.elkAlgorithm.force', value: 'force' },
  { label: 'options.elkAlgorithm.stress', value: 'stress' },
];
