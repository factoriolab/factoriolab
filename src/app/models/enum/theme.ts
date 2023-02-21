import { SelectItem } from 'primeng/api';

export enum Theme {
  Dark = 'dark',
  Light = 'light',
  Black = 'black',
}

export const themeOptions: SelectItem<Theme>[] = [
  { label: 'options.theme.dark', value: Theme.Dark },
  { label: 'options.theme.light', value: Theme.Light },
  { label: 'options.theme.black', value: Theme.Black },
];
