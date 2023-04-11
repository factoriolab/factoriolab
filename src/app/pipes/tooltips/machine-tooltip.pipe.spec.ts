import { TestBed } from '@angular/core/testing';

import { ItemId, Mocks, TestModule } from 'src/tests';
import { Rational } from '~/models';
import { MachineTooltipPipe } from './machine-tooltip.pipe';

describe('MachineTooltipPipe', () => {
  let pipe: MachineTooltipPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [MachineTooltipPipe],
    });
    pipe = TestBed.inject(MachineTooltipPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should generate a machine tooltip', () => {
      const data = Mocks.getDataset();
      data.itemEntities[ItemId.AssemblingMachine3].machine!.category =
        'chemical';
      data.itemEntities[ItemId.AssemblingMachine3].machine!.silo = {
        parts: Rational.one,
        launch: Rational.two,
      };
      data.itemEntities[ItemId.AssemblingMachine3].machine!.consumption = {
        [ItemId.Wood]: Rational.ten,
      };
      data.itemEntities[ItemId.AssemblingMachine3].machine!.disallowedEffects =
        ['productivity'];
      const result = pipe.transform(ItemId.AssemblingMachine3, data);
      expect(result).toBeTruthy();
    });

    it('should handle null values', () => {
      expect(pipe.transform(null, Mocks.Dataset)).toEqual('');
      expect(pipe.transform('null', Mocks.Dataset)).toEqual('');
    });
  });
});
