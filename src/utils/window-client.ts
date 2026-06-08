import { Service } from '@angular/core';

@Service()
export class WindowClient {
  readonly isStandalone = window.matchMedia('(display-mode: standalone)')
    .matches;

  // istanbul ignore next: Helper to call browser location function
  reload(): void {
    window.location.reload();
  }

  copyToClipboard(data: string): Promise<void> {
    return window.navigator.clipboard.writeText(data);
  }
}
