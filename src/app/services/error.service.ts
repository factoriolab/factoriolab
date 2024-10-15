import { ErrorHandler, inject, Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Optional } from '~/models/utils';

@Injectable({
  providedIn: 'root',
})
export class ErrorService implements ErrorHandler {
  ngZone = inject(NgZone);

  message$ = new BehaviorSubject<Optional<string>>(undefined);

  handleError(error: string): void {
    if (this.message$.value == null) {
      this.ngZone.run(() => {
        console.error(error);
        this.message$.next(error);
      });
    }
  }
}
