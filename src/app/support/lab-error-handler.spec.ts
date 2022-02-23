import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { LabErrorHandler } from './lab-error-handler';
import { ErrorService } from '../services';

describe('LabErrorHandler', () => {
  let errorHandler: ErrorHandler;
  let errorService: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ErrorHandler, useClass: LabErrorHandler }],
    });

    errorHandler = TestBed.inject(ErrorHandler);
    errorService = TestBed.inject(ErrorService);
  });

  it('should handle an error', () => {
    spyOn(console, 'error');
    let message: string | undefined;
    errorService.message$.subscribe((m) => (message = m));
    errorHandler.handleError('test');
    expect(console.error).toHaveBeenCalledWith('test');
    expect(message).toEqual('test');
  });
});
