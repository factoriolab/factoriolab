import { isDevMode } from '@angular/core';

interface EventData {
  event_category?: string;
  event_label?: string;
  value?: string;
}

declare const gtag: (type: string, name: string, data: EventData) => void;

/** Log an event with an optional value using Google Analytics */
export function log(event: string, value?: string): void {
  if (isDevMode()) return;
  // istanbul ignore next: Don't test calling google analytics function
  gtag('event', event, { event_category: value });
}
