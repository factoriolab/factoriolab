import { TestBed } from '@angular/core/testing';

import { Mocks } from 'src/tests';
import { InserterTarget, ItemId, Rational } from '~/models';
import { InserterSpeedPipe } from './inserter-speed.pipe';

describe('InserterSpeedPipe', () => {
  let pipe: InserterSpeedPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [InserterSpeedPipe] });
    pipe = TestBed.inject(InserterSpeedPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should return matching inserter data', () => {
      expect(pipe.transform(Rational.one, Mocks.SettingsState1)).toEqual({
        id: ItemId.Inserter,
        value: Rational.from(100, 243),
      });
      expect(pipe.transform(Rational.thousand, Mocks.SettingsState1)).toEqual({
        id: ItemId.StackInserter,
        value: Rational.from(20000, 277),
      });
    });

    it('should handle invalid state where no match is found', () => {
      expect(
        pipe.transform(Rational.one, {
          inserterTarget: InserterTarget.Chest,
        } as any)
      ).toBeNull();
    });

    it('should handle null value', () => {
      expect(pipe.transform(undefined, Mocks.SettingsState1)).toBeNull();
    });
  });
});
