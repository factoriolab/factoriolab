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
        { id: Preset.Minimum, name: 'options.Preset1.Minimum' },
        { id: Preset.Modules, name: 'options.Preset1.Modules' },
        { id: Preset.Beacon8, name: 'options.Preset1.Beacon8' },
        { id: Preset.Beacon12, name: 'options.Preset1.Beacon12' },
      ]
    : [
        { id: Preset.Minimum, name: 'options.Preset2.Minimum' },
        { id: Preset.Modules, name: 'options.Preset2.Modules' },
        { id: Preset.Beacon8, name: 'options.Preset2.Beacon8' },
      ];
}
