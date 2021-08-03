import { IdName } from '../id-name';

export enum SankeyAlign {
  Justify,
  Left,
  Right,
  Center,
}

export const sankeyAlignOptions: IdName<SankeyAlign>[] = [
  { id: SankeyAlign.Justify, name: 'Justify' },
  { id: SankeyAlign.Left, name: 'Left' },
  { id: SankeyAlign.Right, name: 'Right' },
  { id: SankeyAlign.Center, name: 'Center' },
];
