import { ErrorHandler, inject, Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  message$ = new BehaviorSubject<string | null>(null);
}

@Injectable()
export class LabErrorHandler implements ErrorHandler {
  ngZone = inject(NgZone);
  error = inject(ErrorService);

  handleError(error: string): void {
    if (this.error.message$.value == null) {
      this.ngZone.run(() => {
        console.error(error);
        this.error.message$.next(error);
      });
    }
  }
}
