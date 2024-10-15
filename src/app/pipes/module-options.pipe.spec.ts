import { TestBed } from '@angular/core/testing';

import { ItemId } from '~/tests';

import { ModuleOptionsPipe } from './module-options.pipe';

describe('ModuleOptionsPipe', () => {
  let pipe: ModuleOptionsPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ModuleOptionsPipe] });
    pipe = TestBed.inject(ModuleOptionsPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should return an empty list for null values', () => {
      const result = pipe.transform(null, {});
      expect(result).toEqual([]);
    });

    it('should set up options based on a list of modules', () => {
      const result = pipe.transform(['a'], { a: { name: 'name' } });
      expect(result).toEqual([{ label: 'name', value: 'a' }]);
    });

    it('should include the empty module option', () => {
      const result = pipe.transform([], {}, true);
      expect(result).toEqual([{ label: 'None', value: ItemId.Module }]);
    });
  });
});
