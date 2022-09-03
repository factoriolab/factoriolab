import { SelectItem } from 'primeng/api';

export enum Theme {
  System,
  Light,
  Dark,
}

export const themeOptions: SelectItem<Theme>[] = [
  { label: 'options.theme.system', value: Theme.System },
  { label: 'options.theme.light', value: Theme.Light },
  { label: 'options.theme.dark', value: Theme.Dark },
];
