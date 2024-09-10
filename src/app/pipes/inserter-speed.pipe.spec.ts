import { TestBed } from '@angular/core/testing';

import { InserterTarget, ItemId, rational } from '~/models';
import { Mocks } from '~/tests';

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
      expect(pipe.transform(rational.one, Mocks.SettingsStateInitial)).toEqual({
        id: ItemId.Inserter,
        value: rational(100n, 243n),
      });
      expect(
        pipe.transform(rational(1000n), Mocks.SettingsStateInitial),
      ).toEqual({
        id: ItemId.StackInserter,
        value: rational(20000n, 277n),
      });
    });

    it('should handle invalid state where no match is found', () => {
      expect(
        pipe.transform(rational.one, {
          inserterTarget: InserterTarget.Chest,
        } as any),
      ).toBeNull();
    });

    it('should handle null value', () => {
      expect(pipe.transform(undefined, Mocks.SettingsStateInitial)).toBeNull();
    });
  });
});
