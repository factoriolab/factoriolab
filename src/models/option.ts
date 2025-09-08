import { IconDefinition } from '@fortawesome/angular-fontawesome';

export interface Option<T = string> {
  label: string;
  value: T;
  icon?: IconDefinition;
  tooltip?: string;
  disabled?: boolean;
}

export function getIdOptions(
  ids: string[],
  record: Record<string, { name: string }>,
  include = new Set(ids),
  exclude?: Set<string>,
  emptyModule = false,
): Option[] {
  ids = ids.filter((i) => include.has(i));
  if (exclude) ids = ids.filter((i) => !exclude.has(i));
  const list = ids.map((i): Option => ({ label: record[i].name, value: i }));
  if (emptyModule) list.unshift({ label: 'none', value: '' });

  return list;
}
