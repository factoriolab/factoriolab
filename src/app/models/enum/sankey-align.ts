import { SelectItem } from 'primeng/api';

export enum SankeyAlign {
  Justify = 0,
  Left = 1,
  Right = 2,
  Center = 3,
}

export const sankeyAlignOptions: SelectItem<SankeyAlign>[] = [
  { label: 'Justify', value: SankeyAlign.Justify },
  { label: 'Left', value: SankeyAlign.Left },
  { label: 'Right', value: SankeyAlign.Right },
  { label: 'Center', value: SankeyAlign.Center },
];
