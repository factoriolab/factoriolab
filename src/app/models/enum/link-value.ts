import { SelectItem } from 'primeng/api';

import { Game } from './game';

export enum LinkValue {
  None = 0,
  Percent = 1,
  Items = 2,
  Belts = 3,
  Wagons = 4,
  Machines = 5,
}

export function linkValueOptions(game: Game): SelectItem<LinkValue>[] {
  const result: SelectItem<LinkValue>[] = [
    { label: 'None', value: LinkValue.None },
    { label: 'Percent', value: LinkValue.Percent },
    { label: 'Items', value: LinkValue.Items },
    { label: 'Belts', value: LinkValue.Belts },
    { label: 'Wagons', value: LinkValue.Wagons },
    { label: 'Machines', value: LinkValue.Machines },
  ];

  if (game === Game.DysonSphereProgram || game === Game.CaptainOfIndustry) {
    return result.filter((i) => i.value !== LinkValue.Wagons);
  }

  return result;
}
