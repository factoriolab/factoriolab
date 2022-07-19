import { TestBed } from '@angular/core/testing';

import { Game, ItemId } from '~/models';
import { FactoryShowPipe } from './factory-show.pipe';

describe('FactoryShowPipe', () => {
  let pipe: FactoryShowPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [FactoryShowPipe] });
    pipe = TestBed.inject(FactoryShowPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should hide factory icon for DSP Mining Drill', () => {
      expect(
        pipe.transform(ItemId.MiningDrill, Game.DysonSphereProgram)
      ).toBeFalse();
    });
  });
});
