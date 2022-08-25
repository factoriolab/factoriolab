import { TestBed } from '@angular/core/testing';

import { TestModule } from 'src/tests';
import { ModuleTooltipPipe } from './module-tooltip.pipe';

describe('ModuleTooltipPipe', () => {
  let pipe: ModuleTooltipPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [ModuleTooltipPipe],
    });
    pipe = TestBed.inject(ModuleTooltipPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });
});
