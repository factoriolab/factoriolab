import { Option } from '~/option/option';

export type GlpkAlgorithm = 'simplex' | 'exact';

export const glpkAlgorithmOptions: Option<GlpkAlgorithm>[] = [
  { label: 'options.glpkAlgorithm.simplex', value: 'simplex' },
  { label: 'options.glpkAlgorithm.exact', value: 'exact' },
];
