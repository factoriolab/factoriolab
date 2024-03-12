import {
  ErrorHandler,
  inject,
  Injectable,
  NgZone,
  signal,
} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  message = signal<string | null>(null);
}

@Injectable()
export class LabErrorHandler implements ErrorHandler {
  ngZone = inject(NgZone);
  error = inject(ErrorService);

  handleError(error: string): void {
    if (this.error.message() == null) {
      this.ngZone.run(() => {
        console.error(error);
        this.error.message.set(error);
      });
    }
  }
}
