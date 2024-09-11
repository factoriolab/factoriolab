import { SelectItem } from 'primeng/api';

import { Entities, ItemId } from '~/models';

export function getIdOptions(
  ids: string[],
  entities: Entities<{ name: string }>,
  emptyModule = false,
): SelectItem<string>[] {
  const list = ids.map(
    (i): SelectItem<string> => ({ label: entities[i].name, value: i }),
  );
  if (emptyModule) {
    list.unshift({ label: 'None', value: ItemId.Module });
  }

  return list;
}
