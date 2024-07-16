import { Entities } from '~/models';

export function contains<T>(entities: Entities<T>, value: T): boolean {
  return Object.keys(entities).some((k) => entities[k] === value);
}
