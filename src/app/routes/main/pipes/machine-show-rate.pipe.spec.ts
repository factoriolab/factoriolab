import { TestBed } from '@angular/core/testing';

import { ItemId } from 'src/tests';
import { Game } from '~/models';
import { MachineShowRatePipe } from './machine-show-rate.pipe';

describe('MachineShowRatePipe', () => {
  let pipe: MachineShowRatePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MachineShowRatePipe] });
    pipe = TestBed.inject(MachineShowRatePipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should hide machine rate for CoI Mine Control Tower', () => {
      expect(
        pipe.transform(ItemId.MineControlTower, Game.CaptainOfIndustry),
      ).toBeFalse();
    });
  });
});
