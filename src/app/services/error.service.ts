import { ErrorHandler, inject, Injectable, NgZone } from '@angular/core';

import { ContentService } from './content.service';

@Injectable({
  providedIn: 'root',
})
export class LabErrorHandler implements ErrorHandler {
  contentSvc = inject(ContentService);
  ngZone = inject(NgZone);

  handleError(error: string): void {
    if (this.contentSvc.error$.value == null) {
      this.ngZone.run(() => {
        console.error(error);
        this.contentSvc.error$.next(error);
      });
    }
  }
}
