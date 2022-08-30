import { TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { first } from 'rxjs';

import { ItemId, Mocks, TestModule } from 'src/tests';
import { Theme } from '~/models';
import { Preferences, Settings } from '~/store';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let mockStore: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(ThemeService);
    mockStore = TestBed.inject(MockStore);
    // Set up an item icon override to be included
    const data = Mocks.getDataset();
    data.itemEntities[ItemId.Coal].icon = 'coal';
    mockStore.overrideSelector(Settings.getDataset, data);
    mockStore.refreshState();
    service.initialize();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('theme$', () => {
    it('should detect the system preferred theme', () => {
      let theme: Theme | undefined;
      service.theme$.pipe(first()).subscribe((t) => (theme = t));
      // Should be non-null and not System, but actual result may vary by test environment
      expect(theme).toBeDefined();
      expect(theme).not.toEqual(Theme.System);
    });

    it('should use specified theme', () => {
      let theme: Theme | undefined;
      mockStore.overrideSelector(Preferences.getTheme, Theme.Light);
      mockStore.refreshState();
      service.theme$.pipe(first()).subscribe((t) => (theme = t));
      expect(theme).toEqual(Theme.Light);
      mockStore.overrideSelector(Preferences.getTheme, Theme.Dark);
      mockStore.refreshState();
      service.theme$.pipe(first()).subscribe((t) => (theme = t));
      expect(theme).toEqual(Theme.Dark);
    });
  });

  it('should set the theme css href', () => {
    const themeLink = { href: '' };
    spyOn(service['document'], 'getElementById').and.returnValue(
      themeLink as any
    );
    mockStore.overrideSelector(Preferences.getTheme, Theme.Light);
    mockStore.refreshState();
    expect(themeLink.href).toEqual('lara-light-blue.css');
    mockStore.overrideSelector(Preferences.getTheme, Theme.Dark);
    mockStore.refreshState();
    expect(themeLink.href).toEqual('lara-dark-blue.css');
  });
});
