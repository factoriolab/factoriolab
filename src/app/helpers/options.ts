import { SelectItem } from 'primeng/api';

import { Entities, ItemId } from '~/models';

export function getIdOptions(
  ids: string[],
  entities: Entities<{ name: string }>,
  emptyModule = false,
): SelectItem[] {
  const list = ids.map(
    (i): SelectItem => ({ label: entities[i].name, value: i }),
  );
  if (emptyModule) {
    list.unshift({ label: 'None', value: ItemId.Module });
  }

  return list;
}
