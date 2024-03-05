import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { ReplaySubject } from 'rxjs';

import { fnPropsNotNullish } from '~/helpers';
import { Theme } from '~/models';
import { LabState, Preferences, Settings } from '~/store';
import { BrowserUtility } from '~/utilities';

const LAB_ICON_STYLE_ID = 'lab-icon-css';
const LAB_THEME_STYLE_ID = 'lab-theme-css';

export interface ThemeValues {
  textColor: string;
  successColor: string;
  successBackground: string;
  dangerColor: string;
  dangerBackground: string;
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  document = inject(DOCUMENT);
  store = inject(Store<LabState>);

  themeValues$ = new ReplaySubject<ThemeValues>(1);
  head = this.document.getElementsByTagName('head')[0];

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

        if (icon.invertLight) {
          css += `body.light .${i}::before { filter: invert(1); } `;
          css += `.invert .${i}::before { filter: invert(1); } `;
          css += `body.light .invert .${i}::before { filter: none; } `;
        }
      });
      data.itemIds
        .map((i) => data.itemEntities[i])
        .filter(fnPropsNotNullish('icon'))
        .forEach((item) => {
          const icon = data.iconEntities[item.icon];
          css += `.${item.id}.item::before { background-image: url("${icon.file}"); background-position: ${icon.position}; } `;

          if (icon.invertLight) {
            css += `body.light .${item.id}.item::before { filter: invert(1); } `;
            css += `.invert .${item.id}::before { filter: invert(1); } `;
            css += `body.light .invert .${item.id}::before { filter: none; } `;
          }
        });
      data.recipeIds
        .map((r) => data.recipeEntities[r])
        .filter(fnPropsNotNullish('icon'))
        .forEach((recipe) => {
          const icon = data.iconEntities[recipe.icon];
          css += `.${recipe.id}.recipe::before { background-image: url("${icon.file}"); background-position: ${icon.position}; } `;

          if (icon.invertLight) {
            css += `body.light .${recipe.id}.recipe::before { filter: invert(1); } `;
            css += `.invert .${recipe.id}::before { filter: invert(1); } `;
            css += `body.light .invert .${recipe.id}::before { filter: none; } `;
          }
        });
      data.categoryIds
        .map((c) => data.categoryEntities[c])
        .filter(fnPropsNotNullish('icon'))
        .forEach((category) => {
          const icon = data.iconEntities[category.icon];
          css += `.${category.id}.category::before { background-image: url("${icon.file}"); background-position: ${icon.position}; } `;

          if (icon.invertLight) {
            css += `body.light .${category.id}.category::before { filter: invert(1); } `;
            css += `.invert .${category.id}::before { filter: invert(1); } `;
            css += `body.light .invert .${category.id}::before { filter: none; } `;
          }
        });

      data.itemIds
        .map((i) => data.itemEntities[i])
        .filter(fnPropsNotNullish('iconText'))
        .forEach((item) => {
          css += `.${item.id}.item::after { content: "${item.iconText}"; } `;
        });
      data.recipeIds
        .map((i) => data.recipeEntities[i])
        .filter(fnPropsNotNullish('iconText'))
        .forEach((recipe) => {
          css += `.${recipe.id}.recipe::after { content: "${recipe.iconText}"; } `;
        });
      data.categoryIds
        .map((i) => data.categoryEntities[i])
        .filter(fnPropsNotNullish('iconText'))
        .forEach((category) => {
          css += `.${category.id}.category::after { content: "${category.iconText}"; } `;
        });

      style.innerText = css;
      this.head.appendChild(style);
    });

    this.store.select(Preferences.getTheme).subscribe((theme) => {
      const themeLink = this.document.getElementById(
        LAB_THEME_STYLE_ID,
      ) as HTMLLinkElement | null;
      if (themeLink) {
        const href = this.themePath(theme);
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
            this.updateThemeValues();
          };
          this.head.appendChild(tempLink);
        } else {
          this.updateThemeValues();
        }
      }

      for (const t of [Theme.Light, Theme.Dark, Theme.Black]) {
        if (t === theme) {
          this.document.body.classList.add(t);
        } else {
          this.document.body.classList.remove(t);
        }
      }
    });
  }

  updateThemeValues(): void {
    const style = getComputedStyle(this.document.body);
    const values: ThemeValues = {
      textColor: style.getPropertyValue('--text-color'),
      successColor: style.getPropertyValue('--success-color'),
      successBackground: style.getPropertyValue('--success-background'),
      dangerColor: style.getPropertyValue('--danger-color'),
      dangerBackground: style.getPropertyValue('--danger-background'),
    };
    this.themeValues$.next(values);
  }

  themePath(theme: Theme): string {
    switch (theme) {
      case Theme.Light:
        return 'theme-light.css';
      case Theme.Black:
        return 'theme-black.css';
      default:
        return 'theme-dark.css';
    }
  }

  /**
   * Used to set up the initial theme without loading the full store.
   * Helps to prevent flashing that can occur if UI loads light theme and swaps to dark at runtime.
   * Unsafe to inject the full store in the app initializer because WASM may not be loaded yet.
   */
  static appInitTheme(): void {
    const state = BrowserUtility.preferencesState;
    const theme = state?.theme ?? Preferences.initialPreferencesState.theme;

    if (theme === Theme.Light) {
      // Need to switch to light theme before app starts
      const themeLink = window.document.getElementById(
        LAB_THEME_STYLE_ID,
      ) as HTMLLinkElement | null;
      if (themeLink) {
        themeLink.href = 'theme-light.css';
      }
    }
  }
}
