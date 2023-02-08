import { SelectItem } from 'primeng/api';

export enum Theme {
  Dark,
  Light,
}

export const themeOptions: SelectItem<Theme>[] = [
  { label: 'options.theme.dark', value: Theme.Dark },
  { label: 'options.theme.light', value: Theme.Light },
];
