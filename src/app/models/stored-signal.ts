import { effect, signal, WritableSignal } from '@angular/core';

import { Optional } from './utils';

type StorageKey = 'router' | 'preferences' | 'stepDetailTab';

export function getStoredValue(key: StorageKey): Optional<string> {
  return localStorage.getItem(key) ?? undefined;
}

export function storeValue(key: StorageKey, value: Optional<string>): void {
  if (!value) localStorage.removeItem(key);
  else localStorage.setItem(key, value);
}

export function storedSignal(
  key: StorageKey,
): WritableSignal<Optional<string>> {
  const result = signal(getStoredValue(key));

  effect(() => {
    storeValue(key, result());
  });

  return result;
}
