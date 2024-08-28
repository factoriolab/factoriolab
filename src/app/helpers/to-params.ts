import { Params } from '@angular/router';

export function toParams(value: string | URLSearchParams): Params {
  if (typeof value === 'string') value = new URLSearchParams(value);
  const params: Params = {};
  for (const key of value.keys()) params[key] = value.getAll(key);
  return params;
}
