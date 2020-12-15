import { IdName } from '../id-name';

export enum Column {
  Surplus = 'Surplus',
  Items = 'Items',
  Belts = 'Belts',
  Wagons = 'Wagons',
  Factories = 'Factories',
  Beacons = 'Beacons',
  Power = 'Power',
  Pollution = 'Pollution',
  Link = 'Link',
}

export const AllColumns = [
  Column.Items,
  Column.Belts,
  Column.Wagons,
  Column.Factories,
  Column.Beacons,
  Column.Power,
  Column.Pollution,
  Column.Link,
];

export const ColumnsAsOptions: IdName[] = AllColumns.map((c) => ({
  id: c,
  name: c,
}));
