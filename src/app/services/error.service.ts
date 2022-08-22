import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  message$ = new BehaviorSubject<string | null>(null);
}

@Injectable()
export class LabErrorHandler implements ErrorHandler {
  constructor(
    private router: Router,
    private ngZone: NgZone,
    private error: ErrorService
  ) {}

  handleError(error: string): void {
    if (this.error.message$.value == null) {
      this.ngZone.run(() => {
        console.error(error);
        this.error.message$.next(error);
        this.router.navigateByUrl('error');
      });
    }
  }
}
