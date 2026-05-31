import { TestBed } from '@angular/core/testing';

import { UsagePipe } from './usage-pipe';

describe('UsagePipe', () => {
  let pipe: UsagePipe;

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      pipe = new UsagePipe();
    });
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should convert a usage value into appropriate units', () => {
      expect(pipe.transform(1)).toEqual('1 kW');
      expect(pipe.transform(1000)).toEqual('1 MW');
      expect(pipe.transform(1000000)).toEqual('1 GW');
    });

    it('should handle nullish input', () => {
      expect(pipe.transform(null)).toEqual('');
    });
  });
});
