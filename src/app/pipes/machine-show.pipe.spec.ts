import { TestBed } from '@angular/core/testing';

import { Game, ItemId } from '~/models';
import { MachineShowPipe } from './machine-show.pipe';

describe('MachineShowPipe', () => {
  let pipe: MachineShowPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MachineShowPipe] });
    pipe = TestBed.inject(MachineShowPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should hide machine icon for DSP Mining Drill', () => {
      expect(
        pipe.transform(ItemId.MiningDrill, Game.DysonSphereProgram),
      ).toBeFalse();
    });

    it('should handle null values', () => {
      expect(pipe.transform(null, Game.Factorio)).toBeFalse();
    });
  });
});
