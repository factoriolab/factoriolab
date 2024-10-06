import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { Mocks, TestModule } from '~/tests';

import { canActivateId } from './id.guard';

describe('canActivateId', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [
        provideRouter([
          {
            path: ':id',
            canActivate: [canActivateId],
            children: [
              {
                path: 'list',
                component: Mocks.MockComponent,
              },
            ],
          },
        ]),
      ],
    });

    router = TestBed.inject(Router);
  });

  it('should migrate old states', async () => {
    await RouterTestingHarness.create('/list?p=coal*0.5&s=**0&v=10');
    expect(router.url).toEqual('/1.1/list?v=11&o=coal*0.5&odr=0');
  });

  it('should migrate old game shortcuts', async () => {
    const rth = await RouterTestingHarness.create('/factorio');
    expect(router.url).toEqual('/1.1');
    await rth.navigateByUrl('/satisfactory');
    expect(router.url).toEqual('/sfy');
    await rth.navigateByUrl('/techtonica');
    expect(router.url).toEqual('/tta');
    await rth.navigateByUrl('/final-factory');
    expect(router.url).toEqual('/ffy');
  });
});
