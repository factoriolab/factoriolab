import { IdName } from '../id-name';
import { Game } from './game';

export enum Column {
  Tree = 'Tree',
  Surplus = 'Surplus',
  Items = 'Items',
  Belts = 'Belts',
  Wagons = 'Wagons',
  Factories = 'Factories',
  Overclock = 'Overclock',
  Beacons = 'Beacons',
  Power = 'Power',
  Maintenance = 'Maintenance',
  Pollution = 'Pollution',
  Link = 'Link',
}

export const AllColumns = [
  Column.Tree,
  Column.Items,
  Column.Belts,
  Column.Wagons,
  Column.Factories,
  Column.Overclock,
  Column.Beacons,
  Column.Power,
  Column.Maintenance,
  Column.Pollution,
  Column.Link,
];

export const PrecisionColumns = [
  Column.Items,
  Column.Belts,
  Column.Wagons,
  Column.Factories,
  Column.Power,
  Column.Maintenance,
  Column.Pollution,
];

export function columnOptions(game: Game): IdName<Column>[] {
  const result = AllColumns.map((id) => ({
    id,
    name: id,
  }));

  switch (game) {
    case Game.Factorio:
      return result.filter((i) =>
       i.id !== Column.Overclock &&
       i.id !== Column.Maintenance
       );
    case Game.DysonSphereProgram:
      return result.filter(
        (i) =>
          i.id !== Column.Wagons &&
          i.id !== Column.Overclock &&
          i.id !== Column.Beacons &&
          i.id !== Column.Maintenance &&
          i.id !== Column.Pollution
      );
      case Game.CaptainOfIndustry:
        return result.filter(
          (i) =>
           i.id !== Column.Beacons &&
            i.id !== Column.Wagons &&
            i.id !== Column.Overclock &&
            i.id !== Column.Pollution
        );
    case Game.Satisfactory:
      return result.filter(
        (i) => 
        i.id !== Column.Beacons &&
        i.id !== Column.Maintenance && 
        i.id !== Column.Pollution
      );
  }

  return [];
}
