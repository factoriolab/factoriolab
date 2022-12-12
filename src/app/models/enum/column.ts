import { SelectItem } from 'primeng/api';

import { Game } from './game';

export enum Column {
  Tree = 'tree',
  Surplus = 'surplus',
  Items = 'items',
  Belts = 'belts',
  Wagons = 'wagons',
  Factories = 'factories',
  Beacons = 'beacons',
  Power = 'power',
  Pollution = 'pollution',
  Link = 'link',
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
      label: `options.column.${id}`,
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
