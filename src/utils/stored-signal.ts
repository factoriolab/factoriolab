import { effect, signal, WritableSignal } from '@angular/core';

type StorageKey = 'router' | 'preferences' | 'stepDetailTab';

export function getStoredValue(key: StorageKey): string | undefined {
  return localStorage.getItem(key) ?? undefined;
}

export function storeValue(key: StorageKey, value: string | undefined): void {
  if (!value) localStorage.removeItem(key);
  else localStorage.setItem(key, value);
}

export function storedSignal(
  key: StorageKey,
): WritableSignal<string | undefined> {
  const result = signal(getStoredValue(key));

  effect(() => {
    storeValue(key, result());
  });

  return result;
}
