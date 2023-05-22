import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { MockStore } from '@ngrx/store/testing';

import { TestModule } from 'src/tests';
import { Preferences } from '~/store';
import { BrowserUtility } from '~/utilities';
import { LandingGuard } from './landing.guard';

describe('LandingGuard', () => {
  let guard: LandingGuard;
  let router: Router;
  let mockStore: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    router = TestBed.inject(Router);
    mockStore = TestBed.inject(MockStore);
    guard = TestBed.inject(LandingGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should load the last saved state', () => {
      mockStore.overrideSelector(Preferences.getBypassLanding, true);
      mockStore.refreshState();
      spyOnProperty(BrowserUtility, 'routerState').and.returnValue('value');
      spyOn(router, 'parseUrl').and.returnValue('urltree' as any);
      let result: boolean | UrlTree | undefined;
      guard
        .canActivate({} as any, { url: '/' } as any)
        .subscribe((r) => (result = r));
      expect(router.parseUrl).toHaveBeenCalledWith('value');
      expect(result).toEqual('urltree' as any);
    });

    it('should navigate to the list', () => {
      mockStore.overrideSelector(Preferences.getBypassLanding, true);
      mockStore.refreshState();
      spyOn(router, 'parseUrl').and.returnValue('urltree' as any);
      let result: boolean | UrlTree | undefined;
      guard
        .canActivate({} as any, { url: '/?v=6' } as any)
        .subscribe((r) => (result = r));
      expect(router.parseUrl).toHaveBeenCalledWith('/list?v=6');
      expect(result).toEqual('urltree' as any);
    });

    it('should allow navigating to the landing page', () => {
      mockStore.overrideSelector(Preferences.getBypassLanding, false);
      mockStore.refreshState();
      let result: boolean | UrlTree | undefined;
      guard
        .canActivate({} as any, { url: '/' } as any)
        .subscribe((r) => (result = r));
      expect(result).toEqual(true);
    });
  });
});
