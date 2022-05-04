import { ErrorHandler, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  message$ = new BehaviorSubject<string | null>(null);
}

@Injectable()
export class LabErrorHandler implements ErrorHandler {
  constructor(private error: ErrorService) {}

  handleError(error: string): void {
    console.error(error);
    this.error.message$.next(error);
  }
}
