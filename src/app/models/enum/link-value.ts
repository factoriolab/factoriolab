import { IdName } from '../id-name';

export enum LinkValue {
  None,
  Percent,
  Items,
  Belts,
  Wagons,
  Factories,
}

export const LinkValueOptions: IdName[] = [
  { id: LinkValue.None, name: 'None' },
  { id: LinkValue.Percent, name: 'Percent' },
  { id: LinkValue.Items, name: 'Items' },
  { id: LinkValue.Belts, name: 'Belts' },
  { id: LinkValue.Wagons, name: 'Wagons' },
  { id: LinkValue.Factories, name: 'Factories' },
];
