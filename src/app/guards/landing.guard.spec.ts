import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { MockStore } from '@ngrx/store/testing';

import { Mocks, TestModule } from 'src/tests';
import { Preferences } from '~/store';
import { BrowserUtility } from '~/utilities';
import { canActivateLanding } from './landing.guard';

describe('canActivateLanding', () => {
  let router: Router;
  let mockStore: MockStore;

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
            path: 'list',
            component: Mocks.MockComponent,
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
    mockStore = TestBed.inject(MockStore);
  });

  it('should load the last saved state', async () => {
    mockStore.overrideSelector(Preferences.getBypassLanding, true);
    mockStore.refreshState();
    spyOnProperty(BrowserUtility, 'routerState').and.returnValue('/urltree');
    await RouterTestingHarness.create('/');
    expect(router.url).toEqual('/urltree');
  });

  it('should navigate to the list', async () => {
    mockStore.overrideSelector(Preferences.getBypassLanding, true);
    mockStore.refreshState();
    await RouterTestingHarness.create('/?v=6');
    expect(router.url).toEqual('/list?v=6');
  });

  it('should allow navigating to the landing page', async () => {
    mockStore.overrideSelector(Preferences.getBypassLanding, false);
    mockStore.refreshState();
    await RouterTestingHarness.create('/');
    expect(router.url).toEqual('/');
  });
});
