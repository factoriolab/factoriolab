import { TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { first } from 'rxjs';

import { CategoryId, ItemId, Mocks, TestModule } from 'src/tests';
import { Theme } from '~/models';
import { Preferences, Settings } from '~/store';
import { BrowserUtility } from '~/utilities';
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
    data.categoryEntities[CategoryId.Combat].icon = 'pistol';
    data.iconEntities['coal'].invertLight = true;
    data.iconEntities['pistol'].invertLight = true;
    data.iconEntities['nuclear-fuel|recipe'].invertLight = true;
    mockStore.overrideSelector(Settings.getDataset, data);
    mockStore.refreshState();
    service.initialize();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('theme$', () => {
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
    const tempLink = { href: '', onload: (): void => {} };
    spyOn(service['head'], 'removeChild');
    spyOn(service['head'], 'appendChild');
    spyOn(service['document'], 'getElementById').and.returnValue(
      themeLink as any
    );
    spyOn(service['document'], 'createElement').and.returnValue(
      tempLink as any
    );
    mockStore.overrideSelector(Preferences.getTheme, Theme.Light);
    mockStore.refreshState();
    expect(tempLink.href).toEqual('theme-light.css');
    expect(themeLink.href).toEqual('');
    tempLink.onload();
    expect(themeLink.href).toEqual('theme-light.css');
    mockStore.overrideSelector(Preferences.getTheme, Theme.Dark);
    mockStore.refreshState();
    expect(tempLink.href).toEqual('theme-dark.css');
    expect(themeLink.href).toEqual('theme-light.css');
    tempLink.onload();
    expect(themeLink.href).toEqual('theme-dark.css');
  });

  describe('appInitTheme', () => {
    it('should switch to dark theme if preferred', () => {
      localStorage.clear();
      const themeLink = { href: '' };
      spyOn(window, 'matchMedia').and.returnValue({ matches: true } as any);
      spyOn(window.document, 'getElementById').and.returnValue(
        themeLink as any
      );
      ThemeService.appInitTheme();
      expect(themeLink.href).toEqual('theme-dark.css');
    });

    it('should skip if specifying to use light theme', () => {
      const themeLink = { href: '' };
      spyOnProperty(BrowserUtility, 'preferencesState').and.returnValue({
        theme: Theme.Light,
      } as any);
      ThemeService.appInitTheme();
      expect(themeLink.href).toEqual('');
    });
  });
});
