import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { TestModule } from '~/tests';
import { MockComponent } from '~/tests/mocks';

import { canActivateRatio } from './ratio.guard';

describe('canActivateRatio', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [
        provideRouter([
          {
            path: ':id',
            children: [
              {
                path: 'ratio',
                canActivate: [canActivateRatio],
                children: [],
              },
              { path: 'list', component: MockComponent },
            ],
          },
        ]),
      ],
    });

    router = TestBed.inject(Router);
  });

  it('should set up demo ratios', async () => {
    await RouterTestingHarness.create('/1.1/ratio?a&b');
    expect(router.url).toEqual('/list?o=a*0.5&o=b*0.5&odr=0&v=11');
  });
});
