import { TestBed } from '@angular/core/testing';

import { FuelValuePipe } from './fuel-value-pipe';

describe('FuelValuePipe', () => {
  let pipe: FuelValuePipe;

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      pipe = new FuelValuePipe();
    });
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should display a fuel value in appropriate units', () => {
      expect(pipe.transform(1)).toEqual('1 MJ');
      expect(pipe.transform(1000)).toEqual('1 GJ');
    });

    it('should handle null values', () => {
      expect(pipe.transform(null)).toEqual('');
    });
  });
});
