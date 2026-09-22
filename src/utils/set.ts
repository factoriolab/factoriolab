import { Pipe, PipeTransform } from '@angular/core';

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

@Pipe({ name: 'setJoin' })
export class SetJoinPipe implements PipeTransform {
  transform(value: Set<string> | string[] | null | undefined): string {
    if (value == null) return '';
    return Array.from(value).join(', ');
  }
}
