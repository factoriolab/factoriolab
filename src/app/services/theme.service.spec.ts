import { TestBed } from '@angular/core/testing';

import { Theme } from '~/models/enum/theme';
import { CategoryId, ItemId, Mocks, RecipeId, TestModule } from '~/tests';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(ThemeService);
    // Set up an item icon override to be included
    const data = Mocks.getAdjustedDataset();
    data.itemEntities[ItemId.Coal].icon = 'coal';
    data.recipeEntities[RecipeId.Coal].icon = 'coal';
    data.categoryEntities[CategoryId.Combat].icon = 'pistol';
    data.categoryEntities[CategoryId.Combat].iconText = 'test';
    data.locationEntities['id'].icon = 'coal';
    data.locationEntities['id'].iconText = 'test';
    data.iconEntities['coal'].invertLight = true;
    data.iconEntities['pistol'].invertLight = true;
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set the theme css href', () => {
    const themeLink = { href: '' };
    const tempLink = { href: '', onload: (): void => {} };
    spyOn(service.head, 'removeChild');
    spyOn(service.head, 'appendChild');
    spyOn(service.document, 'getElementById').and.returnValue(themeLink as any);
    spyOn(service.document, 'createElement').and.returnValue(tempLink as any);
    service.preferencesSvc.apply({ theme: Theme.Light });
    TestBed.flushEffects();
    expect(tempLink.href).toEqual('theme-light.css');
    expect(themeLink.href).toEqual('');
    tempLink.onload();
    expect(themeLink.href).toEqual('theme-light.css');
    service.preferencesSvc.apply({ theme: Theme.Dark });
    TestBed.flushEffects();
    expect(tempLink.href).toEqual('theme-dark.css');
    expect(themeLink.href).toEqual('theme-light.css');
    tempLink.onload();
    expect(themeLink.href).toEqual('theme-dark.css');
  });

  it('should update theme values on initial pass', () => {
    spyOn(service, 'updateThemeValues');
    const themeLink = { href: 'theme-black.css' };
    spyOn(service.head, 'removeChild');
    spyOn(service.document, 'getElementById').and.returnValue(themeLink as any);
    spyOn(service, 'themePath').and.returnValue('theme-black.css');
    service.preferencesSvc.apply({ theme: Theme.Black });
    TestBed.flushEffects();
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
      localStorage.setItem(
        'preferences',
        JSON.stringify({ theme: Theme.Light }),
      );
      spyOn(window.document, 'getElementById').and.returnValue(
        themeLink as any,
      );
      ThemeService.appInitTheme();
      expect(themeLink.href).toEqual('theme-light.css');
    });

    it('should skip if specifying to use dark theme', () => {
      const themeLink = { href: '' };
      localStorage.setItem('preferences', JSON.stringify({}));
      ThemeService.appInitTheme();
      expect(themeLink.href).toEqual('');
    });
  });
});
