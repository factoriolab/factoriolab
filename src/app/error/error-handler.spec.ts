import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { LabErrorHandler } from './error-handler';

describe('LabErrorHandler', () => {
  let service: LabErrorHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LabErrorHandler);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('handleError', () => {
    it('should log the error and navigate', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(service['router'], 'navigate');
      service.handleError('error');
      expect(console.error).toHaveBeenCalled();
      expect(service['router'].navigate).toHaveBeenCalled();
    });
  });

  describe('getMessage', () => {
    it('should handle different types', () => {
      expect(service['getMessage']('message')).toEqual('message');
      expect(service['getMessage'](new Error('message'))).toEqual('message');
      const httpErr = new HttpErrorResponse({});
      expect(service['getMessage'](httpErr)).toEqual(httpErr.message);
      expect(service['getMessage'](0)).toBeUndefined();
    });
  });
});
