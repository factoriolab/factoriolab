import { TestBed } from '@angular/core/testing';

import { ItemId } from 'src/tests';
import { Game } from '~/models';
import { FactoryShowRatePipe } from './factory-show-rate.pipe';

describe('FactoryShowRatePipe', () => {
  let pipe: FactoryShowRatePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [FactoryShowRatePipe] });
    pipe = TestBed.inject(FactoryShowRatePipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should hide factory rate for CoI Mine Control Tower', () => {
      expect(
        pipe.transform(ItemId.MineControlTower, Game.CaptainOfIndustry)
      ).toBeFalse();
    });
  });
});
