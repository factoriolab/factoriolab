import { TestBed } from '@angular/core/testing';

import { TestModule } from 'src/tests';
import { FactoryTooltipPipe } from './factory-tooltip.pipe';

describe('FactoryTooltipPipe', () => {
  let pipe: FactoryTooltipPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [FactoryTooltipPipe],
    });
    pipe = TestBed.inject(FactoryTooltipPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });
});
