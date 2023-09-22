import { SelectItem } from 'primeng/api';

import { Game } from './game';

export enum Preset {
  Minimum = 0,
  Modules = 1,
  Beacon8 = 2,
  Beacon12 = 3,
}

export function presetOptions(game: Game): SelectItem<Preset>[] {
  return game === Game.Factorio
    ? [
        { value: Preset.Minimum, label: 'options.preset.minimum' },
        { value: Preset.Modules, label: 'options.preset.modules' },
        { value: Preset.Beacon8, label: 'options.preset.beacon8' },
        { value: Preset.Beacon12, label: 'options.preset.beacon12' },
      ]
    : game === Game.DysonSphereProgram
    ? [
        { value: Preset.Minimum, label: 'options.preset.minimum' },
        { value: Preset.Modules, label: 'options.preset.upgraded' },
        { value: Preset.Beacon8, label: 'options.preset.proliferated' },
      ]
    : [
        { value: Preset.Minimum, label: 'options.preset.minimum' },
        { value: Preset.Modules, label: 'options.preset.upgraded' },
      ];
}
