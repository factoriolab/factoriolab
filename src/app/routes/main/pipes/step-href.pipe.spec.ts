import { TestBed } from '@angular/core/testing';

import { Mocks, RecipeId, TestModule } from 'src/tests';
import { Rational, Step } from '~/models';
import { RouterService } from '~/services';
import { StepHrefPipe } from './step-href.pipe';

describe('StepHrefPipe', () => {
  let pipe: StepHrefPipe;
  let routerService: RouterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [StepHrefPipe],
    });
    pipe = TestBed.inject(StepHrefPipe);
    routerService = TestBed.inject(RouterService);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should adjust recipes where necessary', () => {
      spyOn(routerService, 'stepHref');
      const step: Step = {
        id: '0',
        items: Rational.one,
        recipeId: RecipeId.ArtilleryShellRange,
      };
      expect(pipe.transform(step, { bare: '', hash: '' }, Mocks.Dataset));
      expect(routerService.stepHref).toHaveBeenCalled();
      expect(routerService.stepHref).not.toHaveBeenCalledWith(
        Mocks.Step1,
        { bare: '', hash: '' },
        '' as any,
      );
    });
  });
});
