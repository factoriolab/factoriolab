import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ErrorService, LabErrorHandler } from './error.service';

describe('ErrorService', () => {
  let service: ErrorService;
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ErrorHandler, useClass: LabErrorHandler }],
    });
    service = TestBed.inject(ErrorService);
    errorHandler = TestBed.inject(ErrorHandler);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should handle an error', () => {
    spyOn(console, 'error');
    let message: string | null | undefined;
    service.message$.subscribe((m) => (message = m));
    errorHandler.handleError('test');
    expect(console.error).toHaveBeenCalledWith('test');
    expect(message).toEqual('test');
  });
});
