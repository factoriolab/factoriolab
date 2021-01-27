import { ErrorHandler, Injectable } from '@angular/core';

import { ErrorService } from './services';

@Injectable()
export class LabErrorHandler implements ErrorHandler {
  constructor(public error: ErrorService) {}
  handleError(error: string): void {
    // your custom error handling logic
    console.error(error);
    this.error.message = error;
  }
}
