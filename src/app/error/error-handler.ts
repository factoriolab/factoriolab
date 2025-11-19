import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class LabErrorHandler implements ErrorHandler {
  private router = inject(Router);

  handleError(error: unknown): void {
    console.error(error);
    void this.router.navigate(['/error'], { info: this.getDetail(error) });
  }

  private getDetail(error: unknown): string | undefined {
    if (typeof error === 'string') return error;
    if (error instanceof HttpErrorResponse) return error.message;
    return undefined;
  }
}
