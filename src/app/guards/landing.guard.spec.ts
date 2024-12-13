import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { RouterService } from '~/services/router.service';
import { PreferencesService } from '~/store/preferences.service';
import { Mocks, TestModule } from '~/tests';

import { canActivateLanding } from './landing.guard';

describe('canActivateLanding', () => {
  let router: Router;
  let preferencesSvc: PreferencesService;
  let routerSvc: RouterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [
        provideRouter([
          {
            path: 'urltree',
            component: Mocks.MockComponent,
          },
          {
            path: ':id',
            children: [
              {
                path: 'list',
                component: Mocks.MockComponent,
              },
              {
                path: '',
                pathMatch: 'full',
                canActivate: [canActivateLanding],
                component: Mocks.MockComponent,
              },
            ],
          },
          {
            path: '',
            pathMatch: 'full',
            canActivate: [canActivateLanding],
            component: Mocks.MockComponent,
          },
        ]),
      ],
    });

    router = TestBed.inject(Router);
    preferencesSvc = TestBed.inject(PreferencesService);
    routerSvc = TestBed.inject(RouterService);
  });

  it('should load the last saved state', async () => {
    spyOn(preferencesSvc, 'bypassLanding').and.returnValue(true);
    spyOn(routerSvc, 'stored').and.returnValue('/urltree');
    await RouterTestingHarness.create('/');
    expect(router.url).toEqual('/urltree');
  });

  it('should navigate to the list', async () => {
    spyOn(preferencesSvc, 'bypassLanding').and.returnValue(true);
    await RouterTestingHarness.create('/?v=6');
    expect(router.url).toEqual('/spa/list?v=6');
  });

  it('should allow navigating to the landing page', async () => {
    await RouterTestingHarness.create('/');
    expect(router.url).toEqual('/spa');
  });
});
