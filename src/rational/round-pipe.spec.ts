import { TestBed } from '@angular/core/testing';

import { rational } from './rational';
import { RoundPipe } from './round-pipe';

describe('RoundPipe', () => {
  let pipe: RoundPipe;

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      pipe = new RoundPipe();
    });
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should round using appropriate units', () => {
      expect(pipe.transform(1)).toEqual('1');
      expect(pipe.transform(1000)).toEqual('1k');
      expect(pipe.transform(1000000)).toEqual('1M');
      expect(pipe.transform(1000000000)).toEqual('1G');
    });

    it('should handle various data types', () => {
      expect(pipe.transform(null)).toEqual('');
      expect(pipe.transform(rational.one)).toEqual('1');
      expect(pipe.transform('1')).toEqual('1');
    });
  });
});
