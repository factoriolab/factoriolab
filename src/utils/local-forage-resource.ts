import { effect, resource, ResourceRef } from '@angular/core';
import localforage from 'localforage';

type StorageKey = 'data' | 'hash' | 'icons';

export function getLocalForageValue(key: StorageKey): Promise<unknown> {
  return localforage.getItem(key);
}

export async function storeLocalForageValue(
  key: StorageKey,
  value: unknown,
): Promise<unknown> {
  if (!value) return localforage.removeItem(key);
  else return localforage.setItem(key, value);
}

export function localForageResource<T>(
  key: StorageKey,
): ResourceRef<T | undefined> {
  const result = resource({
    loader: () => getLocalForageValue(key) as Promise<T>,
  });

  effect(() => {
    if (result.status() === 'local')
      void storeLocalForageValue(key, result.value());
  });

  return result;
}
