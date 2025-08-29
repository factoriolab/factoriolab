import { isDevMode } from '@angular/core';
import { Simplex } from 'glpk-ts';

export const simplexConfig: Simplex.Options = isDevMode()
  ? {}
  : { msgLevel: 'off' };
