import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, fromEvent, map, Observable, startWith } from 'rxjs';

import { fnPropsNotNullish } from '~/helpers';
import { Theme } from '~/models';
import { LabState, Preferences, Settings } from '~/store';
import { BrowserUtility } from '~/utilities';

const LAB_ICON_STYLE_ID = 'lab-icon-css';
const LAB_THEME_STYLE_ID = 'lab-theme-css';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  head = this.document.getElementsByTagName('head')[0];
  theme$: Observable<Theme.Light | Theme.Dark>;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private store: Store<LabState>
  ) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const prefersDark$ = fromEvent<MediaQueryList>(prefersDark, 'change').pipe(
      startWith(prefersDark),
      map((list) => list.matches)
    );

    this.theme$ = combineLatest([
      this.store.select(Preferences.getTheme),
      prefersDark$,
    ]).pipe(
      map(([theme, prefersDark]) => {
        if (theme === Theme.System) {
          // Don't need to test media query specifically
          // istanbul ignore next
          return prefersDark ? Theme.Dark : Theme.Light;
        }

        return theme;
      })
    );
  }

  initialize(): void {
    this.store.select(Settings.getDataset).subscribe((data) => {
      // Generate .lab-icon::before css rules stylesheet
      const old = this.document.getElementById(LAB_ICON_STYLE_ID);
      if (old) {
        this.head.removeChild(old);
      }
      const style = this.document.createElement('style');
      style.id = LAB_ICON_STYLE_ID;
      let css = '';
      data.iconIds.forEach((i) => {
        const icon = data.iconEntities[i];
        css += `.${i}::before { background-image: url("${icon.file}"); background-position: ${icon.position}; } `;
      });
      data.itemIds
        .map((i) => data.itemEntities[i])
        .filter(fnPropsNotNullish('icon'))
        .forEach((item) => {
          const icon = data.iconEntities[item.icon];
          css += `.${item.id}.item::before { background-image: url("${icon.file}"); background-position: ${icon.position}; } `;
        });
      data.recipeIds
        .map((r) => data.recipeEntities[r])
        .filter(fnPropsNotNullish('icon'))
        .forEach((recipe) => {
          const icon = data.iconEntities[recipe.icon];
          css += `.${recipe.id}.recipe::before { background-image: url("${icon.file}"); background-position: ${icon.position}; } `;
        });
      data.categoryIds
        .map((c) => data.categoryEntities[c])
        .filter(fnPropsNotNullish('icon'))
        .forEach((category) => {
          const icon = data.iconEntities[category.icon];
          css += `.${category.id}.category::before { background-image: url("${icon.file}"); background-position: ${icon.position}; } `;
        });
      style.innerText = css;
      this.head.appendChild(style);
    });

    this.theme$.subscribe((theme) => {
      const themeLink = this.document.getElementById(
        LAB_THEME_STYLE_ID
      ) as HTMLLinkElement | null;
      if (themeLink) {
        const href =
          theme === Theme.Dark ? 'theme-dark.css' : 'theme-light.css';
        if (!themeLink.href.endsWith(href)) {
          // Need to switch theme, href has changed
          // Create a temporary link tag to load the new style sheet
          // Leave old href in place and wait for the new sheet to load
          const tempLink = this.document.createElement('link');
          tempLink.rel = 'stylesheet';
          tempLink.href = href;
          tempLink.onload = (): void => {
            // New style sheet has loaded, update the main themeLink and delete the temporary link
            themeLink.href = href;
            this.head.removeChild(tempLink);
          };
          this.head.appendChild(tempLink);
        }
      }
    });
  }

  /**
   * Used to set up the initial theme without loading the full store.
   * Helps to prevent flashing that can occur if UI loads light theme and swaps to dark at runtime.
   * Unsafe to inject the full store in the app initializer because WASM may not be loaded yet.
   */
  static appInitTheme(): void {
    const state = BrowserUtility.storedState;
    const theme =
      state?.preferencesState?.theme ??
      Preferences.initialPreferencesState.theme;

    if (theme === Theme.Light) return; // No action required

    if (
      theme === Theme.Dark ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      // Need to switch to dark theme before app starts
      const themeLink = window.document.getElementById(
        LAB_THEME_STYLE_ID
      ) as HTMLLinkElement | null;
      if (themeLink) {
        themeLink.href = 'theme-dark.css';
      }
    }
  }
}
