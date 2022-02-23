import { ErrorHandler, Injectable } from '@angular/core';

import { ErrorService } from '../services';

@Injectable()
export class LabErrorHandler implements ErrorHandler {
  constructor(public error: ErrorService) {}
  handleError(error: string): void {
    console.error(error);
    this.error.message$.next(error);
  }
}
