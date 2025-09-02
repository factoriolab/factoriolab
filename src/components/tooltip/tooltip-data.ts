import { ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export const TOOLTIP_DATA = new InjectionToken<TooltipData>('TOOLTIP_DATA');

export interface TooltipData {
  message: string;
  positionChanges: Observable<ConnectedOverlayPositionChange>;
}
