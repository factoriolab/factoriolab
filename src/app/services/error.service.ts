import { ErrorHandler, inject, Injectable, NgZone } from '@angular/core';

import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorService implements ErrorHandler {
  dataSvc = inject(DataService);
  ngZone = inject(NgZone);

  handleError(error: string): void {
    if (this.dataSvc.error$.value == null) {
      this.ngZone.run(() => {
        console.error(error);
        this.dataSvc.error$.next(error);
      });
    }
  }
}
