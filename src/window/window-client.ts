import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WindowClient {
  // istanbul ignore next: Helper to call browser location function
  reload(): void {
    window.location.reload();
  }
}
