import { TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';

import { CategoryId, ItemId, Mocks, RecipeId, TestModule } from 'src/tests';
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
    const data = Mocks.getRawDataset();
    data.itemEntities[ItemId.Coal].icon = 'coal';
    data.recipeEntities[RecipeId.Coal].icon = 'coal';
    data.categoryEntities[CategoryId.Combat].icon = 'pistol';
    data.categoryEntities[CategoryId.Combat].iconText = 'test';
    data.iconEntities['coal'].invertLight = true;
    data.iconEntities['pistol'].invertLight = true;
    mockStore.overrideSelector(Settings.getDataset, data);
    mockStore.refreshState();
    service.initialize();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set the theme css href', () => {
    const themeLink = { href: '' };
    const tempLink = { href: '', onload: (): void => {} };
    spyOn(service['head'], 'removeChild');
    spyOn(service['head'], 'appendChild');
    spyOn(service['document'], 'getElementById').and.returnValue(
      themeLink as any,
    );
    spyOn(service['document'], 'createElement').and.returnValue(
      tempLink as any,
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

  it('should update theme values on initial pass', () => {
    spyOn(service, 'updateThemeValues');
    const themeLink = { href: 'theme-black.css' };
    spyOn(service['document'], 'getElementById').and.returnValue(
      themeLink as any,
    );
    spyOn(service, 'themePath').and.returnValue('theme-black.css');
    mockStore.overrideSelector(Preferences.getTheme, Theme.Black);
    mockStore.refreshState();
    expect(service.updateThemeValues).toHaveBeenCalled();
  });

  describe('themePath', () => {
    it('should handle various themes', () => {
      expect(service.themePath(Theme.Light)).toEqual('theme-light.css');
      expect(service.themePath(Theme.Black)).toEqual('theme-black.css');
      expect(service.themePath(Theme.Dark)).toEqual('theme-dark.css');
      expect(service.themePath('other' as any)).toEqual('theme-dark.css');
    });
  });

  describe('appInitTheme', () => {
    it('should switch to light theme if preferred', () => {
      const themeLink = { href: '' };
      spyOnProperty(BrowserUtility, 'preferencesState').and.returnValue({
        theme: Theme.Light,
      } as any);
      spyOn(window.document, 'getElementById').and.returnValue(
        themeLink as any,
      );
      ThemeService.appInitTheme();
      expect(themeLink.href).toEqual('theme-light.css');
    });

    it('should skip if specifying to use dark theme', () => {
      const themeLink = { href: '' };
      spyOnProperty(BrowserUtility, 'preferencesState').and.returnValue(
        null as any,
      );
      ThemeService.appInitTheme();
      expect(themeLink.href).toEqual('');
    });
  });
});
