import { BaseJson } from '~/data/schema/base';
import { ItemJson } from '~/data/schema/item';
import { ModuleEffect } from '~/data/schema/module';
import { Option } from '~/option/option';
import { coalesce } from '~/utils/nullish';

import { IconFileInfo } from './editor.types';

export function emptyItem(): ItemJson {
  return {
    id: '',
    name: '',
    icon: undefined,
    iconText: undefined,
    category: '',
    row: 0,
  };
}

export const moduleEffectOptions: Option<ModuleEffect>[] = [
  { label: 'consumption', value: 'consumption' },
  { label: 'pollution', value: 'pollution' },
  { label: 'productivity', value: 'productivity' },
  { label: 'quality', value: 'quality' },
  { label: 'speed', value: 'speed' },
];

export function toNumeric(value: string): string | number {
  const num = Number(value);
  if (isNaN(num)) return value;
  return num;
}

export function toNullableNumeric(value: string): string | number | undefined {
  if (!value) return undefined;
  const num = Number(value);
  if (isNaN(num)) return value;
  return num;
}

export function toSize(value: string): [number, number] | undefined {
  try {
    const size = value.split(',').map((v) => Number(v.trim()));
    if (size.length === 2 && size.every((v) => !isNaN(v))) {
      return size as [number, number];
    }
  } catch {
    // Do nothing
  }

  return undefined;
}

export function toOptions(
  objects: BaseJson[],
  icons: Partial<Record<string, IconFileInfo>>,
): Option[];
export function toOptions(
  objects: BaseJson[],
  icons: Partial<Record<string, IconFileInfo>>,
  includeNone: true,
): Option<string | undefined>[];
export function toOptions(
  objects: BaseJson[],
  icons: Partial<Record<string, IconFileInfo>>,
  includeNone?: true,
): Option<string | undefined>[] {
  const result = objects.map(
    (o): Option<string | undefined> => ({
      label: o.name,
      value: o.id,
      icon: icons[coalesce(o.icon, o.id)]?.url,
      iconType: 'img',
      iconText: o.iconText,
    }),
  );
  result.sort((a, b) => a.label.localeCompare(b.label));
  if (includeNone) {
    result.unshift({ label: 'none', value: undefined });
  }
  return result;
}
