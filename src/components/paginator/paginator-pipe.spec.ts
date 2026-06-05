import { TestBed } from '@angular/core/testing';

import { PaginatorPipe } from './paginator-pipe';

describe('PaginatorPipe', () => {
  let pipe: PaginatorPipe;

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      pipe = new PaginatorPipe();
    });
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should return a slice for the page', () => {
      expect(
        pipe.transform([1, 2, 3, 4, 5], { page: 1, rows: 2, asc: false }),
      ).toEqual([3, 4]);
    });

    it('should reset to the first page if out of range', () => {
      expect(
        pipe.transform([1, 2, 3, 4, 5], { page: 3, rows: 2, asc: false }),
      ).toEqual([1, 2]);
    });

    it('should return the value directly if empty', () => {
      const value: unknown[] = [];
      expect(pipe.transform(value, { page: 0, rows: 2, asc: false })).toEqual(
        value,
      );
    });
  });
});
