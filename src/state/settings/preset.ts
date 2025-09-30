import { DefaultsJson } from '~/data/schema/defaults';
import { Option } from '~/option/option';
import { Flag } from '~/state/flags';

export enum Preset {
  Minimum = 0,
  Modules = 1,
  Beacon8 = 2,
  Beacon12 = 3,
}

export function presetOptions(
  flags: Set<Flag>,
  defaults: DefaultsJson | undefined = undefined,
): Option<Preset>[] {
  if (defaults && 'presets' in defaults) {
    return defaults.presets.map((preset) => ({
      value: preset.id,
      label: preset.label,
    }));
  }

  const options: Option<Preset>[] = [
    { value: Preset.Minimum, label: 'options.preset.minimum' },
    { value: Preset.Modules, label: 'options.preset.upgraded' },
  ];

  if (flags.has('beacons')) {
    options[1].label = 'options.preset.modules';
    options.push(
      { value: Preset.Beacon8, label: 'options.preset.beacon8' },
      { value: Preset.Beacon12, label: 'options.preset.beacon12' },
    );
  }

  if (flags.has('proliferator')) {
    options.push({
      value: Preset.Beacon8,
      label: 'options.preset.proliferated',
    });
  }

  return options;
}
