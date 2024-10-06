import { TestBed } from '@angular/core/testing';

import { FilterOptionsPipe } from './filter-options.pipe';

describe('FilterOptionsPipe', () => {
  let pipe: FilterOptionsPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [FilterOptionsPipe] });
    pipe = TestBed.inject(FilterOptionsPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should return an empty array if the value is nullish', () => {
      expect(pipe.transform(null, null, null)).toEqual([]);
    });

    it('should return the value if the exclude list is empty', () => {
      expect(pipe.transform([], null, null)).toEqual([]);
    });

    it('should filter excluded values but include self', () => {
      expect(
        pipe.transform(
          [{ value: 'ok' }, { value: 'exclude' }, { value: 'self' }],
          ['exclude', 'self'],
          'self',
        ),
      ).toEqual([{ value: 'ok' }, { value: 'self' }]);
    });
  });
});
