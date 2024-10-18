import { Injectable } from '@angular/core';
import { environment } from 'src/environments';

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
    if (environment.production)
      gtag('event', name, { event_category: category });
  }
}
