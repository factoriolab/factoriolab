import { TestBed } from '@angular/core/testing';

import { ItemId } from 'src/tests';
import { OptionsPipe } from './options.pipe';

describe('OptionsPipe', () => {
  let pipe: OptionsPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [OptionsPipe] });
    pipe = TestBed.inject(OptionsPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should generate dropdown options from ids', () => {
      expect(
        pipe.transform(['id'], { ['id']: { name: 'name' } }, true),
      ).toEqual([
        { label: 'None', value: ItemId.Module },
        { label: 'name', value: 'id' },
      ]);
    });

    it('should handle null values', () => {
      expect(pipe.transform(null, {})).toEqual([]);
    });
  });
});
