import { SelectItem } from 'primeng/api';

import { Game } from './game';

export enum Preset {
  Minimum,
  Modules,
  Beacon8,
  Beacon12,
}

export function presetOptions(game: Game): SelectItem<Preset>[] {
  return game === Game.Factorio
    ? [
        { value: Preset.Minimum, label: 'options.Preset1.Minimum' },
        { value: Preset.Modules, label: 'options.Preset1.Modules' },
        { value: Preset.Beacon8, label: 'options.Preset1.Beacon8' },
        { value: Preset.Beacon12, label: 'options.Preset1.Beacon12' },
      ]
    : game === Game.CaptainOfIndustry
    ? [
        { value: Preset.Minimum, label: 'options.Preset2.Minimum' },
        { value: Preset.Modules, label: 'options.Preset2.Modules' },
      ]
    : [
        { value: Preset.Minimum, label: 'options.Preset2.Minimum' },
        { value: Preset.Modules, label: 'options.Preset2.Modules' },
        { value: Preset.Beacon8, label: 'options.Preset2.Beacon8' },
      ];
}
