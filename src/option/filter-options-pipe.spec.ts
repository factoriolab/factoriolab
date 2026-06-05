import { TestBed } from '@angular/core/testing';

import { FilterOptionsPipe } from './filter-options-pipe';

describe('FilterOptionsPipe', () => {
  let pipe: FilterOptionsPipe;

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      pipe = new FilterOptionsPipe();
    });
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should filter options', () => {
      expect(
        pipe.transform([{ label: 'a', value: 'exclude' }], ['exclude']),
      ).toEqual([]);
    });

    it('should handle nullish inputs', () => {
      expect(pipe.transform(null, null)).toEqual([]);
      expect(pipe.transform([], null)).toEqual([]);
    });
  });
});
