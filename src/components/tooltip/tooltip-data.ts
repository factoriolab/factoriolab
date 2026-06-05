import {
  ConnectedOverlayPositionChange,
  ConnectedPosition,
} from '@angular/cdk/overlay';
import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { AdjustedRecipe } from '~/data/schema/recipe';

import { TooltipType } from './tooltip-type';

export const TOOLTIP_DATA = new InjectionToken<TooltipData>('TOOLTIP_DATA');

export interface TooltipData {
  value: string;
  type?: TooltipType;
  action?: string;
  adjustedRecipe?: AdjustedRecipe;
  defaultPosition: ConnectedPosition;
  positionChanges: Observable<ConnectedOverlayPositionChange>;
}
