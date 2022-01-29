import { IdName } from '../id-name';
import { Game } from './game';

export enum Preset {
  Minimum,
  Modules,
  Beacon8,
  Beacon12,
}

export function presetOptions(game: Game): IdName<Preset>[] {
  return game === Game.Factorio
    ? [
        { id: Preset.Minimum, name: 'Minimum' },
        { id: Preset.Modules, name: 'Modules' },
        { id: Preset.Beacon8, name: '8 Beacons' },
        { id: Preset.Beacon12, name: '12 Beacons' },
      ]
    : [
        { id: Preset.Minimum, name: 'Minimum' },
        { id: Preset.Modules, name: 'Upgraded' },
        { id: Preset.Beacon8, name: 'Proliferated' },
      ];
}
