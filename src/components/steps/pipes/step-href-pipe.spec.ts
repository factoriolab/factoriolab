import { TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests/test-module';

import { StepHrefPipe } from './step-href-pipe';

describe('StepHrefPipe', () => {
  let pipe: StepHrefPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    TestBed.runInInjectionContext(() => {
      pipe = new StepHrefPipe();
    });
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should get the result from RouterSync', async () => {
      spyOn(pipe['routerSync'], 'stepHref').and.returnValue(
        Promise.resolve({ z: 'href' }),
      );
      const result = await pipe.transform({} as any, {} as any);
      expect(result).toEqual({ z: 'href' });
    });
  });
});
