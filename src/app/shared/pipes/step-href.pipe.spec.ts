import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { initialState, Mocks } from 'src/tests';
import { Rational } from '~/models';
import { RouterService } from '~/services';
import { StepHrefPipe } from './step-href.pipe';

describe('StepHrefPipe', () => {
  let pipe: StepHrefPipe;
  let routerService: RouterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [provideMockStore({ initialState }), StepHrefPipe],
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
      expect(
        pipe.transform(Mocks.Step1, {
          recipeR: {
            [Mocks.Step1.recipeId!]: {
              adjustProd: true,
              productivity: Rational.two,
            },
          },
          hash: '',
        } as any)
      );
      expect(routerService.stepHref).toHaveBeenCalled();
      expect(routerService.stepHref).not.toHaveBeenCalledWith(
        Mocks.Step1,
        '' as any
      );
    });
  });
});
