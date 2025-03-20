import { Injectable, isDevMode } from '@angular/core';

interface EventData {
  event_category?: string;
  event_label?: string;
  value?: string;
}

declare const gtag: (type: string, name: string, data: EventData) => void;

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  event(name: string, category: string): void {
    // istanbul ignore if: Don't test calling google analytics function
    if (!isDevMode()) gtag('event', name, { event_category: category });
  }
}
