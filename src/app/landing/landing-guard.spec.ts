import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { PreferencesStore } from '~/state/preferences/preferences-store';
import { RouterSync } from '~/state/router/router-sync';
import { MockComponent } from '~/tests/mocks/component';
import { TestModule } from '~/tests/test-module';

import { landingGuard } from './landing-guard';

describe('landingGuard', () => {
  let router: Router;
  let preferencesStore: PreferencesStore;
  let routerSync: RouterSync;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [
        provideRouter([
          {
            path: 'urltree',
            component: MockComponent,
          },
          {
            path: ':id',
            children: [
              {
                path: 'list',
                component: MockComponent,
              },
              {
                path: '',
                pathMatch: 'full',
                canActivate: [landingGuard],
                component: MockComponent,
              },
            ],
          },
          {
            path: '',
            pathMatch: 'full',
            canActivate: [landingGuard],
            component: MockComponent,
          },
        ]),
      ],
    });

    router = TestBed.inject(Router);
    preferencesStore = TestBed.inject(PreferencesStore);
    routerSync = TestBed.inject(RouterSync);
  });

  it('should load the last saved state', async () => {
    spyOn(preferencesStore, 'bypassLanding').and.returnValue(true);
    spyOn(routerSync, 'stored').and.returnValue('/urltree');
    await RouterTestingHarness.create('/');
    expect(router.url).toEqual('/urltree');
  });

  it('should navigate to the list', async () => {
    spyOn(preferencesStore, 'bypassLanding').and.returnValue(true);
    await RouterTestingHarness.create('/?v=6');
    expect(router.url).toEqual('/spa/list?v=6');
  });

  it('should allow navigating to the landing page', async () => {
    await RouterTestingHarness.create('/');
    expect(router.url).toEqual('/spa');
  });
});
