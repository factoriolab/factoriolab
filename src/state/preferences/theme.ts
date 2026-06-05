import { Option } from '~/option/option';

export type Theme = 'system' | 'dark' | 'light';

export const themeOptions: Option<Theme>[] = [
  { label: 'options.theme.system', value: 'system' },
  { label: 'options.theme.dark', value: 'dark' },
  { label: 'options.theme.light', value: 'light' },
];
