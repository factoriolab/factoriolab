import { SelectItem } from 'primeng/api';

export enum SankeyAlign {
  Justify = 0,
  Left = 1,
  Right = 2,
  Center = 3,
}

export const sankeyAlignOptions: SelectItem<SankeyAlign>[] = [
  { label: 'options.sankeyAlign.justify', value: SankeyAlign.Justify },
  { label: 'options.sankeyAlign.left', value: SankeyAlign.Left },
  { label: 'options.sankeyAlign.right', value: SankeyAlign.Right },
  { label: 'options.sankeyAlign.center', value: SankeyAlign.Center },
];
