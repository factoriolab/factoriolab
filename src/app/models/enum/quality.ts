import { SelectItem } from 'primeng/api';

export enum Quality {
  Any = -1,
  Normal = 0,
  Uncommon = 1,
  Rare = 2,
  Epic = 3,
  Legendary = 5,
}

export const qualityOptions: SelectItem<Quality>[] = [
  { value: Quality.Any, label: 'options.quality.any' },
  { value: Quality.Normal, label: 'options.quality.normal' },
  { value: Quality.Uncommon, label: 'options.quality.uncommon' },
  { value: Quality.Rare, label: 'options.quality.rare' },
  { value: Quality.Epic, label: 'options.quality.epic' },
  { value: Quality.Legendary, label: 'options.quality.legendary' },
];
