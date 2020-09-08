import { IdName } from '../id-name';

export enum Column {
  Belts = 'Belts',
  Factories = 'Factories',
  Beacons = 'Beacons',
  Power = 'Power',
  Pollution = 'Pollution',
  Link = 'Link',
}

export const AllColumns = [
  Column.Belts,
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
