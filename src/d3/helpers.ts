import { coalesce } from '~/utils/nullish';

export function num(value: number | undefined): number {
  return coalesce(value, 0);
}
