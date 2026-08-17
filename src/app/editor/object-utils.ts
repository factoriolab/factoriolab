import { ItemJson } from '~/data/schema/item';
import { ModuleEffect } from '~/data/schema/module';
import { Option } from '~/option/option';

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
