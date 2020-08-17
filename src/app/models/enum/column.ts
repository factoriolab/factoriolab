import { IdName } from '../id-name';

export enum Column {
  Belts = 'Belts',
  Factories = 'Factories',
  Modules = 'Modules',
  Beacons = 'Beacons',
  Power = 'Power',
  Pollution = 'Pollution',
  Link = 'Link',
}

export const AllColumns = [
  Column.Belts,
  Column.Factories,
  Column.Modules,
  Column.Beacons,
  Column.Power,
  Column.Pollution,
  Column.Link,
];

export const ColumnsAsOptions: IdName[] = AllColumns.map((c) => ({
  id: c,
  name: c,
}));
