import { InjectionToken } from '@angular/core';
import { Simplex } from 'glpk-ts';

export const SIMPLEX_CONFIG = new InjectionToken<Simplex.Options>(
  'SIMPLEX_CONFIG',
);
