import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { ErrorInfo } from './error-info';

@Injectable({ providedIn: 'root' })
export class LabErrorHandler implements ErrorHandler {
  private router = inject(Router);

  handleError(error: unknown): void {
    console.error(error);
    const info: ErrorInfo = { message: this.getMessage(error) };
    void this.router.navigate(['/error'], { info });
  }

  private getMessage(error: unknown): string | undefined {
    if (typeof error === 'string') return error;
    if (error instanceof Error || error instanceof HttpErrorResponse)
      return error.message;
    return undefined;
  }
}
