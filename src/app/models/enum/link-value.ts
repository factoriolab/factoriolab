import { IdName } from '../id-name';

export enum LinkValue {
  None,
  Percent,
  Items,
  Belts,
  Wagons,
  Factories,
}

export function linkValueOptions(isDsp: boolean): IdName[] {
  const result = [
    { id: LinkValue.None, name: 'None' },
    { id: LinkValue.Percent, name: 'Percent' },
    { id: LinkValue.Items, name: 'Items' },
    { id: LinkValue.Belts, name: 'Belts' },
    { id: LinkValue.Wagons, name: 'Wagons' },
    { id: LinkValue.Factories, name: 'Factories' },
  ];

  if (isDsp) {
    return result.filter((i) => i.id !== LinkValue.Wagons);
  }

  return result;
}
