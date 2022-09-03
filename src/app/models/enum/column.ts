import { SelectItem } from 'primeng/api';

import { Game } from './game';

export enum Column {
  Tree = 'Tree',
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

export const allColumns = [
  Column.Tree,
  Column.Items,
  Column.Belts,
  Column.Wagons,
  Column.Factories,
  Column.Beacons,
  Column.Power,
  Column.Pollution,
  Column.Link,
];

export const precisionColumns = [
  Column.Items,
  Column.Belts,
  Column.Wagons,
  Column.Factories,
  Column.Power,
  Column.Pollution,
];

export function columnOptions(game: Game): SelectItem<Column>[] {
  const result = allColumns.map(
    (id): SelectItem<Column> => ({
      label: id,
      value: id,
      disabled: id === Column.Items || id === Column.Factories,
    })
  );

  switch (game) {
    case Game.Factorio:
      return result;
    case Game.CaptainOfIndustry:
      return result.filter(
        (i) =>
          i.value !== Column.Beacons &&
          i.value !== Column.Power &&
          i.value !== Column.Pollution &&
          i.value !== Column.Wagons
      );
    case Game.DysonSphereProgram:
      return result.filter(
        (i) =>
          i.value !== Column.Beacons &&
          i.value !== Column.Pollution &&
          i.value !== Column.Wagons
      );
    case Game.Satisfactory:
      return result.filter(
        (i) => i.value !== Column.Beacons && i.value !== Column.Pollution
      );
  }

  return [];
}
