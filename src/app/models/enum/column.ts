import { SelectItem } from 'primeng/api';

import { Game } from './game';

export enum Column {
  Checkbox = 'checkbox',
  Tree = 'tree',
  /** Not a real column, just used as a key to store effective precision */
  Surplus = 'surplus',
  Items = 'items',
  Belts = 'belts',
  Wagons = 'wagons',
  Machines = 'machines',
  Beacons = 'beacons',
  Power = 'power',
  Pollution = 'pollution',
  Link = 'link',
}

export const allColumns = [
  Column.Checkbox,
  Column.Tree,
  Column.Items,
  Column.Belts,
  Column.Wagons,
  Column.Machines,
  Column.Beacons,
  Column.Power,
  Column.Pollution,
  Column.Link,
];

export const initialColumns = [
  Column.Tree,
  Column.Items,
  Column.Belts,
  Column.Wagons,
  Column.Machines,
  Column.Beacons,
  Column.Power,
  Column.Pollution,
  Column.Link,
];

export const precisionColumns = [
  Column.Items,
  Column.Belts,
  Column.Wagons,
  Column.Machines,
  Column.Power,
  Column.Pollution,
];

export function columnOptions(game: Game): SelectItem<Column>[] {
  const result = allColumns.map(
    (id): SelectItem<Column> => ({
      label: `options.column.${id}`,
      value: id,
      disabled: id === Column.Items || id === Column.Machines,
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
