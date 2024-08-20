export function updateSetIds(
  ids: string | string[],
  value: boolean,
  set: string[] | Set<string>,
): Set<string> {
  set = new Set(set);
  if (!Array.isArray(ids)) ids = [ids];
  ids.forEach((id) => {
    if (value) set.add(id);
    else set.delete(id);
  });
  return set;
}
