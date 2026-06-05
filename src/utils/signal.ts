import { WritableSignal } from '@angular/core';

import { spread } from './object';

export function updateApply<T>(
  signal: WritableSignal<T>,
  partial: Partial<T>,
): void {
  signal.update((v) => spread(v, partial));
}
